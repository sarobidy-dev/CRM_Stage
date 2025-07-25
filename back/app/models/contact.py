from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Contact(Base):
    __tablename__ = "contact"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    prenom = Column(String(50), nullable=True)
    telephone = Column(String(15), nullable=True)
    email = Column(String(120), nullable=True)
    adresse = Column(Text, nullable=True)
    fonction = Column(String(50), nullable=True)
    #forey key
    entreprise_id = Column(Integer, ForeignKey("entreprise.id", ondelete="CASCADE"))
    #relations
    entreprise = relationship("Entreprise", back_populates="contacts")
    ha_contacts = relationship("HAContact", back_populates="contact")

    emails = relationship("EmailEnvoye", back_populates="contact", cascade="all, delete-orphan")

    
    sms_envoyes = relationship("SMS", back_populates="contact", cascade="all, delete-orphan")