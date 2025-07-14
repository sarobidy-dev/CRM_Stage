import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contact_id")
    const utilisateurId = searchParams.get("utilisateur_id")

    // Simuler la récupération des données depuis une base de données
    // Dans un vrai projet, vous feriez une requête à votre base de données
    const contact = {
      nom: "Safidy",
      prenom: "Sarobidy",
      entreprise: "Tech Solutions",
      telephone: "0385805381",
      email: "rabemalalasarobidyravakiniaina@gmail.com",
      adresse: "IHOSY",
      fonction: "Développeur Full Stack",
      source: "appel-froid",
      secteur: "commerce",
      type: "partenaire",
      photo_de_profil: "/placeholder.svg?height=100&width=100",
      id_contact: Number.parseInt(contactId || "47"),
      id_utilisateur: Number.parseInt(utilisateurId || "1"),
    }

    const utilisateur = {
      nom: "RABEMALA",
      prenom: "Sarobidy",
      email: "ainasarobidy@gmail.com",
      photo_profil: "/placeholder.svg?height=100&width=100",
      id_utilisateur: Number.parseInt(utilisateurId || "1"),
    }

    return NextResponse.json({
      success: true,
      contact,
      utilisateur,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des participants:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de la récupération des données" }, { status: 500 })
  }
}
