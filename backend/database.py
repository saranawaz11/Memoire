import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def ensure_app_users_schema() -> None:
    inspector = inspect(engine)
    if "app_users" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("app_users")}
    with engine.begin() as conn:
        if "first_name" not in columns:
            conn.execute(text("ALTER TABLE app_users ADD COLUMN first_name VARCHAR"))
        if "last_name" not in columns:
            conn.execute(text("ALTER TABLE app_users ADD COLUMN last_name VARCHAR"))
        if "email" not in columns:
            conn.execute(text("ALTER TABLE app_users ADD COLUMN email VARCHAR"))
        if "joined_at" not in columns:
            conn.execute(text("ALTER TABLE app_users ADD COLUMN joined_at TIMESTAMP"))
            conn.execute(text("UPDATE app_users SET joined_at = NOW() WHERE joined_at IS NULL"))
            conn.execute(text("ALTER TABLE app_users ALTER COLUMN joined_at SET NOT NULL"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()