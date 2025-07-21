from sqlalchemy import Column, Integer, String, Double, ForeignKey, UniqueConstraint
from database import Base
from sqlalchemy.orm import relationship

class ProjetUtilisateur(Base):
    __tablename__ = "projet_utilisateur" 

    id = Column(Integer, primary_key=True, index=True)
    pourcentageVente = Column(Double, nullable=False)
    #foreign key
    projetProspection_id = Column(Integer, ForeignKey("projet_prospection.id", ondelete="CASCADE"))
    utilisateur_id =Column(Integer, ForeignKey("utilisateur.id", ondelete="CASCADE"))
    # Contrainte d'unicité composite
    __table_args__ = (
        UniqueConstraint('projetProspection_id', 'utilisateur_id', name='uq_projet_utilisateur_unique'),
    )
    # Relation
    utilisateur = relationship("Utilisateur", back_populates="projet_utilisateurs")
    projet_prospection = relationship("ProjetProspection", back_populates="projet_utilisateurs")