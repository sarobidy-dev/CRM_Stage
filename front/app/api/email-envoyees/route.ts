import { type NextRequest, NextResponse } from "next/server"

interface EmailEnvoyeeRequest {
  id_contact: number
  objet: string
  message: string
  date_envoyee: string
  contact: {
    id: number
  }
}

export async function POST(request: NextRequest) {
  console.log("🚀 API Route: Début de la requête POST")

  try {
    const body: EmailEnvoyeeRequest = await request.json()
    console.log("📥 API Route: Données reçues:", body)

    // Validation des données
    if (!body.id_contact || !body.objet || !body.message || !body.date_envoyee) {
      console.log("❌ API Route: Données manquantes")
      return NextResponse.json(
        { error: "Données manquantes: id_contact, objet, message et date_envoyee sont requis" },
        { status: 400 },
      )
    }

    console.log("✅ API Route: Validation réussie")
    console.log("🎯 API Route: Enregistrement email-envoyee:", {
      id_contact: body.id_contact,
      objet: body.objet.substring(0, 50) + "...",
      date_envoyee: body.date_envoyee,
    })

    // URL du backend
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000"
    const fullUrl = `${backendUrl}/email`

    console.log("🌐 API Route: URL du backend:", fullUrl)

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("📡 API Route: Réponse du backend:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url,
    })

    if (!response.ok) {
      let errorText = ""
      try {
        errorText = await response.text()
        console.log("❌ API Route: Texte d'erreur du backend:", errorText)
      } catch (e) {
        console.log("❌ API Route: Impossible de lire la réponse d'erreur")
      }

      console.error("❌ API Route: Erreur backend:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      })

      return NextResponse.json(
        {
          error: `Erreur backend: ${response.status} - ${response.statusText}`,
          details: errorText,
          backendUrl: fullUrl,
        },
        { status: response.status },
      )
    }

    let savedEmail
    try {
      savedEmail = await response.json()
      console.log("✅ API Route: Email enregistré avec succès:", savedEmail)
    } catch (e) {
      console.log("⚠️ API Route: Réponse non-JSON du backend")
      const textResponse = await response.text()
      console.log("📄 API Route: Réponse texte:", textResponse)
      savedEmail = { success: true, message: "Email enregistré", response: textResponse }
    }

    return NextResponse.json(savedEmail, { status: 201 })
  } catch (error) {
    console.error("💥 API Route: Erreur générale:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Impossible de se connecter au backend Django",
          details: "Vérifiez que le serveur Django est démarré sur http://127.0.0.1:8000",
          originalError: error.message,
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        error: "Erreur lors de l'enregistrement de l'email",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  console.log("🚀 API Route: Début de la requête GET")

  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contact_id")

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000"
    const url = contactId ? `${backendUrl}/email?contact_id=${contactId}` : `${backendUrl}/email`

    console.log("🌐 API Route: URL GET:", url)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    console.log("📡 API Route: Réponse GET:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ API Route: Erreur GET:", errorText)
      throw new Error(`Erreur lors de la récupération des emails: ${response.status}`)
    }

    const emails = await response.json()
    console.log("✅ API Route: Emails récupérés:", emails.length || "inconnu")
    return NextResponse.json(emails)
  } catch (error) {
    console.error("💥 API Route: Erreur GET:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des emails" }, { status: 500 })
  }
}
