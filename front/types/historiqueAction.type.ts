const API_BASE_URL = "http://127.0.0.1:8000"

export interface HaContact {
  id: number
  ha_id: number // ID de l'historique
  contact_id: number // ID du contact
}
// types/historique.type.ts

export interface HistoriqueAction {
  id: number;
  date: string; // format ISO string (e.g. "2025-07-19")
  commentaire: string;
  action: string;
  pourcentageVente: number;
  entreprise_id: number | null;
  campagne_id: number | null;
  utilisateur_id: number;
}

export interface ContactHistoryItem {
  id: number
  date: string
  commentaire: string
  action: string
  pourcentageVente: number
  entreprise_id: number
  campagne_id: number | null
  utilisateur_id: number
}

// Créer une relation ha-contact
export async function createHaContact(contactId: number, historiqueId: number): Promise<HaContact> {
  try {
    const response = await fetch(`${API_BASE_URL}/ha-contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact_id: contactId, // Changé de id_contact à contact_id
        ha_id: historiqueId, // Changé de id_historique à ha_id
      }),
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const result = await response.json()

    // Gérer la structure de réponse avec success/data
    if (result.success && result.data) {
      return result.data
    }

    return result
  } catch (error) {
    console.error("Erreur lors de la création de ha-contact:", error)
    throw error
  }
}

// Récupérer l'historique d'un contact
export async function getContactHistory(contactId: number): Promise<ContactHistoryItem[]> {
  try {
    // D'abord récupérer les relations ha-contact pour ce contact
    const haContactsResponse = await fetch(`${API_BASE_URL}/ha-contacts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!haContactsResponse.ok) {
      throw new Error(`Erreur HTTP: ${haContactsResponse.status}`)
    }

    const haContactsResult = await haContactsResponse.json()

    let haContacts = []
    if (haContactsResult.success && Array.isArray(haContactsResult.data)) {
      // Filtrer pour ne garder que les relations pour ce contact
      haContacts = haContactsResult.data.filter((item: HaContact) => item.contact_id === contactId)
    }

    if (haContacts.length === 0) {
      return []
    }

    // Récupérer les détails de chaque historique
    const historiques = await Promise.all(
      haContacts.map(async (haContact: HaContact) => {
        try {
          const historiqueResponse = await fetch(`${API_BASE_URL}/historique-actions/${haContact.ha_id}`)

          if (!historiqueResponse.ok) {
            console.warn(`Impossible de récupérer l'historique ${haContact.ha_id}`)
            return null
          }

          const historiqueResult = await historiqueResponse.json()

          // Gérer différents formats de réponse
          if (historiqueResult.success && historiqueResult.data) {
            return historiqueResult.data
          } else if (historiqueResult.id) {
            return historiqueResult
          }

          return null
        } catch (error) {
          console.warn(`Erreur lors de la récupération de l'historique ${haContact.ha_id}:`, error)
          return null
        }
      }),
    )

    // Filtrer les résultats null et s'assurer qu'on retourne un tableau
    return historiques.filter((h) => h !== null)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error)
    return [] // Retourner un tableau vide en cas d'erreur
  }
}

// Supprimer une relation ha-contact
export async function deleteHaContact(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/ha-contacts/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de ha-contact:", error)
    throw error
  }
}

// Récupérer toutes les relations ha-contact
export async function getAllHaContacts(): Promise<HaContact[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/ha-contacts`)

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const result = await response.json()

    if (result.success && Array.isArray(result.data)) {
      return result.data
    } else if (Array.isArray(result)) {
      return result
    }

    return []
  } catch (error) {
    console.error("Erreur lors de la récupération des ha-contacts:", error)
    return []
  }
}
