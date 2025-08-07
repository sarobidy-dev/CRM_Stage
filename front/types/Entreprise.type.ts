export interface Entreprise {
  utilisateur_id(utilisateur_id: any): unknown
  emailStandart: string
  adresse_id: number | null
  telephoneStandard: string
  raisonSocial: string
  nom: string
  adresse: string
  secteur: string
  telephone: string
  email: string
  id: number
  id_utilisateur: number
}


export interface Adresse {
  id: number;
  ligneAdresse1: string;
  ligneAdresse2: string | null;
  ville: string;
  cp: string;
  pays: string;
}

export interface Utilisateur {
  id: number;
  id_utilisateur?: number; // Peut être id ou id_utilisateur selon l'API
  nom: string;
  prenom?: string;
  email?: string;
}
