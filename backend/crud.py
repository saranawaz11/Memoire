from sqlalchemy.orm import Session
from models import AppUser, Note
from schemas import NoteCreate, NoteUpdate


def get_or_create_app_user(db: Session, clerk_user_id: str) -> AppUser:
    user = db.query(AppUser).filter(AppUser.clerk_user_id == clerk_user_id).first()
    if user:
        return user
    user = AppUser(clerk_user_id=clerk_user_id, role="user")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_note(db: Session, note_id: int) -> Note | None:
    return db.query(Note).filter(Note.id == note_id).first()


def get_notes_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> list[Note]:
    return db.query(Note).filter(Note.user_id == user_id).offset(skip).limit(limit).all()


def create_note(db: Session, data: NoteCreate, user_id: str) -> Note:
    note = Note(
        title=data.title,
        content=data.content,
        tags=data.tags,
        word_count=len(data.content.split()) if data.content else 0,
        user_id=user_id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, note_id: int, data: NoteUpdate) -> Note | None:
    note = get_note(db, note_id)
    if not note:
        return None
    if data.title is not None:
        note.title = data.title
    if data.content is not None:
        note.content = data.content
        note.word_count = len(data.content.split())
    if data.tags is not None:
        note.tags = data.tags
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, note_id: int) -> bool:
    note = get_note(db, note_id)
    if not note:
        return False
    db.delete(note)
    db.commit()
    return True