from datetime import datetime  # Add this import at the top
from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import os
import uuid
import aiofiles

from database import get_async_session
from models.interaction import Interaction
from schemas.interaction import InteractionRead
from crud.interaction import get_interactions, get_interaction, delete_interaction

router = APIRouter(prefix="/interactions", tags=["interactions"])

@router.post("", response_model=InteractionRead, status_code=status.HTTP_201_CREATED)
async def create_interaction(
    type: str = Form(...),
    date_interaction: str = Form(...),
    contenu: str = Form(...),
    id_contact: int = Form(...),
    fichier_joint: UploadFile = File(None),
    session: AsyncSession = Depends(get_async_session)
):
    # Convert string date to datetime object
    try:
        date_obj = datetime.fromisoformat(date_interaction)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
        )

    fichier_path = None
    if fichier_joint:
        ext = os.path.splitext(fichier_joint.filename)[1]
        nom_fichier = f"{uuid.uuid4()}{ext}"
        dossier = "media/fichiers"
        os.makedirs(dossier, exist_ok=True)
        fichier_path = os.path.join(dossier, nom_fichier)
        async with aiofiles.open(fichier_path, "wb") as out:
            content = await fichier_joint.read()
            await out.write(content)

    interaction = Interaction(
        type=type,
        date_interaction=date_obj,  # Use the datetime object here
        contenu=contenu,
        fichier_joint=fichier_path,
        id_contact=id_contact
    )
    session.add(interaction)
    await session.commit()
    await session.refresh(interaction)
    return interaction
@router.get("", response_model=List[InteractionRead])
async def read_all(session: AsyncSession = Depends(get_async_session)):
    return await get_interactions(session)

@router.get("/{interaction_id}", response_model=InteractionRead)
async def read_one(interaction_id: int, session: AsyncSession = Depends(get_async_session)):
    interaction = await get_interaction(session, interaction_id)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction
from fastapi import Path

@router.put("/{interaction_id}", response_model=InteractionRead)
async def update_interaction(
    interaction_id: int = Path(..., description="ID de l'interaction à modifier"),
    type: Optional[str] = Form(None),
    date_interaction: Optional[str] = Form(None),
    contenu: Optional[str] = Form(None),
    id_contact: Optional[int] = Form(None),
    fichier_joint: UploadFile = File(None),
    session: AsyncSession = Depends(get_async_session)
):
    from sqlalchemy.future import select

    result = await session.execute(select(Interaction).where(Interaction.id_interaction == interaction_id))
    interaction = result.scalar_one_or_none()

    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")

    if type is not None:
        interaction.type = type

    if date_interaction is not None:
        try:
            interaction.date_interaction = datetime.fromisoformat(date_interaction)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)")

    if contenu is not None:
        interaction.contenu = contenu

    if id_contact is not None:
        interaction.id_contact = id_contact

    if fichier_joint is not None:
        # Supprimer l'ancien fichier si présent
        if interaction.fichier_joint and os.path.exists(interaction.fichier_joint):
            os.remove(interaction.fichier_joint)

        ext = os.path.splitext(fichier_joint.filename)[1]
        nom_fichier = f"{uuid.uuid4()}{ext}"
        dossier = "media/fichiers"
        os.makedirs(dossier, exist_ok=True)
        fichier_path = os.path.join(dossier, nom_fichier)
        async with aiofiles.open(fichier_path, "wb") as out:
            content = await fichier_joint.read()
            await out.write(content)
        interaction.fichier_joint = fichier_path

    await session.commit()
    await session.refresh(interaction)
    return interaction

@router.delete("/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(interaction_id: int, session: AsyncSession = Depends(get_async_session)):
    deleted = await delete_interaction(session, interaction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return None
