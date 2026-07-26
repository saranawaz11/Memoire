from langchain.agents import create_agent
from langchain_core.messages import HumanMessage
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

import rag
from tools import build_note_tools
from memory import get_session_history


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
  means, ask them to confirm first rather than guessing.
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


def run_agent_turn(db: Session, user_id: str, message: str) -> str:
    # from @app.post("/ai/chat", response_model=ChatResponse)
    tools = build_note_tools(db, user_id) + [_build_search_tool(db, user_id)]
    history = get_session_history(db, user_id)
    
    #create agent uses flat line message reponse 
    # so connecting AIMessage and HumanMessage?
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
    for m in new_messages:
        history.add_message(m)

    return answer