from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

class Entreprise(Base):
    __tablename__ = "entreprise"

    id = Column(Integer, primary_key=True, index=True)
    raisonSocial = Column(String(20), nullable=False)
    telephoneStandard = Column(String(20), unique=True)
    emailStandart = Column(String(20), unique=True)

    adresse_id = Column(Integer, ForeignKey("adresse.id", ondelete="CASCADE"))
    utilisateur_id = Column(Integer, ForeignKey("utilisateur.id", ondelete="CASCADE"))

    adresse = relationship("Adresse", back_populates="entreprises")
    utilisateur = relationship("Utilisateur", back_populates="entreprises")

    historique_actions = relationship("HistoriqueAction", back_populates="entreprise")
    contacts = relationship("Contact", back_populates="entreprise")
    campagne_entreprises = relationship("CampagneEntreprise", back_populates="entreprise")
