"""add soft-delete + section fields + instructor target_load

Revision ID: 87b3c313a8c9
Revises: adc47b250ba0   # <-- set this to your actual current head!
Create Date: 2025-11-06 13:28:33.123161
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "87b3c313a8c9"
down_revision: Union[str, Sequence[str], None] = "adc47b250ba0"  # <-- update if different
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


SECTION_STATUS_ENUM = "section_status"


def upgrade() -> None:
    # ----- Instructors: target_load -----
    op.add_column("instructors", sa.Column("target_load", sa.Integer(), nullable=True))

    # ----- Sections: soft-delete + fields -----
    # status enum
    sa_enum = sa.Enum("open", "closed", name=SECTION_STATUS_ENUM)
    sa_enum.create(op.get_bind(), checkfirst=True)

    op.add_column("sections", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("sections", sa.Column("status", sa_enum, nullable=True))
    op.add_column("sections", sa.Column("section_number", sa.String(length=16), nullable=True))
    op.add_column("sections", sa.Column("notes", sa.Text(), nullable=True))

    # unique (course_id, section_number) if section_number is used
    op.create_unique_constraint(
        "uq_course_section_number",
        "sections",
        ["course_id", "section_number"],
        deferrable=None,
        initially=None,
        # This keeps NULL section_number rows allowed more than once
        # (Postgres treats NULL != NULL, so this is fine as-is)
    )


def downgrade() -> None:
    # drop UC first
    op.drop_constraint("uq_course_section_number", "sections", type_="unique")

    # drop section columns
    op.drop_column("sections", "notes")
    op.drop_column("sections", "section_number")
    op.drop_column("sections", "status")
    op.drop_column("sections", "deleted_at")

    # drop enum (safe if no other table uses it)
    sa.Enum(name=SECTION_STATUS_ENUM).drop(op.get_bind(), checkfirst=True)

    # drop instructor column
    op.drop_column("instructors", "target_load")
