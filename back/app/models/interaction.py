from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Interaction(Base):
    __tablename__ = "interaction"

    id_interaction = Column(Integer, primary_key=True, index=True)
    type = Column(String(50))
    date_interaction = Column(DateTime)
    contenu = Column(Text)
    fichier_joint = Column(String(255))
    id_contact = Column(Integer, ForeignKey("contact.id_contact"))
    contact = relationship("Contact", back_populates="interactions")
