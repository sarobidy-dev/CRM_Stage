from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class VideoCall(Base):
    __tablename__ = "video_calls"
    
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id_contact"))
    utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id_utilisateur"))
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    duration = Column(Integer, default=0)  # en secondes
    status = Column(String(50), default="active")  # active, ended, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    recordings = relationship("VideoRecording", back_populates="call")
class VideoRecording(Base):
    __tablename__ = "video_recordings"
    
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("video_calls.id"))
    recording_id = Column(String(100), unique=True, index=True)
    file_path = Column(String(500))
    file_size = Column(Integer, default=0)
    duration = Column(Integer, default=0)
    format = Column(String(20), default="webm")
    status = Column(String(50), default="recording")  # recording, completed, failed
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    meta_info = Column(Text, nullable=True)  # ✅ Renommé ici

    # Relations
    call = relationship("VideoCall", back_populates="recordings")
