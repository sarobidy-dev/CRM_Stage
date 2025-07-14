"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, MoreHorizontal, Mail, Phone, Edit, Trash2, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ContactForm } from "@/components/contact-form"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { SendMessageDialog } from "@/components/send-message-dialog"
import { FilterDialog } from "@/components/filter-dialog"
import { getAllContacts } from "@/service/Contact.service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Navbar from "@/components/navbarLink/nav"

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

interface FilterOptions {
  secteur: string[]
  type: string[]
  source: string[]
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Dialog states
  const [showContactForm, setShowContactForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)

  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    secteur: [],
    type: [],
    source: [],
  })

  // Fonction pour construire l'URL de la photo
  const getPhotoUrl = (contact: Contact) => {
    if (!contact.photo_de_profil) {
      return "/placeholder.svg?height=40&width=40"
    }

    // Si c'est déjà une URL complète (http/https)
    if (contact.photo_de_profil.startsWith("http")) {
      return contact.photo_de_profil
    }

    // Si c'est une image base64
    if (contact.photo_de_profil.startsWith("data:image")) {
      return contact.photo_de_profil
    }

    // Si c'est un chemin relatif, construire l'URL complète
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    const cleanPath = contact.photo_de_profil.startsWith("/") ? contact.photo_de_profil : `/${contact.photo_de_profil}`
    return `${baseUrl}${cleanPath}`
  }

  // Charger les contacts depuis l'API
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
      setFilteredContacts(validContacts)
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
      setFilteredContacts(mockContacts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  // Apply filters and search
  useEffect(() => {
    let filtered = contacts.filter(
      (contact) =>
        `${contact.prenom} ${contact.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.telephone.includes(searchTerm),
    )

    // Apply active filters
    if (activeFilters.secteur.length > 0) {
      filtered = filtered.filter((contact) => activeFilters.secteur.includes(contact.secteur))
    }
    if (activeFilters.type.length > 0) {
      filtered = filtered.filter((contact) => activeFilters.type.includes(contact.type))
    }
    if (activeFilters.source.length > 0) {
      filtered = filtered.filter((contact) => activeFilters.source.includes(contact.source))
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
      setSelectedContacts(filteredContacts.map((contact) => contact.id_contact))
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
      setContactToDelete(null) // Pas de contact unique
      setShowDeleteDialog(true)
    }
  }

  // Fonction appelée après suppression réussie
  const handleDeleteSuccess = () => {
    console.log("Suppression réussie, rechargement des contacts...")
    // Recharger les contacts depuis l'API
    loadContacts()
    // Réinitialiser les sélections
    setSelectedContacts([])
    setContactToDelete(null)
  }

  const handleSaveContact = (contactData: any) => {
    console.log("Sauvegarde du contact:", contactData)

    if (editingContact) {
      // Update existing contact
      setContacts((prev) =>
        prev.map((c) => (c.id_contact === editingContact.id_contact ? { ...c, ...contactData } : c)),
      )
    } else {
      // Add new contact
      setContacts((prev) => [...prev, contactData])
    }
    setShowContactForm(false)
    setEditingContact(null)
  }

  const handleSendMessage = () => {
    setShowMessageDialog(true)
  }

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const formatDate = (contactId: number) => {
    const dates = ["15 May 2020 8:00 am", "15 May 2020 9:30 am", "15 May 2020 8:30 am"]
    return dates[contactId % dates.length]
  }

  const getActiveFiltersCount = () => {
    return activeFilters.secteur.length + activeFilters.type.length + activeFilters.source.length
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
        {/* Affichage des erreurs */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Contacts</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email, entreprise..."
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
                <Badge className="ml-2 h-5 w-5 p-0 text-white justify-center text-center ">{getActiveFiltersCount()}</Badge>
              )}
            </Button>
            <Button size="sm" onClick={handleAddContact}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter nouvelle contact
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Filtres actifs:</span>
            {activeFilters.secteur.map((filter) => (
              <Badge key={filter} variant="secondary" className="gap-1">
                Secteur: {filter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      secteur: prev.secteur.filter((s) => s !== filter),
                    }))
                  }
                />
              </Badge>
            ))}
            {activeFilters.type.map((filter) => (
              <Badge key={filter} variant="secondary" className="gap-1">
                Type: {filter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      type: prev.type.filter((t) => t !== filter),
                    }))
                  }
                />
              </Badge>
            ))}
            {activeFilters.source.map((filter) => (
              <Badge key={filter} variant="secondary" className="gap-1">
                Source: {filter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      source: prev.source.filter((s) => s !== filter),
                    }))
                  }
                />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setActiveFilters({ secteur: [], type: [], source: [] })}>
              Effacer tout
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Contacts ({filteredContacts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Actions Bar */}
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
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Contacts Table */}
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
                    <TableHead>Name</TableHead>
                    <TableHead>ID No.</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Fonction</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => {
                    const photoUrl = getPhotoUrl(contact)

                    return (
                      <TableRow key={contact.id_contact}>
                        <TableCell>
                          <Checkbox
                            checked={selectedContacts.includes(contact.id_contact)}
                            onCheckedChange={() => handleSelectContact(contact.id_contact)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={photoUrl || "/placeholder.svg"}
                                alt={`${contact.prenom} ${contact.nom}`}
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                                }}
                              />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {getInitials(contact.prenom, contact.nom)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {contact.prenom} {contact.nom}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {contact.id_contact.toString().padStart(7, "0")}
                        </TableCell>
                        <TableCell className="text-blue-600">{contact.email}</TableCell>
                        <TableCell>{contact.telephone}</TableCell>
                        <TableCell>{contact.entreprise}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{contact.fonction}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{formatDate(contact.id_contact)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setShowMessageDialog(true)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Contact
                              </DropdownMenuItem>
                      
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteContact(contact)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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

        {/* Dialogs */}
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
          contactId={contactToDelete?.id_contact}
          contactIds={selectedContacts}
        />

        <SendMessageDialog
          open={showMessageDialog}
          onOpenChange={setShowMessageDialog}
          selectedContacts={
            selectedContacts.length > 0 ? filteredContacts.filter((c) => selectedContacts.includes(c.id_contact)) : []
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
