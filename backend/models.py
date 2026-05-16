from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, ARRAY
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
