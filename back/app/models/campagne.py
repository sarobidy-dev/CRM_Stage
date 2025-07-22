from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

class Campagne(Base):
    __tablename__ = "campagne" 
    
    id = Column(Integer, primary_key=True, index=True)
    libelle = Column(String(700), nullable=False)
    description= Column(Text,nullable=True)
    #foreign key
    projetProspection_id = Column(Integer, ForeignKey("projet_prospection.id", ondelete="CASCADE"))
    # Relations
    projet_prospection  = relationship("ProjetProspection", back_populates="campagnes")

    historique_actions  = relationship("HistoriqueAction", back_populates="campagne")
    campagne_entreprises = relationship("CampagneEntreprise", back_populates="campagne")

 