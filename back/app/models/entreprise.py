from sqlalchemy import Column, Integer, String, Text
from app.database import Base
from sqlalchemy.orm import relationship
class Entreprise(Base):
    __tablename__ = "entreprise"

    id_entreprise = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    adresse = Column(Text)
    secteur = Column(String(50))
    telephone = Column(String(20), unique=True)
    email = Column(String(100), unique=True)
    opportunites = relationship("Opportunite", back_populates="entreprise")
