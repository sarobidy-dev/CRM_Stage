export interface Campagne {
  id: number
  libelle: string
  description?: string
  projetProspection_id: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}