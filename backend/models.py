from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, Index, ARRAY
from database import Base


class AppUser(Base):
    # """Local profile keyed by Clerk user id; role defaults to customer."""

    __tablename__ = "app_users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String, unique=True, nullable=False, index=True)
    role = Column(String, nullable=False, default="customer")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    user_id = Column(String, nullable=False, index=True)
    content = Column(Text)
    tags = Column(ARRAY(String), default=[])
    word_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("by_user", "user_id"),
    )