from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_async_session
from services.haContact import (
    create_ha_contact,
    get_all_ha_contacts,
    get_ha_contact_by_id,
    delete_ha_contact
)
from schemas.haContact import (
    HAContactCreate,
    HAContactRead
)
from utils.jsonResponse import response

router = APIRouter(
    prefix="/ha-contacts",
    tags=["HAContact"]
)


@router.post("/", response_model=dict)
async def create(item: HAContactCreate, db: AsyncSession = Depends(get_async_session)):
    try:
        obj = await create_ha_contact(db, item.dict())
        return response(True, "Lien HA-Contact créé", HAContactRead.from_orm(obj).dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=dict)
async def get_all(db: AsyncSession = Depends(get_async_session)):
    items = await get_all_ha_contacts(db)
    return response(True, "Liste des liens HA-Contact", [HAContactRead.from_orm(i).dict() for i in items])


@router.get("/{id}", response_model=dict)
async def get_one(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await get_ha_contact_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Lien introuvable")
    return response(True, "Lien trouvé", HAContactRead.from_orm(item).dict())


@router.delete("/{id}", response_model=dict)
async def delete(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await delete_ha_contact(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Lien à supprimer introuvable")
    return response(True, "Lien supprimé", None)
