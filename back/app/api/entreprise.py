from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_async_session
from services.entreprise import (
    create_entreprise,
    get_all_entreprises,
    get_entreprise_by_id,
    update_entreprise,
    delete_entreprise
)
from schemas.entreprise import (
    EntrepriseCreate,
    EntrepriseUpdate,
    EntrepriseRead
)
from utils.jsonResponse import response

router = APIRouter(
    prefix="/entreprises",
    tags=["Entreprises"]
)

from services.entreprise import get_entreprise_contact_by_id

@router.get("/{id}/contact", response_model=dict)
async def get_contact(id: int, db: AsyncSession = Depends(get_async_session)):
    contact = await get_entreprise_contact_by_id(db, id)
    if not contact:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée")
    return response(True, "Contact entreprise", contact)

@router.post("/", response_model=dict)
async def create(item: EntrepriseCreate, db: AsyncSession = Depends(get_async_session)):
    try:
        obj = await create_entreprise(db, item.dict())
        return response(True, "Entreprise créée", EntrepriseRead.from_orm(obj).dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=dict)
async def get_all(db: AsyncSession = Depends(get_async_session)):
    items = await get_all_entreprises(db)
    return response(True, "Liste des entreprises", [EntrepriseRead.from_orm(i).dict() for i in items])


@router.get("/{id}", response_model=dict)
async def get_one(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await get_entreprise_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")
    return response(True, "Entreprise trouvée", EntrepriseRead.from_orm(item).dict())


@router.put("/{id}", response_model=dict)
async def update(id: int, data: EntrepriseUpdate, db: AsyncSession = Depends(get_async_session)):
    item = await update_entreprise(db, id, data.dict(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Entreprise non trouvée pour mise à jour")
    return response(True, "Entreprise mise à jour", EntrepriseRead.from_orm(item).dict())


@router.delete("/{id}", response_model=dict)
async def delete(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await delete_entreprise(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")
    return response(True, "Entreprise supprimée", None)
