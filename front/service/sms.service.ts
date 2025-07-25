interface SMSPayload {
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

interface SMSResult {
  success: boolean
  message: string
  results?: Array<{
    success: boolean
    contactName?: string
    recipient?: string
    error?: string
  }>
}

export const sendSMSDirect = async (payload: SMSPayload): Promise<SMSResult> => {
  try {
    console.log("=== DÉBUT ENVOI SMS VIA API ===")
    console.log("Payload SMS:", JSON.stringify(payload, null, 2))

    // Validation côté client avant envoi
    if (!payload.contacts || payload.contacts.length === 0) {
      throw new Error("Aucun contact fourni")
    }

    if (!payload.message || payload.message.trim().length === 0) {
      throw new Error("Message vide")
    }

    // Vérifier que l'API est accessible
    console.log("🔍 Vérification de l'API...")

    const response = await fetch("http://127.0.0.1:8000/sms/send-bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        contacts: payload.contacts,
        message: payload.message,
      }),
    })

    console.log("📡 Réponse HTTP:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    })

    // Lire la réponse en tant que texte d'abord pour debugging
    const responseText = await response.text()
    console.log("📄 Réponse brute:", responseText)

    if (!response.ok) {
      let errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`

      try {
        const errorData = JSON.parse(responseText)
        console.error("❌ Erreur détaillée:", errorData)
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (parseError) {
        console.error("❌ Impossible de parser l'erreur JSON:", parseError)
        errorMessage = `${errorMessage}\nRéponse: ${responseText}`
      }

      throw new Error(errorMessage)
    }

    // Parser la réponse JSON
    let result
    try {
      result = JSON.parse(responseText)
      console.log("✅ Réponse parsée:", result)
    } catch (parseError) {
      console.error("❌ Erreur parsing JSON:", parseError)
      throw new Error(`Réponse invalide du serveur: ${responseText}`)
    }

    // Transformer la réponse pour correspondre à l'interface attendue
    return {
      success: result.success || false,
      message: result.message || "Réponse sans message",
      results: result.results || [],
    }
  } catch (error) {
    console.error("💥 Erreur complète lors de l'envoi SMS:", error)

    // Gestion spécifique des erreurs réseau
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        message: "Impossible de se connecter au serveur SMS. Vérifiez que l'API FastAPI est démarrée sur le port 8000.",
        results: payload.contacts.map((contact) => ({
          success: false,
          contactName: `${contact.prenom} ${contact.nom}`,
          recipient: contact.telephone,
          error: "Erreur de connexion serveur",
        })),
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue lors de l'envoi des SMS",
      results: payload.contacts.map((contact) => ({
        success: false,
        contactName: `${contact.prenom} ${contact.nom}`,
        recipient: contact.telephone,
        error: error instanceof Error ? error.message : "Erreur système",
      })),
    }
  }
}

// Fonction pour tester la connexion à l'API avec endpoint de santé
export const testSMSConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("🔍 Test de connexion à l'API SMS...")

    // Tester d'abord l'endpoint de santé
    const healthResponse = await fetch("http://127.0.0.1:8000/sms/health", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log("✅ API SMS accessible (health check):", healthData)

      // Tester ensuite les stats (qui peuvent échouer si la table n'existe pas)
      try {
        const statsResponse = await fetch("http://127.0.0.1:8000/sms/stats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          console.log("✅ Stats SMS accessibles:", statsData)
          return {
            success: true,
            message: "API SMS entièrement fonctionnelle",
          }
        } else {
          const errorText = await statsResponse.text()
          console.warn("⚠️ Stats SMS non accessibles:", statsResponse.status, errorText)
          return {
            success: true,
            message: "API SMS accessible mais table non initialisée",
          }
        }
      } catch (statsError) {
        console.warn("⚠️ Erreur stats SMS:", statsError)
        return {
          success: true,
          message: "API SMS accessible (stats indisponibles)",
        }
      }
    } else {
      const errorText = await healthResponse.text()
      console.error("❌ API SMS non accessible:", healthResponse.status, errorText)
      return {
        success: false,
        message: `API non accessible: ${healthResponse.status} ${healthResponse.statusText}`,
      }
    }
  } catch (error) {
    console.error("❌ Erreur de connexion API SMS:", error)
    return {
      success: false,
      message: "Impossible de se connecter à l'API SMS",
    }
  }
}

// Fonction pour envoyer un SMS unique avec debugging amélioré
export const sendSingleSMS = async (
  contactId: number,
  telephone: string,
  message: string,
  expediteur = "0385805381",
): Promise<SMSResult> => {
  try {
    console.log("=== ENVOI SMS UNIQUE ===")
    console.log("Données:", { contactId, telephone, message, expediteur })

    const response = await fetch("http://127.0.0.1:8000/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id_contact: contactId,
        message: message,
        telephone: telephone,
        expediteur: expediteur,
      }),
    })

    const responseText = await response.text()
    console.log("Réponse SMS unique:", { status: response.status, body: responseText })

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { detail: responseText }
      }
      throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`)
    }

    const result = JSON.parse(responseText)
    console.log("✅ SMS unique envoyé:", result)

    return {
      success: true,
      message: "SMS envoyé avec succès",
      results: [
        {
          success: true,
          contactName: "Contact",
          recipient: telephone,
        },
      ],
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi SMS unique:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur lors de l'envoi du SMS",
      results: [
        {
          success: false,
          contactName: "Contact",
          recipient: telephone,
          error: error instanceof Error ? error.message : "Erreur système",
        },
      ],
    }
  }
}

// Fonction pour récupérer l'historique SMS avec debugging
export const getSMSHistory = async (contactId?: number): Promise<any[]> => {
  try {
    const url = contactId ? `http://127.0.0.1:8000/sms/history/${contactId}` : "http://127.0.0.1:8000/sms/history"
    console.log("📚 Récupération historique SMS:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erreur historique SMS:", response.status, errorText)
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const history = await response.json()
    console.log("✅ Historique SMS récupéré:", history.length, "éléments")
    return history
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'historique SMS:", error)
    return []
  }
}

// Fonction pour supprimer un SMS
export const deleteSMS = async (smsId: number): Promise<boolean> => {
  try {
    console.log("🗑️ Suppression SMS:", smsId)

    const response = await fetch(`http://127.0.0.1:8000/sms/${smsId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erreur suppression SMS:", response.status, errorText)
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    console.log(`✅ SMS ${smsId} supprimé avec succès`)
    return true
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du SMS:", error)
    return false
  }
}

// Fonction pour récupérer les statistiques SMS
export const getSMSStats = async (): Promise<any> => {
  try {
    console.log("📊 Récupération statistiques SMS...")

    const response = await fetch("http://127.0.0.1:8000/sms/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Erreur stats SMS:", response.status, errorText)
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const stats = await response.json()
    console.log("✅ Statistiques SMS:", stats)
    return stats
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des statistiques SMS:", error)
    return {
      total_sms: 0,
      sms_envoyes: 0,
      sms_echecs: 0,
      taux_succes: 0,
      daily_stats: [],
    }
  }
}

// Fonction pour valider un numéro de téléphone malgache
export const validateMalagasyPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+261|0)[0-9]{9}$/
  return phoneRegex.test(phone)
}

// Fonction pour formater un numéro de téléphone
export const formatPhoneNumber = (phone: string): string => {
  // Supprimer tous les espaces et caractères spéciaux
  const cleaned = phone.replace(/\D/g, "")

  // Si le numéro commence par 261, ajouter le +
  if (cleaned.startsWith("261")) {
    return `+${cleaned}`
  }

  // Si le numéro commence par 0, le garder tel quel
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return cleaned
  }

  return phone
}

// Fonction pour personnaliser un message SMS
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
