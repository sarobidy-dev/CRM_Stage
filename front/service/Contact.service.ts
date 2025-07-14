import type { Contact } from "@/types/Contact.type"
import ApiService from "./api.service"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

// Récupérer tous les contacts
export const getAllContacts = async (): Promise<Contact[]> => {
  return await ApiService.get(`${apiUrl}/contacts`)
}
export const getCountContact = async (): Promise<Contact[]> => {
  return await ApiService.get(`${apiUrl}/contacts/count`)
}

export const createContact = async (contactFormData: FormData): Promise<Contact> => {
  console.log("=== SERVICE CREATE CONTACT ===")
  console.log("Envoi FormData au backend...")

  // Log du contenu du FormData pour debug
  for (const [key, value] of contactFormData.entries()) {
    if (value instanceof File) {
      console.log(`${key}: [FILE] ${value.name} (${value.size} bytes)`)
    } else {
      console.log(`${key}: ${value}`)
    }
  }

  return await ApiService.post(`${apiUrl}/contacts`, contactFormData, {
    isFormData: true,
  })
}

export const updateContact = async (id: number, contactFormData: FormData): Promise<Contact> => {
  console.log("=== SERVICE UPDATE CONTACT ===")
  console.log(`Mise à jour du contact ID: ${id}`)

  // Log du contenu du FormData pour debug
  for (const [key, value] of contactFormData.entries()) {
    if (value instanceof File) {
      console.log(`${key}: [FILE] ${value.name} (${value.size} bytes)`)
    } else {
      console.log(`${key}: ${value}`)
    }
  }

  return await ApiService.put(`${apiUrl}/contacts/${id}`, contactFormData, {
    isFormData: true,
  })
}
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
