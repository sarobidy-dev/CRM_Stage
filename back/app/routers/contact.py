from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import os, uuid, aiofiles

from app.database import get_async_session
from app.schemas.contact import ContactCreate, ContactRead, ContactUpdate
from app.crud.Contact import count_contacts, get_contacts, get_contact, create_contact, update_contact, delete_contact

router = APIRouter(
    prefix="/contacts",
    tags=["contacts"]
)
import uuid
import os
from fastapi import UploadFile

def save_profile_picture(file: UploadFile):
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = f"media/photos/{filename}"

    with open(filepath, "wb") as buffer:
        buffer.write(file.file.read())

    return filepath

@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
async def create_contact_route(
    nom: str = Form(...),
    prenom: str = Form(...),
    entreprise: Optional[str] = Form(None),
    telephone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    adresse: Optional[str] = Form(None),
    fonction: Optional[str] = Form(None),
    source: Optional[str] = Form(None),
    secteur: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    id_utilisateur: int = Form(...),
    photo_de_profil: UploadFile = File(None),
    session: AsyncSession = Depends(get_async_session)
):
    chemin_photo = None
    if photo_de_profil:
        extension = os.path.splitext(photo_de_profil.filename)[1]
        nom_fichier = f"{uuid.uuid4()}{extension}"
        dossier = "media/photos"
        os.makedirs(dossier, exist_ok=True)
        chemin_photo = os.path.join(dossier, nom_fichier)
        async with aiofiles.open(chemin_photo, "wb") as out_file:
            content = await photo_de_profil.read()
            await out_file.write(content)

    contact_dict = {
        "nom": nom,
        "prenom": prenom,
        "entreprise": entreprise,
        "telephone": telephone,
        "email": email,
        "adresse": adresse,
        "fonction": fonction,
        "source": source,
        "secteur": secteur,
        "type": type,
        "id_utilisateur": id_utilisateur,
        "photo_de_profil": chemin_photo
    }
    return await create_contact(session, contact_dict)
@router.get("/count", summary="Obtenir le nombre total de contacts")
async def count_contacts_route(session: AsyncSession = Depends(get_async_session)):
    total = await count_contacts(session)
    return {"total_contacts": total}

@router.get("", response_model=List[ContactRead])
async def read_contacts_route(skip: int = 0, limit: int = 100, session: AsyncSession = Depends(get_async_session)):
    contacts = await get_contacts(session)
    selected_contacts = contacts[skip:skip + limit]

    # Mise à jour du chemin de la photo
    for contact in selected_contacts:
        if contact.photo_de_profil:
            contact.photo_de_profil = f"/media/photos/{os.path.basename(contact.photo_de_profil)}"

    return selected_contacts




@router.get("/{contact_id}", response_model=ContactRead)
async def read_contact_route(contact_id: int, session: AsyncSession = Depends(get_async_session)):
    contact = await get_contact(session, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    if contact.photo_de_profil:
        contact.photo_de_profil = f"/media/photos/{os.path.basename(contact.photo_de_profil)}"

    return contact

@router.put("/{contact_id}", response_model=ContactRead)
async def update_contact_route(
    contact_id: int,
    nom: Optional[str] = Form(None),
    prenom: Optional[str] = Form(None),
    entreprise: Optional[str] = Form(None),
    telephone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    adresse: Optional[str] = Form(None),
    fonction: Optional[str] = Form(None),
    source: Optional[str] = Form(None),
    secteur: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    photo_de_profil: UploadFile = File(None),
    session: AsyncSession = Depends(get_async_session)
):
    # Récupérer le contact existant
    existing_contact = await get_contact(session, contact_id)
    if not existing_contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    chemin_photo = existing_contact.photo_de_profil  # Conserver l'existant par défaut

    if photo_de_profil:
        extension = os.path.splitext(photo_de_profil.filename)[1]
        nom_fichier = f"{uuid.uuid4()}{extension}"
        dossier = "media/photos"
        os.makedirs(dossier, exist_ok=True)
        chemin_photo = os.path.join(dossier, nom_fichier)
        async with aiofiles.open(chemin_photo, "wb") as out_file:
            content = await photo_de_profil.read()
            await out_file.write(content)

    update_data = {
        k: v for k, v in {
            "nom": nom,
            "prenom": prenom,
            "entreprise": entreprise,
            "telephone": telephone,
            "email": email,
            "adresse": adresse,
            "fonction": fonction,
            "source": source,
            "secteur": secteur,
            "type": type,
            "photo_de_profil": chemin_photo
        }.items() if v is not None
    }

    updated = await update_contact(session, contact_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Ajuster l'URL de la photo pour affichage
    if updated.photo_de_profil:
        updated.photo_de_profil = f"/media/photos/{os.path.basename(updated.photo_de_profil)}"

    return updated

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact_route(contact_id: int, session: AsyncSession = Depends(get_async_session)):
    deleted = await delete_contact(session, contact_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Contact not found")
    return None
