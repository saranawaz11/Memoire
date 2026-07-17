from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, ARRAY, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from database import Base
from sqlalchemy.sql import func



def utcnow():
    return datetime.now(timezone.utc)

class AppUser(Base):
    __tablename__ = "app_users"

    id            = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String, unique=True, nullable=False, index=True)
    role          = Column(String, nullable=False, default="user")
    first_name    = Column(String, nullable=True)
    last_name     = Column(String, nullable=True)
    email         = Column(String, nullable=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)



class Note(Base):
    __tablename__ = "notes"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String, nullable=False)
    user_id    = Column(String, nullable=False, index=True)
    content    = Column(Text)
    tags       = Column(ARRAY(String), default=list)
    word_count = Column(Integer, default=0)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    chunks = relationship(
        "NoteChunk",
        back_populates="note",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="NoteChunk.chunk_index",
    )


class NoteChunk(Base):
    """
    One row per chunk of a note's content, each with its own embedding.
    Longer notes get split into several chunks so retrieval can match a
    specific passage instead of diluting the whole note into one vector.
    """
    __tablename__ = "note_chunks"

    id          = Column(Integer, primary_key=True, index=True)
    note_id     = Column(Integer, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content     = Column(Text, nullable=False)
    # all-MiniLM-L6-v2 produces 384-dim vectors.
    embedding   = Column(Vector(384), nullable=True)

    note = relationship("Note", back_populates="chunks")