from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.contact import Contact
from sqlalchemy import select, func

async def count_contacts(session: AsyncSession) -> int:
    result = await session.execute(select(func.count()).select_from(Contact))
    return result.scalar_one()

# GET all contacts
async def get_contacts(db: AsyncSession):
    result = await db.execute(select(Contact))
    return result.scalars().all()

# GET contact by id
async def get_contact(db: AsyncSession, contact_id: int):
    result = await db.execute(select(Contact).where(Contact.id_contact == contact_id))
    return result.scalars().first()

# CREATE contact
async def create_contact(session: AsyncSession, contact_data: dict) -> Contact:
    new_contact = Contact(**contact_data)
    session.add(new_contact)
    await session.commit()
    await session.refresh(new_contact)  # rafraîchit pour avoir l'id généré
    return new_contact

# UPDATE contact
async def update_contact(db: AsyncSession, contact_id: int, update_data: dict):
    contact = await get_contact(db, contact_id)
    if not contact:
        return None
    for key, value in update_data.items():
        setattr(contact, key, value)  # photo_de_profil mise à jour si présente
    await db.commit()
    await db.refresh(contact)
    return contact

# DELETE contact
async def delete_contact(db: AsyncSession, contact_id: int):
    contact = await get_contact(db, contact_id)
    if not contact:
        return None
    await db.delete(contact)
    await db.commit()
    return contact
