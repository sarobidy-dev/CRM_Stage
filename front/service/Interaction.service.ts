import type { Interaction, CreateInteractionData } from "@/types/interaction.type"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export const getInteractions = async (): Promise<Interaction[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions`, {
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
    console.error("Erreur lors de la récupération des interactions:", error)
    throw error
  }
}

export const getInteractionById = async (id: number): Promise<Interaction> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions/${id}`, {
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
    console.error("Erreur lors de la récupération de l'interaction:", error)
    throw error
  }
}

export const createInteraction = async (interactionData: CreateInteractionData, file?: File): Promise<Interaction> => {
  try {
    const formData = new FormData()

    // Ajouter les données de l'interaction
    formData.append("type", interactionData.type)
    formData.append("date_interaction", interactionData.date_interaction)
    formData.append("contenu", interactionData.contenu)
    formData.append("id_contact", interactionData.id_contact.toString())

    // Ajouter le fichier s'il existe
    if (file) {
      formData.append("fichier_joint", file)
    }

    const response = await fetch(`${API_BASE_URL}/interactions`, {
      method: "POST",
      body: formData, // Pas de Content-Type header, le navigateur le définit automatiquement avec boundary
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erreur lors de la création de l'interaction:", error)
    throw error
  }
}

export const updateInteraction = async (
  id: number,
  interactionData: Partial<CreateInteractionData>,
  file?: File,
): Promise<Interaction> => {
  try {
    const formData = new FormData()

    // Ajouter les données de l'interaction
    if (interactionData.type) formData.append("type", interactionData.type)
    if (interactionData.date_interaction) formData.append("date_interaction", interactionData.date_interaction)
    if (interactionData.contenu) formData.append("contenu", interactionData.contenu)
    if (interactionData.id_contact) formData.append("id_contact", interactionData.id_contact.toString())

    // Ajouter le fichier s'il existe
    if (file) {
      formData.append("fichier_joint", file)
    }

    const response = await fetch(`${API_BASE_URL}/interactions/${id}`, {
      method: "PUT",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'interaction:", error)
    throw error
  }
}

export const deleteInteraction = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interactions/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'interaction:", error)
    throw error
  }
}

// Cette fonction n'est plus nécessaire car l'upload se fait directement avec l'interaction
export const uploadFile = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.file_path || data.filename
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier:", error)
    throw error
  }
}
