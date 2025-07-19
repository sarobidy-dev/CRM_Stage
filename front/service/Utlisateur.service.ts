// import axios from "axios";
// import ApiService from "./api.service";
// import { Utilisateur } from "@/types/Utilisateur.type";
// const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// export const fetchUtilisateurs = async (): Promise<Utilisateur[]> => {
//     return await ApiService.get(`${apiUrl}/utilisateurs`);
// };

// const API = process.env.NEXT_PUBLIC_API_URL;

// export const createUtilisateur = async (formData: FormData) => {
//   const res = await axios.post(`${API}/utilisateurs/`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const updateUtilisateur = async (id: number, formData: FormData) => {
//   const res = await axios.put(`${apiUrl}/utilisateurs/${id}`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const deleteUtilisateur = async (id: number) => {
//   const res = await axios.delete(`${apiUrl}/utilisateurs/${id}`);
//   return res.data;
// };
import type { Utilisateur } from "@/types/Utilisateur.type"

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
    return data
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    throw error
  }
}

/**
 * Crée un nouvel utilisateur
 */
export const createUtilisateur = async (formData: FormData): Promise<Utilisateur> => {
  try {
    const response = await fetch(`${API_BASE_URL}/utilisateurs`, {
      method: "POST",
      body: formData, // FormData pour gérer les fichiers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    throw error
  }
}

/**
 * Met à jour un utilisateur existant
 */
export const updateUtilisateur = async (id: number, formData: FormData): Promise<Utilisateur> => {
  try {
    const response = await fetch(`${API_BASE_URL}/utilisateurs/${id}`, {
      method: "PUT",
      body: formData, // FormData pour gérer les fichiers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data
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

    // La suppression ne retourne généralement pas de données
    return
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    throw error
  }
}

/**
 * Récupère un utilisateur par son ID
 */
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
    return data
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    throw error
  }
}
