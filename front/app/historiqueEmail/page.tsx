"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, Search, User, Filter, Clock, RefreshCw, Eye, Download, Trash2 } from "lucide-react"

import type { Contact } from "@/types/Contact.type"
import { enrichEmailsWithContacts, getEmailHistory } from "@/service/getEmail.service"
import { getAllContacts } from "@/service/Contact.service"

interface EmailEnvoyee {
  id_contact: number
  objet: string
  message: string
  date_envoyee: string
  id_email: number
  contact: {
    id: number
  }
}

interface EmailWithContact extends EmailEnvoyee {
  contactName: string
  contactEmail: string
  contactFunction: string
}

export default function HistoriqueEmails() {
  const [emails, setEmails] = useState<EmailWithContact[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredEmails, setFilteredEmails] = useState<EmailWithContact[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContact, setSelectedContact] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<EmailWithContact | null>(null)

  // Récupérer les emails et contacts
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🚀 Début du chargement des données...")

      // Récupérer les emails et contacts en parallèle
      const [emailsData, contactsResponse] = await Promise.all([getEmailHistory(), getAllContacts()])

      console.log("📧 Emails reçus:", emailsData)
      console.log("👥 Contacts reçus:", contactsResponse)

      // Gérer différents formats de réponse pour les contacts
      let contactsData: Contact[] = []

      if (Array.isArray(contactsResponse)) {
        // Si c'est directement un tableau
        contactsData = contactsResponse
      } else if (contactsResponse && typeof contactsResponse === "object") {
        // Si c'est un objet, chercher le tableau dans les propriétés communes
        if (Array.isArray(contactsResponse.data)) {
          contactsData = contactsResponse.data
        } else if (Array.isArray(contactsResponse.contacts)) {
          contactsData = contactsResponse.contacts
        } else if (Array.isArray(contactsResponse.results)) {
          contactsData = contactsResponse.results
        } else {
          console.error("❌ Format de contacts non reconnu:", contactsResponse)
          throw new Error("Le format des contacts retourné par l'API n'est pas supporté")
        }
      } else {
        console.error("❌ Réponse contacts invalide:", contactsResponse)
        throw new Error("La réponse de l'API contacts est invalide")
      }

      console.log("✅ Contacts traités:", contactsData.length, "contacts")

      // Vérifier que nous avons bien un tableau de contacts
      if (!Array.isArray(contactsData)) {
        throw new Error("Impossible d'extraire la liste des contacts")
      }

      setContacts(contactsData)

      // Enrichir les emails avec les informations des contacts
      const emailsWithContacts = enrichEmailsWithContacts(emailsData, contactsData)

      // Vérifier quelques exemples d'emails enrichis
      console.log("🔍 Exemples d'emails enrichis:", emailsWithContacts.slice(0, 3))

      // Trier par date décroissante (plus récent en premier)
      emailsWithContacts.sort((a, b) => new Date(b.date_envoyee).getTime() - new Date(a.date_envoyee).getTime())

      console.log("✅ Emails enrichis:", emailsWithContacts.length, "emails")

      setEmails(emailsWithContacts)
      setFilteredEmails(emailsWithContacts)
    } catch (err) {
      console.error("💥 Erreur lors du chargement:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filtrer les emails
  useEffect(() => {
    let filtered = emails

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (email) =>
          email.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrer par contact sélectionné
    if (selectedContact !== "all") {
      filtered = filtered.filter((email) => email.id_contact.toString() === selectedContact)
    }

    // Filtrer par période
    if (selectedPeriod !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (selectedPeriod) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "3months":
          filterDate.setMonth(now.getMonth() - 3)
          break
      }

      if (selectedPeriod !== "all") {
        filtered = filtered.filter((email) => new Date(email.date_envoyee) >= filterDate)
      }
    }

    setFilteredEmails(filtered)
  }, [emails, searchTerm, selectedContact, selectedPeriod])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  }

  const truncateMessage = (message: string, maxLength = 120) => {
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message
  }

  const getUniqueContactsCount = () => {
    return new Set(emails.map((e) => e.id_contact)).size
  }

  const getLastEmailDate = () => {
    return emails.length > 0 ? formatDateShort(emails[0].date_envoyee) : "-"
  }

  // Fonction d'export CSV
  const exportToCSV = () => {
    const headers = ["Date", "Objet", "Contact", "Email", "Fonction", "Message"]
    const csvContent = [
      headers.join(","),
      ...filteredEmails.map((email) =>
        [
          formatDate(email.date_envoyee),
          `"${email.objet.replace(/"/g, '""')}"`,
          `"${email.contactName.replace(/"/g, '""')}"`,
          `"${email.contactEmail.replace(/"/g, '""')}"`,
          `"${email.contactFunction.replace(/"/g, '""')}"`,
          `"${email.message.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `historique-emails-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Fonction de suppression d'email
  const deleteEmail = async (emailId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet email de l'historique ?")) {
      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/email/${emailId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      // Recharger les données après suppression
      await fetchData()

      // Fermer le modal si l'email supprimé était ouvert
      if (selectedEmail && selectedEmail.id_email === emailId) {
        setSelectedEmail(null)
      }

      console.log(`✅ Email ${emailId} supprimé avec succès`)
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error)
      alert("Erreur lors de la suppression de l'email")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de l'historique des emails...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <Mail className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">Erreur de chargement</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Historique des Emails</h1>
            <p className="text-muted-foreground">Consultez tous les emails envoyés à vos contacts</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{emails.length}</p>
                  <p className="text-xs text-muted-foreground">Emails envoyés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{getUniqueContactsCount()}</p>
                  <p className="text-xs text-muted-foreground">Contacts contactés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{getLastEmailDate()}</p>
                  <p className="text-xs text-muted-foreground">Dernier envoi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{filteredEmails.length}</p>
                  <p className="text-xs text-muted-foreground">Résultats filtrés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres et Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par objet, message, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedContact} onValueChange={setSelectedContact}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les contacts</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id.toString()}>
                    {contact.prenom} {contact.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="3months">3 derniers mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des emails */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Emails ({filteredEmails.length})</CardTitle>
              <CardDescription>
                {filteredEmails.length === 0 && emails.length > 0
                  ? "Aucun email ne correspond à vos critères de recherche"
                  : "Liste des emails envoyés, triés par date décroissante"}
              </CardDescription>
            </div>
            {filteredEmails.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredEmails.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {emails.length === 0 ? "Aucun email envoyé" : "Aucun résultat trouvé"}
              </h3>
              <p className="text-muted-foreground">
                {emails.length === 0
                  ? "Commencez par envoyer des emails à vos contacts"
                  : "Essayez de modifier vos critères de recherche"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredEmails.map((email, index) => (
                  <div key={`${email.id_email}-${index}`}>
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <h3 className="font-semibold text-base line-clamp-1">{email.objet}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span className="font-medium text-foreground">
                                {email.contactName || `Contact #${email.id_contact}`}
                              </span>
                              {email.contactEmail && email.contactEmail !== "Email non disponible" && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600">{email.contactEmail}</span>
                                </>
                              )}
                              {email.contactFunction && (
                                <>
                                  <span>•</span>
                                  <span className="italic text-muted-foreground">{email.contactFunction}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
                              <Calendar className="h-3 w-3" />
                              {formatDate(email.date_envoyee)}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(email)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteEmail(email.id_email)
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p className="line-clamp-2">{truncateMessage(email.message)}</p>
                        </div>
                      </div>
                    </div>
                    {index < filteredEmails.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Modal de détail d'email */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedEmail.objet}</CardTitle>
                  <CardDescription>
                    Envoyé à {selectedEmail.contactName} le {formatDate(selectedEmail.date_envoyee)}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteEmail(selectedEmail.id_email)}
                  className="text-destructive hover:text-destructive mr-2"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Destinataire</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-foreground">Nom:</strong>
                        <span>{selectedEmail.contactName || `Contact #${selectedEmail.id_contact}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong className="text-foreground">Email:</strong>
                        <span className="text-blue-600">{selectedEmail.contactEmail || "Non disponible"}</span>
                      </div>
                      {selectedEmail.contactFunction && (
                        <div className="flex items-center gap-2">
                          <strong className="text-foreground">Fonction:</strong>
                          <span>{selectedEmail.contactFunction}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Message</h4>
                    <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">{selectedEmail.message}</div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
