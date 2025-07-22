import type { Utilisateur, CreateUtilisateurRequest, UpdateUtilisateurRequest } from "@/types/Utilisateur.type"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

/**
 * Récupère tous les utilisateurs
 */
export const fetchUtilisateurs = async (): Promise<Utilisateur[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/utilisateurs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()

    // Gérer différents formats de réponse
    if (data.success && Array.isArray(data.data)) {
      return data.data
    } else if (Array.isArray(data)) {
      return data
    } else {
      return []
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return [] // Retourner un tableau vide plutôt que de throw
  }
}

/**
 * Crée un nouvel utilisateur
 */
export const createUtilisateur = async (userData: CreateUtilisateurRequest): Promise<Utilisateur> => {
  try {
    const formData = new FormData()
    formData.append("nom", userData.nom)
    formData.append("prenom", userData.prenom)
    formData.append("email", userData.email)
    formData.append("mot2pass", userData.mot2pass)
    formData.append("role", userData.role)
    formData.append("actif", userData.actif.toString())

    if (userData.photo_profil) {
      formData.append("photo_profil", userData.photo_profil)
    }

    const response = await fetch(`${API_BASE_URL}/utilisateurs`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.success ? data.data : data
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    throw error
  }
}

/**
 * Met à jour un utilisateur existant
 */
export const updateUtilisateur = async (id: number, userData: UpdateUtilisateurRequest): Promise<Utilisateur> => {
  try {
    const formData = new FormData()

    if (userData.nom) formData.append("nom", userData.nom)
    if (userData.prenom) formData.append("prenom", userData.prenom)
    if (userData.email) formData.append("email", userData.email)
    if (userData.mot2pass) formData.append("mot2pass", userData.mot2pass)
    if (userData.role) formData.append("role", userData.role)
    if (userData.actif !== undefined) formData.append("actif", userData.actif.toString())
    if (userData.photo_profil) formData.append("photo_profil", userData.photo_profil)

    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: "PUT",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.success ? data.data : data
  } catch (error) {
    console.error("Erreur lors de la modification de l'utilisateur:", error)
    throw error
  }
}

/**
 * Supprime un utilisateur
 */
export const deleteUtilisateur = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
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
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    throw error
  }
}

export const getUserById = async (id: number): Promise<Utilisateur> => {
  try {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.success ? data.data : data
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    throw error
  }
}
