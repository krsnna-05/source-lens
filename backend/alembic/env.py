"""Alembic environment for migrations."""
from logging.config import fileConfig
from pathlib import Path
import sys

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy.engine import make_url

from alembic import context

# Add the parent directory to sys.path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

# This is the Alembic Config object, which provides
# the values of the [alembic] section of the alembic.ini file.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add models metadata for auto-generating migrations
from app.core import settings  # noqa: E402
from app.models import Base  # noqa: E402

# Set the sqlalchemy.url from shared application settings.
# Alembic runs migrations through a synchronous engine, so convert the app's
# asyncpg URL to the sync psycopg2 driver for migration commands.
database_url = make_url(settings.DATABASE_URL)
if database_url.drivername == "postgresql+asyncpg":
    database_url = database_url.set(drivername="postgresql+psycopg2")
config.set_main_option("sqlalchemy.url", database_url.render_as_string(hide_password=False))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well. By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    configuration = config.get_section(config.config_ini_section)
    if configuration is None:
        configuration = {}
    configuration["sqlalchemy.url"] = config.get_main_option("sqlalchemy.url")

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
