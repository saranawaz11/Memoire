from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from database import conn
from fastapi import FastAPI, HTTPException
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Note(BaseModel):
    title: str
    content: str
    tags: list[str] = []


@app.get("/")
async def root():
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM notes ORDER BY updatedAt DESC")
        rows = cur.fetchall()
    notes = [
        {"id": r[0], "title": r[1], "content": r[2], "tags": r[3], "updatedAt": str(r[4]), "wordCount": r[5]}
        for r in rows
    ]
    return {"notes": notes}


@app.get("/note/{note_id}")
async def get_note_by_id(note_id: int):
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM notes WHERE id = %s", (note_id,))
        r = cur.fetchone()
    if not r:
        raise HTTPException(status_code=404, detail="Note not found")
    note = {"id": r[0], "title": r[1], "content": r[2], "tags": r[3], "updatedAt": str(r[4]), "wordCount": r[5]}
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