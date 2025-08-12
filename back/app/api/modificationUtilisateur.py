from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.utilisateur import Utilisateur
from database import get_async_session

from schemas.modificationUtilisateur import UtilisateurUpdateRequest  # importe ton modèle ici

router = APIRouter(prefix="/utilisateur", tags=["Utilisateurs"])

async def modifier_utilisateur(db: AsyncSession, user_id: int, user_data: dict):
    stmt = select(Utilisateur).where(Utilisateur.id == user_id)
    result = await db.execute(stmt)
    utilisateur = result.scalars().first()

    if not utilisateur:
        return None

    for key, value in user_data.items():
        if hasattr(utilisateur, key):
            setattr(utilisateur, key, value)

    # Pas de commit ici, modification en mémoire seulement
    return utilisateur

@router.put("/{user_id}")
async def update_utilisateur(
    user_id: int = Path(..., description="ID de l'utilisateur à modifier"),
    user_data: UtilisateurUpdateRequest = Depends(),
    db: AsyncSession = Depends(get_async_session)
):
    utilisateur_modifie = await modifier_utilisateur(db, user_id, user_data.dict(exclude_unset=True))
    if not utilisateur_modifie:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {
        "message": "Utilisateur modifié (en mémoire, pas enregistré en base)",
        "utilisateur": {
            "id": utilisateur_modifie.id,
            "email": utilisateur_modifie.email,
            "nom": utilisateur_modifie.nom,
            "actif": utilisateur_modifie.actif
        }
    }
