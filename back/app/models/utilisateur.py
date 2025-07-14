from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateur"  # convention lowercase + snake_case

    id_utilisateur = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    prenom = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(String(100), nullable=False)
    numero_tel = Column(String(10), nullable=False)
    photo_profil = Column(String(255), nullable=True)
    contacts = relationship("Contact", back_populates="utilisateur")
    opportunites = relationship("Opportunite", back_populates="utilisateur")
