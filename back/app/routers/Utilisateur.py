from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import os, uuid, aiofiles

from schemas.Utilisateur import UtilisateurRead, UtilisateurCreate, UtilisateurUpdate
from crud.Utilisateur import (
    get_utilisateurs,
    get_utilisateur,
    create_utilisateur,
    update_utilisateur,
    delete_utilisateur,
)
from database import get_async_session

router = APIRouter()


@router.get("/utilisateurs", response_model=List[UtilisateurRead])
async def read_utilisateurs(db: AsyncSession = Depends(get_async_session)):
    return await get_utilisateurs(db)


@router.get("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def read_utilisateur(
    utilisateur_id: int, db: AsyncSession = Depends(get_async_session)
):
    utilisateur = await get_utilisateur(db, utilisateur_id)
    if utilisateur is None:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur


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
        "nom": nom,
        "mot2pass": mot2pass,
        "email": email,
        "role": role,
        "photo_profil": chemin_photo,
    }

    utilisateur = await create_utilisateur(db, utilisateur_dict)
    return utilisateur


@router.put("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def update_existing_utilisateur(
    utilisateur_id: int,
    nom: str = Form(...),
    prenom: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    numero_tel: str = Form(...),
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
        "prenom": prenom,
        "email": email,
        "role": role,
        "numero_tel": numero_tel,
        "photo_profil": chemin_photo,
    }

    # Nettoyage des champs None (ex: si photo_profil pas envoyé)
    update_dict = {k: v for k, v in update_dict.items() if v is not None}

    utilisateur = await update_utilisateur(db, utilisateur_id, update_dict)
    if utilisateur is None:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return utilisateur


@router.delete("/utilisateurs/{utilisateur_id}", response_model=UtilisateurRead)
async def delete_existing_utilisateur(
    utilisateur_id: int, db: AsyncSession = Depends(get_async_session)
):
    utilisateur = await delete_utilisateur(db, utilisateur_id)
    if utilisateur is None:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return utilisateur
