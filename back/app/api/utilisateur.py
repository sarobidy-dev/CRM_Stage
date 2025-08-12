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
import os
import uuid
import aiofiles

from database import get_async_session
from schemas.Utilisateur import UtilisateurRead
from services.utilisateur import (
    get_utilisateurs,
    get_utilisateur,
    create_utilisateur,
    update_utilisateur,
    delete_utilisateur,
    email_existe,
    email_existe_pour_un_autre,
)

from services.email_service import EmailService

router = APIRouter()
UPLOAD_DIR = "media/photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

email_service = EmailService()

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
    if await email_existe(db, email):
        raise HTTPException(
            status_code=400,
            detail="Cet email est déjà utilisé"
        )
    photo_path: Optional[str] = await _save_photo(photo_profil) if photo_profil else None

    data = {
        "nom": nom,
        "email": email,
        "mot2pass": mot2pass,
        "role": role,
        "actif": actif,
        "photo_profil": photo_path,
    }
    utilisateur = await create_utilisateur(db, data)
    return utilisateur


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
    # Récupérer l'utilisateur AVANT mise à jour pour avoir l'ancienne adresse email
    utilisateur_avant = await get_utilisateur(db, utilisateur_id)
    if not utilisateur_avant:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    if email and await email_existe_pour_un_autre(db, email, utilisateur_id):
        raise HTTPException(
            status_code=400,
            detail={"success": False, "message": "Cet email est déjà utilisé par un autre utilisateur", "data": None}
        )

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

    # Envoyer email à l'ancienne adresse email (avant mise à jour)
    sujet = "Votre compte a été modifié"
    corps = f"Bonjour {utilisateur.nom},\n\nUne personne a modifié votre compte CRM.\n\nCordialement,\nL'équipe."

    send_email_func = email_service.send_email
    if callable(getattr(send_email_func, "__await__", None)):  # async
        email_envoye = await send_email_func(utilisateur_avant.email, sujet, corps)
    else:
        email_envoye = send_email_func(utilisateur_avant.email, sujet, corps)

    if email_envoye:
        print(f"Email envoyé à l'ancienne adresse : {utilisateur_avant.email}")
    else:
        print(f"Échec de l'envoi de l'email à {utilisateur_avant.email}")

    return utilisateur


@router.delete("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def delete_utilisateur_endpoint(utilisateur_id: int, db: AsyncSession = Depends(get_async_session)):
    utilisateur = await delete_utilisateur(db, utilisateur_id)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur
