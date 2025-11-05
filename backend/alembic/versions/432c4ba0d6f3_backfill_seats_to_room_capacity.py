"""backfill seats to room capacity

Revision ID: 432c4ba0d6f3
Revises: 9eca9afce229
Create Date: 2025-10-02 17:00:35.006015
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "432c4ba0d6f3"
down_revision = "9eca9afce229"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Set seats to the room capacity for sections that currently have 0/NULL."""
    op.execute(
        """
        UPDATE sections AS s
        SET seats = r.capacity
        FROM rooms AS r
        WHERE s.room_id = r.id
          AND (s.seats IS NULL OR s.seats = 0);
        """
    )

    # If you ALSO want to clamp any over-capacity values down to capacity,
    # uncomment the block below. Otherwise we leave existing >capacity values as-is.
    #
    # op.execute(
    #     """
    #     UPDATE sections AS s
    #     SET seats = r.capacity
    #     FROM rooms AS r
    #     WHERE s.room_id = r.id
    #       AND s.seats > r.capacity;
    #     """
    # )


def downgrade() -> None:
    """No-op: this data change is not safely reversible without a snapshot."""
    # Intentionally left blank. Resetting seats to 0 could destroy legitimate values.
    pass
