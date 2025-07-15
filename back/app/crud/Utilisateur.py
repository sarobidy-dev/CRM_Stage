from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.utilisateur import Utilisateur

# GET all utilisateurs
async def get_utilisateurs(db: AsyncSession):
    result = await db.execute(select(Utilisateur)) 
    return result.scalars().all()

# GET utilisateur by id
async def get_utilisateur(db: AsyncSession, utilisateur_id: int):
    result = await db.execute(select(Utilisateur).where(Utilisateur.id == utilisateur_id))
    return result.scalars().first()

# CREATE utilisateur
async def create_utilisateur(db: AsyncSession, utilisateur_data: dict):
    new_utilisateur = Utilisateur(**utilisateur_data)
    db.add(new_utilisateur)
    await db.commit()
    await db.refresh(new_utilisateur)
    return new_utilisateur

# UPDATE utilisateur
async def update_utilisateur(db: AsyncSession, utilisateur_id: int, update_data: dict):
    utilisateur = await get_utilisateur(db, utilisateur_id)
    if not utilisateur:
        return None
    for key, value in update_data.items():
        setattr(utilisateur, key, value)
    await db.commit()
    await db.refresh(utilisateur)
    return utilisateur

# DELETE utilisateur
async def delete_utilisateur(db: AsyncSession, utilisateur_id: int):
    utilisateur = await get_utilisateur(db, utilisateur_id)
    if not utilisateur:
        return None
    await db.delete(utilisateur)
    await db.commit()
    return utilisateur
