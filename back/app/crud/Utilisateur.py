from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.utilisateur import Utilisateur  # adapte le chemin si besoin


# -------------------------------------------------
# GET ALL
# -------------------------------------------------
async def get_utilisateurs(db: AsyncSession):
    """
    Retourne la liste complète des utilisateurs.
    """
    result = await db.execute(select(Utilisateur))
    return result.scalars().all()


# -------------------------------------------------
# GET ONE
# -------------------------------------------------
async def get_utilisateur(db: AsyncSession, utilisateur_id: int):
<<<<<<< HEAD
    """
    Retourne un utilisateur par son id, ou None s’il n’existe pas.
    """
    result = await db.execute(
        select(Utilisateur).where(Utilisateur.id == utilisateur_id)   # <- ici
    )
    return result.scalar_one_or_none()   # plus explicite
=======
    result = await db.execute(select(Utilisateur).where(Utilisateur.id == utilisateur_id))
    return result.scalars().first()
>>>>>>> cf516b1f42bdea130e858eca7ea9fdec5d927197


# -------------------------------------------------
# CREATE
# -------------------------------------------------
async def create_utilisateur(db: AsyncSession, utilisateur_data: dict):
    nouvel_utilisateur = Utilisateur(**utilisateur_data)
    db.add(nouvel_utilisateur)
    await db.commit()
    await db.refresh(nouvel_utilisateur)
    return nouvel_utilisateur


# -------------------------------------------------
# UPDATE
# -------------------------------------------------
async def update_utilisateur(db: AsyncSession, utilisateur_id: int, update_data: dict):
    utilisateur = await get_utilisateur(db, utilisateur_id)
    if not utilisateur:
        return None

    for key, value in update_data.items():
        setattr(utilisateur, key, value)

    await db.commit()
    await db.refresh(utilisateur)
    return utilisateur


# -------------------------------------------------
# DELETE
# -------------------------------------------------
async def delete_utilisateur(db: AsyncSession, utilisateur_id: int):
    utilisateur = await get_utilisateur(db, utilisateur_id)
    if not utilisateur:
        return None

    await db.delete(utilisateur)
    await db.commit()
    return utilisateur
