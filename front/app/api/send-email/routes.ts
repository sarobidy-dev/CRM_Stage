import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { getContactById } from "@/service/Contact.service"

interface Contact {
  nom: string
  prenom: string
  email: string
  photo_de_profil: string
  id_contact: number
  entreprise: string
  fonction: string
}

interface EmailRequest {
  type: "email" | "sms"
  subject?: string
  message: string
  contactIds: number[] 
}

export async function POST(request: NextRequest) {
  console.log("=== API SEND-EMAIL APPELÉE ===")

  try {
    const body: EmailRequest = await request.json()
    console.log("Body reçu:", body)

    const { type, subject, message, contactIds } = body

    if (type !== "email") {
      return NextResponse.json({ error: "SMS non supporté pour le moment" }, { status: 400 })
    }

    if (!contactIds || contactIds.length === 0) {
      return NextResponse.json({ error: "Aucun contact spécifié" }, { status: 400 })
    }

    if (!message || !subject) {
      return NextResponse.json({ error: "Sujet et message requis" }, { status: 400 })
    }

    // Récupérer les données complètes des contacts depuis le backend
    let contacts: Contact[] = []
    try {
      // Récupérer chaque contact individuellement par son ID
      const contactPromises = contactIds.map((id) => getContactById(id))
      const contactsData = await Promise.all(contactPromises)

      contacts = contactsData
        .filter((c): c is NonNullable<typeof c> => Boolean(c) && typeof c.id_contact === "number")
        .map((c) => ({
          nom: c.nom,
          prenom: c.prenom,
          email: c.email,
          photo_de_profil: c.photo_de_profil,
          id_contact: c.id_contact as number,
          entreprise: c.entreprise,
          fonction: c.fonction,
        }))

      if (contacts.length === 0) {
        return NextResponse.json({ error: "Aucun contact trouvé avec les IDs fournis" }, { status: 404 })
      }

      console.log(
        "Contacts récupérés pour l'envoi:",
        contacts.map((c) => ({ id: c.id_contact, email: c.email, nom: `${c.prenom} ${c.nom}` })),
      )
    } catch (error) {
      console.error("Erreur récupération contacts:", error)
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération des contacts",
          
        },
        { status: 500 },
      )
    }

    // Vérifier les variables d'environnement
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("Variables SMTP manquantes")
      return NextResponse.json(
        {
          error: "Configuration email manquante. Vérifiez vos variables d'environnement SMTP.",
        },
        { status: 500 },
      )
    }

    console.log("Configuration SMTP:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? "***configuré***" : "manquant",
      pass: process.env.SMTP_PASS ? "***configuré***" : "manquant",
    })

    // Configuration du transporteur email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Vérifier la connexion
    console.log("Vérification de la connexion SMTP...")
    try {
      await transporter.verify()
      console.log("Connexion SMTP OK")
    } catch (verifyError) {
      console.error("Erreur connexion SMTP:", verifyError)
      return NextResponse.json(
        {
          error: "Impossible de se connecter au serveur email. Vérifiez votre configuration SMTP.",
          details: verifyError instanceof Error ? verifyError.message : "Erreur inconnue",
        },
        { status: 500 },
      )
    }

    const results = []

    // Envoyer l'email à chaque contact avec personnalisation
    for (const contact of contacts) {
      try {
        // Personnaliser le message pour ce contact
        const personalizedMessage = message
          .replace(/\[Prénom\]/g, contact.prenom)
          .replace(/\[Nom\]/g, contact.nom)
          .replace(/\[Entreprise\]/g, contact.entreprise || "")
          .replace(/\[Fonction\]/g, contact.fonction || "")

        const personalizedSubject = subject
          .replace(/\[Prénom\]/g, contact.prenom)
          .replace(/\[Nom\]/g, contact.nom)
          .replace(/\[Entreprise\]/g, contact.entreprise || "")
          .replace(/\[Fonction\]/g, contact.fonction || "")

        console.log(`Envoi email à: ${contact.email} (${contact.prenom} ${contact.nom})`)

        const info = await transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || "Votre App"}" <${process.env.SMTP_USER}>`,
          to: contact.email,
          subject: personalizedSubject,
          text: personalizedMessage,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">${personalizedSubject}</h1>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
                  <pre style="white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; color: #333; line-height: 1.6;">${personalizedMessage}</pre>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                  <h3 style="margin: 0 0 10px 0; color: #1976d2; font-size: 16px;">📋 Informations du contact</h3>
                  <p style="margin: 5px 0; color: #555;"><strong>Nom:</strong> ${contact.prenom} ${contact.nom}</p>
                  <p style="margin: 5px 0; color: #555;"><strong>Email:</strong> ${contact.email}</p>
                  ${contact.entreprise ? `<p style="margin: 5px 0; color: #555;"><strong>Entreprise:</strong> ${contact.entreprise}</p>` : ""}
                  ${contact.fonction ? `<p style="margin: 5px 0; color: #555;"><strong>Fonction:</strong> ${contact.fonction}</p>` : ""}
                </div>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e1e5e9; border-top: none;">
                <p style="color: #6c757d; font-size: 12px; margin: 0;">
                  📧 Cet email a été envoyé depuis votre application de gestion de contacts
                </p>
                <p style="color: #6c757d; font-size: 12px; margin: 5px 0 0 0;">
                  ${new Date().toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          `,
        })

        results.push({
          recipient: contact.email,
          contactName: `${contact.prenom} ${contact.nom}`,
          success: true,
          messageId: info.messageId,
        })

        console.log("✅ Email envoyé avec succès à:", contact.email, "ID:", info.messageId)
      } catch (error) {
        console.error("❌ Erreur envoi email à", contact.email, ":", error)
        results.push({
          recipient: contact.email,
          contactName: `${contact.prenom} ${contact.nom}`,
          success: false,
          error: error instanceof Error ? error.message : "Erreur inconnue",
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    console.log(`📊 Résultat: ${successCount} succès, ${failureCount} échecs`)

    return NextResponse.json({
      success: failureCount === 0,
      message: `${successCount} email(s) envoyé(s) avec succès${failureCount > 0 ? `, ${failureCount} échec(s)` : ""}`,
      results,
      contactsProcessed: contacts.length,
    })
  } catch (error) {
    console.error("=== ERREUR API SEND-EMAIL ===")
    console.error("Erreur complète:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur lors de l'envoi des emails",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
