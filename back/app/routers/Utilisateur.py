from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
)
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import os, uuid, aiofiles

from schemas.Utilisateur import UtilisateurRead
from crud.Utilisateur import (
    get_utilisateurs,
    get_utilisateur,
    create_utilisateur,
    update_utilisateur,
    delete_utilisateur,
)
from database import get_async_session

router = APIRouter()
UPLOAD_DIR = "media/photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # s’assure que le dossier existe


# ---------------------------------------------------------
# utilitaire d’upload asynchrone
# ---------------------------------------------------------
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    async with aiofiles.open(path, "wb") as out:
        await out.write(await file.read())
    return path


# ---------------------------------------------------------
# GET
# ---------------------------------------------------------
@router.get("/utilisateurs", response_model=List[UtilisateurRead])
async def read_utilisateurs(db: AsyncSession = Depends(get_async_session)):

@router.get("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def read_utilisateur(
    utilisateur_id: int, db: AsyncSession = Depends(get_async_session)
):
    utilisateur = await get_utilisateur(db, utilisateur_id)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur


# ---------------------------------------------------------
# POST  — tous les champs requis sauf photo_profil
@router.post(
    "/utilisateurs",
    response_model=UtilisateurRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_utilisateur_endpoint(
=======
=======
    photo_profil: UploadFile = File(None),
>>>>>>> de737ace026c271acbbb4c663e5e2ac867b1932c
    db: AsyncSession = Depends(get_async_session),
    photo_path: Optional[str] = (
        await _save_photo(photo_profil) if photo_profil else None
        "nom": nom,
        "email": email,
        "mot2pass": mot2pass,
        "role": role,
        "actif": actif,
        "photo_profil": photo_path,
    }
    return await create_utilisateur(db, data)


# ---------------------------------------------------------
# PUT  — mêmes champs mais tous optionnels
# ---------------------------------------------------------
@router.put("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def update_utilisateur_endpoint(
    utilisateur_id: int,
<<<<<<< HEAD
    nom: str | None = Form(None),
    email: str | None = Form(None),
    mot2pass: str | None = Form(None),
    actif: bool | None = Form(None),
    photo_profil: UploadFile | None = File(None),
    db: AsyncSession = Depends(get_async_session),
):
    photo_path: Optional[str] = (
        await _save_photo(photo_profil) if photo_profil else None
    )
=======
    nom: str = Form(...),
    prenom: str = Form(...),
    email: str = Form(...),
        "mot2pass": mot2pass,
        "role": role,
<<<<<<< HEAD
        "actif": actif,
        "photo_profil": photo_path,
=======
        "numero_tel": numero_tel,
        "photo_profil": chemin_photo,
>>>>>>> de737ace026c271acbbb4c663e5e2ac867b1932c
    }
    # on enlève les clés restées à None
    update_dict = {k: v for k, v in update_dict.items() if v is not None}

    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
# ---------------------------------------------------------
# DELETE
# ---------------------------------------------------------
@router.delete("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def delete_utilisateur_endpoint(
=======
    return utilisateur


@router.delete("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def delete_existing_utilisateur(
>>>>>>> de737ace026c271acbbb4c663e5e2ac867b1932c
    utilisateur_id: int, db: AsyncSession = Depends(get_async_session)
):
    utilisateur = await delete_utilisateur(db, utilisateur_id)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur
