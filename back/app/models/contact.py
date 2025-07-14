from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Contact(Base):
    __tablename__ = "contact"

    id_contact = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    prenom = Column(String(50), nullable=False)
    entreprise = Column(String(100), nullable=True)
    telephone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    adresse = Column(Text, nullable=True)
    fonction = Column(String(50), nullable=True)
    source = Column(String(50), nullable=True)
    secteur = Column(String(50), nullable=True)
    type = Column(String(20), nullable=True)
    id_utilisateur = Column(Integer, ForeignKey("utilisateur.id_utilisateur"), nullable=False)

    photo_de_profil = Column(String(255), nullable=True) 

    utilisateur = relationship("Utilisateur", back_populates="contacts")
    
    interactions = relationship("Interaction", back_populates="contact")
    
