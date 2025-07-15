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
<<<<<<< HEAD:back/app/routers/Utilisateur.py
from typing import List, Optional
import os, uuid, aiofiles

from schemas.Utilisateur import UtilisateurRead
=======
from typing import List
import os, uuid, aiofiles
from fastapi.responses import JSONResponse
from schemas.Utilisateur import UtilisateurRead, UtilisateurCreate, UtilisateurUpdate
>>>>>>> cf516b1f42bdea130e858eca7ea9fdec5d927197:back/app/api/Utilisateur.py
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


<<<<<<< HEAD:back/app/routers/Utilisateur.py
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
=======
>>>>>>> cf516b1f42bdea130e858eca7ea9fdec5d927197:back/app/api/Utilisateur.py
@router.get("/utilisateurs", response_model=List[UtilisateurRead])
async def read_utilisateurs(db: AsyncSession = Depends(get_async_session)):

<<<<<<< HEAD:back/app/routers/Utilisateur.py
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
=======

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
    # recuperation des collumns
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

@router.post(
    "/utilisateurs", response_model=UtilisateurRead, status_code=status.HTTP_201_CREATED
)
async def create_new_utilisateur(
    nom: str = Form(...),
    mot2pass: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    photo_profil: UploadFile = File(None),
    db: AsyncSession = Depends(get_async_session),
):
    chemin_photo = None
    if photo_profil:
        extension = os.path.splitext(photo_profil.filename)[1]
        nom_fichier = f"{uuid.uuid4()}{extension}"
        dossier = "media/photos"
        os.makedirs(dossier, exist_ok=True)
        chemin_photo = os.path.join(dossier, nom_fichier)

        async with aiofiles.open(chemin_photo, "wb") as out_file:
            content = await photo_profil.read()
            await out_file.write(content)

    utilisateur_dict = {
>>>>>>> cf516b1f42bdea130e858eca7ea9fdec5d927197:back/app/api/Utilisateur.py
        "nom": nom,
        "email": email,
        "mot2pass": mot2pass,
        "role": role,
<<<<<<< HEAD:back/app/routers/Utilisateur.py
        "actif": actif,
        "photo_profil": photo_path,
=======
        "photo_profil": chemin_photo,
>>>>>>> cf516b1f42bdea130e858eca7ea9fdec5d927197:back/app/api/Utilisateur.py
    }
    return await create_utilisateur(db, data)


<<<<<<< HEAD:back/app/routers/Utilisateur.py
# ---------------------------------------------------------
# PUT  — mêmes champs mais tous optionnels
# ---------------------------------------------------------
=======

>>>>>>> cf516b1f42bdea130e858eca7ea9fdec5d927197:back/app/api/Utilisateur.py
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
    mot2pass: str = Form(...),
    email: str = Form(...),
<<<<<<< HEAD:back/app/routers/Utilisateur.py
        "mot2pass": mot2pass,
        "role": role,
<<<<<<< HEAD
        "actif": actif,
        "photo_profil": photo_path,
=======
        "numero_tel": numero_tel,
        "photo_profil": chemin_photo,
>>>>>>> de737ace026c271acbbb4c663e5e2ac867b1932c
=======
    role: str = Form(...),
    photo_profil: UploadFile = File(None),
    db: AsyncSession = Depends(get_async_session),
):
    # Traitement de la photo de profil
    chemin_photo = None
    if photo_profil:
        contents = await photo_profil.read()

        # S'assurer que le dossier existe
        os.makedirs("images", exist_ok=True)

        # Nom unique pour éviter les conflits
        extension = os.path.splitext(photo_profil.filename)[1]
        nom_unique = f"{uuid.uuid4().hex}{extension}"
        chemin_photo = os.path.join("images", nom_unique)

        # Écriture du fichier
        with open(chemin_photo, "wb") as f:
            f.write(contents)

    # Création du dictionnaire d'update
    update_dict = {
        "nom": nom,
        "mot2pass": mot2pass,
        "email": email,
        "role": role,
        "photo_profil": chemin_photo,
>>>>>>> cf516b1f42bdea130e858eca7ea9fdec5d927197:back/app/api/Utilisateur.py
    }
    # on enlève les clés restées à None
    update_dict = {k: v for k, v in update_dict.items() if v is not None}

    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
<<<<<<< HEAD:back/app/routers/Utilisateur.py
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
=======

    return utilisateur


@router.delete("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def delete_existing_utilisateur(
>>>>>>> cf516b1f42bdea130e858eca7ea9fdec5d927197:back/app/api/Utilisateur.py
    utilisateur_id: int, db: AsyncSession = Depends(get_async_session)
):
    utilisateur = await delete_utilisateur(db, utilisateur_id)
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur
