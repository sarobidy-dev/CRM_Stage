from utils import jsonResponse
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
from fastapi.responses import JSONResponse
from schemas.Utilisateur import UtilisateurRead, UtilisateurCreate, UtilisateurUpdate
from services.utilisateur import (
    get_utilisateurs,
    get_utilisateur,
    create_utilisateur,
    update_utilisateur,
    delete_utilisateur,
)
from database import get_async_session

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


# ---------------------------------------------------------
# GET - un utilisateur
# ---------------------------------------------------------
@router.get("/utilisateurs/{utilisateur_id}")
async def read_utilisateur(utilisateur_id: int, db: AsyncSession = Depends(get_async_session)):
    utilisateur = await get_utilisateur(db, utilisateur_id)
    if utilisateur is None:
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": "Utilisateur non trouvé",
                "data": None
            }
        )
    data_dict = {c.key: getattr(utilisateur, c.key) for c in utilisateur.__table__.columns}
    utilisateur_data = UtilisateurRead.model_validate(data_dict).model_dump()
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Utilisateur trouvé",
            "data": utilisateur_data
        },
    )


# ---------------------------------------------------------
# POST - créer un utilisateur
# ---------------------------------------------------------
@router.post("/utilisateurs", response_model=UtilisateurRead, status_code=status.HTTP_201_CREATED)
async def create_new_utilisateur(
    nom: str = Form(...),
    mot2pass: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    actif: bool = Form(...),
    photo_profil: UploadFile = File(None),
    db: AsyncSession = Depends(get_async_session),
):
    photo_path = await _save_photo(photo_profil) if photo_profil else None

    utilisateur_dict = {
        "nom": nom,
        "email": email,
        "mot2pass": mot2pass,
        "role": role,
        "actif": actif,
        "photo_profil": photo_path,
    }
    return await create_utilisateur(db, utilisateur_dict)


@router.post("/utilisat", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_new_utilisateur(
    nom: str = Form(...),
    mot2pass: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    actif: bool = Form(...),
    photo_profil: UploadFile = File(None),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        # Traitement image
        photo_path = await _save_photo(photo_profil) if photo_profil else None

        # Créer un dictionnaire des données utilisateur
        utilisateur_dict = {
            "nom": nom,
            "email": email,
            "mot2pass": mot2pass,
            "role": role,
            "actif": actif,
            "photo_profil": photo_path,
        }

        # ✅ Validation Pydantic (avant l'appel à la DB)
        utilisateur_create = UtilisateurCreate(**utilisateur_dict)

        # ✅ Création utilisateur en base
        nouvel_utilisateur = await create_utilisateur(db, utilisateur_create.dict())

        return response(True, "Utilisateur créé avec succès", UtilisateurRead.model_validate(nouvel_utilisateur).dict())

    except ValidationError as ve:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=response(False, "Erreur de validation de l'email", ve.errors()),
        )

    except IntegrityError:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=response(False, "Un utilisateur avec cet email existe déjà."),
        )

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=response(False, "Erreur serveur : " + str(e)),
        )
# ---------------------------------------------------------
# PUT - mise à jour utilisateur
# ---------------------------------------------------------
@router.put("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def update_utilisateur_endpoint(
    utilisateur_id: int,
    nom: Optional[str] = Form(None),
    mot2pass: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    actif: Optional[bool] = Form(None),
    photo_profil: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_async_session),
):
    chemin_photo = await _save_photo(photo_profil) if photo_profil else None

    update_dict = {
        "nom": nom,
        "email": email,
        "mot2pass": mot2pass,
        "role": role,
        "actif": actif,
        "photo_profil": chemin_photo,
    }
    update_dict = {k: v for k, v in update_dict.items() if v is not None}

    utilisateur = await update_utilisateur(db, utilisateur_id, update_dict)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return utilisateur


# ---------------------------------------------------------
# DELETE - supprimer un utilisateur
# ---------------------------------------------------------
@router.delete("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def delete_existing_utilisateur(
    utilisateur_id: int, db: AsyncSession = Depends(get_async_session)
):
    utilisateur = await delete_utilisateur(db, utilisateur_id)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur
