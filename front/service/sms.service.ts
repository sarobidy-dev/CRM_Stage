export interface SMSPayload {
  contacts: Array<{
    id: number
    nom: string
    prenom: string
    telephone: string
    email: string
    fonction: string
  }>
  message: string
}

export interface SMSResult {
  success: boolean
  message: string
  results?: Array<{
    success: boolean
    contactName?: string
    recipient?: string
    error?: string
  }>
}

export const validateMalagasyPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+261|0)[0-9]{9}$/
  return phoneRegex.test(phone)
}

export const personalizeSMSMessage = (
  message: string,
  contact: { prenom?: string; nom?: string; fonction?: string },
): string => {
  let personalizedMessage = message
  if (contact.prenom) {
    personalizedMessage = personalizedMessage.replace(/\[Prénom\]/g, contact.prenom)
  }
  if (contact.nom) {
    personalizedMessage = personalizedMessage.replace(/\[Nom\]/g, contact.nom)
  }
  if (contact.fonction) {
    personalizedMessage = personalizedMessage.replace(/\[Fonction\]/g, contact.fonction)
  }
  return personalizedMessage
}

export const sendSMSDirect = async (payload: SMSPayload): Promise<SMSResult> => {
  try {
    if (!payload.contacts || payload.contacts.length === 0) {
      throw new Error("Aucun contact fourni")
    }
    if (!payload.message || payload.message.trim().length === 0) {
      throw new Error("Message vide")
    }

    const token = process.env.NEXT_PUBLIC_MAPI_TOKEN
    if (!token) throw new Error("Token MAPI non défini")

    const results = []

    for (const contact of payload.contacts) {
      const personalizedMessage = personalizeSMSMessage(payload.message, contact)
      const expediteur = contact.telephone // ← le numéro du contact est utilisé comme expéditeur

      if (!validateMalagasyPhone(expediteur)) {
        throw new Error(`Numéro d'expéditeur invalide : ${expediteur}`)
      }

      const body = {
        id_contact: contact.id,
        message: personalizedMessage,
        type: "sms",
        expediteur,
      }

      const response = await fetch("http://127.0.0.1:8000/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvbWVzc2FnaW5nLm1hcGkubWdcLyIsImlhdCI6MTc1NDU1Mzc1OCwiZXhwIjoxNzU0NTU3MzU4LCJ1c2VybmFtZSI6IjEyMzQ1Njc4OTAiLCJ1c2VyaWQiOjQ2N30.XxfyWuKSxkPrNq_ah91ZkYGdt5NBCDXQldPUhiNlbqw",
        },
        body: JSON.stringify(body),
      })

      const responseText = await response.text()

      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}`
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {}
        results.push({
          success: false,
          contactName: `${contact.prenom} ${contact.nom}`,
          recipient: contact.telephone,
          error: errorMessage,
        })
      } else {
        results.push({
          success: true,
          contactName: `${contact.prenom} ${contact.nom}`,
          recipient: contact.telephone,
        })
      }
    }

    const allSuccess = results.every((r) => r.success)

    return {
      success: allSuccess,
      message: allSuccess ? "Tous les SMS ont été envoyés" : "Certains SMS ont échoué",
      results,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue",
      results: payload.contacts.map((contact) => ({
        success: false,
        contactName: `${contact.prenom} ${contact.nom}`,
        recipient: contact.telephone,
        error: error instanceof Error ? error.message : "Erreur système",
      })),
    }
  }
}
