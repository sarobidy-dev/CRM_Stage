import type { Entreprise } from "@/types/Entreprise.type"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export interface CreateEntrepriseData {
  nom: string
  secteur?: string
  adresse?: string
  telephone?: string
  email?: string
}

// Récupérer toutes les entreprises
export const getAllEntreprises = async (): Promise<Entreprise[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/entreprises`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const json = await response.json()
    return json.data // ✅ extraire seulement le tableau
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error)
    throw error
  }
}

export const getEntrepriseById = async (id: number): Promise<Entreprise> => {
  try {
    const response = await fetch(`${API_BASE_URL}/entreprises/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erreur lors de la récupération de l'entreprise:", error)
    throw error
  }
}

export const createEntreprise = async (entrepriseData: CreateEntrepriseData): Promise<Entreprise> => {
  try {
    const response = await fetch(`${API_BASE_URL}/entreprises`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entrepriseData),
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.data // ⚠️ uniformiser le retour comme pour update
  } catch (error) {
    console.error("Erreur lors de la création de l'entreprise:", error)
    throw error
  }
}

export const updateEntreprise = async (
  id: number,
  entrepriseData: Partial<CreateEntrepriseData>,
): Promise<Entreprise> => {
  try {
    const response = await fetch(`${API_BASE_URL}/entreprises/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entrepriseData),
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.data // ✅ uniformisé avec create
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error)
    throw error
  }
}

export const deleteEntreprise = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/entreprises/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error)
    throw error
  }
}