"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Video, Mail, Users, Copy, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Contact {
  nom: string
  prenom: string
  entreprise: string
  telephone: string
  email: string
  adresse: string
  fonction: string
  source: string
  secteur: string
  type: string
  photo_de_profil: string
  id_contact: number
  id_utilisateur: number
}

interface GoogleMeetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedContacts: Contact[]
}

export function GoogleMeetDialog({ open, onOpenChange, selectedContacts }: GoogleMeetDialogProps) {
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [meetingDescription, setMeetingDescription] = useState("")
  const [meetingLink, setMeetingLink] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isLinkCopied, setIsLinkCopied] = useState(false)
  const [step, setStep] = useState<"create" | "share">("create")

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const getPhotoUrl = (contact: Contact) => {
    if (!contact.photo_de_profil) {
      return "/placeholder.svg?height=32&width=32"
    }
    if (contact.photo_de_profil.startsWith("http") || contact.photo_de_profil.startsWith("data:image")) {
      return contact.photo_de_profil
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    const cleanPath = contact.photo_de_profil.startsWith("/") ? contact.photo_de_profil : `/${contact.photo_de_profil}`
    return `${baseUrl}${cleanPath}`
  }

  const generateMeetingLink = () => {
    setIsCreating(true)
    // Simulation de la création d'un lien Google Meet
    setTimeout(() => {
      const randomId = Math.random().toString(36).substring(2, 15)
      const link = `https://meet.google.com/${randomId}`
      setMeetingLink(link)
      setIsCreating(false)
      setStep("share")
    }, 1500)
  }

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink)
      setIsLinkCopied(true)
      setTimeout(() => setIsLinkCopied(false), 2000)
    } catch (error) {
      console.error("Erreur lors de la copie:", error)
    }
  }

  const sendInvitations = () => {
    const subject = encodeURIComponent(`Invitation à la réunion: ${meetingTitle}`)
    const body = encodeURIComponent(`
Bonjour,

Vous êtes invité(e) à participer à la réunion suivante:

📅 Titre: ${meetingTitle}
📆 Date: ${new Date(meetingDate).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
🕐 Heure: ${meetingTime}

${meetingDescription ? `📝 Description: ${meetingDescription}` : ""}

🔗 Lien Google Meet: ${meetingLink}

Instructions pour rejoindre:
1. Cliquez sur le lien ci-dessus
2. Autorisez l'accès à votre caméra et microphone
3. Cliquez sur "Rejoindre maintenant"

Nous vous recommandons de rejoindre 5 minutes avant l'heure prévue.

Cordialement
    `)

    // Créer la liste des emails
    const emails = selectedContacts.map((contact) => contact.email).join(";")

    // Ouvrir le client email avec tous les destinataires
    window.open(`mailto:${emails}?subject=${subject}&body=${body}`)

    // Fermer le dialog après envoi
    setTimeout(() => {
      onOpenChange(false)
      resetForm()
    }, 1000)
  }

  const resetForm = () => {
    setMeetingTitle("")
    setMeetingDate("")
    setMeetingTime("")
    setMeetingDescription("")
    setMeetingLink("")
    setStep("create")
    setIsLinkCopied(false)
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {step === "create" ? "Créer une réunion Google Meet" : "Partager l'invitation"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {step === "create"
              ? `Créer une réunion pour ${selectedContacts.length} contact(s) sélectionné(s)`
              : "Envoyez l'invitation à vos contacts"}
          </DialogDescription>
        </DialogHeader>

        {step === "create" && (
          <div className="space-y-6">
            {/* Contacts sélectionnés */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                Participants ({selectedContacts.length})
              </Label>
              <div className="max-h-40 overflow-y-auto border-2 border-gray-100 rounded-xl p-4 space-y-3 bg-gradient-to-r from-gray-50 to-white shadow-inner">
                {selectedContacts.map((contact) => (
                  <div
                    key={contact.id_contact}
                    className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all duration-200">
                      <AvatarImage
                        src={getPhotoUrl(contact) || "/placeholder.svg"}
                        alt={`${contact.prenom} ${contact.nom}`}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold">
                        {getInitials(contact.prenom, contact.nom)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                        {contact.prenom} {contact.nom}
                      </p>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 font-medium"
                    >
                      {contact.entreprise}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire de réunion */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la réunion *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Réunion équipe marketing"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-xl py-3 px-4 text-gray-800 placeholder:text-gray-400 transition-all duration-200 focus:shadow-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Heure *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Ordre du jour, objectifs de la réunion..."
                  value={meetingDescription}
                  onChange={(e) => setMeetingDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={generateMeetingLink}
                disabled={!meetingTitle || !meetingDate || !meetingTime || isCreating}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    <span className="animate-pulse">Création en cours...</span>
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5 mr-2" />
                    Créer la réunion
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "share" && (
          <div className="space-y-6">
            {/* Résumé de la réunion */}
            <Alert className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                <Video className="h-4 w-4 text-white" />
              </div>
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-bold text-green-800 text-lg">🎉 Réunion créée avec succès!</p>
                  <div className="text-sm space-y-2 bg-white/50 p-4 rounded-lg">
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <strong>Titre:</strong> {meetingTitle}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <strong>Date:</strong>{" "}
                      {new Date(meetingDate).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <strong>Heure:</strong> {meetingTime}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <strong>Participants:</strong> {selectedContacts.length} contact(s)
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Lien de la réunion */}
            <div className="space-y-2">
              <Label>Lien Google Meet</Label>
              <div className="flex gap-2">
                <Input value={meetingLink} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="sm" onClick={copyMeetingLink} className="shrink-0 bg-transparent">
                  {isLinkCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {isLinkCopied && <p className="text-sm text-green-600">Lien copié dans le presse-papiers!</p>}
            </div>

            {/* Liste des participants */}
            <div className="space-y-3">
              <Label>Participants qui recevront l'invitation</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                {selectedContacts.map((contact) => (
                  <div key={contact.id_contact} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getPhotoUrl(contact) || "/placeholder.svg"}
                        alt={`${contact.prenom} ${contact.nom}`}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {getInitials(contact.prenom, contact.nom)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {contact.prenom} {contact.nom}
                      </p>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                    </div>
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep("create")}>
                Retour
              </Button>
              <Button
                onClick={sendInvitations}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Mail className="h-5 w-5 mr-2" />🚀 Envoyer les invitations
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
