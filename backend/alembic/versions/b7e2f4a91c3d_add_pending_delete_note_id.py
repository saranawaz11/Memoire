"""add pending_delete_note_id to app_users

Revision ID: b7e2f4a91c3d
Revises: 83b28c44ef7d
Create Date: 2026-07-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "b7e2f4a91c3d"
down_revision = "83b28c44ef7d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "app_users",
        sa.Column("pending_delete_note_id", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("app_users", "pending_delete_note_id")