#Every tool here is built fresh, per-request, inside `build_note_tools(), after the normal auth dependency chain has verified the caller's token. The verified clerk_user_id is passed in as `user_id` to scope all DB queries to that user. No user_id field is ever read from the request body, query params, or anything the LLM produced mid-conversation — that would be a security hole.

from typing import List, Optional

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

import crud
from schemas import NoteCreate, NoteUpdate
import rag

# Argument schemas — these define exactly what the LLM is allowed to supply.

class CreateNoteArgs(BaseModel):
    title: str = Field(..., description="The title of the note.")
    content: str = Field("", description="The body/content of the note.")
    tags: List[str] = Field(default_factory=list, description="Optional tags for the note.")


class ListNotesArgs(BaseModel):
    limit: int = Field(20, ge=1, le=100, description="Max number of notes to return.")


class GetNoteArgs(BaseModel):
    note_id: int = Field(..., description="The ID of the note to fetch.")


class UpdateNoteArgs(BaseModel):
    note_id: int = Field(..., description="The ID of the note to update.")
    title: Optional[str] = Field(None, description="New title, if changing it.")
    content: Optional[str] = Field(None, description="New content, if changing it.")
    tags: Optional[List[str]] = Field(None, description="New tags, if changing them.")


class DeleteNoteArgs(BaseModel):
    note_id: int = Field(..., description="The ID of the note to delete.")


# Tools should return short, LLM-readable strings — not raw ORM objects
def _format_note(note) -> str:
    return (
        f"[Note #{note.id}] {note.title}\n"
        f"Tags: {', '.join(note.tags) if note.tags else 'none'}\n"
        f"Updated: {note.updated_at.isoformat()}\n"
        f"Content: {note.content or '(empty)'}"
    )



def build_note_tools(db: Session, user_id: str) -> list[StructuredTool]:
    # post ai chat

    def create_note(title: str, content: str = "", tags: List[str] = []) -> str:
        print(f"[TOOL CALLED] create_note user_id={user_id} title={title!r} content={content!r} tags={tags!r}")
        try:
            note = crud.create_note(
                db,
                NoteCreate(title=title, content=content, tags=tags),
                user_id,
            )
            rag.upsert_note_embedding_by_id(note.id)
        except Exception as e:
            return f"Failed to create note: {e}"
        return f"Created note #{note.id}: {note.title}"

    def list_notes(limit: int = 20) -> str:
        print(f"[TOOL CALLED] list_notes user_id={user_id} limit={limit}")
        notes = crud.get_notes_by_user(db, user_id, limit=limit)
        if not notes:
            return "You have no notes yet."
        return "\n\n".join(_format_note(n) for n in notes)

    def get_note(note_id: int) -> str:
        print(f"[TOOL CALLED] get_note user_id={user_id} note_id={note_id}")
        note = crud.get_note_for_user(db, note_id, user_id)
        if note is None:
            return f"No note found with id {note_id}."
        return _format_note(note)

    def update_note(
        note_id: int,
        title: Optional[str] = None,
        content: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> str:
        print(f"[TOOL CALLED] update_note user_id={user_id} note_id={note_id} title={title!r} content={content!r} tags={tags!r}")
        update = NoteUpdate(title=title, content=content, tags=tags)
        note = crud.update_note_for_user(db, note_id, user_id, update)
        if note is None:
            return f"No note found with id {note_id}."
        if title is not None or content is not None or tags is not None:
            rag.upsert_note_embedding_by_id(note.id)
        return f"Updated note #{note.id}: {note.title}"

    def delete_note(note_id: int) -> str:
        print(f"[TOOL CALLED] delete_note user_id={user_id} note_id={note_id}")
        deleted = crud.delete_note_for_user(db, note_id, user_id)
        if not deleted:
            return f"No note found with id {note_id}."
        return f"Deleted note #{note_id}."

    return [
        StructuredTool.from_function(
            func=create_note,
            name="create_note",
            description=(
                "Create a new note for the current user. Use this when the "
                "user asks to save, jot down, or write a new note."
            ),
            args_schema=CreateNoteArgs,
        ),
        StructuredTool.from_function(
            func=list_notes,
            name="list_notes",
            description=(
                "List the current user's notes, most recently updated "
                "first. Use this to answer questions like 'what notes do "
                "I have' or 'show my recent notes'."
            ),
            args_schema=ListNotesArgs,
        ),
        StructuredTool.from_function(
            func=get_note,
            name="get_note",
            description=(
                "Fetch a single note by its ID. Use this when the user "
                "references a specific note (by number or title) and you "
                "need its full content."
            ),
            args_schema=GetNoteArgs,
        ),
        StructuredTool.from_function(
            func=update_note,
            name="update_note",
            description=(
                "Update an existing note's title, content, or tags. Only "
                "the fields provided are changed — omit any field you don't "
                "want to modify."
            ),
            args_schema=UpdateNoteArgs,
        ),
        StructuredTool.from_function(
            func=delete_note,
            name="delete_note",
            description=(
                "Permanently delete a note by its ID. This cannot be "
                "undone — if there's any ambiguity about which note the "
                "user means, ask them to confirm before calling this."
            ),
            args_schema=DeleteNoteArgs,
        ),
    ]