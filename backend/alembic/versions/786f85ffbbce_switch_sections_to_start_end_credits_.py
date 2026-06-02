"""Switch sections to start/end/credits; drop meeting_times

Revision ID: 786f85ffbbce
Revises: 3668a7a4a8dc
Create Date: 2025-11-26 19:46:22.660429
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "786f85ffbbce"
down_revision: Union[str, Sequence[str], None] = "3668a7a4a8dc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: move sections to free-form times + credits and drop meeting_times."""

    # 1) Drop unique constraints that depended on meeting_time_id
    #    (these names come from your Section model __table_args__)
    with op.batch_alter_table("sections") as batch:
        try:
            batch.drop_constraint("uq_room_time", type_="unique")
        except Exception:
            # ok if it doesn't exist (fresh DB, etc.)
            pass
        try:
            batch.drop_constraint("uq_instructor_time", type_="unique")
        except Exception:
            pass

    # 2) Add new columns for free-form start/end and credits
    op.add_column(
        "sections",
        sa.Column(
            "start",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.add_column(
        "sections",
        sa.Column(
            "end",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.add_column(
        "sections",
        sa.Column(
            "credits",
            sa.Integer(),
            nullable=False,
            server_default="3",
        ),
    )

    # 3) Drop old seat/time columns from sections
    with op.batch_alter_table("sections") as batch:
        # remove FK to meeting_times
        try:
            batch.drop_column("meeting_time_id")
        except Exception:
            pass
        # remove seats (we'll track credits instead)
        try:
            batch.drop_column("seats")
        except Exception:
            pass

    # 4) Drop meeting_times table entirely (no longer used)
    try:
        op.drop_table("meeting_times")
    except Exception:
        # fine if it doesn't exist in this environment
        pass

    # 5) Helpful non-unique indexes for conflict checks (room/instructor vs time)
    op.create_index(
        "ix_sections_room_time",
        "sections",
        ["room_id", "start", "end"],
        unique=False,
    )
    op.create_index(
        "ix_sections_instructor_time",
        "sections",
        ["instructor_id", "start", "end"],
        unique=False,
    )

    # 6) Remove server_default on new columns (app will always send explicit values)
    with op.batch_alter_table("sections") as batch:
        batch.alter_column(
            "start",
            server_default=None,
            existing_type=sa.DateTime(timezone=True),
        )
        batch.alter_column(
            "end",
            server_default=None,
            existing_type=sa.DateTime(timezone=True),
        )
        batch.alter_column(
            "credits",
            server_default=None,
            existing_type=sa.Integer(),
        )


def downgrade() -> None:
    """Downgrade schema: recreate meeting_times and old section columns."""

    # 1) Drop the helper indexes
    try:
        op.drop_index("ix_sections_instructor_time", table_name="sections")
    except Exception:
        pass
    try:
        op.drop_index("ix_sections_room_time", table_name="sections")
    except Exception:
        pass

    # 2) Recreate meeting_times table (minimal version)
    op.create_table(
        "meeting_times",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("day_of_week", sa.String(), nullable=False),
        sa.Column("start_time", sa.String(), nullable=False),
        sa.Column("end_time", sa.String(), nullable=False),
    )

    # 3) Add old columns back on sections
    with op.batch_alter_table("sections") as batch:
        batch.add_column(sa.Column("meeting_time_id", sa.Integer(), nullable=True))
        batch.add_column(sa.Column("seats", sa.Integer(), nullable=True))

    # 4) Remove new columns
    with op.batch_alter_table("sections") as batch:
        try:
            batch.drop_column("credits")
        except Exception:
            pass
        try:
            batch.drop_column("end")
        except Exception:
            pass
        try:
            batch.drop_column("start")
        except Exception:
            pass

    # 5) Recreate the old unique constraints on room/instructor+meeting_time
    with op.batch_alter_table("sections") as batch:
        batch.create_unique_constraint(
            "uq_room_time", ["room_id", "meeting_time_id"]
        )
        batch.create_unique_constraint(
            "uq_instructor_time", ["instructor_id", "meeting_time_id"]
        )
