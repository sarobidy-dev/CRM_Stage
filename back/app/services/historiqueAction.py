from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.historiqueAction import HistoriqueAction


async def create_historique_action(db: AsyncSession, data: dict):
    obj = HistoriqueAction(**data)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def get_all_historique_actions(db: AsyncSession):
    result = await db.execute(select(HistoriqueAction))
    return result.scalars().all()


async def get_historique_action_by_id(db: AsyncSession, historique_action_id: int):
    result = await db.execute(
        select(HistoriqueAction).where(HistoriqueAction.id == historique_action_id)
    )
    return result.scalars().first()


async def update_historique_action(db: AsyncSession, historique_action_id: int, data: dict):
    result = await db.execute(
        select(HistoriqueAction).where(HistoriqueAction.id == historique_action_id)
    )
    obj = result.scalars().first()
    if obj:
        for key, value in data.items():
            setattr(obj, key, value)
        await db.commit()
        await db.refresh(obj)
    return obj


async def delete_historique_action(db: AsyncSession, historique_action_id: int):
    result = await db.execute(
        select(HistoriqueAction).where(HistoriqueAction.id == historique_action_id)
    )
    obj = result.scalars().first()
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj


async def check_foreign_keys_exist(db: AsyncSession, campagne_id: int, entreprise_id: int, utilisateur_id: int):
    campagne = await db.execute(select(Campagne).where(Campagne.id == campagne_id))
    if not campagne.scalars().first():
        raise HTTPException(status_code=400, detail=f"Campagne id={campagne_id} inexistante")
    entreprise = await db.execute(select(Entreprise).where(Entreprise.id == entreprise_id))
    if not entreprise.scalars().first():
        raise HTTPException(status_code=400, detail=f"Entreprise id={entreprise_id} inexistante")
    utilisateur = await db.execute(select(Utilisateur).where(Utilisateur.id == utilisateur_id))
    if not utilisateur.scalars().first():
        raise HTTPException(status_code=400, detail=f"Utilisateur id={utilisateur_id} inexistant")
