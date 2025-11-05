"""add seats to sections

Revision ID: 9eca9afce229
Revises: None
Create Date: 2025-10-02 16:23:58.141746
"""
from alembic import op
import sqlalchemy as sa

revision = "9eca9afce229"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add seats column and backfill 0 for existing rows."""
    # Add with a server default so existing rows get 0 immediately
    op.add_column(
        "sections",
        sa.Column("seats", sa.Integer(), nullable=True, server_default=sa.text("0")),
    )
    # Drop the default and enforce NOT NULL for future writes
    op.alter_column("sections", "seats", server_default=None)
    op.alter_column("sections", "seats", nullable=False)


def downgrade() -> None:
    """Remove seats column."""
    op.drop_column("sections", "seats")
