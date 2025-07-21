from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.projetUtilisateur import ProjetUtilisateur


async def create_projet_utilisateur(db: AsyncSession, data: dict):
    obj = ProjetUtilisateur(**data)
    db.add(obj)
    try:
        await db.commit()
        await db.refresh(obj)
        return obj
    except Exception as e:
        await db.rollback()
        raise e


async def get_all_projet_utilisateurs(db: AsyncSession):
    result = await db.execute(select(ProjetUtilisateur))
    return result.scalars().all()


async def get_projet_utilisateur_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(ProjetUtilisateur).where(ProjetUtilisateur.id == id))
    return result.scalars().first()


async def update_projet_utilisateur(db: AsyncSession, id: int, data: dict):
    result = await db.execute(select(ProjetUtilisateur).where(ProjetUtilisateur.id == id))
    obj = result.scalars().first()
    if obj:
        for key, value in data.items():
            setattr(obj, key, value)
        try:
            await db.commit()
            await db.refresh(obj)
        except Exception as e:
            await db.rollback()
            raise e
    return obj


async def delete_projet_utilisateur(db: AsyncSession, id: int):
    result = await db.execute(select(ProjetUtilisateur).where(ProjetUtilisateur.id == id))
    obj = result.scalars().first()
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj
