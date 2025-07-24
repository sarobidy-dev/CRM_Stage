import type { Contact } from "@/types/Contact.type"

interface EmailEnvoyee {
  id_contact: number
  objet: string
  message: string
  date_envoyee: string
  id_email: number
  contact: {
    id: number
  }
}

interface EmailWithContact extends EmailEnvoyee {
  contactName: string
  contactEmail: string
  contactFunction: string
}

const apiUrl = "http://127.0.0.1:8000"

/**
 * Récupère l'historique des emails envoyés
 */
export const getEmailHistory = async (): Promise<EmailEnvoyee[]> => {
  try {
    const response = await fetch(`${apiUrl}/email`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    console.log("📧 Données emails brutes:", data)
    return data
  } catch (error) {
    console.error("Erreur getEmailHistory:", error)
    throw error
  }
}

/**
 * Enrichit les emails avec les informations des contacts
 */
export const enrichEmailsWithContacts = (emails: EmailEnvoyee[], contacts: Contact[]): EmailWithContact[] => {
  console.log("🔄 Enrichissement des emails...")
  console.log("📧 Emails à enrichir:", emails.length)
  console.log("👥 Contacts disponibles:", contacts.length)

  const enrichedEmails = emails.map((email) => {
    // Chercher le contact correspondant
    const contact = contacts.find((c) => c.id === email.id_contact)

    console.log(`🔍 Email ID ${email.id_email} - Contact ID ${email.id_contact}:`, contact ? "trouvé" : "non trouvé")

    const enrichedEmail: EmailWithContact = {
      ...email,
      contactName: contact ? `${contact.prenom || ""} ${contact.nom || ""}`.trim() : `Contact #${email.id_contact}`,
      contactEmail: contact?.email || "Email non disponible",
      contactFunction: contact?.fonction || "",
    }

    console.log(`✅ Email enrichi:`, {
      id_email: enrichedEmail.id_email,
      contactName: enrichedEmail.contactName,
      contactEmail: enrichedEmail.contactEmail,
      contactFunction: enrichedEmail.contactFunction,
    })

    return enrichedEmail
  })

  console.log("✅ Enrichissement terminé:", enrichedEmails.length, "emails enrichis")
  return enrichedEmails
}

/**
 * Récupère l'historique des emails pour un contact spécifique
 */
export const getEmailHistoryByContact = async (contactId: number): Promise<EmailEnvoyee[]> => {
  try {
    const response = await fetch(`${apiUrl}/email?contact_id=${contactId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur getEmailHistoryByContact:", error)
    throw error
  }
}
