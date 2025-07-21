import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contact_id, utilisateur_id } = body

    // Générer un ID unique pour l'enregistrement
    const recordingId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simuler la création d'un enregistrement en base de données
    const recordingData = {
      recording_id: recordingId,
      contact_id,
      utilisateur_id,
      started_at: new Date().toISOString(),
      status: "recording",
    }

    console.log("Enregistrement démarré:", recordingData)

    return NextResponse.json({
      success: true,
      recording_id: recordingId,
      message: "Enregistrement démarré avec succès",
    })
  } catch (error) {
    console.error("Erreur lors du démarrage de l'enregistrement:", error)
    return NextResponse.json({ success: false, error: "Erreur lors du démarrage de l'enregistrement" }, { status: 500 })
  }
}
