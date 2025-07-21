from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from database import Base
from sqlalchemy.orm import relationship

class CampagneEntreprise(Base):
    __tablename__ = "campagne_entreprise"

    id = Column(Integer, primary_key=True, index=True)

    entreprise_id = Column(Integer, ForeignKey("entreprise.id", ondelete="CASCADE"))
    campagne_id = Column(Integer, ForeignKey("campagne.id", ondelete="CASCADE"))

    __table_args__ = (
        UniqueConstraint('entreprise_id', 'campagne_id', name='uq_campagne_entreprise_unique'),
    )

    campagne = relationship("Campagne", back_populates="campagne_entreprises")
    entreprise = relationship("Entreprise", back_populates="campagne_entreprises")
