"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  Edit,
  Trash2,
  MessageSquare,
  X,
  History,
  Phone,
  Copy,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ContactForm } from "@/components/contact-form"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { SendMessageDialog } from "@/components/send-message-dialog"
import { FilterDialog } from "@/components/filter-dialog"
import { ContactHistoryDialog } from "@/components/contact-historique-dialog"
import { getAllContacts } from "@/service/Contact.service"
import { getAllEntreprises } from "@/service/Entreprise.service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Navbar from "@/components/navbarLink/nav"
import AddHistoriqueDialog from "@/components/DialogueHistorique"
import { getAllCampagnes } from "@/service/campagne.service"
import { toast } from "@/hooks/use-toast"
import type { Campagne } from "@/types/campagne.type"

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

interface Entreprise {
  id: number
  nom?: string
  raisonSocial?: string
}

interface FilterOptions {
  fonction: string[]
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])

  // Dialog states
  const [utilisateur, setUtilisateur] = useState<{ id: number }>({ id: 1 })
  const [showContactForm, setShowContactForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [contactToCall, setContactToCall] = useState<Contact | null>(null)
  const [campagnes, setCampagnes] = useState<Campagne[]>([])

  useEffect(() => {
    const fetchCampagnes = async () => {
      try {
        const res = await getAllCampagnes()
        setCampagnes(res.data)
        console.log("Campagnes loaded:", res.data)
      } catch {
        toast({ title: "Erreur", description: "Impossible de charger les campagnes", variant: "destructive" })
      } finally {
      }
    }
    fetchCampagnes()
  }, [])

  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    fonction: [],
  })

  // Charger les contacts depuis l'API
  const loadContacts = async () => {
    try {
      setLoading(true)
      setError("")
      const response = (await getAllContacts()) as Contact[] | { data: Contact[] }
      if (Array.isArray(response)) {
        setContacts(response)
        setFilteredContacts(response)
      } else if (response && Array.isArray((response as { data?: unknown }).data)) {
        setContacts((response as { data: Contact[] }).data)
        setFilteredContacts((response as { data: Contact[] }).data)
      } else {
        throw new Error("Format de réponse invalide")
      }
    } catch (error: any) {
      setError(`Erreur lors du chargement des contacts: ${error.message}`)
      const mockContacts: Contact[] = [
        {
          id: 1,
          nom: "RABEMALALA",
          prenom: "Sarobidy",
          telephone: "0343566244",
          email: "sarobidy@gmail.com",
          adresse: "Antananarivo, Madagascar",
          fonction: "Développeur Full Stack",
          entreprise_id: 1,
        },
        {
          id: 2,
          nom: "RAKOTO",
          prenom: "Aina",
          telephone: "0344567890",
          email: "aina@gmail.com",
          adresse: "Fianarantsoa, Madagascar",
          fonction: "Designer",
          entreprise_id: 1,
        },
      ]
      setContacts(mockContacts)
      setFilteredContacts(mockContacts)
    } finally {
      setLoading(false)
    }
  }

  // Charger les entreprises
  const loadEntreprises = async () => {
    try {
      const data = await getAllEntreprises()
      setEntreprises(data)
    } catch (error) {
      setEntreprises([])
    }
  }

  useEffect(() => {
    loadContacts()
    loadEntreprises()
  }, [])

  useEffect(() => {
    let filtered = contacts.filter(
      (contact) =>
        `${contact.prenom} ${contact.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.telephone.includes(searchTerm) ||
        contact.fonction.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (activeFilters.fonction.length > 0) {
      filtered = filtered.filter((contact) => activeFilters.fonction.includes(contact.fonction))
    }

    setFilteredContacts(filtered)
  }, [searchTerm, contacts, activeFilters])

  const handleSelectContact = (contactId: number) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    )
  }

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map((contact) => contact.id))
    }
  }

  const handleAddContact = () => {
    setEditingContact(null)
    setShowContactForm(true)
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setShowContactForm(true)
  }

  const handleDeleteContact = (contact: Contact) => {
    setContactToDelete(contact)
    setShowDeleteDialog(true)
  }

  const handleBulkDelete = () => {
    if (selectedContacts.length > 0) {
      setContactToDelete(null)
      setShowDeleteDialog(true)
    }
  }

  const handleDeleteSuccess = () => {
    loadContacts()
    setSelectedContacts([])
    setContactToDelete(null)
  }

  const handleSaveContact = (savedContact: Contact) => {
    loadContacts()
    setShowContactForm(false)
    setEditingContact(null)
  }

  const handleSendMessage = () => {
    setShowMessageDialog(true)
  }

  // Fonction pour afficher le numéro de téléphone dans une fenêtre décorée
  const handleCallContact = (contact: Contact) => {
    setContactToCall(contact)
    setShowCallDialog(true)
  }

  // Fonction pour copier le numéro de téléphone
  const copyPhoneNumber = () => {
    if (contactToCall) {
      navigator.clipboard.writeText(contactToCall.telephone)
      toast({
        title: "Copié !",
        description: "Le numéro de téléphone a été copié dans le presse-papiers",
      })
    }
  }

  const getInitials = (prenom: string, nom: string) => {
    const prenomSafe = prenom && typeof prenom === "string" ? prenom.trim() : ""
    const nomSafe = nom && typeof nom === "string" ? nom.trim() : ""

    if (!prenomSafe || !nomSafe) {
      return prenomSafe
        ? prenomSafe.charAt(0).toUpperCase() + "?"
        : nomSafe
          ? "?" + nomSafe.charAt(0).toUpperCase()
          : "??"
    }

    return `${prenomSafe.charAt(0)}${nomSafe.charAt(0)}`.toUpperCase()
  }

  const formatDate = (contactId: number) => {
    const dates = ["15 May 2020 8:00 am", "15 May 2020 9:30 am", "15 May 2020 8:30 am"]
    return dates[contactId % dates.length]
  }

  const getActiveFiltersCount = () => {
    return activeFilters.fonction.length
  }

  // Trouver le nom de l'entreprise à partir de l'id (supporte nom ou raisonSocial)
  const getEntrepriseName = (id: number) => {
    const ent = entreprises.find((e) => e.id === id)
    return ent ? (ent.nom ?? ent.raisonSocial ?? "") : ""
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Contacts</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)} className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {getActiveFiltersCount() > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 text-white justify-center text-center">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
            <Button size="sm" onClick={handleAddContact}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter nouveau contact
            </Button>
          </div>
        </div>

        {getActiveFiltersCount() > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Filtres actifs:</span>
            {activeFilters.fonction.map((filter) => (
              <Badge key={filter} variant="secondary" className="gap-1">
                Fonction: {filter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      fonction: prev.fonction.filter((f) => f !== filter),
                    }))
                  }
                />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setActiveFilters({ fonction: [] })}>
              Effacer tout
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Contacts ({filteredContacts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {selectedContacts.length > 0 && (
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <span className="text-sm text-blue-700">{selectedContacts.length} contact(s) sélectionné(s)</span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSendMessage}>
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer un message
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                  {/* Afficher le bouton Ajouter historique seulement si exactement 1 contact est sélectionné */}
                  {selectedContacts.length === 1 && (
                    <AddHistoriqueDialog
                      entrepriseId={filteredContacts.find((c) => c.id === selectedContacts[0])?.entreprise_id ?? 0}
                      contactId={selectedContacts[0]}
                      utilisateurId={utilisateur?.id ?? 1}
                      campagnes={campagnes}
                      entreprises={entreprises}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Fonction</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => handleSelectContact(contact.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(contact.prenom, contact.nom)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {contact.prenom} {contact.nom}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{contact.id.toString().padStart(7, "0")}</TableCell>
                      <TableCell className="text-blue-600">{contact.email}</TableCell>
                      <TableCell>{contact.telephone}</TableCell>
                      <TableCell className="text-gray-600">{contact.adresse}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{contact.fonction}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{getEntrepriseName(contact.entreprise_id)}</TableCell>
                      <TableCell className="text-gray-600">{formatDate(contact.id)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <ContactHistoryDialog
                              contactId={contact.id}
                              contactName={`${contact.prenom} ${contact.nom}`}
                            >
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <History className="h-4 w-4 mr-2" />
                                Voir l'historique
                              </DropdownMenuItem>
                            </ContactHistoryDialog>
                            <DropdownMenuItem onClick={() => handleCallContact(contact)}>
                              <Phone className="h-4 w-4 mr-2" />
                              Appeler
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowMessageDialog(true)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Envoyer un message
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier contact
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteContact(contact)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredContacts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun contact trouvé</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog pour afficher le numéro de téléphone */}
        <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                Appeler le contact
              </DialogTitle>
            </DialogHeader>
            {contactToCall && (
              <div className="space-y-6">
                {/* Informations du contact */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                      {getInitials(contactToCall.prenom, contactToCall.nom)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {contactToCall.prenom} {contactToCall.nom}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {contactToCall.fonction}
                    </p>
                    <p className="text-gray-600">{getEntrepriseName(contactToCall.entreprise_id)}</p>
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div className="text-center space-y-4">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Numéro de téléphone</p>
                    <p className="text-3xl font-bold text-green-700 tracking-wider">{contactToCall.telephone}</p>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={copyPhoneNumber}
                      variant="outline"
                      className="flex items-center gap-2 hover:bg-blue-50 bg-transparent"
                    >
                      <Copy className="h-4 w-4" />
                      Copier
                    </Button>
                    <Button
                      onClick={() => setShowCallDialog(false)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Fermer
                    </Button>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="text-center text-sm text-gray-500 border-t pt-4">
                  <p>💡 Vous pouvez copier le numéro et l'utiliser dans votre application d'appel</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ContactForm
          open={showContactForm}
          onOpenChange={setShowContactForm}
          contact={editingContact}
          onSave={handleSaveContact}
        />

        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteSuccess}
          contactName={contactToDelete ? `${contactToDelete.prenom} ${contactToDelete.nom}` : ""}
          isMultiple={selectedContacts.length > 1 || (selectedContacts.length > 0 && !contactToDelete)}
          count={selectedContacts.length}
          contactId={contactToDelete?.id}
          contactIds={selectedContacts}
        />

        <SendMessageDialog
          open={showMessageDialog}
          onOpenChange={setShowMessageDialog}
          selectedContacts={
            selectedContacts.length > 0 ? filteredContacts.filter((c) => selectedContacts.includes(c.id)) : []
          }
        />

        <FilterDialog
          open={showFilterDialog}
          onOpenChange={setShowFilterDialog}
          contacts={contacts}
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
        />
      </div>
    </div>
  )
}
