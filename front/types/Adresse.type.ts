export interface Adresse {
  quartier: string
  rue: string
  id: number
  ligneAdresse1: string
  ligneAdresse2?: string  // optionnel car parfois on n’a pas cette ligne
  ville: string
  cp: string
  pays: string
}

export interface AdresseResponse {
  success: boolean;
  message: string;
  data: Adresse[];
}

export interface SingleAdresseResponse {
  success: boolean;
  message: string;
  data: Adresse;
}
