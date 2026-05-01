from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder


app = FastAPI()

class Note(BaseModel):
    id: int
    title: str
    content: str
    tags: list[str]
    updatedAt: str
    wordCount: int

notes = [
  {
    "id": 1,
    "title": "Introduction to React",
    "content": "React is a JavaScript library used for building user interfaces, especially single-page applications.",
    "tags": ["react", "javascript", "frontend"],
    "updatedAt": "2026-05-01T10:00:00Z",
    "wordCount": 18
  },
  {
    "id": 2,
    "title": "Node.js Basics",
    "content": "Node.js allows JavaScript to run on the server side using an event-driven, non-blocking I/O model.",
    "tags": ["nodejs", "backend", "javascript"],
    "updatedAt": "2026-05-01T10:05:00Z",
    "wordCount": 20
  },
  {
    "id": 3,
    "title": "MongoDB Overview",
    "content": "MongoDB is a NoSQL database that stores data in flexible JSON-like documents.",
    "tags": ["mongodb", "database", "nosql"],
    "updatedAt": "2026-05-01T10:10:00Z",
    "wordCount": 15
  },
  {
    "id": 4,
    "title": "Express.js Routing",
    "content": "Express provides a robust set of features to build web applications and APIs with routing support.",
    "tags": ["express", "backend", "api"],
    "updatedAt": "2026-05-01T10:15:00Z",
    "wordCount": 18
  },
  {
    "id": 5,
    "title": "TypeScript Benefits",
    "content": "TypeScript adds static typing to JavaScript, improving code quality and maintainability.",
    "tags": ["typescript", "javascript"],
    "updatedAt": "2026-05-01T10:20:00Z",
    "wordCount": 14
  },
  {
    "id": 6,
    "title": "Next.js Features",
    "content": "Next.js enables server-side rendering and static site generation for React applications.",
    "tags": ["nextjs", "react", "framework"],
    "updatedAt": "2026-05-01T10:25:00Z",
    "wordCount": 14
  },
  {
    "id": 7,
    "title": "REST API Principles",
    "content": "REST APIs use HTTP methods like GET, POST, PUT, and DELETE to manage resources.",
    "tags": ["api", "rest", "backend"],
    "updatedAt": "2026-05-01T10:30:00Z",
    "wordCount": 18
  },
  {
    "id": 8,
    "title": "Git Basics",
    "content": "Git is a distributed version control system used to track changes in source code.",
    "tags": ["git", "version-control"],
    "updatedAt": "2026-05-01T10:35:00Z",
    "wordCount": 17
  },
  {
    "id": 9,
    "title": "CSS Flexbox",
    "content": "Flexbox is a layout model that allows elements to align and distribute space within a container.",
    "tags": ["css", "flexbox", "frontend"],
    "updatedAt": "2026-05-01T10:40:00Z",
    "wordCount": 18
  },
  {
    "id": 10,
    "title": "Authentication Basics",
    "content": "Authentication verifies user identity using methods like JWT, sessions, or OAuth.",
    "tags": ["auth", "security", "backend"],
    "updatedAt": "2026-05-01T10:45:00Z",
    "wordCount": 14
  }
]

# print(notes)

@app.get("/")
async def root():
    return notes

@app.get("/note/{note_id}")
async def get_note_by_id(note_id: int):
    for note in notes:
        if note["id"] == note_id:
            return note
    return {"message": "Note not found"}


@app.post("/note", response_model=Note)
async def create_note(note: Note):
    notes.append(note)
    return {"message": "Note created successfully", "note": note}


@app.put("/note/{note_id}", response_model=Note)
async def update_note(note_id: int, note: Note):
    update_note_encoded = jsonable_encoder(note)
    notes[note_id] = update_note_encoded
    return {"message": "Note updated successfully", "note": update_note_encoded}

@app.delete("/note/{note_id}")
async def delete_note(note_id: int):
    del notes[note_id]
    return {"message": "Note deleted successfully", "note": notes[note_id]}