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
        console.log("🚀 Envoi SMS via API FastAPI...")

        const smsPayload = {
          contacts: selectedContacts.map((contact) => ({
            ...contact,
            expediteur: myPhoneNumber,
          })),
          message: message,
          expediteur: myPhoneNumber,
        }

        console.log("📤 Données envoyées au service SMS:", smsPayload)

        result = await sendSMSDirect(smsPayload)

        console.log("✅ Résultat de l'envoi SMS:", result)
      }

      setSendResult(result)

      if (result.success) {
        window.dispatchEvent(new CustomEvent("newEmailSent"))
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
      console.error("Erreur lors de l'envoi:", error)
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

  const getInitials = (prenom: string, nom: string) => `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()

  const getMessagePlaceholder = () => {
    return messageType === "email"
      ? "Rédigez votre email ici...\n\nBonjour [Prénom],\n\nJ'espère que vous allez bien...\n\nCordialement,\n[Votre nom]\n\nVariables disponibles:\n[Prénom] [Nom] [Fonction]"
      : `Rédigez votre SMS ici... (160 caractères max)\n\nExemple:\nBonjour [Prénom], j'espère que vous allez bien. Cordialement.\n\nEnvoyé depuis: ${myPhoneNumber}`
  }

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
              <p className="text-sm text-blue-700">
                Nombre total de contacts sélectionnés: {selectedContacts.length}
              </p>
              <p className="text-sm text-blue-700">
                Contacts avec numéros valides: {validSMSContacts.length}
              </p>
              {invalidSMSContacts.length > 0 && (
                <p className="text-sm text-red-600">
                  Contacts avec numéros invalides: {invalidSMSContacts.map((c) => c.telephone).join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Sujet (email uniquement) */}
          {messageType === "email" && (
            <div className="space-y-1">
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Objet de l'email"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={sending}
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-1">
            <Label htmlFor="message">Message</Label>
            {messageType === "email" ? (
              <Textarea
                id="message"
                placeholder={getMessagePlaceholder()}
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
                className="resize-y"
              />
            ) : (
              <Textarea
                id="message"
                placeholder={getMessagePlaceholder()}
                rows={4}
                maxLength={160}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
                className="resize-y"
              />
            )}
          </div>

          {/* Liste des contacts sélectionnés */}
          <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
            {selectedContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-2 py-1 border-b last:border-b-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(contact.prenom, contact.nom)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-grow">
                  <span className="font-medium">{contact.prenom} {contact.nom}</span>
                  <span className="text-sm text-muted-foreground">{contact.fonction}</span>
                </div>
                {messageType === "email" ? (
                  <Badge variant="secondary">{contact.email}</Badge>
                ) : (
                  <Badge variant="secondary">{contact.telephone}</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={sending}>
            Annuler
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? "Envoi..." : <><Send className="mr-2 h-4 w-4" />Envoyer</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
