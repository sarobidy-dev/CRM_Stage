import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contact_id, utilisateur_id, call_id } = body

    // Simuler la fin d'un appel téléphonique
    console.log("Fin d'appel téléphonique:", {
      contact_id,
      utilisateur_id,
      call_id,
      ended_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Appel téléphonique terminé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la fin de l'appel:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la fin de l'appel téléphonique" },
      { status: 500 },
    )
  }
}
