"""Add repositories and indexed_files tables."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

repository_provider = postgresql.ENUM(
    'github', 'gitlab', 'local', name='repository_provider', create_type=False
)
repository_status = postgresql.ENUM(
    'pending', 'indexing', 'ready', 'failed', name='repository_status', create_type=False
)
index_mode = postgresql.ENUM('manual', 'auto', name='index_mode', create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    repository_provider.create(bind, checkfirst=True)
    repository_status.create(bind, checkfirst=True)
    index_mode.create(bind, checkfirst=True)

    op.create_table(
        'repositories',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('owner', sa.String(255), nullable=False),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('provider', repository_provider, nullable=False),
        sa.Column('default_branch', sa.String(255), nullable=False),
        sa.Column('local_path', sa.String(1000), nullable=True),
        sa.Column('latest_remote_commit', sa.String(40), nullable=True),
        sa.Column('last_indexed_commit', sa.String(40), nullable=True),
        sa.Column('status', repository_status, nullable=False),
        sa.Column('index_mode', index_mode, nullable=False),
        sa.Column('last_indexed_at', sa.DateTime(), nullable=True),
        sa.Column('last_error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'owner', 'name', name='uq_repositories_user_owner_name'),
    )

    op.create_table(
        'indexed_files',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('repository_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('path', sa.String(1000), nullable=False),
        sa.Column('blob_sha', sa.String(40), nullable=False),
        sa.Column('language', sa.String(50), nullable=False),
        sa.Column('size_bytes', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('indexed_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['repository_id'], ['repositories.id'], ondelete='CASCADE'),
    )


def downgrade() -> None:
    op.drop_table('indexed_files')
    op.drop_table('repositories')
    bind = op.get_bind()
    index_mode.drop(bind, checkfirst=True)
    repository_status.drop(bind, checkfirst=True)
    repository_provider.drop(bind, checkfirst=True)
