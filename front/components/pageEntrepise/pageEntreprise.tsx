"use client"

import { useState, useEffect } from "react"
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  MoreHorizontal,
  Eye,
  DollarSign,
  Send,
  Clock,
  CalendarIcon,
  Loader2,
  Delete,
  Trash2,
} from "lucide-react"

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// Import des types et services
import type { Entreprise } from "@/types/Entreprise.type"
import type { Contact } from "@/types/Contact.type"
import type { Opportunite } from "@/types/opportunite.type"
import type { Interaction } from "@/types/interaction.type"
import { getAllEntreprises } from "@/service/Entreprise.service"
import { getAllContacts, getCountContact } from "@/service/Contact.service"
import { getAllOpportunites, getCountOpportunite } from "@/service/Opportunite.service"
import { getInteractions } from "@/service/Interaction.service"


// Props pour recevoir l'ID de l'entreprise
interface PageEntrepriseProps {
  entrepriseId?: number
}

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

export default function PageEntreprise({ entrepriseId = 1 }: PageEntrepriseProps) {
  // États pour les données
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null)
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

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Charger toutes les données en parallèle
        const [entreprisesData, contactsData, opportunitesData, interactionsData] = await Promise.all([
          getAllEntreprises(),
          getAllContacts(),
          getAllOpportunites(),
          getInteractions()
        ])

        // Trouver l'entreprise spécifique (remplacement de find)
        let currentEntreprise = null
        for (const e of entreprisesData) {
          if (e.id_entreprise === entrepriseId) {
            currentEntreprise = e
            break
          }
        }

        if (!currentEntreprise) {
          throw new Error("Entreprise non trouvée")
        }
        setEntreprise(currentEntreprise)

        // Remplacer filter pour les contacts
        const entrepriseContacts = []
        for (const c of contactsData) {
          if (c.entreprise === currentEntreprise.nom) {
            entrepriseContacts.push(c)
          }
        }

        // Remplacer filter pour les opportunités
        const entrepriseOpportunites = []
        for (const o of opportunitesData) {
          if (o.id_entreprise === entrepriseId) {
            entrepriseOpportunites.push(o)
          }
        }

        // Remplacer filter pour les interactions
        const entrepriseInteractions = []
        for (const i of interactionsData) {
          // Vérifier si l'interaction concerne un contact de l'entreprise
          let hasContact = false
          for (const c of entrepriseContacts) {
            if (c.id_contact === i.id_contact) {
              hasContact = true
              break
            }
          }
          if (hasContact) {
            entrepriseInteractions.push(i)
          }
        }

        setContacts(entrepriseContacts)
        setOpportunites(entrepriseOpportunites)
        setInteractions(entrepriseInteractions)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des données")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [entrepriseId])

  interface FilterOptions {
    secteur: string[]
    type: string[]
    source: string[]
  }
  const [totalContacts, setTotalContacts] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const loadContacts = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Chargement des contacts...")
      const contactsData = await getAllContacts()
      console.log("Contacts reçus:", contactsData)

      const validContacts = contactsData
        .filter((c: any) => typeof c.id_contact === "number")
        .map((c: any) => ({
          ...c,
          id_contact: c.id_contact as number,
          id_utilisateur: c.id_utilisateur as number,
        })) as Contact[]

      console.log("Contacts validés:", validContacts)
      setContacts(validContacts)
    } catch (error: any) {
      console.error("Erreur lors du chargement des contacts:", error)
      setError(`Erreur lors du chargement des contacts: ${error.message}`)

      // Utiliser des données de test en cas d'erreur
      const mockContacts: Contact[] = [
        {
          nom: "RABEMALALA",
          prenom: "Sarobidy",
          entreprise: "Tech Solutions",
          telephone: "22333333",
          email: "sarobidy@gmail.com",
          adresse: "Antananarivo, Madagascar",
          fonction: "Développeur Full Stack",
          source: "LinkedIn",
          secteur: "Technologie",
          type: "Client",
          photo_de_profil: "/placeholder.svg?height=40&width=40",
          id_contact: 2,
          id_utilisateur: 1,
        },
      ]
      setContacts(mockContacts)

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])
  // useEffect(() => {
  //   const fetchCount = async () => {
  //     try {

  //       const response = await getCountContact();
  //       setTotalContacts(response.total_contacts); // Assurez-vous que la réponse contient le champ total_contacts
  //     } catch (err) {
  //       console.error(err);
  //       setError("Erreur lors de la récupération du nombre de contacts");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCount();
  // }, []);


  useEffect(() => {
    const fetchOpportunites = async () => {
      try {
        const response = await getAllOpportunites(); // pas getCountOpportunite
        setOpportunites(response); // tableau d'opportunités
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des opportunités");
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunites();
  }, []);

  
  const valeurTotalePipeline = opportunites.reduce((total, opp) => {
    return total + opp.prob_abill_suc * 1000;
  }, 0);

  useEffect(() => {
    const fetchInteraction = async () => {
      try {
        const response = await getInteractions(); // pas getCountOpportunite
        setInteractions(response);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des opportunités");
      } finally {
        setLoading(false);
      }
    };

    fetchInteraction();
  }, []);
  // useEffect(() => {
  //   const loadContacts = async () => {
  //     try {
  //       const response = await getAllInteractions(); // pas getCountOpportunite
  //       setContacts(response); // tableau d'opportunités
  //     } catch (err) {
  //       console.error(err);
  //       setError("Erreur lors du chargement des opportunités");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadContacts();
  // }, []);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex w-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement des données...</span>
        </div>
      </div>
    )
  }

  if (!entreprise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center w-full justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Entreprise non trouvée</h2>
            <p className="text-gray-600">L'entreprise demandée n'existe pas.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header de l'entreprise */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold">{entreprise.nom}</h1>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Client actif
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{entreprise.adresse}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>{entreprise.secteur}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {totalContacts} contact{contacts.length > 1 ? "s" : ""}
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
                <span className="text-sm">{entreprise.telephone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{entreprise.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">ID: {entreprise.id_entreprise}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contacts</p>
                  <p className="text-2xl font-bold">{totalContacts}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
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
          <Card>
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
          <Card>
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
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="opportunites">Opportunités</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
          </TabsList>

          <TabsContent value="apercu" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Contacts récents */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Contacts principaux</CardTitle>
                  <Dialog open={isNouveauContactOpen} onOpenChange={setIsNouveauContactOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                  {totalContacts === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Aucun contact trouvé</p>
                  ) : (
                    contacts.slice(0, 3).map((contact) => (
                      <div key={contact.id_contact} className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={contact.photo_de_profil || "/placeholder.svg"} />
                          <AvatarFallback>{`${contact.prenom[0] || ""}${contact.nom[0] || ""}`}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Opportunités actives</CardTitle>
                  <Dialog open={isNouvelleOppOpen} onOpenChange={setIsNouvelleOppOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                  {opportunites.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Aucune opportunité trouvée</p>
                  ) : (
                    opportunites.slice(0, 2).map((opp) => (
                      <div key={opp.id_opportunite} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{opp.titre}</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Interactions récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Aucune interaction trouvée</p>
                  ) : (
                    interactions.slice(0, 3).map((interaction) => {
                      const contact = contacts.find((c) => c.id_contact === interaction.id_contact)
                      return (
                        <div
                          key={interaction.id_interaction}
                          className="flex items-start space-x-3 border-b pb-4 last:border-b-0"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            {getTypeIcon(interaction.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{interaction.type}</p>
                              <span className="text-sm text-muted-foreground">
                                {formatDateTime(interaction.date_interaction)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              avec {contact ? `${contact.prenom} ${contact.nom}` : "Contact inconnu"}
                            </p>
                            <p className="text-sm">{interaction.contenu}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contacts de l'entreprise</CardTitle>
                  <CardDescription>Gérez tous les contacts liés à {entreprise.nom}</CardDescription>
                </div>
                <Dialog open={isNouveauContactOpen} onOpenChange={setIsNouveauContactOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouveau contact
                    </Button>
                  </DialogTrigger>
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
                      <div key={contact.id_contact} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={contact.photo_de_profil || "/placeholder.svg"} />
                            <AvatarFallback>{`${contact.prenom[0] || ""}${contact.nom[0] || ""}`}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Opportunités commerciales</CardTitle>
                  <CardDescription>Suivez toutes les opportunités pour {entreprise.nom}</CardDescription>
                </div>
                <Dialog open={isNouvelleOppOpen} onOpenChange={setIsNouvelleOppOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle opportunité
                    </Button>
                  </DialogTrigger>
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
                      <div key={opp.id_opportunite} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">{opp.titre}</h3>
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
                          <p className="text-sm">{opp.description}</p>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Historique des interactions</CardTitle>
                  <CardDescription>Toutes les interactions avec {entreprise.nom}</CardDescription>
                </div>

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
                      const contact = contacts.find((c) => c.id_contact === interaction.id_contact)
                      return (
                        <div
                          key={interaction.id_interaction}
                          className="flex items-start space-x-4 rounded-lg border p-4"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            {getTypeIcon(interaction.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{interaction.type}</h3>
                              <span className="text-sm text-muted-foreground">
                                {formatDateTime(interaction.date_interaction)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              avec {contact ? `${contact.prenom} ${contact.nom}` : "Contact inconnu"}
                            </p>
                            <p className="text-sm">{interaction.contenu}</p>
                            {interaction.fichier_joint && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Fichier joint
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="bg-red-800 text-white">
                            <Trash2 className="h-4 w-4 " />
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

        {/* Toutes les modales restent identiques mais utilisent maintenant les vraies données */}
        {/* Modal Modifier Entreprise */}
        <Dialog open={isModifierOpen} onOpenChange={setIsModifierOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier l'entreprise</DialogTitle>
              <DialogDescription>Modifiez les informations de l'entreprise {entreprise.nom}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de l'entreprise</Label>
                  <Input id="nom" defaultValue={entreprise.nom} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secteur">Secteur d'activité</Label>
                  <Input id="secteur" defaultValue={entreprise.secteur} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input id="adresse" defaultValue={entreprise.adresse} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" defaultValue={entreprise.telephone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={entreprise.email} />
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
              <DialogDescription>Informations complètes sur {entreprise.nom}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Informations générales</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nom :</span>
                      <span>{entreprise.nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Secteur :</span>
                      <span>{entreprise.secteur}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID :</span>
                      <span>{entreprise.id_entreprise}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Contact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adresse :</span>
                      <span className="text-right">{entreprise.adresse}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Téléphone :</span>
                      <span>{entreprise.telephone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email :</span>
                      <span>{entreprise.email}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
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

        {/* Les autres modales restent identiques... */}
        {/* Modal Envoyer Email */}
        <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Envoyer un email</DialogTitle>
              <DialogDescription>Composer un email pour {entreprise.nom}</DialogDescription>
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
                      <SelectItem key={contact.id_contact} value={contact.email}>
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

        {/* Modal Programmer Appel */}
        <Dialog open={isAppelOpen} onOpenChange={setIsAppelOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Programmer un appel</DialogTitle>
              <DialogDescription>Planifier un appel avec {entreprise.nom}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-appel">Contact à appeler</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem
                        key={contact.id_contact ?? `${contact.prenom}-${contact.nom}`}
                        value={(contact.id_contact ?? '').toString()}
                      >
                        {contact.prenom} {contact.nom} - {contact.fonction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heure">Heure</Label>
                  <Input id="heure" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sujet-appel">Sujet de l'appel</Label>
                <Input id="sujet-appel" placeholder="Objet de l'appel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes-appel">Notes</Label>
                <Textarea id="notes-appel" placeholder="Notes préparatoires..." className="min-h-[100px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAppelOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsAppelOpen(false)}>
                <Clock className="mr-2 h-4 w-4" />
                Programmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Nouvelle Opportunité */}
        <Dialog open={isNouvelleOppOpen} onOpenChange={setIsNouvelleOppOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouvelle opportunité</DialogTitle>
              <DialogDescription>Créer une nouvelle opportunité pour {entreprise.nom}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titre-opp">Titre de l'opportunité</Label>
                <Input id="titre-opp" placeholder="Ex: Implémentation CRM" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description-opp">Description</Label>
                <Textarea
                  id="description-opp"
                  placeholder="Description de l'opportunité..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="probabilite">Probabilité de succès (%)</Label>
                  <Input id="probabilite" placeholder="Ex: 75" type="number" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etape">Étape du pipeline</Label>
                  <Input id="etape" placeholder="Ex: Qualification" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut-opp">Statut</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="chaud">Chaud</SelectItem>
                    <SelectItem value="qualification">Qualification</SelectItem>
                    <SelectItem value="negociation">Négociation</SelectItem>
                    <SelectItem value="ferme">Fermé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNouvelleOppOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsNouvelleOppOpen(false)}>Créer l'opportunité</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Nouveau Contact */}
        <Dialog open={isNouveauContactOpen} onOpenChange={setIsNouveauContactOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouveau contact</DialogTitle>
              <DialogDescription>Ajouter un nouveau contact pour {entreprise.nom}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" placeholder="Prénom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom-contact">Nom</Label>
                  <Input id="nom-contact" placeholder="Nom" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fonction">Fonction</Label>
                <Input id="fonction" placeholder="Ex: Directeur Commercial" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-contact">Email</Label>
                  <Input id="email-contact" type="email" placeholder="email@exemple.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tel-contact">Téléphone</Label>
                  <Input id="tel-contact" placeholder="+33 1 23 45 67 89" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse-contact">Adresse</Label>
                <Input id="adresse-contact" placeholder="Adresse du contact" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secteur-contact">Secteur</Label>
                  <Input id="secteur-contact" placeholder="Secteur d'activité" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type-contact">Type</Label>
                  <Input id="type-contact" placeholder="Type de contact" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNouveauContactOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsNouveauContactOpen(false)}>Ajouter le contact</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Nouvelle Interaction */}
        <Dialog open={isNouvelleInteractionOpen} onOpenChange={setIsNouvelleInteractionOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nouvelle interaction</DialogTitle>
              <DialogDescription>Enregistrer une nouvelle interaction avec {entreprise.nom}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type-interaction">Type d'interaction</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Appel téléphonique">Appel téléphonique</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Réunion">Réunion</SelectItem>
                      <SelectItem value="Visite">Visite</SelectItem>
                      <SelectItem value="Démonstration">Démonstration</SelectItem>
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
                        <SelectItem key={contact.id_contact ?? `${contact.prenom}-${contact.nom}`} value={(contact.id_contact ?? '').toString()}>
                          {contact.prenom} {contact.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date et heure</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contenu-interaction">Contenu</Label>
                <Textarea
                  id="contenu-interaction"
                  placeholder="Contenu de l'interaction..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNouvelleInteractionOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsNouvelleInteractionOpen(false)}>Enregistrer l'interaction</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
