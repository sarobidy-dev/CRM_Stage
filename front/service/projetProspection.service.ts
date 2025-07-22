import { CreateProjetProspectionRequest, ProjetProspection, ProjetProspectionResponse, SingleProjetProspectionResponse, UpdateProjetProspectionRequest } from "@/types/projetProspection.type"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

/**
 * Récupère tous les projets de prospection
 */
export const getAllProjetsProspection = async (): Promise<ProjetProspection[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projets-prospection`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data: ProjetProspectionResponse = await response.json()

    if (data.success && Array.isArray(data.data)) {
      return data.data
    } else if (Array.isArray(data)) {
      return data as ProjetProspection[]
    } else {
      return []
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des projets de prospection:", error)
    return []
  }
}

/**
 * Récupère un projet de prospection par son ID
 */
export const getProjetProspectionById = async (id: number): Promise<ProjetProspection | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projets-prospection/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data: SingleProjetProspectionResponse = await response.json()

    if (data.success && data.data) {
      return data.data
    } else if ((data as any).id) {
      return data as ProjetProspection
    } else {
      return null
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du projet de prospection:", error)
    return null
  }
}

/**
 * Crée un nouveau projet de prospection
 */
export const createProjetProspection = async (
  projetData: CreateProjetProspectionRequest,
): Promise<ProjetProspection> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projets-prospection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projetData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.data) {
      return data.data
    } else if (data.id) {
      return data
    } else {
      throw new Error("Format de réponse invalide")
    }
  } catch (error) {
    console.error("Erreur lors de la création du projet de prospection:", error)
    throw error
  }
}

/**
 * Met à jour un projet de prospection existant
 */
export const updateProjetProspection = async (
  id: number,
  projetData: UpdateProjetProspectionRequest,
): Promise<ProjetProspection> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projets-prospection/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projetData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.data) {
      return data.data
    } else if (data.id) {
      return data
    } else {
      throw new Error("Format de réponse invalide")
    }
  } catch (error) {
    console.error("Erreur lors de la modification du projet de prospection:", error)
    throw error
  }
}

/**
 * Supprime un projet de prospection
 */
export const deleteProjetProspection = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projets-prospection/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Erreur HTTP: ${response.status}`)
    }
  } catch (error) {
    console.error("Erreur lors de la suppression du projet de prospection:", error)
    throw error
  }
}
