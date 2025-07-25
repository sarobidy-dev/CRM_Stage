from services import sms
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, text
from typing import List, Optional
from datetime import datetime, timedelta
from database import get_db
from models.sms import SMS
from models.contact import Contact
from schemas.sms import SMSCreate, SMSResponse, SMSBulkCreate, SMSBulkResponse, SMSHistoryResponse

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sms", tags=["SMS"])

@router.get("/health")
async def health_check():
    """Endpoint de santé pour vérifier que l'API SMS fonctionne"""
    return {
        "status": "healthy",
        "service": "SMS API",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/send", response_model=SMSResponse)
async def send_single_sms(sms_data: SMSCreate, db: Session = Depends(get_db)):
    """Envoie un SMS à un seul contact"""
    try:
        logger.info(f"Tentative d'envoi SMS au contact {sms_data.id_contact}")
        
        # Vérifier que le contact existe - SQLAlchemy 2.0 syntax
        stmt = select(Contact).where(Contact.id == sms_data.id_contact)
        contact = db.execute(stmt).scalar_one_or_none()
        
        if not contact:
            logger.warning(f"Contact {sms_data.id_contact} non trouvé")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact non trouvé"
            )
        
        # Personnaliser le message
        personalized_message = sms_data.message.replace('[Prénom]', contact.prenom or '')
        personalized_message = personalized_message.replace('[Nom]', contact.nom or '')
        
        logger.info(f"Message personnalisé: {personalized_message[:50]}...")
        
        # Envoyer le SMS
        result = sms.send_single_sms(sms_data.telephone, personalized_message)
        
        # Enregistrer en base
        sms_record = SMS(
            id_contact=sms_data.id_contact,
            message=personalized_message,
            telephone=sms_data.telephone,
            statut='envoyé' if result['success'] else 'échec',
            type='sms',
            expediteur=sms_data.expediteur
        )
        
        db.add(sms_record)
        db.commit()
        db.refresh(sms_record)
        
        logger.info(f"SMS enregistré avec ID: {sms_record.id}")
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Échec de l'envoi SMS: {result.get('error', 'Erreur inconnue')}"
            )
        
        return sms_record
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur lors de l'envoi SMS: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}"
        )

@router.post("/send-bulk", response_model=SMSBulkResponse)
async def send_bulk_sms(sms_data: SMSBulkCreate, db: Session = Depends(get_db)):
    """Envoie des SMS en masse"""
    try:
        logger.info(f"Début envoi SMS en masse pour {len(sms_data.contacts)} contacts")
        
        # Valider que tous les contacts existent - SQLAlchemy 2.0 syntax
        contact_ids = [contact['id'] for contact in sms_data.contacts]
        stmt = select(Contact).where(Contact.id.in_(contact_ids))
        existing_contacts = db.execute(stmt).scalars().all()
        existing_ids = {contact.id for contact in existing_contacts}
        
        # Filtrer les contacts existants
        valid_contacts = [
            contact for contact in sms_data.contacts 
            if contact['id'] in existing_ids
        ]
        
        if not valid_contacts:
            logger.warning("Aucun contact valide trouvé")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Aucun contact valide trouvé"
            )
        
        logger.info(f"Contacts valides: {len(valid_contacts)}")
        
        # Envoyer les SMS
        result = sms.send_bulk_sms(valid_contacts, sms_data.message, db)
        
        logger.info(f"Envoi SMS terminé: {result['total_sent']} succès, {result['total_failed']} échecs")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi SMS en masse: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne du serveur: {str(e)}"
        )

@router.get("/history", response_model=List[SMSHistoryResponse])
async def get_sms_history(
    skip: int = 0, 
    limit: int = 100, 
    contact_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Récupère l'historique des SMS"""
    try:
        logger.info(f"Récupération historique SMS (skip={skip}, limit={limit}, contact_id={contact_id})")
        
        # Vérifier si la table SMS existe
        try:
            db.execute(text("SELECT 1 FROM sms LIMIT 1"))
        except Exception as table_error:
            logger.warning(f"Table SMS non accessible: {str(table_error)}")
            return []
        
        # SQLAlchemy 2.0 syntax avec jointure
        stmt = select(SMS, Contact).join(Contact, SMS.id_contact == Contact.id, isouter=True)
        
        if contact_id:
            stmt = stmt.where(SMS.id_contact == contact_id)
        
        stmt = stmt.order_by(SMS.date_envoyee.desc()).offset(skip).limit(limit)
        
        results = db.execute(stmt).all()
        
        # Construire la réponse
        sms_history = []
        for sms, contact in results:
            sms_dict = {
                'id': sms.id,
                'id_contact': sms.id_contact,
                'message': sms.message,
                'telephone': sms.telephone,
                'date_envoyee': sms.date_envoyee,
                'statut': sms.statut,
                'expediteur': sms.expediteur,
                'contact_name': f"{contact.prenom} {contact.nom}" if contact else "Contact supprimé"
            }
            sms_history.append(sms_dict)
        
        logger.info(f"Historique récupéré: {len(sms_history)} SMS")
        return sms_history
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique SMS: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de l'historique: {str(e)}"
        )

@router.get("/history/{contact_id}", response_model=List[SMSHistoryResponse])
async def get_contact_sms_history(contact_id: int, db: Session = Depends(get_db)):
    """Récupère l'historique SMS d'un contact spécifique"""
    try:
        logger.info(f"Récupération historique SMS pour contact {contact_id}")
        
        # Vérifier que le contact existe
        stmt = select(Contact).where(Contact.id == contact_id)
        contact = db.execute(stmt).scalar_one_or_none()
        
        if not contact:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact non trouvé"
            )
        
        # Récupérer l'historique SMS du contact
        stmt = select(SMS).where(SMS.id_contact == contact_id).order_by(SMS.date_envoyee.desc())
        sms_list = db.execute(stmt).scalars().all()
        
        result = []
        for sms in sms_list:
            sms_dict = {
                'id': sms.id,
                'id_contact': sms.id_contact,
                'message': sms.message,
                'telephone': sms.telephone,
                'date_envoyee': sms.date_envoyee,
                'statut': sms.statut,
                'expediteur': sms.expediteur,
                'contact_name': f"{contact.prenom} {contact.nom}"
            }
            result.append(sms_dict)
        
        logger.info(f"Historique contact récupéré: {len(result)} SMS")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique SMS du contact {contact_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de l'historique: {str(e)}"
        )

@router.delete("/{sms_id}")
async def delete_sms(sms_id: int, db: Session = Depends(get_db)):
    """Supprime un SMS de l'historique"""
    try:
        logger.info(f"Suppression SMS {sms_id}")
        
        stmt = select(SMS).where(SMS.id == sms_id)
        sms = db.execute(stmt).scalar_one_or_none()
        
        if not sms:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="SMS non trouvé"
            )
        
        db.delete(sms)
        db.commit()
        
        logger.info(f"SMS {sms_id} supprimé avec succès")
        return {"message": "SMS supprimé avec succès"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression du SMS {sms_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )

@router.get("/stats")
async def get_sms_stats(db: Session = Depends(get_db)):
    """Récupère les statistiques des SMS"""
    try:
        logger.info("Récupération des statistiques SMS")
        
        # Vérifier si la table SMS existe
        try:
            db.execute(text("SELECT 1 FROM sms LIMIT 1"))
        except Exception as table_error:
            logger.warning(f"Table SMS non accessible: {str(table_error)}")
            return {
                'total_sms': 0,
                'sms_envoyes': 0,
                'sms_echecs': 0,
                'taux_succes': 0,
                'daily_stats': [],
                'message': 'Table SMS non initialisée'
            }
        
        # Statistiques générales avec gestion des valeurs nulles
        try:
            total_stmt = select(func.count(SMS.id))
            total_sms = db.execute(total_stmt).scalar() or 0
            
            envoyes_stmt = select(func.count(SMS.id)).where(SMS.statut == 'envoyé')
            sms_envoyes = db.execute(envoyes_stmt).scalar() or 0
            
            echecs_stmt = select(func.count(SMS.id)).where(SMS.statut == 'échec')
            sms_echecs = db.execute(echecs_stmt).scalar() or 0
            
        except Exception as stats_error:
            logger.error(f"Erreur lors du calcul des statistiques: {str(stats_error)}")
            return {
                'total_sms': 0,
                'sms_envoyes': 0,
                'sms_echecs': 0,
                'taux_succes': 0,
                'daily_stats': [],
                'error': str(stats_error)
            }
        
        # Statistiques par jour (7 derniers jours)
        daily_stats = []
        try:
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            
            daily_stmt = select(
                func.date(SMS.date_envoyee).label('date'),
                func.count(SMS.id).label('count'),
                func.sum(func.case([(SMS.statut == 'envoyé', 1)], else_=0)).label('success'),
                func.sum(func.case([(SMS.statut == 'échec', 1)], else_=0)).label('failed')
            ).where(
                SMS.date_envoyee >= seven_days_ago
            ).group_by(
                func.date(SMS.date_envoyee)
            ).order_by(
                func.date(SMS.date_envoyee).desc()
            )
            
            daily_results = db.execute(daily_stmt).all()
            
            daily_stats = [
                {
                    'date': stat.date.isoformat() if stat.date else datetime.utcnow().date().isoformat(),
                    'total': int(stat.count or 0),
                    'success': int(stat.success or 0),
                    'failed': int(stat.failed or 0)
                }
                for stat in daily_results
            ]
            
        except Exception as daily_error:
            logger.warning(f"Erreur lors du calcul des statistiques quotidiennes: {str(daily_error)}")
            daily_stats = []
        
        result = {
            'total_sms': int(total_sms),
            'sms_envoyes': int(sms_envoyes),
            'sms_echecs': int(sms_echecs),
            'taux_succes': round((sms_envoyes / total_sms * 100) if total_sms > 0 else 0, 2),
            'daily_stats': daily_stats
        }
        
        logger.info(f"Statistiques calculées: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des statistiques SMS: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des statistiques: {str(e)}"
        )
