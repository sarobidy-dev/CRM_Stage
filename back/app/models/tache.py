# models/tache.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
 # ou votre Base declarative

class Tache(Base):
    __tablename__ = "taches"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date_echeance = Column(DateTime, nullable=True)
    statut = Column(String(50), default="en attente")
    contact_id = Column(Integer, ForeignKey("contact.id", ondelete="CASCADE"), nullable=False) 
    contact = relationship("Contact", back_populates="taches")
    date_creation = Column(DateTime, default=datetime.utcnow)
