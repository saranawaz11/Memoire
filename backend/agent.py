from langchain.agents import create_agent
from langchain_core.messages import HumanMessage
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
import re
import rag
import crud
from tools import build_note_tools
from memory import get_session_history

_Mutation_PREFIXES = ["Created note #", "Updated note #", "Deleted note #"]

def _turn_changed_notes(messages:list) -> bool:
    return any(
        isinstance(m, ToolMessage)
        and isinstance(m.content, str)
        and m.content.startswith(tuple(_Mutation_PREFIXES))
        for m in messages
    )


# --- Delete confirmation, handled server-side, not by the LLM -------------
#
# The model reliably asks a confirmation question with the note's ID in it
# (the system prompt already requires stating IDs explicitly), but it does
# NOT reliably call delete_note again on the next turn's bare "yes" reply —
# it tends to just narrate "Deleted note #X" without invoking anything.
# Since that's a destructive action, we don't leave it to chance: we parse
# the model's own confirmation question to learn which note_id is pending,
# store it on AppUser, and on the next turn perform the actual deletion in
# code if the reply looks affirmative — no LLM tool call involved in the
# mutation itself.
_CONFIRM_QUESTION_RE = re.compile(r"delete note #(\d+)", re.IGNORECASE)
_AFFIRMATIVE_RE = re.compile(r"^\s*(yes|yeah|yep|yup|sure|confirm|confirmed|ok|okay|go ahead|do it)\b", re.IGNORECASE)
_NEGATIVE_RE = re.compile(r"^\s*(no|nope|nah|cancel|don'?t|do not|stop|wait)\b", re.IGNORECASE)


class SearchNotesArgs(BaseModel):
    query: str = Field(
        ...,
        description="What to search for in the user's notes (semantic search, not exact keyword match).",
    )

def _build_search_tool(db: Session, user_id: str) -> StructuredTool:
    def search_notes(query: str) -> str:
        excerpts = rag.get_relevant_note_excerpts(db, user_id, query)
        if not excerpts:
            return "No relevant notes found for that query."
        return "\n\n".join(
            f"[Note #{e['note_id']}] {e['content']}" for e in excerpts
        )

    return StructuredTool.from_function(
        func=search_notes,
        name="search_notes",
        description=(
            "Semantically search the user's notes for content relevant to "
            "a topic or question. Always use this before answering "
            "questions about what the user has written — don't guess or "
            "rely on conversation history alone for factual note content."
        ),
        args_schema=SearchNotesArgs,
    )


SYSTEM_PROMPT = """You are a helpful assistant embedded in a personal notes app called Memoire.

You can:
- create, list, view, update, and delete the user's notes (tools below)
- search the user's notes for relevant content (search_notes tool)

Rules:
- Always use search_notes before answering any question about the content
  of the user's notes. Never guess or fabricate note content.
- If deleting a note, and there's any ambiguity about which note the user
  means, ask them to confirm first rather than guessing. Phrase the
  confirmation question EXACTLY like this, including the note's ID:
  "Delete note #<id>: <title>? (yes/no)" — this exact phrasing is required,
  don't reword it.
- IMPORTANT — avoiding duplicate notes: if the user asks to add to, change,
  or describe "the note," "it," or "that" without a clear ID, this almost
  always means UPDATE an existing note, not create a new one. Before
  calling create_note, check: did the user
  already mention a note in this conversation that this request could be
  about? If so, use update_note on that note's ID instead. If you genuinely
  cannot tell which note they mean, use list_notes or search_notes to find
  likely candidates, or ask the user to clarify — do not create a new note
  as a fallback.
- Whenever you create, update, or delete a note, ALWAYS state its ID number
  explicitly in your reply. This is not
  optional — your reply is the only record of that ID the next turn of
  this conversation will have access to.
- When updating a note's content: unless the user clearly wants to replace
  the whole thing, prefer to preserve their existing content and append or
  integrate the new information, rather than overwriting it outright. If
  you're not sure what the current content is, call get_note first.
- Be concise. This is a notes app, not a chat platform — keep responses short."""


def run_agent_turn(db: Session, user_id: str, message: str) -> dict:
    # from @app.post("/ai/chat", response_model=ChatResponse)
    user = crud.get_app_user(db, user_id)
    history = get_session_history(db, user_id)

    # handle a pending delete confirmation, if any 
    if user and user.pending_delete_note_id is not None:
        pending_id = user.pending_delete_note_id

        if _AFFIRMATIVE_RE.match(message):
            crud.clear_pending_delete(db, user)
            deleted = crud.delete_note_for_user(db, pending_id, user_id)
            answer = (
                f"Deleted note #{pending_id}."
                if deleted
                else f"No note found with id {pending_id}."
            )
            history.add_message(HumanMessage(content=message))
            history.add_message(AIMessage(content=answer))
            return {"answer": answer, "notes_changed": bool(deleted)}

        if _NEGATIVE_RE.match(message):
            crud.clear_pending_delete(db, user)
            answer = "Okay, I won't delete that note."
            history.add_message(HumanMessage(content=message))
            history.add_message(AIMessage(content=answer))
            return {"answer": answer, "notes_changed": False}

        crud.clear_pending_delete(db, user)

    # Step 2: normal agent turn
    tools = build_note_tools(db, user_id) + [_build_search_tool(db, user_id)]

    agent = create_agent(
        model=rag.get_llm(),
        tools=tools,
        system_prompt=SYSTEM_PROMPT,
    )

    prior_messages = history.messages
    incoming = HumanMessage(content=message)
    result = agent.invoke({"messages": prior_messages + [incoming]})

    answer = result["messages"][-1].content

    new_messages = result["messages"][len(prior_messages):]

    # DEBUG: trace this turn
    print("=" * 60)
    print(f"[AGENT TRACE] user_id={user_id!r} message={message!r}")
    for i, m in enumerate(new_messages):
        print(
            f"  [{i}] {type(m).__name__} "
            f"tool_calls={getattr(m, 'tool_calls', None)!r} "
            f"content={str(getattr(m, 'content', ''))[:200]!r}"
        )
    print("=" * 60)

    notes_changed = _turn_changed_notes(new_messages)
    for m in new_messages:
        history.add_message(m)

    # Step 3: if this turn's answer IS a delete confirmation question
    if user:
        match = _CONFIRM_QUESTION_RE.search(answer)
        if match:
            crud.set_pending_delete(db, user, int(match.group(1)))

    return {"answer": answer, "notes_changed": notes_changed}