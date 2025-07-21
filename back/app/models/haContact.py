from sqlalchemy import Column, Integer, String, ForeignKey,UniqueConstraint

from database import Base
from sqlalchemy.orm import relationship

class HAContact(Base):
    __tablename__ = "ha_contact" 
    
    id = Column(Integer, primary_key=True, index=True)
    #foreinkey
    ha_id = Column(Integer, ForeignKey("historique_action.id", ondelete="CASCADE"))
    contact_id = Column(Integer, ForeignKey("contact.id", ondelete="CASCADE"))
    # Contrainte d'unicité composite
    __table_args__ = (
        UniqueConstraint('ha_id', 'contact_id', name='uq_historiqueAction_Contact_unique'),
    )
    #Relation
    historique_action = relationship("HistoriqueAction", back_populates="ha_contacts")
    contact = relationship("Contact", back_populates="ha_contacts")