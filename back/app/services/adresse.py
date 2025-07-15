from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.adresse import Adresse

# GET all Adresses
async def getAllAdresses(db: AsyncSession):
    result = await db.execute(select(Adresse)) 
    return result.scalars().all()

# GET Adresse by id
async def getAdresseById(db: AsyncSession, Adresse_id: int):
    result = await db.execute(select(Adresse).where(Adresse.id == Adresse_id))
    return result.scalars().first()

# CREATE Adresse
async def create_Adresse(db: AsyncSession, Adresse_data: dict):
    new_Adresse = Adresse(**Adresse_data)
    db.add(new_Adresse)
    await db.commit()
    await db.refresh(new_Adresse)
    return new_Adresse

# UPDATE Adresse
async def update_Adresse(db: AsyncSession, Adresse_id: int, update_data: dict):
    Adresse = await get_Adresse(db, Adresse_id)
    if not Adresse:
        return None
    for key, value in update_data.items():
        setattr(Adresse, key, value)
    await db.commit()
    await db.refresh(Adresse)
    return Adresse

# DELETE Adresse
async def delete_Adresse(db: AsyncSession, Adresse_id: int):
    Adresse = await get_Adresse(db, Adresse_id)
    if not Adresse:
        return None
    await db.delete(Adresse)
    await db.commit()
    return Adresse
