"""Add enhanced user, payment, and notification support

Revision ID: a7e3c5b1d2f9
Revises: previous_revision_id
Create Date: 2025-08-25 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision = 'a7e3c5b1d2f9'
down_revision = None  # Replace with the actual previous revision ID when known
branch_labels = None
depends_on = None


def upgrade():
    # Add new fields to User table
    op.add_column('user', sa.Column('verification_token', sa.String(length=255), nullable=True))
    op.add_column('user', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('user', sa.Column('reset_token', sa.String(length=255), nullable=True))
    op.add_column('user', sa.Column('reset_token_expiry', sa.DateTime(), nullable=True))
    op.add_column('user', sa.Column('last_login', sa.DateTime(), nullable=True))
    op.add_column('user', sa.Column('mobile_money_provider', sa.String(length=50), nullable=True))
    op.add_column('user', sa.Column('mobile_money_number', sa.String(length=50), nullable=True))
    op.add_column('user', sa.Column('skills_text', sa.Text(), nullable=True))
    op.add_column('user', sa.Column('notification_preferences', sa.JSON(), nullable=True))
    op.add_column('user', sa.Column('avg_rating', sa.Float(), nullable=True))
    op.add_column('user', sa.Column('jobs_completed', sa.Integer(), nullable=True))
    op.add_column('user', sa.Column('jobs_posted', sa.Integer(), nullable=True))
    op.add_column('user', sa.Column('is_available', sa.Boolean(), nullable=True))
    
    # Try to add TSVECTOR column for search if PostgreSQL is used
    try:
        op.add_column('user', sa.Column('search_vector', postgresql.TSVECTOR(), nullable=True))
        op.create_index('idx_user_search_vector', 'user', ['search_vector'], unique=False, postgresql_using='gin')
    except Exception:
        # SQLite doesn't support TSVECTOR, so we'll use skills_text for search instead
        pass

    # Add new fields to Transaction table
    op.add_column('transaction', sa.Column('payment_method', sa.String(length=50), nullable=True))
    op.add_column('transaction', sa.Column('mobile_money_provider', sa.String(length=50), nullable=True))
    op.add_column('transaction', sa.Column('mobile_money_number', sa.String(length=50), nullable=True))
    op.add_column('transaction', sa.Column('provider_reference', sa.String(length=255), nullable=True))
    op.add_column('transaction', sa.Column('provider_response', sa.Text(), nullable=True))
    op.add_column('transaction', sa.Column('error_message', sa.Text(), nullable=True))
    op.add_column('transaction', sa.Column('completed_at', sa.DateTime(), nullable=True))
    
    # Create EmailLog table if it doesn't exist
    if not op.get_bind().dialect.has_table(op.get_bind(), 'email_log'):
        op.create_table('email_log',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('recipient', sa.String(length=255), nullable=False),
            sa.Column('subject', sa.String(length=255), nullable=False),
            sa.Column('body', sa.Text(), nullable=False),
            sa.Column('status', sa.String(length=50), nullable=False),
            sa.Column('error_message', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.PrimaryKeyConstraint('id')
        )
    
    # Create Notification table if it doesn't exist
    if not op.get_bind().dialect.has_table(op.get_bind(), 'notification'):
        op.create_table('notification',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('type', sa.String(length=50), nullable=False),
            sa.Column('message', sa.Text(), nullable=False),
            sa.Column('is_read', sa.Boolean(), nullable=False, server_default='0'),
            sa.Column('read_at', sa.DateTime(), nullable=True),
            sa.Column('reference_id', sa.Integer(), nullable=True),
            sa.Column('reference_type', sa.String(length=50), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
            sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('idx_notification_user_id', 'notification', ['user_id'], unique=False)


def downgrade():
    # Remove new fields from User table
    op.drop_column('user', 'verification_token')
    op.drop_column('user', 'email_verified')
    op.drop_column('user', 'reset_token')
    op.drop_column('user', 'reset_token_expiry')
    op.drop_column('user', 'last_login')
    op.drop_column('user', 'mobile_money_provider')
    op.drop_column('user', 'mobile_money_number')
    op.drop_column('user', 'skills_text')
    op.drop_column('user', 'notification_preferences')
    op.drop_column('user', 'avg_rating')
    op.drop_column('user', 'jobs_completed')
    op.drop_column('user', 'jobs_posted')
    op.drop_column('user', 'is_available')
    
    # Try to remove TSVECTOR column if PostgreSQL is used
    try:
        op.drop_index('idx_user_search_vector', table_name='user')
        op.drop_column('user', 'search_vector')
    except Exception:
        # SQLite doesn't have these columns
        pass

    # Remove new fields from Transaction table
    op.drop_column('transaction', 'payment_method')
    op.drop_column('transaction', 'mobile_money_provider')
    op.drop_column('transaction', 'mobile_money_number')
    op.drop_column('transaction', 'provider_reference')
    op.drop_column('transaction', 'provider_response')
    op.drop_column('transaction', 'error_message')
    op.drop_column('transaction', 'completed_at')
    
    # Drop new tables
    op.drop_table('notification')
    op.drop_table('email_log')
