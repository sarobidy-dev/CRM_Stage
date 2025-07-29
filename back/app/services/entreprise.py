from schemas import Utilisateur
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.entreprise import Entreprise
from models.utilisateur import Utilisateur 


from models.entreprise import Entreprise

async def get_entreprise_contact_by_id(db: AsyncSession, entreprise_id: int):
    result = await db.execute(
        select(Entreprise.emailStandart, Entreprise.telephoneStandard).where(Entreprise.id == entreprise_id)
    )
    row = result.first()
    if row:
        return {"emailStandart": row[0], "telephoneStandard": row[1]}
    return None



async def create_entreprise(db: AsyncSession, data: dict):
    utilisateur_id = data.get("utilisateur_id")
    if not utilisateur_id:
        raise Exception("L'attribut utilisateur_id est requis.")

    # Vérifier que l'utilisateur existe
    result = await db.execute(select(Utilisateur).where(Utilisateur.id == utilisateur_id))
    utilisateur = result.scalar_one_or_none()
    if not utilisateur:
        raise Exception(f"L'utilisateur avec l'ID {utilisateur_id} n'existe pas.")

    email = data.get("emailStandart")
    telephone = data.get("telephoneStandard")

    # Vérifier si le numéro de téléphone existe déjà
    if telephone:
        query_tel = select(Entreprise).where(Entreprise.telephoneStandard == telephone)
        result_tel = await db.execute(query_tel)
        if result_tel.scalar_one_or_none():
            raise Exception("Numéro de téléphone existe déjà.")

    # Vérifier si l'email existe déjà
    if email:
        query_email = select(Entreprise).where(Entreprise.emailStandart == email)
        result_email = await db.execute(query_email)
        if result_email.scalar_one_or_none():
            raise Exception("L'email existe déjà.")

    # Si OK, créer l’entreprise
    obj = Entreprise(**data)
    db.add(obj)
    try:
        await db.commit()
        await db.refresh(obj)
        return obj
    except Exception as e:
        await db.rollback()
        raise

async def get_all_entreprises(db: AsyncSession):
    result = await db.execute(select(Entreprise))
    return result.scalars().all()


async def get_entreprise_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(Entreprise).where(Entreprise.id == id))
    return result.scalars().first()


from sqlalchemy import and_

async def update_entreprise(db: AsyncSession, id: int, data: dict):
    # Vérifie si on met à jour le champ utilisateur_id
    if "utilisateur_id" in data:
        utilisateur_id = data["utilisateur_id"]
        result = await db.execute(select(Utilisateur).where(Utilisateur.id == utilisateur_id))
        utilisateur = result.scalar_one_or_none()
        if not utilisateur:
            raise Exception(f"L'utilisateur avec l'ID {utilisateur_id} n'existe pas.")

    # Récupérer l'entreprise à mettre à jour
    result = await db.execute(select(Entreprise).where(Entreprise.id == id))
    obj = result.scalars().first()
    if not obj:
        raise Exception(f"L'entreprise avec l'ID {id} n'existe pas.")

    # Vérifications unicité email
    if "emailStandart" in data:
        email = data["emailStandart"]
        query_email = select(Entreprise).where(
            and_(
                Entreprise.emailStandart == email,
                Entreprise.id != id  # exclure l'entreprise actuelle
            )
        )
        result_email = await db.execute(query_email)
        if result_email.scalar_one_or_none():
            raise Exception("L'email existe déjà.")

    # Vérifications unicité téléphone
    if "telephoneStandard" in data:
        telephone = data["telephoneStandard"]
        query_tel = select(Entreprise).where(
            and_(
                Entreprise.telephoneStandard == telephone,
                Entreprise.id != id  # exclure l'entreprise actuelle
            )
        )
        result_tel = await db.execute(query_tel)
        if result_tel.scalar_one_or_none():
            raise Exception("Numéro de téléphone existe déjà.")

    # Mise à jour des champs
    for key, value in data.items():
        setattr(obj, key, value)

    try:
        await db.commit()
        await db.refresh(obj)
    except Exception as e:
        await db.rollback()
        raise e

    return obj

async def delete_entreprise(db: AsyncSession, id: int):
    result = await db.execute(select(Entreprise).where(Entreprise.id == id))
    obj = result.scalars().first()
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj
