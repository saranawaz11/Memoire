from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import crud
import models
from database import engine, get_db
from schemas import MeResponse, NoteCreate, NoteUpdate, NoteResponse

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Notes App")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Auth — Clerk passes user ID from frontend via header
# ---------------------------------------------------------------------------

def get_current_user_id(x_user_id: str = Header(...)) -> str:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return x_user_id


def get_db_user(
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id),
) -> models.AppUser:
    return crud.get_or_create_app_user(db, clerk_user_id)


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------


@app.get("/me", response_model=MeResponse, response_model_by_alias=True)
def read_me(user: models.AppUser = Depends(get_db_user)):
    return MeResponse(user_id=user.clerk_user_id, role=user.role)


# ---------------------------------------------------------------------------
# Note Routes
# ---------------------------------------------------------------------------

@app.post("/notes/", response_model=NoteResponse, response_model_by_alias=True, status_code=201)
def create_note(data: NoteCreate, db: Session = Depends(get_db), user: models.AppUser = Depends(get_db_user)):
    return crud.create_note(db, data, user.clerk_user_id)


@app.get("/notes/", response_model=list[NoteResponse], response_model_by_alias=True)
def list_notes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), user: models.AppUser = Depends(get_db_user)):
    return crud.get_notes_by_user(db, user.clerk_user_id, skip=skip, limit=limit)


@app.get("/notes/{note_id}", response_model=NoteResponse, response_model_by_alias=True)
def get_note(note_id: int, db: Session = Depends(get_db), user: models.AppUser = Depends(get_db_user)):
    note = crud.get_note(db, note_id)
    if not note or note.user_id != user.clerk_user_id:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@app.patch("/notes/{note_id}", response_model=NoteResponse, response_model_by_alias=True)
def update_note(note_id: int, data: NoteUpdate, db: Session = Depends(get_db), user: models.AppUser = Depends(get_db_user)):
    note = crud.get_note(db, note_id)
    if not note or note.user_id != user.clerk_user_id:
        raise HTTPException(status_code=404, detail="Note not found")
    return crud.update_note(db, note_id, data)


@app.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db), user: models.AppUser = Depends(get_db_user)):
    note = crud.get_note(db, note_id)
    if not note or note.user_id != user.clerk_user_id:
        raise HTTPException(status_code=404, detail="Note not found")
    crud.delete_note(db, note_id)