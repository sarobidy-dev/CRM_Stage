from database import Base
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

class EmailEnvoye(Base):
    __tablename__ = "emails_envoyes"

    id_email = Column(Integer, primary_key=True, index=True)
    id_contact = Column(Integer, ForeignKey("contact.id", ondelete="CASCADE"), nullable=False)
    objet = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    date_envoyee: datetime = datetime.utcnow().replace(tzinfo=None)

    contact = relationship("Contact", back_populates="emails")
