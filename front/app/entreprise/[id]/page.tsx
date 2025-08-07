"use client"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Building2, Users, Plus, Edit, MoreHorizontal, Eye, DollarSign, Send, Loader2, Trash2, ArrowLeft, Phone, Mail, MapPin, TrendingUp, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

// Import des types et services
import type { Entreprise, Adresse, Utilisateur } from "@/types/Entreprise.type" // Unified import
import type { Contact } from "@/types/Contact.type"
import type { Opportunite } from "@/types/opportunite.type"
import type { Interaction } from "@/types/interaction.type"
import { getAllEntreprises } from "@/service/Entreprise.service"
import { getAllContacts } from "@/service/Contact.service"
import { getAllOpportunites } from "@/service/Opportunite.service"
import { getInteractions } from "@/service/Interaction.service"
import { getAllAdresses } from "@/service/Adresse.service" // Import getAllAdresses

const getStatutColor = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "chaud":
    case "actif":
      return "bg-red-100 text-red-800"
    case "en cours":
    case "qualification":
      return "bg-blue-100 text-blue-800"
    case "fermé":
    case "gagné":
      return "bg-green-100 text-green-800"
    case "perdu":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "appel":
    case "appel téléphonique":
      return <Phone className="h-4 w-4" />
    case "email":
      return <Mail className="h-4 w-4" />
    case "réunion":
    case "meeting":
      return <Calendar className="h-4 w-4" />
    default:
      return <Calendar className="h-4 w-4" />
  }
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: fr })
  } catch {
    return dateString
  }
}

const formatDateTime = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy à HH:mm", { locale: fr })
  } catch {
    return dateString
  }
}

export default function PageEntreprise() {
  const params = useParams()
  const router = useRouter()
  const entrepriseId = Number(params.id)

  // États pour les données
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null)
  const [allEntreprises, setAllEntreprises] = useState<Entreprise[]>([])
  const [adresses, setAdresses] = useState<Adresse[]>([]) // State for addresses
  const [contacts, setContacts] = useState<Contact[]>([])
  const [opportunites, setOpportunites] = useState<Opportunite[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])

  // États de chargement
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // États des modales
  const [activeTab, setActiveTab] = useState("apercu")
  const [isModifierOpen, setIsModifierOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEmailOpen, setIsEmailOpen] = useState(false)
  const [isAppelOpen, setIsAppelOpen] = useState(false)
  const [isNouvelleOppOpen, setIsNouvelleOppOpen] = useState(false)
  const [isNouveauContactOpen, setIsNouveauContactOpen] = useState(false)
  const [isNouvelleInteractionOpen, setIsNouvelleInteractionOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()

  // Helper functions for addresses and users (copied from entreprise/page.tsx)
  const getAdresseById = useCallback((id: number | null | undefined) => adresses.find((a) => a.id === id), [adresses])
  const formatAdresse = useCallback((adresse?: Adresse) =>
    adresse
      ? [adresse.ligneAdresse1, adresse.ligneAdresse2, adresse.ville, adresse.cp, adresse.pays]
          .filter(Boolean)
          .join(", ")
      : "-", [adresses])

  // Chargement des données
  useEffect(() => {
    loadAllData()
  }, [])

  // Rechargement des données quand l'entreprise change
  useEffect(() => {
    if (allEntreprises.length > 0 && adresses.length > 0) { // Ensure addresses are loaded
      loadEntrepriseData(entrepriseId)
    }
  }, [entrepriseId, allEntreprises, adresses]) // Add adresses to dependency array

  const loadAllData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Charger toutes les entreprises et adresses d'abord
      const [entreprisesData, adressesData] = await Promise.all([
        getAllEntreprises(),
        getAllAdresses(),
      ])
      setAllEntreprises(entreprisesData)
      setAdresses(Array.isArray(adressesData?.data) ? adressesData.data : Array.isArray(adressesData) ? adressesData : [])

      // Charger les données pour l'entreprise spécifique
      await loadEntrepriseData(entrepriseId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des données")
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadEntrepriseData = async (id: number) => {
    try {
      // Charger toutes les données en parallèle
      const [contactsData, opportunitesData, interactionsData] = await Promise.all([
        getAllContacts(),
        getAllOpportunites(),
        getInteractions(),
      ])

      // Trouver l'entreprise spécifique parmi toutes les entreprises déjà chargées
      const currentEntreprise = allEntreprises.find((e) => e.id === id) // Use e.id
      if (!currentEntreprise) {
        throw new Error("Entreprise non trouvée")
      }
      setEntreprise(currentEntreprise)

      // Filtrer les contacts par entreprise (en utilisant l'ID de l'entreprise)
      const entrepriseContacts = contactsData.filter((c) => c.entreprise_id === currentEntreprise.id) // Use entreprise_id
      // Filtrer les opportunités par ID d'entreprise
      const entrepriseOpportunites = opportunitesData.filter((o) => o.id_entreprise === id)
      // Filtrer les interactions par contacts de l'entreprise
      const contactIds = entrepriseContacts.map((c) => c.id) // Use c.id
      const entrepriseInteractions = interactionsData.filter((i) => contactIds.includes(i.id_contact))

      setContacts(entrepriseContacts)
      setOpportunites(entrepriseOpportunites)
      setInteractions(entrepriseInteractions)
    } catch (err) {
      console.error("Erreur lors du chargement des données de l'entreprise:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'entreprise",
        variant: "destructive",
      })
    }
  }

  const handleEntrepriseChange = (newEntrepriseId: string) => {
    router.push(`/entreprise/${newEntrepriseId}`)
  }

  const valeurTotalePipeline = opportunites.reduce((total, opp) => {
    return total + opp.prob_abill_suc * 1000
  }, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex w-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-700">Chargement des données...</span>
        </div>
      </div>
    )
  }

  if (!entreprise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center w-full justify-center">
        <Card className="w-96 shadow-lg">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Entreprise non trouvée</h2>
            <p className="text-gray-600 mb-4">L'entreprise demandée n'existe pas ou n'a pas pu être chargée.</p>
            <Link href="/entreprise">
              <Button>Retour à la liste des entreprises</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentAdresse = getAdresseById(entreprise.adresse_id);

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Navigation et sélecteur d'entreprise */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/entreprise">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Entreprise :</span>
              <Select value={entrepriseId.toString()} onValueChange={handleEntrepriseChange}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allEntreprises.map((ent) => (
                    <SelectItem key={ent.id} value={ent.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {ent.raisonSocial}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700">
            ID: {entreprise.id}
          </Badge>
        </div>

        {/* Header de l'entreprise */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-gray-900">{entreprise.raisonSocial}</h1>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Client actif
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{formatAdresse(currentAdresse)}</span>
                    </div>
                    {entreprise.secteur && (
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4" />
                        <span>{entreprise.secteur}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {contacts.length} contact{contacts.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Dialog open={isModifierOpen} onOpenChange={setIsModifierOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  </DialogTrigger>
                  {/* Modifier Entreprise Dialog Content (kept as is for now) */}
                </Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEmailOpen(true)}>
                      <Mail className="mr-2 h-4 w-4" />
                      Envoyer email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsAppelOpen(true)}>
                      <Phone className="mr-2 h-4 w-4" />
                      Programmer appel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{entreprise.telephoneStandard || "-"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{entreprise.emailStandart || "-"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">ID: {entreprise.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contacts</p>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opportunités</p>
                  <p className="text-2xl font-bold">{opportunites.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valeur pipeline</p>
                  <p className="text-2xl font-bold">{Math.round(valeurTotalePipeline / 1000)}K€</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interactions</p>
                  <p className="text-2xl font-bold">{interactions.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="apercu">Aperçu</TabsTrigger>
            <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
            <TabsTrigger value="opportunites">Opportunités ({opportunites.length})</TabsTrigger>
            <TabsTrigger value="interactions">Interactions ({interactions.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="apercu" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Contacts principaux */}
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Contacts principaux</CardTitle>
                  <Dialog open={isNouveauContactOpen} onOpenChange={setIsNouveauContactOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter
                      </Button>
                    </DialogTrigger>
                    {/* Nouveau Contact Dialog Content (kept as is for now) */}
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contacts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Aucun contact trouvé</p>
                  ) : (
                    contacts.slice(0, 3).map((contact) => (
                      <div key={contact.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                        <Avatar>
                          <AvatarImage src={contact.photo_de_profil || "/placeholder.svg?height=40&width=40&query=contact profile"} />
                          <AvatarFallback>{`${contact.prenom[0] || ""}${contact.nom[0] || ""}`}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {contact.prenom} {contact.nom}
                          </p>
                          <p className="text-sm text-muted-foreground">{contact.fonction}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              {/* Opportunités actives */}
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Opportunités actives</CardTitle>
                  <Dialog open={isNouvelleOppOpen} onOpenChange={setIsNouvelleOppOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle
                      </Button>
                    </DialogTrigger>
                    {/* Nouvelle Opportunité Dialog Content (kept as is for now) */}
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                  {opportunites.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Aucune opportunité trouvée</p>
                  ) : (
                    opportunites.slice(0, 2).map((opp) => (
                      <div key={opp.id_opportunite} className="space-y-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{opp.titre}</p>
                          <Badge className={getStatutColor(opp.statut)}>{opp.statut}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{opp.etape_pipeline}</span>
                          <span>{opp.prob_abill_suc}% de probabilité</span>
                        </div>
                        <Progress value={opp.prob_abill_suc} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Interactions récentes */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Interactions récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Aucune interaction trouvée</p>
                  ) : (
                    interactions.slice(0, 3).map((interaction) => {
                      const contact = contacts.find((c) => c.id === interaction.id_contact) // Use c.id
                      return (
                        <div
                          key={interaction.id_interaction}
                          className="flex items-start space-x-3 border-b pb-4 last:border-b-0 last:pb-0 p-2 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            {getTypeIcon(interaction.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">{interaction.type}</p>
                              <span className="text-sm text-muted-foreground">
                                {formatDateTime(interaction.date_interaction)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              avec {contact ? `${contact.prenom} ${contact.nom}` : "Contact inconnu"}
                            </p>
                            <p className="text-sm text-gray-700">{interaction.contenu}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contacts de l'entreprise</CardTitle>
                  <CardDescription>Gérez tous les contacts liés à {entreprise.raisonSocial}</CardDescription>
                </div>
                <Dialog open={isNouveauContactOpen} onOpenChange={setIsNouveauContactOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau contact
                    </Button>
                  </DialogTrigger>
                  {/* Nouveau Contact Dialog Content (kept as is for now) */}
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun contact trouvé pour cette entreprise</p>
                      <Button className="mt-4" onClick={() => setIsNouveauContactOpen(true)}>
                        Ajouter le premier contact
                      </Button>
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={contact.photo_de_profil || "/placeholder.svg?height=40&width=40&query=contact profile"} />
                            <AvatarFallback>{`${contact.prenom[0] || ""}${contact.nom[0] || ""}`}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {contact.prenom} {contact.nom}
                            </p>
                            <p className="text-sm text-muted-foreground">{contact.fonction}</p>
                            <div className="flex space-x-4 text-sm text-muted-foreground">
                              <span>{contact.email}</span>
                              <span>{contact.telephone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunites" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Opportunités commerciales</CardTitle>
                  <CardDescription>Suivez toutes les opportunités pour {entreprise.raisonSocial}</CardDescription>
                </div>
                <Dialog open={isNouvelleOppOpen} onOpenChange={setIsNouvelleOppOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle opportunité
                    </Button>
                  </DialogTrigger>
                  {/* Nouvelle Opportunité Dialog Content (kept as is for now) */}
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunites.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune opportunité trouvée pour cette entreprise</p>
                      <Button className="mt-4" onClick={() => setIsNouvelleOppOpen(true)}>
                        Créer la première opportunité
                      </Button>
                    </div>
                  ) : (
                    opportunites.map((opp) => (
                      <div key={opp.id_opportunite} className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">{opp.titre}</h3>
                          <Badge className={getStatutColor(opp.statut)}>{opp.statut}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <p className="text-muted-foreground">Probabilité</p>
                            <p className="font-medium">{opp.prob_abill_suc}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Étape</p>
                            <p className="font-medium">{opp.etape_pipeline}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Créé le</p>
                            <p className="font-medium">{formatDate(opp.date_creation)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Interaction</p>
                            <p className="font-medium">{formatDate(opp.date_interaction)}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-2">Description:</p>
                          <p className="text-sm text-gray-700">{opp.description}</p>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Progression</span>
                            <span className="text-sm font-medium">{opp.prob_abill_suc}%</span>
                          </div>
                          <Progress value={opp.prob_abill_suc} className="h-2" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Historique des interactions</CardTitle>
                  <CardDescription>Toutes les interactions avec {entreprise.raisonSocial}</CardDescription>
                </div>
                <Dialog open={isNouvelleInteractionOpen} onOpenChange={setIsNouvelleInteractionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle interaction
                    </Button>
                  </DialogTrigger>
                  {/* Nouvelle Interaction Dialog Content (kept as is for now) */}
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune interaction trouvée pour cette entreprise</p>
                      <Button className="mt-4" onClick={() => setIsNouvelleInteractionOpen(true)}>
                        Enregistrer la première interaction
                      </Button>
                    </div>
                  ) : (
                    interactions.map((interaction) => {
                      const contact = contacts.find((c) => c.id === interaction.id_contact) // Use c.id
                      return (
                        <div
                          key={interaction.id_interaction}
                          className="flex items-start space-x-4 rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            {getTypeIcon(interaction.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-gray-900">{interaction.type}</h3>
                              <span className="text-sm text-muted-foreground">
                                {formatDateTime(interaction.date_interaction)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              avec {contact ? `${contact.prenom} ${contact.nom}` : "Contact inconnu"}
                            </p>
                            <p className="text-sm text-gray-700">{interaction.contenu}</p>
                            {interaction.fichier_joint && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Fichier joint
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals (kept as is for now, but ensure they use the unified Entreprise type for data) */}
        {/* Modal Modifier Entreprise */}
        <Dialog open={isModifierOpen} onOpenChange={setIsModifierOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier l'entreprise</DialogTitle>
              <DialogDescription>Modifiez les informations de l'entreprise {entreprise.raisonSocial}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="raisonSocial">Raison sociale</Label>
                  <Input id="raisonSocial" defaultValue={entreprise.raisonSocial} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secteur">Secteur d'activité</Label>
                  <Input id="secteur" defaultValue={entreprise.secteur || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input id="adresse" defaultValue={formatAdresse(currentAdresse)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" defaultValue={entreprise.telephoneStandard || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={entreprise.emailStandart || ''} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModifierOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsModifierOpen(false)}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Voir Détails */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Détails de l'entreprise</DialogTitle>
              <DialogDescription>Informations complètes sur {entreprise.raisonSocial}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Informations générales</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nom :</span>
                      <span className="text-gray-700">{entreprise.raisonSocial}</span>
                    </div>
                    {entreprise.secteur && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Secteur :</span>
                        <span className="text-gray-700">{entreprise.secteur}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID :</span>
                      <span className="text-gray-700">{entreprise.id}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Contact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adresse :</span>
                      <span className="text-right text-gray-700">{formatAdresse(currentAdresse)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Téléphone :</span>
                      <span className="text-gray-700">{entreprise.telephoneStandard || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email :</span>
                      <span className="text-gray-700">{entreprise.emailStandart || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{contacts.length}</p>
                  <p className="text-sm text-muted-foreground">Contacts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{opportunites.length}</p>
                  <p className="text-sm text-muted-foreground">Opportunités</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{interactions.length}</p>
                  <p className="text-sm text-muted-foreground">Interactions</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDetailsOpen(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Envoyer Email */}
        <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Envoyer un email</DialogTitle>
              <DialogDescription>Composer un email pour {entreprise.raisonSocial}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destinataire">Destinataire</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.email}>
                        {contact.prenom} {contact.nom} - {contact.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sujet">Sujet</Label>
                <Input id="sujet" placeholder="Objet de l'email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Votre message..." className="min-h-[150px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmailOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsEmailOpen(false)}>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Programmer Appel (kept as is for now) */}
        <Dialog open={isAppelOpen} onOpenChange={setIsAppelOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Programmer un appel</DialogTitle>
              <DialogDescription>Planifiez un appel avec un contact de {entreprise.raisonSocial}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-appel">Contact</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.prenom} {contact.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-appel">Date et heure</Label>
                <Input id="date-appel" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes-appel">Notes</Label>
                <Textarea id="notes-appel" placeholder="Notes de l'appel..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAppelOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsAppelOpen(false)}>
                <Phone className="mr-2 h-4 w-4" />
                Programmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Nouvelle Opportunité (kept as is for now) */}
        <Dialog open={isNouvelleOppOpen} onOpenChange={setIsNouvelleOppOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouvelle opportunité</DialogTitle>
              <DialogDescription>Créez une nouvelle opportunité pour {entreprise.raisonSocial}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titre-opp">Titre</Label>
                <Input id="titre-opp" placeholder="Titre de l'opportunité" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description-opp">Description</Label>
                <Textarea id="description-opp" placeholder="Description de l'opportunité..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="probabilite-opp">Probabilité de succès (%)</Label>
                  <Input id="probabilite-opp" type="number" min="0" max="100" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etape-opp">Étape du pipeline</Label>
                  <Select defaultValue="qualification">
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une étape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualification">Qualification</SelectItem>
                      <SelectItem value="proposition">Proposition</SelectItem>
                      <SelectItem value="négociation">Négociation</SelectItem>
                      <SelectItem value="fermé">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-opp">Contact principal</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.prenom} {contact.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNouvelleOppOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsNouvelleOppOpen(false)}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Nouveau Contact (kept as is for now) */}
        <Dialog open={isNouveauContactOpen} onOpenChange={setIsNouveauContactOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouveau contact</DialogTitle>
              <DialogDescription>Ajoutez un nouveau contact pour {entreprise.raisonSocial}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom-contact">Prénom</Label>
                  <Input id="prenom-contact" placeholder="Prénom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom-contact">Nom</Label>
                  <Input id="nom-contact" placeholder="Nom" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-contact">Email</Label>
                <Input id="email-contact" type="email" placeholder="Email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone-contact">Téléphone</Label>
                <Input id="telephone-contact" placeholder="Téléphone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fonction-contact">Fonction</Label>
                <Input id="fonction-contact" placeholder="Fonction" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNouveauContactOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsNouveauContactOpen(false)}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Nouvelle Interaction (kept as is for now) */}
        <Dialog open={isNouvelleInteractionOpen} onOpenChange={setIsNouvelleInteractionOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouvelle interaction</DialogTitle>
              <DialogDescription>Enregistrez une nouvelle interaction pour {entreprise.raisonSocial}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type-interaction">Type d'interaction</Label>
                <Select defaultValue="appel">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appel">Appel téléphonique</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="réunion">Réunion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-interaction">Contact</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.prenom} {contact.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-interaction">Date et heure</Label>
                <Input id="date-interaction" type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contenu-interaction">Contenu</Label>
                <Textarea id="contenu-interaction" placeholder="Détails de l'interaction..." className="min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fichier-joint">Fichier joint</Label>
                <Input id="fichier-joint" type="file" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNouvelleInteractionOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsNouvelleInteractionOpen(false)}>Enregistrer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
