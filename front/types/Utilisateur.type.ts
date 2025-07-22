export interface Utilisateur {
  id: number
  id_utilisateur?: number // Pour compatibilité si votre API retourne les deux
  nom: string
  prenom: string
  email: string
  mot2pass?: string // Optionnel car on ne veut pas toujours l'exposer
  role: string
  actif?: boolean
  photo_profil?: string
}

export interface CreateUtilisateurRequest {
  nom: string
  prenom: string
  email: string
  mot2pass: string
  role: string
  actif: boolean
  photo_profil?: File
}

export interface UpdateUtilisateurRequest {
  nom?: string
  prenom?: string
  email?: string
  mot2pass?: string
  role?: string
  actif?: boolean
  photo_profil?: File
}
