import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import AsyncEngine

from alembic import context

# Ajouter le chemin du projet pour les importations
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importer Base et les modèles
from ..app.database import Base
from ..app.models.utilisateur import Utilisateur  # Assurez-vous que tous les modèles sont importés

# Objet de configuration Alembic
config = context.config

# Configurer les logs
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Définir target_metadata pour l'autogénération des migrations
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Exécuter les migrations en mode 'offline'."""
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
    """Exécuter les migrations en mode 'online'."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    # Vérifier si l'engine est asynchrone
    if isinstance(connectable, AsyncEngine):
        import asyncio

        async def do_run_migrations(connection):
            context.configure(connection=connection, target_metadata=target_metadata)
            async with context.begin_transaction():
                await context.run_migrations()

        asyncio.run(do_run_migrations(connectable.connect()))
    else:
        with connectable.connect() as connection:
            context.configure(connection=connection, target_metadata=target_metadata)
            with context.begin_transaction():
                context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()