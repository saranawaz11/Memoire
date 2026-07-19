import html
import os
import re
from functools import lru_cache
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.orm import Session
import models
from database import SessionLocal
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint


load_dotenv()

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"  # 384 dims
EMBEDDING_DIM = 384
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

TOP_K_CHUNKS = int(os.getenv("RAG_TOP_K_CHUNKS", "8"))   # chunks to retrieve
TOP_K_NOTES = int(os.getenv("RAG_TOP_K_NOTES", "5"))     # distinct notes to keep/cite

CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "800"))       # characters
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "120"))  # characters


# Model loading (cached singletons so we don't reload on every request)
@lru_cache(maxsize=1)
def get_embedding_model():
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


@lru_cache(maxsize=1)
def get_text_splitter():

    return RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )


@lru_cache(maxsize=1)
def get_llm():

    endpoint = HuggingFaceEndpoint(
        repo_id="Qwen/Qwen2.5-7B-Instruct",
        huggingfacehub_api_token=HF_TOKEN,
        task="text-generation",
        max_new_tokens=512,
        temperature=0.3,
        provider="auto",
    )
    return ChatHuggingFace(llm=endpoint)


def embed_text(text: str) -> list[float]:
    return get_embedding_model().embed_query(text)


def embed_texts(texts: list[str]) -> list[list[float]]:
    return get_embedding_model().embed_documents(texts)


# Chunking

_TAG_RE = re.compile(r"<[^>]+>")
_WHITESPACE_RE = re.compile(r"[ \t]+")


def _strip_html(raw: str) -> str:
    if not raw:
        return ""
    text = _TAG_RE.sub(" ", raw)
    text = html.unescape(text)
    text = _WHITESPACE_RE.sub(" ", text)
    # Collapse excess blank lines left behind by block-level tags.
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()


def _chunk_note_text(note: "models.Note") -> list[str]:
    tags = " ".join(note.tags or [])
    body = _strip_html(note.content or "").strip()

    if not body:
        # Short/empty notes: one chunk is enough, no need to split.
        text = f"{note.title}\n{tags}".strip()
        return [text] if text else []

    splitter = get_text_splitter()
    raw_chunks = splitter.split_text(body)

    return [f"{note.title}\n{chunk}\n{tags}".strip() for chunk in raw_chunks]


# Writing embeddings (called after a note is created/updated)
def upsert_note_embedding_by_id(note_id: int) -> None:
    db: Session = SessionLocal()
    try:
        note = db.query(models.Note).filter(models.Note.id == note_id).first()
        if not note:
            return
        _reembed_note(db, note)
        db.commit()
    finally:
        db.close()


def _reembed_note(db: Session, note: "models.Note") -> None:
    db.query(models.NoteChunk).filter(models.NoteChunk.note_id == note.id).delete()

    texts = _chunk_note_text(note)
    if not texts:
        return

    vectors = embed_texts(texts)
    for i, (text, vector) in enumerate(zip(texts, vectors)):
        db.add(models.NoteChunk(
            note_id=note.id,
            chunk_index=i,
            content=text,
            embedding=vector,
        ))


def reindex_all_notes(db: Session, user_id: str | None = None) -> int:
    query = db.query(models.Note)
    if user_id:
        query = query.filter(models.Note.user_id == user_id)
    notes = query.all()

    for note in notes:
        _reembed_note(db, note)
    db.commit()
    return len(notes)


# Retrieval + answer generation
def search_similar_chunks(db: Session, user_id: str, question: str, k: int = TOP_K_CHUNKS):
    query_embedding = embed_text(question)
    return (
        db.query(models.NoteChunk)
        .join(models.Note, models.Note.id == models.NoteChunk.note_id)
        .filter(models.Note.user_id == user_id)
        .filter(models.NoteChunk.embedding.isnot(None))
        .order_by(models.NoteChunk.embedding.cosine_distance(query_embedding))
        .limit(k)
        .all()
    )


PROMPT_TEMPLATE = """You are a helpful assistant that answers questions using ONLY the excerpts from the user's own notes below.
If the excerpts don't contain enough information to answer, say "I couldn't find anything in your notes about that."
Don't make anything up. Keep the answer concise.

Excerpts:
{context}

Question: {question}

Answer:"""


def _build_context(chunks: list["models.NoteChunk"]) -> str:
    blocks = []
    for chunk in chunks:
        blocks.append(f"[Note #{chunk.note_id}] {chunk.content}")
    return "\n\n".join(blocks)


def _snippet(text: str, length: int = 160) -> str:
    text = text.strip()
    if len(text) <= length:
        return text
    return text[:length].rsplit(" ", 1)[0] + "..."


def answer_question(db: Session, user_id: str, question: str) -> dict:
    chunks = search_similar_chunks(db, user_id, question)

    if not chunks:
        return {
            "answer": "I couldn't find anything in your notes about that.",
            "sources": [],
        }

    prompt = PROMPT_TEMPLATE.format(context=_build_context(chunks), question=question)
    llm = get_llm()
    result = llm.invoke(prompt)
    answer_text = getattr(result, "content", str(result))

    seen_note_ids: set[int] = set()
    sources = []
    for chunk in chunks:
        if chunk.note_id in seen_note_ids:
            continue
        seen_note_ids.add(chunk.note_id)
        sources.append({
            "id": chunk.note_id,
            "title": chunk.note.title,
            "snippet": _snippet(chunk.content),
        })
        if len(sources) >= TOP_K_NOTES:
            break

    return {"answer": answer_text, "sources": sources}