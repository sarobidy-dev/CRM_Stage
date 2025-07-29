from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.contact import Contact


from fastapi import HTTPException, status
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.contact import Contact  # adapte selon ton projet
import logging

logger = logging.getLogger(__name__)


async def create_contact(db: AsyncSession, data: dict):
    # Vérifie si email déjà existant
    if email := data.get("email"):
        result = await db.execute(select(Contact).where(Contact.email == email))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cet email est déjà utilisé."
            )

    # Vérifie si téléphone déjà existant
    if telephone := data.get("telephone"):
        result = await db.execute(select(Contact).where(Contact.telephone == telephone))
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ce numéro de téléphone est déjà utilisé."
            )

    # Création du contact
    try:
        obj = Contact(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    except Exception as e:
        await db.rollback()
        logger.error(f"Erreur lors de la création du contact : {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la création du contact."
        )


async def get_all_contacts(db: AsyncSession):
    result = await db.execute(select(Contact))
    return result.scalars().all()
async def get_contact_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(Contact).where(Contact.id == id))
    return result.scalars().first()
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

async def update_contact(db: AsyncSession, id: int, data: dict):
    result = await db.execute(select(Contact).where(Contact.id == id))
    obj = result.scalars().first()

    if not obj:
        raise HTTPException(status_code=404, detail="Contact non trouvé")

    for key, value in data.items():
        setattr(obj, key, value)

    try:
        await db.commit()
        await db.refresh(obj)
    except IntegrityError as e:
        await db.rollback()

        # Erreur typique si l'email ou téléphone est dupliqué (selon tes contraintes UNIQUE)
        if "email" in str(e.orig).lower():
            raise HTTPException(status_code=409, detail="Cet email est déjà utilisé")
        elif "telephone" in str(e.orig).lower():
            raise HTTPException(status_code=409, detail="Ce numéro de téléphone est déjà utilisé")
        else:
            raise HTTPException(status_code=400, detail="Erreur d'intégrité des données")
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Erreur serveur inattendue")

    return obj



async def delete_contact(db: AsyncSession, id: int):
    result = await db.execute(select(Contact).where(Contact.id == id))
    obj = result.scalars().first()
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj
