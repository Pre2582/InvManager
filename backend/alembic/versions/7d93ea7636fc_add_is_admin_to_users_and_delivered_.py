"""add_is_admin_to_users_and_delivered_status

Revision ID: 7d93ea7636fc
Revises: 726fd28f8641
Create Date: 2026-06-03 14:55:54.401332

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7d93ea7636fc'
down_revision = '726fd28f8641'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Add is_admin column — all existing users default to non-admin
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))

    # 2. Add DELIVERED to the orderstatus PostgreSQL enum (IF NOT EXISTS is safe on re-runs)
    op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'DELIVERED'")


def downgrade() -> None:
    op.drop_column('users', 'is_admin')
    # PostgreSQL does not support removing enum values once added;
    # the DELIVERED value will persist after downgrade.
