from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    tags: List[str] = []


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class NoteResponse(BaseModel):
    # """JSON uses camelCase for the Next.js frontend."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    title: str
    user_id: str = Field(serialization_alias="userId")
    content: Optional[str] = None
    tags: List[str]
    word_count: int = Field(serialization_alias="wordCount")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")


class MeResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(serialization_alias="userId")
    role: str
