from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
)
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import os, uuid, aiofiles

from database import get_async_session
from schemas.Utilisateur import UtilisateurRead
from services.utilisateur import (
    get_utilisateurs,
    get_utilisateur,
    create_utilisateur,
    update_utilisateur,
    delete_utilisateur,
)

router = APIRouter()
UPLOAD_DIR = "media/photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def _save_photo(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    async with aiofiles.open(path, "wb") as out:
        await out.write(await file.read())
    return path


@router.get("/utilisateurs", response_model=List[UtilisateurRead])
async def read_utilisateurs(db: AsyncSession = Depends(get_async_session)):
    return await get_utilisateurs(db)

@router.get("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def read_utilisateur(utilisateur_id: int, db: AsyncSession = Depends(get_async_session)):
    utilisateur = await get_utilisateur(db, utilisateur_id)
    if not utilisateur:
        return JSONResponse(
            status_code=404,
            content={"success": False, "message": "Utilisateur non trouvé", "data": None},
        )

    data_dict = {c.key: getattr(utilisateur, c.key) for c in utilisateur.__table__.columns}
    utilisateur_data = UtilisateurRead.model_validate(data_dict).model_dump()

    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "Utilisateur trouvé", "data": utilisateur_data},
    )


@router.post("/utilisateurs", response_model=UtilisateurRead, status_code=status.HTTP_201_CREATED)
async def create_utilisateur_endpoint(
    nom: str = Form(...),
    email: str = Form(...),
    mot2pass: str = Form(...),
    role: str = Form(...),
    actif: bool = Form(True),
    photo_profil: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_async_session),
):
    photo_path: Optional[str] = await _save_photo(photo_profil) if photo_profil else None

    data = {
        "nom": nom,
        "email": email,
        "mot2pass": mot2pass,
        "role": role,
        "actif": actif,
        "photo_profil": photo_path,
    }
    return await create_utilisateur(db, data)


@router.put("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def update_utilisateur_endpoint(
    utilisateur_id: int,
    nom: str | None = Form(None),
    email: str | None = Form(None),
    mot2pass: str | None = Form(None),
    role: str | None = Form(None),
    actif: bool | None = Form(None),
    photo_profil: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_async_session),
):
    photo_path: Optional[str] = await _save_photo(photo_profil) if photo_profil else None

    update_dict = {
        "nom": nom,
        "email": email,
        "mot2pass": mot2pass,
        "role": role,
        "actif": actif,
        "photo_profil": photo_path,
    }
    update_dict = {k: v for k, v in update_dict.items() if v is not None}

    utilisateur = await update_utilisateur(db, utilisateur_id, update_dict)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return utilisateur

@router.delete("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def delete_utilisateur_endpoint(utilisateur_id: int, db: AsyncSession = Depends(get_async_session)):
    utilisateur = await delete_utilisateur(db, utilisateur_id)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur
