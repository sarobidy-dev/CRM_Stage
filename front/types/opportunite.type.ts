
export interface Opportunite {
  id_opportunite: number
  titre: string
  description: string
  date_interaction: string
  contenu: string
  date_creation: string
  prob_abill_suc: number
  statut: string
  etape_pipeline: string
  id_utilisateur: number
  id_entreprise: number
}

export interface CreateOpportuniteData {
  titre: string
  description: string
  date_interaction: string
  contenu: string
  date_creation: string
  prob_abill_suc: number
  statut: string
  etape_pipeline: string
  id_utilisateur: number
  id_entreprise: number
}

export interface UpdateOpportuniteData extends Partial<CreateOpportuniteData> {
  id_opportunite: number
}
export interface Opportunite {
  montant: number
} 