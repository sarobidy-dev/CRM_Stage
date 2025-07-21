from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import text

# from core.config import DATABASE_URL

from dotenv import load_dotenv
import os
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")


# Créer l'engine async
engine = create_async_engine(DATABASE_URL, echo=True)
Base = declarative_base()
async_session = sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession
)

# Dépendance FastAPI pour injecter la session
async def get_async_session():
    async with async_session() as session:
        yield session

# Alias optionnel pour FastAPI
get_db = get_async_session

# Test la connexion à la base
async def test_connection():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            print("✅ Base de données connectée avec succès.")
    except Exception as e:
        print("❌ Échec de connexion à la base de données :", e)

# Crée les tables à partir des modèles
async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
