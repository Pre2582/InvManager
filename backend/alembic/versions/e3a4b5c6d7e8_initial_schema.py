"""initial schema — create all base tables

Revision ID: e3a4b5c6d7e8
Revises:
Create Date: 2026-06-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'e3a4b5c6d7e8'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create orderstatus enum only if it does not already exist.
    # PostgreSQL does not support CREATE TYPE IF NOT EXISTS, so we check pg_type first.
    row = conn.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'orderstatus'")).scalar()
    if not row:
        conn.execute(sa.text(
            "CREATE TYPE orderstatus AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED')"
        ))

    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index('ix_users_username', 'users', ['username'], unique=True, if_not_exists=True)
    op.create_index('ix_users_email', 'users', ['email'], unique=True, if_not_exists=True)

    op.create_table(
        'customers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index('ix_customers_email', 'customers', ['email'], unique=True, if_not_exists=True)

    op.create_table(
        'products',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('sku', sa.String(length=100), nullable=False),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index('ix_products_sku', 'products', ['sku'], unique=True, if_not_exists=True)

    # Use postgresql.ENUM with create_type=False so SQLAlchemy does not try to
    # CREATE the type again when issuing CREATE TABLE orders.
    op.create_table(
        'orders',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('customer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status',
                  postgresql.ENUM('PENDING', 'CONFIRMED', 'CANCELLED',
                                  name='orderstatus', create_type=False),
                  nullable=False),
        sa.Column('total_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index('ix_orders_customer_id', 'orders', ['customer_id'], if_not_exists=True)

    op.create_table(
        'order_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Numeric(10, 2), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index('ix_order_items_order_id', 'order_items', ['order_id'], if_not_exists=True)


def downgrade() -> None:
    op.drop_index('ix_order_items_order_id', table_name='order_items')
    op.drop_table('order_items')
    op.drop_index('ix_orders_customer_id', table_name='orders')
    op.drop_table('orders')
    op.drop_index('ix_products_sku', table_name='products')
    op.drop_table('products')
    op.drop_index('ix_customers_email', table_name='customers')
    op.drop_table('customers')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_username', table_name='users')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS orderstatus')
