
#Persistence: backed by the `chat_messages` table via crud.py, not an in-memory dict — so history survives server restarts and works correctly across multiple worker processes (an in-memory dict would NOT, since a user's requests can land on any worker).
# Conversation-history ("session") management for the notes assistant.

import json
from sqlalchemy.orm import Session
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage

import crud


def _message_to_row(message: BaseMessage) -> tuple[str, str, str | None]:

    if isinstance(message, HumanMessage):
        return "human", message.content, None

    if isinstance(message, ToolMessage):
        data = json.dumps({
            "tool_call_id": message.tool_call_id,
            "name": getattr(message, "name", None),
        })
        content = message.content if isinstance(message.content, str) else json.dumps(message.content)
        return "tool", content, data

    if isinstance(message, AIMessage):
        data = json.dumps({"tool_calls": message.tool_calls}) if message.tool_calls else None
        return "ai", message.content or "", data
    
    return message.type, message.content or "", None


def _row_to_message(row) -> BaseMessage:
    extra = json.loads(row.data) if row.data else {}

    if row.role == "human":
        return HumanMessage(content=row.content)

    if row.role == "tool":
        return ToolMessage(
            content=row.content,
            tool_call_id=extra.get("tool_call_id", ""),
            name=extra.get("name"),
        )

    if row.role == "ai":
        return AIMessage(content=row.content, tool_calls=extra.get("tool_calls", []))

    return AIMessage(content=row.content)


class DBChatMessageHistory(BaseChatMessageHistory):

    def __init__(self, db: Session, user_id: str, limit: int = 40):
        self.db = db
        self.user_id = user_id
        self.limit = limit

    @property
    def messages(self) -> list[BaseMessage]:
        rows = crud.get_chat_context(self.db, self.user_id, limit=self.limit)
        return [_row_to_message(row) for row in rows]

    def add_message(self, message: BaseMessage) -> None:
        role, content, data = _message_to_row(message)
        crud.add_chat_message(self.db, self.user_id, role, content, data=data)

    def clear(self) -> None:
        raise NotImplementedError(
            "Chat history deletion isn't wired up — add a dedicated "
            "endpoint if you want a 'clear conversation' feature."
        )


def get_session_history(db: Session, user_id: str) -> DBChatMessageHistory:
    return DBChatMessageHistory(db, user_id)