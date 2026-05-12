from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

import crud
import models
from database import engine, get_db, ensure_app_users_schema
from schemas import MeResponse, NoteCreate, NoteUpdate, NoteResponse, UserListResponse

models.Base.metadata.create_all(bind=engine)
ensure_app_users_schema()

app = FastAPI(title="Notes App")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user_id(x_user_id: str = Header(...)) -> str:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return x_user_id


def get_db_user(
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_current_user_id),
) -> models.AppUser:
    return crud.get_or_create_app_user(db, clerk_user_id)


# @app.get("/me", response_model=MeResponse, response_model_by_alias=True)
# def read_me(user: models.AppUser = Depends(get_db_user)):
#     return MeResponse(user_id=user.clerk_user_id, role=user.role)


@app.get("/me", response_model=MeResponse, response_model_by_alias=True)
def read_me(
    user: models.AppUser = Depends(get_db_user),
    first_name: str | None = Header(None, alias="x-first-name"),
    last_name:  str | None = Header(None, alias="x-last-name"),
    email:      str | None = Header(None, alias="x-email"),
    db: Session = Depends(get_db),
):
    # if name not saved yet, save it now
    if first_name and not user.first_name:
        user.first_name = first_name
        user.last_name  = last_name
        user.email      = email
        db.commit()
        db.refresh(user)

    return MeResponse(
        user_id=user.clerk_user_id,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
    )
    
def require_manager(user: models.AppUser = Depends(get_db_user)) -> models.AppUser:
    if user.role != "manager":
        raise HTTPException(status_code=403, detail="Managers only.")
    return user

# @app.get("/users")
# def get_all_users(
#     user: models.AppUser = Depends(require_manager),
#     db: Session = Depends(get_db)
# ):
#     return db.query(models.AppUser).all()

@app.get("/users")
def get_all_users(user=Depends(require_manager), db: Session = Depends(get_db)) -> list[UserListResponse]:
    rows = (
        db.query(
            models.AppUser.clerk_user_id,
            models.AppUser.role,
            models.AppUser.first_name,
            models.AppUser.last_name,
            models.AppUser.email,
            models.AppUser.joined_at,
            func.count(models.Note.id).label("note_count"),
        )
        .outerjoin(models.Note, models.Note.user_id == models.AppUser.clerk_user_id)
        .group_by(
            models.AppUser.clerk_user_id,
            models.AppUser.role,
            models.AppUser.first_name,
            models.AppUser.last_name,
            models.AppUser.email,
            models.AppUser.joined_at,
        )
        .all()
    )

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


@app.delete("/users/{target_user_id}")
def delete_user(
    target_user_id: str,
    user: models.AppUser = Depends(require_manager),  # must be manager
    db: Session = Depends(get_db)
):
    db.query(models.AppUser).filter(models.AppUser.clerk_user_id == target_user_id).delete()
    db.commit()
    return {"message": f"User {target_user_id} deleted"}

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