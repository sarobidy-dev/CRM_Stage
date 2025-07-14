"use client"

import { useState } from "react"
import { Send, Mail, MessageSquare, Users, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendEmailDirect } from "@/service/email.sercive"
import type { Contact, SendResult } from "@/types/email.type"

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedContacts: Contact[]
}

export function SendMessageDialog({ open, onOpenChange, selectedContacts }: SendMessageDialogProps) {
  const [messageType, setMessageType] = useState<"email" | "sms">("email")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<SendResult | null>(null)
  const [error, setError] = useState<string>("")

  // Fonction pour construire l'URL de la photo
  const getPhotoUrl = (contact: Contact) => {
    if (!contact.photo_de_profil) {
      return "/placeholder.svg?height=40&width=40"
    }
    
    if (contact.photo_de_profil.startsWith("http")) {
      return contact.photo_de_profil
    }

    if (contact.photo_de_profil.startsWith("data:image")) {
      return contact.photo_de_profil
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    const cleanPath = contact.photo_de_profil.startsWith("/") ? contact.photo_de_profil : `/${contact.photo_de_profil}`
    return `${baseUrl}${cleanPath}`
  }

  const handleSend = async () => {
    if (!message.trim() || (messageType === "email" && !subject.trim())) {
      setError("Veuillez remplir tous les champs requis")
      return
    }

    if (selectedContacts.length === 0) {
      setError("Aucun contact sélectionné")
      return
    }

    console.log("=== DÉBUT ENVOI EMAIL ===")
    console.log("Contacts sélectionnés:", selectedContacts)

    setSending(true)
    setError("")
    setSendResult(null)

    try {
      // Utiliser la nouvelle fonction directe avec les contacts déjà disponibles
      const result = await sendEmailDirect({
        contacts: selectedContacts,
        subject: subject,
        message: message,
        type: messageType,
      })

      console.log("Résultat de l'envoi:", result)

      if (!result.success && !result.results?.some((r) => r.success)) {
        throw new Error(result.message || "Erreur lors de l'envoi")
      }

      setSendResult(result)

      if (result.success) {
        setTimeout(() => {
          setSubject("")
          setMessage("")
          setSendResult(null)
          onOpenChange(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de l'envoi du message")
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    if (!sending) {
      setSubject("")
      setMessage("")
      setError("")
      setSendResult(null)
      onOpenChange(false)
    }
  }

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const getMessagePlaceholder = () => {
    if (messageType === "email") {
      return "Rédigez votre email ici...\n\nBonjour [Prénom],\n\nJ'espère que vous allez bien...\n\nCordialement,\n[Votre nom]\n\nVariables disponibles:\n[Prénom] [Nom] [Entreprise] [Fonction]"
    } else {
      return "Rédigez votre SMS ici... (160 caractères max)"
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              {messageType === "email" ? (
                <Mail className="h-5 w-5 text-blue-600" />
              ) : (
                <MessageSquare className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg">Envoyer un {messageType === "email" ? "email" : "SMS"}</DialogTitle>
              <DialogDescription>
                {selectedContacts.length === 1
                  ? `Envoyer un message à ${selectedContacts[0].prenom} ${selectedContacts[0].nom}`
                  : `Envoyer un message à ${selectedContacts.length} contacts`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Affichage des erreurs */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Affichage du résultat d'envoi */}
          {sendResult && (
            <Alert variant={sendResult.success ? "default" : "destructive"}>
              {sendResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{sendResult.message}</p>
                  {sendResult.results && sendResult.results.length > 1 && (
                    <div className="text-sm space-y-1">
                      {sendResult.results.map((result, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 ${result.success ? "text-green-600" : "text-red-600"}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${result.success ? "bg-green-500" : "bg-red-500"}`}
                          ></span>
                          <span>
                            {result.contactName || result.recipient}: {result.success ? "Envoyé" : result.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Type de message */}
          <div className="space-y-2">
            <Label>Type de message</Label>
            <Select
              value={messageType}
              onValueChange={(value: "email" | "sms") => setMessageType(value)}
              disabled={sending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="sms" disabled>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS (bientôt disponible)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Destinataires */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Label>Destinataires ({selectedContacts.length})</Label>
            </div>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 space-y-2">
              {selectedContacts.map((contact) => (
                <div key={contact.id_contact} className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={getPhotoUrl(contact) || "/placeholder.svg"}
                      alt={`${contact.prenom} ${contact.nom}`}
                    />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                      {getInitials(contact.prenom, contact.nom)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {contact.prenom} {contact.nom}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {contact.email}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Sujet (pour email seulement) */}
          {messageType === "email" && (
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Objet de votre email"
                disabled={sending}
                required
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message *</Label>
              {messageType === "sms" && <span className="text-xs text-gray-500">{message.length}/160 caractères</span>}
            </div>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={getMessagePlaceholder()}
              rows={messageType === "email" ? 8 : 4}
              maxLength={messageType === "sms" ? 160 : undefined}
              disabled={sending}
              required
            />
            {messageType === "email" && (
              <p className="text-xs text-gray-500">
                Vous pouvez utiliser [Prénom], [Nom], [Entreprise] et [Fonction] pour personnaliser votre message
              </p>
            )}
          </div>

          {/* Aperçu */}
          {messageType === "email" && subject && message && selectedContacts.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Aperçu</h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Sujet:</strong>{" "}
                  {subject
                    .replace(/\[Prénom\]/g, selectedContacts[0]?.prenom || "[Prénom]")
                    .replace(/\[Nom\]/g, selectedContacts[0]?.nom || "[Nom]")}
                </p>
                <p>
                  <strong>Message:</strong>
                </p>
                <div className="bg-white p-2 rounded border text-xs whitespace-pre-wrap">
                  {message
                    .replace(/\[Prénom\]/g, selectedContacts[0]?.prenom || "[Prénom]")
                    .replace(/\[Nom\]/g, selectedContacts[0]?.nom || "[Nom]")}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={sending}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={
              !message.trim() ||
              (messageType === "email" && !subject.trim()) ||
              sending ||
              selectedContacts.length === 0
            }
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer {messageType === "email" ? "l'email" : "le SMS"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
