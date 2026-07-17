"""add note_chunks table with HNSW index, drop notes.embedding

Revision ID: add_note_chunks
Revises: add_note_embedding
Create Date: 2026-07-05

HOW TO USE:
1. Copy this file into backend/alembic/versions/.
2. Run `alembic upgrade head`.
3. Afterwards, hit POST /ai/reindex (per user) to populate chunks for
   existing notes — the old single-vector embeddings are dropped by this
   migration, so nothing is retrievable until you reindex.
"""
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = "add_note_chunks"
down_revision = "add_note_embedding"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "note_chunks",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "note_id",
            sa.Integer(),
            sa.ForeignKey("notes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("embedding", Vector(384), nullable=True),
    )
    op.create_index("ix_note_chunks_note_id", "note_chunks", ["note_id"])

    # Approximate nearest-neighbor index for fast cosine-distance search.
    # HNSW is the recommended pgvector index for this access pattern
    # (good recall, no separate "training"/build step like IVFFlat needs).
    op.create_index(
        "ix_note_chunks_embedding_hnsw",
        "note_chunks",
        ["embedding"],
        postgresql_using="hnsw",
        postgresql_with={"m": 16, "ef_construction": 64},
        postgresql_ops={"embedding": "vector_cosine_ops"},
    )

    # Superseded by chunk-level embeddings.
    op.drop_column("notes", "embedding")


def downgrade() -> None:
    op.add_column("notes", sa.Column("embedding", Vector(384), nullable=True))
    op.drop_index("ix_note_chunks_embedding_hnsw", table_name="note_chunks")
    op.drop_index("ix_note_chunks_note_id", table_name="note_chunks")
    op.drop_table("note_chunks")