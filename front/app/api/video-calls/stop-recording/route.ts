import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recording_id } = body

    // Simuler l'arrêt de l'enregistrement en base de données
    const recordingData = {
      recording_id,
      ended_at: new Date().toISOString(),
      status: "completed",
    }

    console.log("Enregistrement arrêté:", recordingData)

    return NextResponse.json({
      success: true,
      message: "Enregistrement arrêté avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de l'arrêt de l'enregistrement:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de l'arrêt de l'enregistrement" }, { status: 500 })
  }
}
