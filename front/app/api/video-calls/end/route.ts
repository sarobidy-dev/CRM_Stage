import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contact_id, utilisateur_id, duration } = body

    // Simuler la mise à jour de l'appel en base de données
    const callData = {
      contact_id,
      utilisateur_id,
      duration,
      ended_at: new Date().toISOString(),
      status: "completed",
    }

    console.log("Appel terminé:", callData)

    return NextResponse.json({
      success: true,
      message: "Appel terminé avec succès",
      duration,
    })
  } catch (error) {
    console.error("Erreur lors de la fin de l'appel:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de la fin de l'appel" }, { status: 500 })
  }
}
