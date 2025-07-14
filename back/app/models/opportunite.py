from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Opportunite(Base):
    __tablename__ = "opportunites"

    id_opportunite = Column(Integer, primary_key=True, index=True)
    titre = Column(String(100))
    description = Column(Text)
    date_interaction = Column(DateTime)
    contenu = Column(Text)
    date_creation = Column(Date)
    prob_abill_suc = Column(Integer)
    statut = Column(String(30))
    etape_pipeline = Column(String(50))
    
    id_utilisateur = Column(Integer, ForeignKey("utilisateur.id_utilisateur"))
    id_entreprise = Column(Integer, ForeignKey("entreprise.id_entreprise"))

    utilisateur = relationship("Utilisateur", back_populates="opportunites")
    entreprise = relationship("Entreprise", back_populates="opportunites")
    tache = relationship("Tache", back_populates="opportunites")
