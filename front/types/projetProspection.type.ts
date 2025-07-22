export interface ProjetProspection {
  id: number
  projet: string
  description: string
  created_at?: string
  updated_at?: string
}

export interface CreateProjetProspectionRequest {
  projet: string
  description: string
}

export interface UpdateProjetProspectionRequest {
  projet?: string
  description?: string
}

export interface ProjetProspectionResponse {
  success: boolean
  message: string
  data: ProjetProspection[]
}

export interface SingleProjetProspectionResponse {
  success: boolean
  message: string
  data: ProjetProspection
}
