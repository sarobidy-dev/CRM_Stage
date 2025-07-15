from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_async_session
from services.campagneEntreprise import (
    create_campagne_entreprise,
    get_all_campagne_entreprises,
    get_campagne_entreprise_by_id,
    delete_campagne_entreprise
)
from schemas.campagneEntreprise import (
    CampagneEntrepriseCreate,
    CampagneEntrepriseRead
)
from utils.jsonResponse import response

router = APIRouter(
    prefix="/campagne-entreprises",
    tags=["CampagneEntreprises"]
)


@router.post("/", response_model=dict)
async def create(item: CampagneEntrepriseCreate, db: AsyncSession = Depends(get_async_session)):
    try:
        obj = await create_campagne_entreprise(db, item.dict())
        return response(True, "Lien Campagne-Entreprise créé", CampagneEntrepriseRead.from_orm(obj).dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=dict)
async def get_all(db: AsyncSession = Depends(get_async_session)):
    items = await get_all_campagne_entreprises(db)
    return response(True, "Liste des liens Campagne-Entreprise", [CampagneEntrepriseRead.from_orm(i).dict() for i in items])


@router.get("/{id}", response_model=dict)
async def get_one(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await get_campagne_entreprise_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Lien introuvable")
    return response(True, "Lien trouvé", CampagneEntrepriseRead.from_orm(item).dict())


@router.delete("/{id}", response_model=dict)
async def delete(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await delete_campagne_entreprise(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Lien à supprimer introuvable")
    return response(True, "Lien supprimé", None)
