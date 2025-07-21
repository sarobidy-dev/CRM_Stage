import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const video = formData.get("video") as File
    const recordingId = formData.get("recording_id") as string

    if (!video || !recordingId) {
      return NextResponse.json(
        { success: false, error: "Fichier vidéo ou ID d'enregistrement manquant" },
        { status: 400 },
      )
    }

    // Simuler l'upload du fichier
    // Dans un vrai projet, vous uploaderiez vers un service de stockage comme AWS S3, Vercel Blob, etc.
    const uploadData = {
      recording_id: recordingId,
      filename: video.name,
      size: video.size,
      type: video.type,
      uploaded_at: new Date().toISOString(),
    }

    console.log("Fichier uploadé:", uploadData)

    return NextResponse.json({
      success: true,
      message: "Enregistrement uploadé avec succès",
      file_info: uploadData,
    })
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de l'upload de l'enregistrement" }, { status: 500 })
  }
}
