from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from models.campagne import Campagne  # adapte le chemin si besoin


# 🔸 Créer une campagne
async def create_campagne(db: AsyncSession, campagne_data: dict):
    campagne = Campagne(**campagne_data)
    db.add(campagne)
    await db.commit()
    await db.refresh(campagne)
    return campagne


# 🔸 Lire toutes les campagnes
async def get_all_campagnes(db: AsyncSession):
    result = await db.execute(select(Campagne))
    return result.scalars().all()


# 🔸 Lire une campagne par ID
async def get_campagne_by_id(db: AsyncSession, campagne_id: int):
    result = await db.execute(select(Campagne).where(Campagne.id == campagne_id))
    return result.scalars().first()


# 🔸 Mettre à jour une campagne
async def update_campagne(db: AsyncSession, campagne_id: int, campagne_data: dict):
    result = await db.execute(select(Campagne).where(Campagne.id == campagne_id))
    campagne = result.scalars().first()
    if campagne:
        for key, value in campagne_data.items():
            setattr(campagne, key, value)
        await db.commit()
        await db.refresh(campagne)
    return campagne


# 🔸 Supprimer une campagne
async def delete_campagne(db: AsyncSession, campagne_id: int):
    result = await db.execute(select(Campagne).where(Campagne.id == campagne_id))
    campagne = result.scalars().first()
    if campagne:
        await db.delete(campagne)
        await db.commit()
    return campagne
