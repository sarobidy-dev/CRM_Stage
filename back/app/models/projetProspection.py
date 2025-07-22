from sqlalchemy import Column, Integer, String, Text
from database import Base
from sqlalchemy.orm import relationship

class ProjetProspection(Base):
    __tablename__ = "projet_prospection" 
    
    id = Column(Integer, primary_key=True, index=True)
    projet = Column(String(50), nullable=False)
    description= Column(Text, nullable=True)
    # Relations
    campagnes = relationship("Campagne", back_populates="projet_prospection")
    projet_utilisateurs = relationship("ProjetUtilisateur", back_populates="projet_prospection")