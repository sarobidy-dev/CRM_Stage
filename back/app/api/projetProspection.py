from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_async_session
from services.projetProspection import (
    create_projet_prospection,
    get_all_projets,
    get_projet_by_id,
    update_projet_prospection,
    delete_projet_prospection
)
from schemas.projetProspection import (
    ProjetProspectionCreate,
    ProjetProspectionUpdate,
    ProjetProspectionRead,
)
from utils.jsonResponse import response

router = APIRouter(
    prefix="/projets-prospection",
    tags=["ProjetsProspection"]
)


@router.post("/", response_model=dict)
async def create(projet: ProjetProspectionCreate, db: AsyncSession = Depends(get_async_session)):
    new_projet = await create_projet_prospection(db, projet.dict())
    return response(True, "Projet de prospection créé", ProjetProspectionRead.from_orm(new_projet).dict())


@router.get("/", response_model=dict)
async def get_all(db: AsyncSession = Depends(get_async_session)):
    projets = await get_all_projets(db)
    return response(True, "Liste des projets récupérée", [ProjetProspectionRead.from_orm(p).dict() for p in projets])


@router.get("/{id}", response_model=dict)
async def get_one(id: int, db: AsyncSession = Depends(get_async_session)):
    projet = await get_projet_by_id(db, id)
    if not projet:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    return response(True, "Projet trouvé", ProjetProspectionRead.from_orm(projet).dict())


@router.put("/{id}", response_model=dict)
async def update(id: int, data: ProjetProspectionUpdate, db: AsyncSession = Depends(get_async_session)):
    projet = await update_projet_prospection(db, id, data.dict(exclude_unset=True))
    if not projet:
        raise HTTPException(status_code=404, detail="Projet non trouvé pour mise à jour")
    return response(True, "Projet mis à jour", ProjetProspectionRead.from_orm(projet).dict())


@router.delete("/{id}", response_model=dict)
async def delete(id: int, db: AsyncSession = Depends(get_async_session)):
    projet = await delete_projet_prospection(db, id)
    if not projet:
        raise HTTPException(status_code=404, detail="Projet non trouvé pour suppression")
    return response(True, "Projet supprimé", None)
