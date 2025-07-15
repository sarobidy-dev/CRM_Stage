from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_async_session
from services.contact import (
    create_contact,
    get_all_contacts,
    get_contact_by_id,
    update_contact,
    delete_contact
)
from schemas.contact import (
    ContactCreate,
    ContactUpdate,
    ContactRead
)
from utils.jsonResponse import response

router = APIRouter(
    prefix="/contacts",
    tags=["Contacts"]
)


@router.post("/", response_model=dict)
async def create(item: ContactCreate, db: AsyncSession = Depends(get_async_session)):
    try:
        obj = await create_contact(db, item.dict())
        return response(True, "Contact créé", ContactRead.from_orm(obj).dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=dict)
async def get_all(db: AsyncSession = Depends(get_async_session)):
    items = await get_all_contacts(db)
    return response(True, "Liste des contacts", [ContactRead.from_orm(i).dict() for i in items])


@router.get("/{id}", response_model=dict)
async def get_one(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await get_contact_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Contact introuvable")
    return response(True, "Contact trouvé", ContactRead.from_orm(item).dict())


@router.put("/{id}", response_model=dict)
async def update(id: int, data: ContactUpdate, db: AsyncSession = Depends(get_async_session)):
    item = await update_contact(db, id, data.dict(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Contact introuvable pour mise à jour")
    return response(True, "Contact mis à jour", ContactRead.from_orm(item).dict())


@router.delete("/{id}", response_model=dict)
async def delete(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await delete_contact(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Contact introuvable")
    return response(True, "Contact supprimé", None)
