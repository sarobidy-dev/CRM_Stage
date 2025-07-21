from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_async_session
from services.adresse import (
    create_adresse,
    get_all_adresses,
    get_adresse_by_id,
    update_adresse,
    delete_adresse
)
from schemas.adresse import (
    AdresseCreate,
    AdresseUpdate,
    AdresseRead
)
from utils.jsonResponse import response

router = APIRouter(
    prefix="/adresses",
    tags=["Adresses"]
)


@router.post("/", response_model=dict)
async def create(item: AdresseCreate, db: AsyncSession = Depends(get_async_session)):
    try:
        obj = await create_adresse(db, item.dict())
        return response(True, "Adresse créée", AdresseRead.from_orm(obj).dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=dict)
async def get_all(db: AsyncSession = Depends(get_async_session)):
    items = await get_all_adresses(db)
    return response(True, "Liste des adresses", [AdresseRead.from_orm(i).dict() for i in items])


@router.get("/{id}", response_model=dict)
async def get_one(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await get_adresse_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Adresse introuvable")
    return response(True, "Adresse trouvée", AdresseRead.from_orm(item).dict())


@router.put("/{id}", response_model=dict)
async def update(id: int, data: AdresseUpdate, db: AsyncSession = Depends(get_async_session)):
    item = await update_adresse(db, id, data.dict(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Adresse non trouvée pour mise à jour")
    return response(True, "Adresse mise à jour", AdresseRead.from_orm(item).dict())


@router.delete("/{id}", response_model=dict)
async def delete(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await delete_adresse(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Adresse introuvable")
    return response(True, "Adresse supprimée", None)
