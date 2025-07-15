from sqlalchemy import Column, Integer, String,Boolean
from database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateur" 

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    mot2pass = Column(String(120), unique=True, index=True, nullable=False)
    role = Column(String(40), nullable=False)
    actif= Column(Boolean, default=True)
    photo_profil = Column(String(255), nullable=True)
   