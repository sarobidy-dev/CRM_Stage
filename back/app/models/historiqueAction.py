from sqlalchemy import Column, Integer, String, Date, Text, Double, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

class HistoriqueAction(Base):
    __tablename__ = "historique_action" 
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    commentaire = Column(Text, nullable=True)
    action=Column(String(45), nullable=False)
    pourcentageVente= Column(Double, nullable=True)
    #forey key 
    entreprise_id = Column(Integer, ForeignKey("entreprise.id", ondelete="CASCADE"))
    campagne_id = Column(Integer, ForeignKey("campagne.id", ondelete="CASCADE"))
    utilisateur_id = Column(Integer, ForeignKey("utilisateur.id",ondelete="CASCADE"))
    # Relation
    utilisateur = relationship("Utilisateur", back_populates="historique_actions")
    campagne = relationship("Campagne", back_populates="historique_actions")
    entreprise = relationship("Entreprise", back_populates="historique_actions")

    ha_contacts = relationship("HAContact", back_populates="historique_action")