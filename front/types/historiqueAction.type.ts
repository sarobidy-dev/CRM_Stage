import { Campagne } from "./campagne.type"
import { Entreprise } from "./Entreprise.type"
import { Utilisateur } from "./Utilisateur.type"

export interface HistoriqueAction {
  statut: string
  id: number
  date: string
  commentaire: string
  action: string
  pourcentageVente: number
  entreprise_id: number
  campagne_id: number | null
  utilisateur_id: number
  
  entreprise?: Entreprise
  campagne?: Campagne
  utilisateur?: Utilisateur
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}


export type CreateHistoriqueInput = Omit<HistoriqueAction, "id">
