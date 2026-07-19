from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import crud
import models
import rag
from auth import get_current_user_id, fetch_clerk_profile  # CHANGED: was a local Header-based function
from database import engine, get_db
from schemas import (
    MeResponse, NoteCreate, NoteUpdate, NoteResponse, UserListResponse,
    AIQueryRequest, AIQueryResponse, AIReindexResponse,
)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Notes App")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_user(
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id),
) -> models.AppUser:
    user = crud.get_app_user(db, clerk_user_id)
    if user:
        return user
    profile = fetch_clerk_profile(clerk_user_id)
    return crud.get_or_create_app_user(db, clerk_user_id, profile)

def require_manager(user: models.AppUser = Depends(get_db_user)) -> models.AppUser:
    if user.role != "manager":
        raise HTTPException(status_code=403, detail="Managers only.")
    return user

@app.get("/me", response_model=MeResponse, response_model_by_alias=True)
def read_me(
    user: models.AppUser = Depends(get_db_user),
    db: Session = Depends(get_db),
):
    profile = fetch_clerk_profile(user.clerk_user_id)
    if profile["first_name"] and (
        user.first_name != profile["first_name"] or user.last_name != profile["last_name"]
    ):
        user.first_name = profile["first_name"]
        user.last_name = profile["last_name"]
        user.email = profile["email"]
        db.commit()
        db.refresh(user)

    return MeResponse(
        user_id=user.clerk_user_id,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
    )


@app.get("/users", response_model=list[UserListResponse], response_model_by_alias=True)
def get_all_users(
    user: models.AppUser = Depends(require_manager),
    db: Session = Depends(get_db),
):
    rows = crud.get_all_users_with_note_count(db)
    return [
        UserListResponse(
            clerk_user_id=row.clerk_user_id,
            role=row.role,
            first_name=row.first_name,
            last_name=row.last_name,
            email=row.email,
            note_count=row.note_count,
            joined_at=row.joined_at,
        )
        for row in rows
    ]

@app.delete("/users/{target_user_id}", status_code=204)
def delete_user(
    target_user_id: str,
    user: models.AppUser = Depends(require_manager),
    db: Session = Depends(get_db),
):
    deleted = crud.delete_user(db, target_user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")


@app.delete("/me", status_code=204)
def delete_me(
    user: models.AppUser = Depends(get_db_user),
    db: Session = Depends(get_db),
):
    crud.delete_user(db, user.clerk_user_id)


@app.post("/notes/", response_model=NoteResponse, response_model_by_alias=True, status_code=201)
def create_note(
    data: NoteCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: models.AppUser = Depends(get_db_user),
):
    note = crud.create_note(db, data, user.clerk_user_id)
    background_tasks.add_task(rag.upsert_note_embedding_by_id, note.id)
    return note


@app.get("/notes/", response_model=list[NoteResponse], response_model_by_alias=True)
def list_notes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: models.AppUser = Depends(get_db_user),
):
    return crud.get_notes_by_user(db, user.clerk_user_id, skip=skip, limit=limit)


@app.get("/notes/{note_id}", response_model=NoteResponse, response_model_by_alias=True)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    user: models.AppUser = Depends(get_db_user),
):
    note = crud.get_note(db, note_id)
    if not note or note.user_id != user.clerk_user_id:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@app.patch("/notes/{note_id}", response_model=NoteResponse, response_model_by_alias=True)
def update_note(
    note_id: int,
    data: NoteUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: models.AppUser = Depends(get_db_user),
):
    note = crud.get_note(db, note_id)
    if not note or note.user_id != user.clerk_user_id:
        raise HTTPException(status_code=404, detail="Note not found")
    updated = crud.update_note(db, note_id, data)
    background_tasks.add_task(rag.upsert_note_embedding_by_id, note_id)
    return updated

@app.delete("/notes/{note_id}", status_code=204)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    user: models.AppUser = Depends(get_db_user),
):
    note = crud.get_note(db, note_id)
    if not note or note.user_id != user.clerk_user_id:
        raise HTTPException(status_code=404, detail="Note not found")
    crud.delete_note(db, note_id)


# AI / RAG
@app.post("/ai/query", response_model=AIQueryResponse, response_model_by_alias=True)
def ai_query(
    data: AIQueryRequest,
    db: Session = Depends(get_db),
    user: models.AppUser = Depends(get_db_user),
):
    result = rag.answer_question(db, user.clerk_user_id, data.question)
    return AIQueryResponse(answer=result["answer"], sources=result["sources"])


@app.post("/ai/reindex", response_model=AIReindexResponse)
def ai_reindex(
    db: Session = Depends(get_db),
    user: models.AppUser = Depends(get_db_user),
):
    count = rag.reindex_all_notes(db, user_id=user.clerk_user_id)
    return AIReindexResponse(indexed=count)
