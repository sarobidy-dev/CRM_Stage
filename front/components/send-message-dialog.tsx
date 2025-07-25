"use client"
import { useState } from "react"
import { Send, Mail, MessageSquare, Users, AlertCircle, CheckCircle, Phone } from "lucide-react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendEmailDirect } from "@/service/email.sercive"
import { sendSMSDirect, validateMalagasyPhone } from "@/service/sms.service"

interface Contact {
  id: number
  nom: string
  prenom: string
  telephone: string
  email: string
  adresse: string
  fonction: string
  entreprise_id: number
}

interface SendResult {
  success: boolean
  message: string
  results?: Array<{
    success: boolean
    contactName?: string
    recipient?: string
    error?: string
  }>
}

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

  // Votre numéro pour les SMS
  const myPhoneNumber = "0385805381"

  const handleSend = async () => {
    if (!message.trim() || (messageType === "email" && !subject.trim())) {
      setError("Veuillez remplir tous les champs requis")
      return
    }

    if (selectedContacts.length === 0) {
      setError("Aucun contact sélectionné")
      return
    }

    // Validation spécifique pour SMS
    if (messageType === "sms") {
      const invalidPhones = selectedContacts.filter((contact) => !validateMalagasyPhone(contact.telephone))
      if (invalidPhones.length > 0) {
        setError(
          `Numéros de téléphone invalides: ${invalidPhones.map((c) => `${c.prenom} ${c.nom} (${c.telephone})`).join(", ")}`,
        )
        return
      }
    }

    console.log(`=== DÉBUT ENVOI ${messageType.toUpperCase()} ===`)
    console.log("Contacts sélectionnés:", selectedContacts)

    setSending(true)
    setError("")
    setSendResult(null)

    try {
      let result: SendResult

      if (messageType === "email") {
        // Code email existant - INCHANGÉ
        result = await sendEmailDirect({
          contacts: selectedContacts,
          subject: subject,
          message: message,
          type: messageType,
        })

        console.log("Résultat de l'envoi email:", result)

        if (!result.success && !result.results?.some((r) => r.success)) {
          throw new Error(result.message || "Erreur lors de l'envoi")
        }

        // Ajouter les données dans la table "envoyee" pour les emails
        const now = new Date().toISOString()
        const payloads = selectedContacts.map((contact) => ({
          id_contact: contact.id,
          objet: subject,
          message: message,
          date_envoyee: now,
        }))

        await Promise.all(
          payloads.map(async (payload) => {
            try {
              await fetch("http://127.0.0.1:8000/email", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              })
            } catch (error) {
              console.error("Erreur lors de l'enregistrement dans la table envoyée:", error)
            }
          }),
        )
      } else {
        // Code SMS utilisant l'API FastAPI
        console.log("🚀 Envoi SMS via API FastAPI...")

        result = await sendSMSDirect({
          contacts: selectedContacts,
          message: message,
        })

        console.log("✅ Résultat de l'envoi SMS:", result)
      }

      setSendResult(result)

      if (result.success) {
        // Déclencher l'événement pour actualiser l'historique
        window.dispatchEvent(new CustomEvent("newEmailSent"))

        // Déclencher aussi un événement spécifique pour les SMS
        if (messageType === "sms") {
          window.dispatchEvent(new CustomEvent("newSMSSent"))
        }

        setTimeout(() => {
          setSubject("")
          setMessage("")
          setSendResult(null)
          onOpenChange(false)
        }, 3000)
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi ${messageType}:`, error)
      setError(error instanceof Error ? error.message : `Erreur lors de l'envoi du ${messageType}`)
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
      return "Rédigez votre email ici...\n\nBonjour [Prénom],\n\nJ'espère que vous allez bien...\n\nCordialement,\n[Votre nom]\n\nVariables disponibles:\n[Prénom] [Nom] [Fonction]"
    } else {
      return `Rédigez votre SMS ici... (160 caractères max)\n\nExemple:\nBonjour [Prénom], j'espère que vous allez bien. Cordialement.\n\nEnvoyé depuis: ${myPhoneNumber}`
    }
  }

  // Compter les contacts avec des numéros valides pour SMS
  const validSMSContacts = selectedContacts.filter((contact) => validateMalagasyPhone(contact.telephone))
  const invalidSMSContacts = selectedContacts.filter((contact) => !validateMalagasyPhone(contact.telephone))

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
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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

          {/* Sélecteur de type de message */}
          <div className="space-y-2">
            <Label>Type de message</Label>
            <Select
              value={messageType}
              onValueChange={(value: "email" | "sms") => {
                setMessageType(value)
                setSubject("")
                setMessage("")
                setError("")
                setSendResult(null)
              }}
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
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS (via API FastAPI)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Informations SMS */}
          {messageType === "sms" && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Informations SMS (API FastAPI)</span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <strong>Expéditeur:</strong> {myPhoneNumber}
                </p>
                <p>
                  <strong>API:</strong> http://127.0.0.1:8000/sms/send-bulk
                </p>
                <p>
                  <strong>Contacts valides:</strong> {validSMSContacts.length}/{selectedContacts.length}
                </p>
                {invalidSMSContacts.length > 0 && (
                  <p className="text-red-600">
                    <strong>Numéros invalides:</strong> {invalidSMSContacts.map((c) => c.telephone).join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Liste des destinataires */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Label>Destinataires ({messageType === "sms" ? validSMSContacts.length : selectedContacts.length})</Label>
            </div>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 space-y-2">
              {selectedContacts.map((contact) => {
                const isValidForSMS = messageType === "email" || validateMalagasyPhone(contact.telephone)
                return (
                  <div key={contact.id} className={`flex items-center gap-3 ${!isValidForSMS ? "opacity-50" : ""}`}>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                        {getInitials(contact.prenom, contact.nom)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {contact.prenom} {contact.nom}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {messageType === "email" ? contact.email : contact.telephone}
                    </Badge>
                    {messageType === "sms" && !isValidForSMS && (
                      <Badge variant="destructive" className="text-xs">
                        Numéro invalide
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Champ sujet (email seulement) */}
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

          {/* Champ message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message *</Label>
              {messageType === "sms" && (
                <span className={`text-xs ${message.length > 160 ? "text-red-500" : "text-gray-500"}`}>
                  {message.length}/160 caractères
                </span>
              )}
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
            <p className="text-xs text-gray-500">
              {messageType === "email"
                ? "Vous pouvez utiliser [Prénom], [Nom] et [Fonction] pour personnaliser votre message"
                : "Les SMS sont limités à 160 caractères. Variables disponibles: [Prénom], [Nom]"}
            </p>
          </div>

          {/* Aperçu */}
          {((messageType === "email" && subject && message) || (messageType === "sms" && message)) &&
            selectedContacts.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Aperçu</h4>
                <div className="text-sm space-y-1">
                  {messageType === "email" && (
                    <p>
                      <strong>Sujet:</strong>{" "}
                      {subject
                        .replace(/\[Prénom\]/g, selectedContacts[0]?.prenom || "[Prénom]")
                        .replace(/\[Nom\]/g, selectedContacts[0]?.nom || "[Nom]")}
                    </p>
                  )}
                  <p>
                    <strong>Message:</strong>
                  </p>
                  <div className="bg-white p-2 rounded border text-xs whitespace-pre-wrap">
                    {message
                      .replace(/\[Prénom\]/g, selectedContacts[0]?.prenom || "[Prénom]")
                      .replace(/\[Nom\]/g, selectedContacts[0]?.nom || "[Nom]")
                      .replace(/\[Fonction\]/g, selectedContacts[0]?.fonction || "[Fonction]")}
                  </div>
                  {messageType === "sms" && (
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                      <p>Envoyé depuis: {myPhoneNumber}</p>
                      <p>Via API: FastAPI SMS Service</p>
                    </div>
                  )}
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
              (messageType === "sms" && validSMSContacts.length === 0) ||
              sending ||
              selectedContacts.length === 0
            }
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {messageType === "sms" ? "Envoi SMS via API..." : "Envoi en cours..."}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer {messageType === "email" ? "l'email" : "le SMS"}
                {messageType === "sms" && ` (${validSMSContacts.length})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
