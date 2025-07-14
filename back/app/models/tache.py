from sqlalchemy import Column, Integer, String, Text, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base  # ton declarative base

class Tache(Base):
    __tablename__ = "tache"

    id_tache = Column(Integer, primary_key=True, index=True)
    titre = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    date_echeance = Column(Date, nullable=True)
    est_recurrente = Column(Boolean, default=False)
    rappel = Column(DateTime, nullable=True)
    statut = Column(String(30), nullable=True)
    id_opportunite = Column(Integer, ForeignKey("opportunites.id_opportunite"), nullable=False)
    opportunites = relationship("Opportunite", back_populates="tache")

