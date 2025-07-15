from sqlalchemy import Column, Integer, String, Text
from database import Base
from sqlalchemy.orm import relationship
class Entreprise(Base):
    __tablename__ = "entreprise"

    id= Column(Integer, primary_key=True, index=True)
    raisonSocial = Column(String(20), nullable=False)
    telephoneStandard = Column(String(20), unique=True)
    emailStandart = Column(String(20), unique=True)

   
