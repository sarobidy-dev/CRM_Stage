import re

import logging
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select
from models.sms import SMS
from models.contact import Contact
from schemas.sms import SMSCreate, SMSBulkCreate

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.api_url = "https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B261385805381/requests"
        self.api_key = ""  
        self.sender_number = "0385438872"
    
    def validate_malagasy_phone(self, phone: str) -> bool:
        """Valide un numéro de téléphone malgache"""
        phone_pattern = r'^(\+261|0)[0-9]{9}$'
        return bool(re.match(phone_pattern, phone))
    
    def format_phone_number(self, phone: str) -> str:
        """Formate un numéro de téléphone pour l'API"""
        # Supprimer tous les espaces et caractères spéciaux
        cleaned = re.sub(r'\D', '', phone)
        
        # Si le numéro commence par 261, ajouter le +
        if cleaned.startswith('261'):
            return f'+{cleaned}'
        
        # Si le numéro commence par 0, remplacer par +261
        if cleaned.startswith('0') and len(cleaned) == 10:
            return f'+261{cleaned[1:]}'
        
        return phone
    
    def send_single_sms(self, phone: str, message: str) -> Dict[str, Any]:
        """Envoie un SMS à un seul destinataire"""
        try:
            if not self.validate_malagasy_phone(phone):
                return {
                    'success': False,
                    'error': 'Numéro de téléphone invalide',
                    'phone': phone
                }
            
            formatted_phone = self.format_phone_number(phone)
            
            # Simulation d'envoi SMS (remplacez par l'appel API réel)
            # Exemple avec Orange API Madagascar
            """
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'outboundSMSMessageRequest': {
                    'address': [formatted_phone],
                    'senderAddress': f'tel:+261{self.sender_number[1:]}',
                    'outboundSMSTextMessage': {
                        'message': message
                    }
                }
            }
            
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 201:
                return {
                    'success': True,
                    'message_id': response.json().get('outboundSMSMessageRequest', {}).get('resourceURL'),
                    'phone': formatted_phone
                }
            else:
                return {
                    'success': False,
                    'error': f'Erreur API: {response.status_code}',
                    'phone': formatted_phone
                }
            """
            
            # Simulation pour le développement
            import random
            success = random.random() > 0.1  # 90% de succès
            
            if success:
                return {
                    'success': True,
                    'message_id': f'sms_{datetime.now().timestamp()}',
                    'phone': formatted_phone
                }
            else:
                return {
                    'success': False,
                    'error': 'Échec de l\'envoi SMS',
                    'phone': formatted_phone
                }
                
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi SMS à {phone}: {str(e)}")
            return {
                'success': False,
                'error': f'Erreur système: {str(e)}',
                'phone': phone
            }
    
    def send_bulk_sms(self, contacts: List[Dict], message: str, db: Session) -> Dict[str, Any]:
        """Envoie des SMS en masse"""
        results = []
        success_count = 0
        failed_count = 0
        
        for contact in contacts:
            try:
                phone = contact.get('telephone', '')
                contact_name = f"{contact.get('prenom', '')} {contact.get('nom', '')}".strip()
                contact_id = contact.get('id')
                
                # Personnaliser le message
                personalized_message = message.replace('[Prénom]', contact.get('prenom', ''))
                personalized_message = personalized_message.replace('[Nom]', contact.get('nom', ''))
                
                # Envoyer le SMS
                sms_result = self.send_single_sms(phone, personalized_message)
                
                # Déterminer le statut
                statut = 'envoyé' if sms_result['success'] else 'échec'
                
                # Enregistrer en base de données
                sms_record = SMS(
                    id_contact=contact_id,
                    message=personalized_message,
                    telephone=phone,
                    date_envoyee=datetime.utcnow(),
                    statut=statut,
                    type='sms',
                    expediteur=self.sender_number
                )
                
                db.add(sms_record)
                
                # Ajouter au résultat
                result_item = {
                    'success': sms_result['success'],
                    'contactName': contact_name,
                    'recipient': phone,
                    'contact_id': contact_id
                }
                
                if sms_result['success']:
                    success_count += 1
                    result_item['message_id'] = sms_result.get('message_id')
                else:
                    failed_count += 1
                    result_item['error'] = sms_result.get('error', 'Erreur inconnue')
                
                results.append(result_item)
                
            except Exception as e:
                failed_count += 1
                logger.error(f"Erreur lors du traitement du contact {contact}: {str(e)}")
                results.append({
                    'success': False,
                    'contactName': contact_name if 'contact_name' in locals() else 'Inconnu',
                    'recipient': phone if 'phone' in locals() else 'Inconnu',
                    'contact_id': contact_id if 'contact_id' in locals() else None,
                    'error': f'Erreur de traitement: {str(e)}'
                })
        
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Erreur lors de la sauvegarde: {str(e)}")
            return {
                'success': False,
                'message': 'Erreur lors de la sauvegarde en base de données',
                'total_sent': 0,
                'total_failed': len(contacts),
                'results': []
            }
        
        return {
            'success': success_count > 0,
            'message': f'{success_count} SMS envoyé(s) avec succès, {failed_count} échec(s)',
            'total_sent': success_count,
            'total_failed': failed_count,
            'results': results
        }

# Instance globale du service
sms_service = SMSService()
