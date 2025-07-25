from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class SMS(Base):
    __tablename__ = "sms"
    
    id = Column(Integer, primary_key=True, index=True)
    id_contact = Column(Integer, ForeignKey("contact.id"), nullable=False)
    message = Column(Text, nullable=False)
    telephone = Column(String(20), nullable=False)
    date_envoyee = Column(DateTime, default=datetime.utcnow)
    statut = Column(String(20), default="en_attente")  # en_attente, envoyé, échec
    type = Column(String(10), default="sms")
    expediteur = Column(String(20), default="0385805381")
    contact = relationship("Contact", back_populates="sms_envoyes")

