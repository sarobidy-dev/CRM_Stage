// Types pour l'API email
export interface EmailRequest {
  destinator: string
  subject: string
  body: string
}

export interface EmailResponse {
  success: boolean
  message: string
  messageId?: string
}

// Types pour le service frontend
export interface SendEmailParams {
  contactIds: number[]
  subject: string
  message: string
  type: "email" | "sms"
}

export interface Contact {
  nom: string
  prenom: string
  email: string
  photo_de_profil: string
  id_contact: number
}

export interface SendResult {
  success: boolean
  message: string
  results?: Array<{
    recipient: string
    contactName?: string
    success: boolean
    messageId?: string
    error?: string
  }>
}
