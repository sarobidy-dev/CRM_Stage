interface Contact {
  id: number
  nom: string
  prenom: string
  telephone: string
  email: string
  adresse: string
  fonction: string
  entreprise_id: number
}

interface EmailEnvoyee {
  id_contact: number
  objet: string
  message: string
  date_envoyee: string
}

/**
 * Personnalise un message avec les données du contact
 */
const personalizeMessage = (template: string, contact: Contact): string => {
  return template
    .replace(/\[Prénom\]/g, contact.prenom || "")
    .replace(/\[Nom\]/g, contact.nom || "")
    .replace(/\[Fonction\]/g, contact.fonction || "")
}

/**
 * Enregistre un email dans la table email-envoyees via l'API Next.js
 */
export const saveEmailToDatabase = async (contact: Contact, subject: string, message: string): Promise<void> => {
  try {
    const emailData = {
      id_contact: contact.id,
      objet: personalizeMessage(subject, contact),
      message: personalizeMessage(message, contact),
      date_envoyee: new Date().toISOString().slice(0, 19),
      contact: {
        id: contact.id,
      },
    }

    console.log(`📧 Enregistrement email pour contact ${contact.id}:`, emailData)

    const response = await fetch("/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`❌ Erreur lors de l'enregistrement pour le contact ${contact.id}:`, response.status, errorData)
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
    }

    const result = await response.json()
    console.log(`✅ Email enregistré avec succès pour le contact ${contact.id}:`, result)
  } catch (error) {
    console.error(`💥 Erreur d'enregistrement pour le contact ${contact.id}:`, error)
    throw error
  }
}

/**
 * Enregistre les emails pour tous les contacts sélectionnés
 */
export const saveEmailsToDatabase = async (contacts: Contact[], subject: string, message: string): Promise<void> => {
  try {
    console.log(`🚀 Début de l'enregistrement pour ${contacts.length} contact(s)`)

    // Enregistrer pour chaque contact
    const savePromises = contacts.map((contact) => saveEmailToDatabase(contact, subject, message))

    await Promise.all(savePromises)

    console.log(`🎉 Tous les emails ont été enregistrés avec succès dans la base de données`)
  } catch (error) {
    console.error("💥 Erreur lors de l'enregistrement des emails:", error)
    throw new Error("Impossible d'enregistrer les emails dans la base de données")
  }
}

/**
 * Récupère l'historique des emails envoyés via l'API Next.js
 */
export const getEmailHistory = async (): Promise<EmailEnvoyee[]> => {
  try {
    const response = await fetch("/email", {
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
    console.error("Erreur getEmailHistory:", error)
    throw error
  }
}

/**
 * Récupère l'historique des emails pour un contact spécifique via l'API Next.js
 */
export const getEmailHistoryByContact = async (contactId: number): Promise<EmailEnvoyee[]> => {
  try {
    const response = await fetch(`/email?contact_id=${contactId}`, {
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

interface SaveEmailParams {
  contacts: Contact[]
  objet: string
  message: string
}

/**
 * Enregistre les emails dans l'historique pour tous les contacts sélectionnés
 */
export const saveEmailToHistory = async ({ contacts, objet, message }: SaveEmailParams): Promise<void> => {
  try {
    console.log(`🚀 Début de l'enregistrement dans l'historique pour ${contacts.length} contact(s)`)

    // Enregistrer pour chaque contact dans la base de données
    await saveEmailsToDatabase(contacts, objet, message)

    console.log(`🎉 Emails enregistrés avec succès dans l'historique`)
  } catch (error) {
    console.error("💥 Erreur lors de l'enregistrement dans l'historique:", error)
    throw new Error("Impossible d'enregistrer les emails dans l'historique")
  }
}
