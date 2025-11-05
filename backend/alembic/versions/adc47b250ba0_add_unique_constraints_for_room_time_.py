"""add unique constraints for room+time and instructor+time

Revision ID: adc47b250ba0
Revises: 432c4ba0d6f3
Create Date: 2025-10-02 18:08:59.032057
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "adc47b250ba0"
down_revision = "432c4ba0d6f3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Enforce:
      - no two sections in the same room at the same meeting time
      - no instructor teaching two sections at the same meeting time
    """
    op.create_unique_constraint(
        "uq_sections_room_time", "sections", ["room_id", "meeting_time_id"]
    )
    op.create_unique_constraint(
        "uq_sections_instructor_time", "sections", ["instructor_id", "meeting_time_id"]
    )


def downgrade() -> None:
    # drop in reverse order
    op.drop_constraint("uq_sections_instructor_time", "sections", type_="unique")
    op.drop_constraint("uq_sections_room_time", "sections", type_="unique")
