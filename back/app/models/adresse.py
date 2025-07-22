from sqlalchemy import Column, Integer, String
from database import Base
from sqlalchemy.orm import relationship

class Adresse(Base):
    __tablename__ = "adresse"

    id = Column(Integer, primary_key=True, index=True)
    ligneAdresse1 = Column(String(50), nullable=False)
    ligneAdresse2 = Column(String(50), nullable=True)
    ville = Column(String(80), nullable=False)
    cp = Column(String(5), nullable=False)
    pays = Column(String(60), nullable=False)

    entreprises = relationship("Entreprise", back_populates="adresse")
