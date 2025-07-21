import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contact_id, utilisateur_id } = body

    // Simuler la création d'un appel en base de données
    const callData = {
      id: Math.random().toString(36).substr(2, 9),
      contact_id,
      utilisateur_id,
      started_at: new Date().toISOString(),
      status: "active",
    }

    console.log("Appel démarré:", callData)

    return NextResponse.json({
      success: true,
      call_id: callData.id,
      message: "Appel démarré avec succès",
    })
  } catch (error) {
    console.error("Erreur lors du démarrage de l'appel:", error)
    return NextResponse.json({ success: false, error: "Erreur lors du démarrage de l'appel" }, { status: 500 })
  }
}
