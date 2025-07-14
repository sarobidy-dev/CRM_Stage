from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any

from app.crud.video_service import VideoCallService

from app.database import get_db
router = APIRouter(prefix="/api/video-calls", tags=["video-calls"])

class StartCallRequest(BaseModel):
    contact_id: int
    utilisateur_id: int

class EndCallRequest(BaseModel):
    contact_id: int
    utilisateur_id: int
    duration: int

class StartRecordingRequest(BaseModel):
    contact_id: int
    utilisateur_id: int

class StopRecordingRequest(BaseModel):
    recording_id: str

@router.post("/start")
async def start_call(
    request: StartCallRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Endpoint: POST /api/video-calls/start
    Démarrer un nouvel appel vidéo entre un contact et un utilisateur
    """
    service = VideoCallService(db)
    result = await service.start_call(
        contact_id=request.contact_id,
        utilisateur_id=request.utilisateur_id
    )
    return result

@router.post("/end")
async def end_call(
    request: EndCallRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Endpoint: POST /api/video-calls/end
    Terminer un appel vidéo et enregistrer la durée
    """
    service = VideoCallService(db)
    result = await service.end_call(
        contact_id=request.contact_id,
        utilisateur_id=request.utilisateur_id,
        duration=request.duration
    )
    return result

@router.post("/start-recording")
async def start_recording(
    request: StartRecordingRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Endpoint: POST /api/video-calls/start-recording
    Démarrer l'enregistrement d'un appel vidéo
    """
    service = VideoCallService(db)
    result = await service.start_recording(
        contact_id=request.contact_id,
        utilisateur_id=request.utilisateur_id
    )
    return result

@router.post("/stop-recording")
async def stop_recording(
    request: StopRecordingRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Endpoint: POST /api/video-calls/stop-recording
    Arrêter l'enregistrement d'un appel vidéo
    """
    service = VideoCallService(db)
    result = await service.stop_recording(recording_id=request.recording_id)
    return result

@router.post("/upload-recording")
async def upload_recording(
    recording_id: str,
    video: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Endpoint: POST /api/video-calls/upload-recording
    Upload du fichier d'enregistrement vidéo
    """
    if not video.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="Le fichier doit être une vidéo")
    
    service = VideoCallService(db)
    result = await service.upload_recording(
        recording_id=recording_id,
        video_file=video
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.get("/recordings/{call_id}")
async def get_call_recordings(
    call_id: int,
    db: Session = Depends(get_db)
):
    """
    Endpoint: GET /api/video-calls/recordings/{call_id}
    Récupérer tous les enregistrements d'un appel
    """
    service = VideoCallService(db)
    recordings = service.get_call_recordings(call_id)
    return {"recordings": recordings}

@router.get("/history/{utilisateur_id}")
async def get_user_call_history(
    utilisateur_id: int,
    db: Session = Depends(get_db)
):
    """
    Endpoint: GET /api/video-calls/history/{utilisateur_id}
    Récupérer l'historique des appels d'un utilisateur
    """
    from models.video_call import VideoCall
    
    calls = db.query(VideoCall).filter(
        VideoCall.utilisateur_id == utilisateur_id
    ).order_by(VideoCall.started_at.desc()).all()
    
    return {
        "calls": [
            {
                "id": call.id,
                "contact_id": call.contact_id,
                "started_at": call.started_at.isoformat(),
                "ended_at": call.ended_at.isoformat() if call.ended_at else None,
                "duration": call.duration,
                "status": call.status
            }
            for call in calls
        ]
    }
