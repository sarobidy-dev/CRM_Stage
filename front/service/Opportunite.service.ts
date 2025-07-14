import type { Opportunite } from "@/types/opportunite.type"
import ApiService from "./api.service"


const apiUrl = process.env.NEXT_PUBLIC_API_URL
type CountOpportuniteResponse = {
  total_opportunites: number;
};

export const getCountOpportunite = async (): Promise<CountOpportuniteResponse> => {
 return await ApiService.get(`${apiUrl}/opportunites/count`);
};

export const getAllOpportunites = async (): Promise<Opportunite[]> => {
return await ApiService.get(`${apiUrl}/opportunites`)
}
import type { CreateOpportuniteData } from "@/types/opportunite.type"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export const getOpportunites = async (): Promise<Opportunite[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/opportunites`, {
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
    console.error("Erreur lors de la récupération des opportunités:", error)
    throw error
  }
}

export const getOpportuniteById = async (id: number): Promise<Opportunite> => {
  try {
    const response = await fetch(`${API_BASE_URL}/opportunites/${id}`, {
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
    console.error("Erreur lors de la récupération de l'opportunité:", error)
    throw error
  }
}

export const createOpportunite = async (opportuniteData: CreateOpportuniteData): Promise<Opportunite> => {
  try {
    const response = await fetch(`${API_BASE_URL}/opportunites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(opportuniteData),
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erreur lors de la création de l'opportunité:", error)
    throw error
  }
}

export const updateOpportunite = async (
  id: number,
  opportuniteData: Partial<CreateOpportuniteData>,
): Promise<Opportunite> => {
  try {
    const response = await fetch(`${API_BASE_URL}/opportunites/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(opportuniteData),
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'opportunité:", error)
    throw error
  }
}

export const deleteOpportunite = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/opportunites/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'opportunité:", error)
    throw error
  }
}
