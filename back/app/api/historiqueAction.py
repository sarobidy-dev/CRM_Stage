from typing import Optional
from models.historiqueAction import HistoriqueAction
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_async_session
from datetime import datetime,date
from sqlalchemy import func
from services.historiqueAction import (
    create_historique_action,
    get_all_historique_actions,
    get_historique_action_by_id,
    update_historique_action,
    delete_historique_action,
)
from schemas.historiqueAction import (
    HistoriqueActionCreate,
    HistoriqueActionUpdate,
    HistoriqueActionRead,
)
from utils.jsonResponse import response

router = APIRouter(
    prefix="/historiqueActions",
    tags=["HistoriqueActions"]
)
@router.get("/nombre-entreprises-actives-aujourdhui", response_model=dict)
async def nombre_entreprises_actives_aujourdhui(db: AsyncSession = Depends(get_async_session)):
    today = date.today()
    
    # Requête pour compter le nombre distinct d'entreprise ayant une action aujourd'hui
    query = (
        select(func.count(func.distinct(HistoriqueAction.entreprise_id)))
        .where(func.date(HistoriqueAction.date) == today)
    )

    result = await db.execute(query)
    nombre_entreprises = result.scalar() or 0

    return {"nombre_entreprises_actives_aujourdhui": nombre_entreprises}

@router.post("/", response_model=dict)
async def create(item: HistoriqueActionCreate, db: AsyncSession = Depends(get_async_session)):
    new_obj = await create_historique_action(db, item.dict())
    return response(True, "Historique d'action créé", HistoriqueActionRead.from_orm(new_obj).dict())


@router.get("/", response_model=dict)
async def get_all(db: AsyncSession = Depends(get_async_session)):
    items = await get_all_historique_actions(db)
    return response(True, "Liste des historiques récupérée", [HistoriqueActionRead.from_orm(i).dict() for i in items])

@router.get("/statistiques")
async def get_statistiques(
    campagne_id: Optional[int] = None,
    db: AsyncSession = Depends(get_async_session)
):
    query = select(HistoriqueAction).where(HistoriqueAction.campagne_id == campagne_id)

    result = await db.execute(query)
    historiques = result.scalars().all()
    today = date.today()

    historiques_aujourdhui = [
        h for h in historiques
        if (h.date.date() if isinstance(h.date, datetime) else h.date) == today
    ]

    gagnes = sum(1 for h in historiques_aujourdhui if h.pourcentageVente is not None and h.pourcentageVente >= 80)
    encours = sum(1 for h in historiques_aujourdhui if h.pourcentageVente is not None and 30 <= h.pourcentageVente < 80)
    perdus = sum(1 for h in historiques_aujourdhui if h.pourcentageVente is not None and h.pourcentageVente < 30)

    return {
        "gagnes": gagnes,
        "encours": encours,
        "perdus": perdus
    }

@router.get("/{id}", response_model=dict)
async def get_one(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await get_historique_action_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Historique non trouvé")
    return response(True, "Historique trouvé", HistoriqueActionRead.from_orm(item).dict())


@router.put("/{id}", response_model=dict)
async def update(id: int, data: HistoriqueActionUpdate, db: AsyncSession = Depends(get_async_session)):
    item = await update_historique_action(db, id, data.dict(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Historique à mettre à jour introuvable")
    return response(True, "Historique mis à jour", HistoriqueActionRead.from_orm(item).dict())


@router.delete("/{id}", response_model=dict)
async def delete(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await delete_historique_action(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Historique à supprimer introuvable")
    return response(True, "Historique supprimé", None)
