"""add embedding column to notes (pgvector)

Revision ID: add_note_embedding
Revises: <PUT_YOUR_CURRENT_HEAD_REVISION_HERE>
Create Date: 2026-07-03

HOW TO USE:
1. Run `alembic heads` in backend/ to find your current head revision id.
2. Copy this file into backend/alembic/versions/, rename it to something like
   <revision_id>_add_note_embedding.py, and replace the "down_revision" value
   below with the head id from step 1.
3. Run `pip install pgvector` (see requirements.txt notes) before running
   this migration, since the pgvector SQLAlchemy type is imported below.
4. Run `alembic upgrade head`.
"""
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = "add_note_embedding"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable the pgvector extension (requires pgvector installed on the
    # Postgres server itself — see notes in requirements.txt/README below).
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.add_column(
        "notes",
        sa.Column("embedding", Vector(384), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("notes", "embedding")
    # Not dropping the extension on downgrade in case other tables use it.