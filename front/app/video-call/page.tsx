"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Mail, Video } from "lucide-react"
import { GoogleMeetDialog } from "@/components/google-meet-dialog"

export default function GoogleMeetApp() {
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTime, setMeetingTime] = useState("")
  const [email, setEmail] = useState("")
  const [meetingLink, setMeetingLink] = useState("")
  const [showGoogleMeetDialog, setShowGoogleMeetDialog] = useState(false)

  const createMeetingLink = () => {
    // Simulation d'un lien Google Meet
    const randomId = Math.random().toString(36).substring(2, 15)
    const link = `https://meet.google.com/${randomId}`
    setMeetingLink(link)
  }

  const shareByEmail = () => {
    const subject = encodeURIComponent(`Invitation à la réunion: ${meetingTitle}`)
    const body = encodeURIComponent(`
Bonjour,

Vous êtes invité(e) à participer à la réunion suivante:

Titre: ${meetingTitle}
Date: ${meetingDate}
Heure: ${meetingTime}

Lien Google Meet: ${meetingLink}

Cordialement
    `)

    window.open(`mailto:${email}?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Google Meet Manager
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Créez et partagez facilement vos réunions Google Meet avec une interface moderne et intuitive
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulaire de création */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Créer une Réunion
              </CardTitle>
              <CardDescription>Remplissez les informations de votre réunion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la réunion</Label>
                <Input
                  id="title"
                  placeholder="Ex: Réunion équipe marketing"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Date
                  </Label>
                  <Input id="date" type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Heure
                  </Label>
                  <Input id="time" type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} />
                </div>
              </div>

              <Button
                onClick={createMeetingLink}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={!meetingTitle || !meetingDate || !meetingTime}
              >
                <Video className="h-5 w-5 mr-2" />
                Générer le lien Google Meet
              </Button>

              {meetingLink && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-inner animate-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-semibold text-green-800">Lien créé avec succès!</p>
                  </div>
                  <p className="text-sm text-green-700 break-all font-mono bg-white/50 p-2 rounded-lg">{meetingLink}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partage par email */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Partager par Email
              </CardTitle>
              <CardDescription>Envoyez l'invitation par email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email du destinataire</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Aperçu de l'invitation</Label>
                <Textarea
                  readOnly
                  value={`Titre: ${meetingTitle || "Votre réunion"}
Date: ${meetingDate || "À définir"}
Heure: ${meetingTime || "À définir"}
Lien: ${meetingLink || "Générez d'abord le lien"}`}
                  className="h-24"
                />
              </div>

              <Button
                onClick={shareByEmail}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={!email || !meetingLink}
              >
                <Mail className="h-5 w-5 mr-2" />
                Envoyer l'invitation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Étapes pour utiliser Google Meet */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">Guide d'utilisation</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Suivez ces étapes simples pour organiser votre réunion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Pour l'organisateur:</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex gap-3 items-start group">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      1
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      Remplissez le formulaire ci-dessus
                    </span>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      2
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      Cliquez sur "Générer le lien Google Meet"
                    </span>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      3
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      Ajoutez l'email du participant
                    </span>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      4
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      Cliquez sur "Envoyer l'invitation"
                    </span>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      5
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      Le jour J, cliquez sur le lien pour démarrer
                    </span>
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Pour les participants:</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex gap-3 items-start group">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      1
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      Recevez l'email d'invitation
                    </span>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      2
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      Notez la date et l'heure dans votre agenda
                    </span>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      3
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      Le jour J, cliquez sur le lien Google Meet
                    </span>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      4
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      Autorisez l'accès à votre caméra/micro
                    </span>
                  </li>
                  <li className="flex gap-3 items-start group">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200">
                      5
                    </span>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                      Cliquez sur "Rejoindre maintenant"
                    </span>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-semibold text-yellow-800 mb-2">Conseils importants:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Testez votre caméra et micro avant la réunion</li>
                <li>• Utilisez un casque pour éviter l'écho</li>
                <li>• Assurez-vous d'avoir une bonne connexion internet</li>
                <li>• Rejoignez 5 minutes avant l'heure prévue</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <GoogleMeetDialog open={showGoogleMeetDialog} onOpenChange={setShowGoogleMeetDialog} selectedContacts={[]} />
    </div>
  )
}
