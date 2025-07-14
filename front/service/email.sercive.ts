import type { EmailRequest, EmailResponse, SendEmailParams, SendResult, Contact } from "@/types/email.type"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Service pour envoyer un email à un destinataire
export async function sendSingleEmail(emailData: EmailRequest): Promise<EmailResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return {
      success: true,
      message: "Email envoyé avec succès",
      messageId: result.messageId,
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue",
    }
  }
}

// Service pour récupérer les contacts par IDs (gardé pour compatibilité)
export async function getContactsByIds(contactIds: number[]): Promise<Contact[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: contactIds }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur lors de la récupération des contacts:", error)
    return []
  }
}

// Nouvelle interface pour envoyer directement avec les contacts
export interface SendEmailDirectParams {
  contacts: Contact[]
  subject: string
  message: string
  type: "email" | "sms"
}

// Service optimisé pour envoyer des emails directement avec les contacts fournis
export async function sendEmailDirect(params: SendEmailDirectParams): Promise<SendResult> {
  const { contacts, subject, message, type } = params

  if (type !== "email") {
    return {
      success: false,
      message: "Seul l'envoi d'emails est supporté pour le moment",
    }
  }

  if (contacts.length === 0) {
    return {
      success: false,
      message: "Aucun contact fourni",
    }
  }

  try {
    console.log("=== ENVOI EMAIL DIRECT ===")
    console.log("Contacts à traiter:", contacts)

    // Envoyer l'email à chaque contact
    const results = await Promise.allSettled(
      contacts.map(async (contact) => {
        const emailData: EmailRequest = {
          destinator: contact.email,
          subject: subject.replace(/\[Prénom\]/g, contact.prenom).replace(/\[Nom\]/g, contact.nom),
          body: message.replace(/\[Prénom\]/g, contact.prenom).replace(/\[Nom\]/g, contact.nom),
        }

        console.log("Envoi email pour:", contact.email, emailData)

        const result = await sendSingleEmail(emailData)
        return {
          recipient: contact.email,
          contactName: `${contact.prenom} ${contact.nom}`,
          success: result.success,
          messageId: result.messageId,
          error: result.success ? undefined : result.message,
        }
      }),
    )

    // Traiter les résultats
    const processedResults = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value
      } else {
        return {
          recipient: contacts[index]?.email || "Email inconnu",
          contactName: contacts[index] ? `${contacts[index].prenom} ${contacts[index].nom}` : "Contact inconnu",
          success: false,
          error: result.reason?.message || "Erreur inconnue",
        }
      }
    })

    const successCount = processedResults.filter((r) => r.success).length
    const totalCount = processedResults.length

    return {
      success: successCount > 0,
      message:
        successCount === totalCount
          ? `Tous les emails ont été envoyés avec succès (${successCount}/${totalCount})`
          : successCount > 0
            ? `${successCount}/${totalCount} emails envoyés avec succès`
            : "Aucun email n'a pu être envoyé",
      results: processedResults,
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails:", error)
    return {
      success: false,
      message: "Erreur lors de l'envoi des emails",
    }
  }
}

// Service principal pour envoyer des emails à plusieurs contacts (version avec IDs)
export async function sendEmail(params: SendEmailParams): Promise<SendResult> {
  const { contactIds, subject, message, type } = params

  if (type !== "email") {
    return {
      success: false,
      message: "Seul l'envoi d'emails est supporté pour le moment",
    }
  }

  try {
    // Récupérer les informations des contacts
    const contacts = await getContactsByIds(contactIds)
    if (contacts.length === 0) {
      return {
        success: false,
        message: "Aucun contact trouvé",
      }
    }

    // Utiliser la nouvelle fonction directe
    return await sendEmailDirect({
      contacts,
      subject,
      message,
      type,
    })
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails:", error)
    return {
      success: false,
      message: "Erreur lors de l'envoi des emails",
    }
  }
}

// Service pour tester la connexion à l'API
export async function testEmailService(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
    })
    return response.ok
  } catch (error) {
    console.error("Service email non disponible:", error)
    return false
  }
}
