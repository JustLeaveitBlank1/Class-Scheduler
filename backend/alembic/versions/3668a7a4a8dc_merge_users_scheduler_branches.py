"""merge users + scheduler branches

Revision ID: 3668a7a4a8dc
Revises: 87b3c313a8c9, 3f7f8c63de3f
Create Date: 2025-11-06 13:42:52.220703

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3668a7a4a8dc'
down_revision: Union[str, Sequence[str], None] = ('87b3c313a8c9', '3f7f8c63de3f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
