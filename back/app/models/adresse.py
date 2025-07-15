from sqlalchemy import Column, Integer, String,Boolean
from database import Base

class Adresse(Base):
    __tablename__ = "adresse" 
    
    id = Column(Integer, primary_key=True, index=True)
    ligneAdresse1 = Column(String(40), nullable=False)
    ligneAdresse2= Column(String(40))
    ville = Column(String(80),nullable=False)
    cp = Column(String(5), nullable=False)
    pays= Column(String(60) default=True)
