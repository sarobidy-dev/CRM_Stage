
import { Contact } from "@/types/Contact.type"
import ApiService from "./api.service"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

// Récupérer tous les contacts
export const getAllContacts = async (): Promise<Contact[]> => {
  return await ApiService.get(`${apiUrl}/contacts`)
}
export const getCountContact = async (): Promise<Contact[]> => {
  return await ApiService.get(`${apiUrl}/contacts/count`)
}

export const createContact = async (contact: {
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  fonction?: string;
  entreprise_id: number;
}): Promise<Contact> => {
  return await ApiService.post(`${apiUrl}/contacts`, contact); // ← envoie JSON
};
export interface ContactPayload {
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  fonction?: string;
  entreprise_id: number;
}
export const updateContact = async (
  id: number,
  contact: Partial<ContactPayload>   // ↔ tous les champs deviennent optionnels pour un PATCH
): Promise<Contact> => {
  console.log("=== SERVICE UPDATE CONTACT ===");
  console.log(`Mise à jour du contact ID: ${id}`, contact);

  // Envoie l’objet tel quel : ApiService ajoutera l’en‑tête JSON
  return await ApiService.put(`${apiUrl}/contacts/${id}`, contact);
};
export const deleteContact = async (id: number): Promise<void> => {
  return await ApiService.delete(`${apiUrl}/contacts/${id}`)
}
export const getContactById = async (id: number): Promise<Contact> => {
  return await ApiService.get(`${apiUrl}/contacts/${id}`)
}
export interface SendEmailParams {
  contactIds: number[]
  subject: string
  message: string
  type?: "email" | "sms"
}

export interface SendEmailResponse {
  success: boolean
  message: string
  results?: Array<{
    recipient: string
    contactName?: string
    success: boolean
    messageId?: string
    error?: string
  }>
  contactsProcessed?: number
}

// Envoyer un email aux contacts
export const sendEmail = async (params: SendEmailParams): Promise<SendEmailResponse> => {
  console.log("Envoi d'email aux contacts:", params.contactIds)

  try {
    // Vérifier les paramètres obligatoires
    if (!params.contactIds || params.contactIds.length === 0) {
      throw new Error("Aucun contact sélectionné pour l'envoi d'email")
    }

    if (!params.subject || !params.message) {
      throw new Error("Le sujet et le message sont obligatoires")
    }

    // Préparer les données pour l'API
    const emailData = {
      contactIds: params.contactIds,
      subject: params.subject,
      message: params.message,
      type: params.type || "email",
    }

    console.log("Données d'envoi d'email:", emailData)

    // Appel à l'API backend pour envoyer l'email
    const result = await ApiService.post(`/send-email`, emailData)

    console.log("Résultat de l'envoi d'email:", result)
    return result
  } catch (error) {
    console.error("Erreur lors de l'envoi d'email:", error)

    // Formater l'erreur pour une réponse cohérente
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de l'envoi d'email",
    }
  }
}
export async function deleteContactById(id: number): Promise<void> {
  const response = await fetch(`${apiUrl}/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Erreur suppression contact id=${id}: ${response.statusText}`)
  }
}

export async function deleteMultipleContacts(ids: number[]): Promise<void> {
  // Supposons que ton API supporte la suppression multiple via un endpoint POST/DELETE avec liste d’IDs
  const response = await fetch(`${apiUrl}/bulk-delete`, {
    method: "POST", // parfois DELETE n'accepte pas de body, POST est souvent utilisé ici
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  })

  if (!response.ok) {
    throw new Error(`Erreur suppression multiple contacts: ${response.statusText}`)
  }
}
export const getContactsStats = async (): Promise<{ perdus: number; gagnes: number; encours: number }> => {
  try {
    const contacts = await getAllContacts()

    const stats = {
      perdus: contacts.filter((c) => c.statut === "perdu").length,
      gagnes: contacts.filter((c) => c.statut === "gagne").length,
      encours: contacts.filter((c) => c.statut === "encours").length,
    }

    return stats
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques contacts:", error)
    return { perdus: 0, gagnes: 0, encours: 0 }
  }
}
