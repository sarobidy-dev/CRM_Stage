export interface Interaction {
  type: string
  date_interaction: string
  contenu: string
  fichier_joint?: string
  id_contact: number
  id_interaction: number
}


export interface CreateInteractionData {
  type: string
  date_interaction: string
  contenu: string
  fichier_joint?: string
  id_contact: number
}

export interface UpdateInteractionData extends Partial<CreateInteractionData> {
  id_interaction: number
}
