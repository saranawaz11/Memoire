from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from database import conn
from fastapi import FastAPI, HTTPException
from datetime import datetime

app = FastAPI()

class Note(BaseModel):
    title: str
    content: str
    tags: list[str] = []


@app.get("/")
async def root():
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM notes ORDER BY updatedAt DESC")
        notes = cur.fetchall()
    return {"notes": notes}


@app.get("/note/{note_id}")
async def get_note_by_id(note_id: int):
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM notes WHERE id = %s", (note_id,))
        note = cur.fetchone()
    print("note:", note)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"note": note}


@app.post("/note")
async def create_note(note: Note):
    word_count = len(note.content.split())
    with conn.cursor() as cur:
       cur.execute(
    '''INSERT INTO notes (title, content, tags, updatedat, wordcount) 
       VALUES (%s, %s, %s, %s, %s)''',
    (note.title, note.content, note.tags, datetime.now(), word_count)
    )
    conn.commit()
    return {"message": "Note created successfully"}


@app.put("/note/{note_id}")
async def update_note(note_id: int, note: Note):
    word_count = len(note.content.split())
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE notes SET title=%s, content=%s, tags=%s, updatedat=%s, wordcount=%s WHERE id=%s",
            (note.title, note.content, note.tags, datetime.now(), word_count, note_id)
        )
        conn.commit()
    return {"message": "Note updated successfully"}

@app.delete("/note/{note_id}")
async def delete_note(note_id: int):
    with conn.cursor() as cur:
        cur.execute("DELETE FROM notes WHERE id = %s", (note_id,))
        conn.commit()
    return {"message": "Note deleted successfully"}