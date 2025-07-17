export interface HistoriqueAction {
  id: number
  date: string
  commentaire?: string
  action: string
  pourcentageVente?: number
  entreprise_id: number
  campagne_id: number
  utilisateur_id: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}