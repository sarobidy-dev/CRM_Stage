from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import text
from app.config import DATABASE_URL

engine = create_async_engine(DATABASE_URL, echo=True)
Base = declarative_base()

async_session = sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession
)

async def get_async_session():
    async with async_session() as session:
        yield session

# Alias cohérent pour l’import
get_db = get_async_session

async def test_connection():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            print("✅ Base de données connectée avec succès.")
    except Exception as e:
        print("❌ Échec de connexion à la base de données :", e)

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
