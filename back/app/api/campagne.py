from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_async_session
from services.campagne import (
    create_campagne,
    get_all_campagnes,
    get_campagne_by_id,
    update_campagne,
    delete_campagne,
)
from schemas.campagne import (
    CampagneCreate,
    CampagneRead,
    CampagneUpdate,
)

from utils.jsonResponse import response

router = APIRouter(
    prefix="/campagnes",
    tags=["Campagnes"]
)


@router.post("/", response_model=dict)
async def create(campagne_data: CampagneCreate, db: AsyncSession = Depends(get_async_session)):
    campagne = await create_campagne(db, campagne_data.dict())
    return response(True, "Campagne créée avec succès", CampagneRead.from_orm(campagne).dict())


@router.get("/", response_model=dict)
async def get_all(db: AsyncSession = Depends(get_async_session)):
    campagnes = await get_all_campagnes(db)
    campagnes_data = [CampagneRead.from_orm(c).dict() for c in campagnes]
    return response(True, "Liste des campagnes récupérée avec succès", campagnes_data)


@router.get("/{campagne_id}", response_model=dict)
async def get_by_id(campagne_id: int, db: AsyncSession = Depends(get_async_session)):
    campagne = await get_campagne_by_id(db, campagne_id)
    if not campagne:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    return response(True, "Campagne trouvée", CampagneRead.from_orm(campagne).dict())


@router.put("/{campagne_id}", response_model=dict)
async def update(campagne_id: int, data: CampagneUpdate, db: AsyncSession = Depends(get_async_session)):
    campagne = await update_campagne(db, campagne_id, data.dict(exclude_unset=True))
    if not campagne:
        raise HTTPException(status_code=404, detail="Campagne non trouvée pour mise à jour")
    return response(True, "Campagne mise à jour avec succès", CampagneRead.from_orm(campagne).dict())


@router.delete("/{campagne_id}", response_model=dict)
async def delete(campagne_id: int, db: AsyncSession = Depends(get_async_session)):
    campagne = await delete_campagne(db, campagne_id)
    if not campagne:
        raise HTTPException(status_code=404, detail="Campagne non trouvée pour suppression")
    return response(True, "Campagne supprimée avec succès", None)
