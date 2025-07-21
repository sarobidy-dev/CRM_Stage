from models.historiqueAction import HistoriqueAction
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_async_session
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


@router.post("/", response_model=dict)
async def create(item: HistoriqueActionCreate, db: AsyncSession = Depends(get_async_session)):
    new_obj = await create_historique_action(db, item.dict())
    return response(True, "Historique d'action créé", HistoriqueActionRead.from_orm(new_obj).dict())


@router.get("/", response_model=dict)
async def get_all(db: AsyncSession = Depends(get_async_session)):
    items = await get_all_historique_actions(db)
    return response(True, "Liste des historiques récupérée", [HistoriqueActionRead.from_orm(i).dict() for i in items])

@router.get("/statistiques")
async def get_statistiques(db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(HistoriqueAction))
    historiques = result.scalars().all()

    gagnés = sum(1 for h in historiques if h.pourcentageVente >= 80)
    en_cours = sum(1 for h in historiques if 30 <= h.pourcentageVente < 80)
    perdus = sum(1 for h in historiques if h.pourcentageVente < 30)

    return {
        "gagnes": gagnés,
        "encours": en_cours,
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
