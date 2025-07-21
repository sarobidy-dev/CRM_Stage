import os
import uuid
import asyncio
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import UploadFile
import ffmpeg
import json

from models.video_call import VideoCall, VideoRecording


class VideoCallService:
    def __init__(self, db: Session):
        self.db = db
        self.recordings_dir = "media/recordings"
        os.makedirs(self.recordings_dir, exist_ok=True)
    
    async def start_call(self, contact_id: int, utilisateur_id: int) -> Dict[str, Any]:
        """Démarrer un nouvel appel vidéo"""
        call = VideoCall(
            contact_id=contact_id,
            utilisateur_id=utilisateur_id,
            status="active"
        )
        self.db.add(call)
        self.db.commit()
        self.db.refresh(call)
        
        return {
            "call_id": call.id,
            "status": "started",
            "started_at": call.started_at.isoformat()
        }
    
    async def end_call(self, contact_id: int, utilisateur_id: int, duration: int) -> Dict[str, Any]:
        """Terminer un appel vidéo"""
        call = self.db.query(VideoCall).filter(
            VideoCall.contact_id == contact_id,
            VideoCall.utilisateur_id == utilisateur_id,
            VideoCall.status == "active"
        ).first()
        
        if call:
            call.ended_at = datetime.utcnow()
            call.duration = duration
            call.status = "ended"
            self.db.commit()
            
            return {
                "call_id": call.id,
                "status": "ended",
                "duration": duration
            }
        
        return {"error": "Appel non trouvé"}
    
    async def start_recording(self, contact_id: int, utilisateur_id: int) -> Dict[str, Any]:
        """Démarrer l'enregistrement d'un appel"""
        # Trouver l'appel actif
        call = self.db.query(VideoCall).filter(
            VideoCall.contact_id == contact_id,
            VideoCall.utilisateur_id == utilisateur_id,
            VideoCall.status == "active"
        ).first()
        
        if not call:
            return {"error": "Aucun appel actif trouvé"}
        
        # Créer un nouvel enregistrement
        recording_id = str(uuid.uuid4())
        recording = VideoRecording(
            call_id=call.id,
            recording_id=recording_id,
            status="recording"
        )
        
        self.db.add(recording)
        self.db.commit()
        self.db.refresh(recording)
        
        return {
            "recording_id": recording_id,
            "status": "recording_started"
        }
    
    async def stop_recording(self, recording_id: str) -> Dict[str, Any]:
        """Arrêter l'enregistrement"""
        recording = self.db.query(VideoRecording).filter(
            VideoRecording.recording_id == recording_id
        ).first()
        
        if recording:
            recording.completed_at = datetime.utcnow()
            recording.status = "processing"
            self.db.commit()
            
            return {
                "recording_id": recording_id,
                "status": "recording_stopped"
            }
        
        return {"error": "Enregistrement non trouvé"}
    
    async def upload_recording(self, recording_id: str, video_file: UploadFile) -> Dict[str, Any]:
        """Upload et traitement du fichier d'enregistrement"""
        recording = self.db.query(VideoRecording).filter(
            VideoRecording.recording_id == recording_id
        ).first()
        
        if not recording:
            return {"error": "Enregistrement non trouvé"}
        
        # Sauvegarder le fichier
        file_path = os.path.join(self.recordings_dir, f"{recording_id}.webm")
        
        with open(file_path, "wb") as buffer:
            content = await video_file.read()
            buffer.write(content)
        
        # Obtenir les métadonnées du fichier
        try:
            probe = ffmpeg.probe(file_path)
            video_info = next(s for s in probe['streams'] if s['codec_type'] == 'video')
            duration = float(probe['format']['duration'])
            file_size = int(probe['format']['size'])
            
            metadata = {
                "width": video_info['width'],
                "height": video_info['height'],
                "codec": video_info['codec_name'],
                "fps": eval(video_info['r_frame_rate'])
            }
            
            # Mettre à jour l'enregistrement
            recording.file_path = file_path
            recording.file_size = file_size
            recording.duration = int(duration)
            recording.metadata = json.dumps(metadata)
            recording.status = "completed"
            self.db.commit()
            
            # Optionnel: Convertir en MP4 pour une meilleure compatibilité
            await self._convert_to_mp4(recording_id, file_path)
            
            return {
                "recording_id": recording_id,
                "status": "completed",
                "file_path": file_path,
                "duration": int(duration),
                "file_size": file_size
            }
            
        except Exception as e:
            recording.status = "failed"
            self.db.commit()
            return {"error": f"Erreur traitement vidéo: {str(e)}"}
    
    async def _convert_to_mp4(self, recording_id: str, input_path: str):
        """Convertir WebM en MP4 (optionnel)"""
        output_path = os.path.join(self.recordings_dir, f"{recording_id}.mp4")
        
        try:
            (
                ffmpeg
                .input(input_path)
                .output(output_path, vcodec='libx264', acodec='aac')
                .overwrite_output()
                .run(quiet=True)
            )
        except Exception as e:
            print(f"Erreur conversion MP4: {e}")
    
    def get_call_recordings(self, call_id: int) -> list:
        """Récupérer tous les enregistrements d'un appel"""
        recordings = self.db.query(VideoRecording).filter(
            VideoRecording.call_id == call_id
        ).all()
        
        return [
            {
                "recording_id": r.recording_id,
                "duration": r.duration,
                "file_size": r.file_size,
                "status": r.status,
                "created_at": r.started_at.isoformat(),
                "file_path": r.file_path
            }
            for r in recordings
        ]
