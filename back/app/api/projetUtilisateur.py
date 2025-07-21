from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_async_session
from services.projetUtilisateur import (
    create_projet_utilisateur,
    get_all_projet_utilisateurs,
    get_projet_utilisateur_by_id,
    update_projet_utilisateur,
    delete_projet_utilisateur
)
from schemas.projetUtilisateur import (
    ProjetUtilisateurCreate,
    ProjetUtilisateurUpdate,
    ProjetUtilisateurRead
)
from utils.jsonResponse import response

router = APIRouter(
    prefix="/projet-utilisateurs",
    tags=["ProjetUtilisateurs"]
)


@router.post("/", response_model=dict)
async def create(item: ProjetUtilisateurCreate, db: AsyncSession = Depends(get_async_session)):
    try:
        obj = await create_projet_utilisateur(db, item.dict())
        return response(True, "Relation projet-utilisateur créée", ProjetUtilisateurRead.from_orm(obj).dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=dict)
async def get_all(db: AsyncSession = Depends(get_async_session)):
    items = await get_all_projet_utilisateurs(db)
    return response(True, "Liste récupérée", [ProjetUtilisateurRead.from_orm(i).dict() for i in items])


@router.get("/{id}", response_model=dict)
async def get_one(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await get_projet_utilisateur_by_id(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Élément non trouvé")
    return response(True, "Élément trouvé", ProjetUtilisateurRead.from_orm(item).dict())


@router.put("/{id}", response_model=dict)
async def update(id: int, data: ProjetUtilisateurUpdate, db: AsyncSession = Depends(get_async_session)):
    item = await update_projet_utilisateur(db, id, data.dict(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Élément à mettre à jour introuvable")
    return response(True, "Mise à jour effectuée", ProjetUtilisateurRead.from_orm(item).dict())


@router.delete("/{id}", response_model=dict)
async def delete(id: int, db: AsyncSession = Depends(get_async_session)):
    item = await delete_projet_utilisateur(db, id)
    if not item:
        raise HTTPException(status_code=404, detail="Élément à supprimer introuvable")
    return response(True, "Suppression réussie", None)
