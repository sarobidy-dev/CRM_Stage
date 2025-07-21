export interface Contact {
  statut: string
  id: number
  nom: string
  prenom: string
  telephone: string
  email: string
  adresse: string
  fonction: string
  entreprise_id: number
}

// Type pour la réponse API
export interface ContactResponse {
  success: boolean
  message: string
  data: Contact | Contact[]
}

// Type pour les filtres
export interface FilterOptions {
  fonction: string[]
}

// Type pour la création/modification de contact
export interface ContactFormData {
  nom: string
  prenom: string
  telephone: string
  email: string
  adresse: string
  fonction: string
  entreprise_id: number
}
