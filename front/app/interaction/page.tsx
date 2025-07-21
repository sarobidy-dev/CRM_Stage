"use client"

import type React from "react"
import { useEffect, useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, FileText, Phone, Mail, Calendar, User, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/components/navbarLink/nav"
import type { Interaction, CreateInteractionData } from "@/types/interaction.type"
import type { Contact } from "@/types/Contact.type"
import { getInteractions, createInteraction, updateInteraction, deleteInteraction } from "@/service/Interaction.service"
import { getAllContacts } from "@/service/Contact.service"

const INTERACTION_TYPES = ["Appel téléphonique", "Email", "Réunion", "Visite", "SMS", "Autre"]

const InteractionPage = () => {
  const [data, setData] = useState<Interaction[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentInteraction, setCurrentInteraction] = useState<Interaction | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState<CreateInteractionData>({
    type: "",
    date_interaction: "",
    contenu: "",
    fichier_joint: "",
    id_contact: 0,
  })

  useEffect(() => {
    refreshData()
    loadContacts()
  }, [])

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const response = await getInteractions()
      setData(response || [])
    } catch (err) {
      console.error("Erreur de récupération:", err)
      setData([])
      toast({
        title: "Erreur",
        description: "Impossible de charger les interactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadContacts = async () => {
    setIsLoadingContacts(true)
    try {
      const response = await getAllContacts()
      setContacts(response || [])
    } catch (err) {
      console.error("Erreur de récupération des contacts:", err)
      setContacts([])
      toast({
        title: "Erreur",
        description: "Impossible de charger les contacts",
        variant: "destructive",
      })
    } finally {
      setIsLoadingContacts(false)
    }
  }

  const getContactName = (id_contact: number): string => {
    const contact = contacts.find((c) => c.id_contact === id_contact)
    return contact ? `${contact.nom} ${contact.prenom}` : `Contact #${id_contact}`
  }

  const handleAddInteraction = () => {
    const now = new Date()
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setFormData({
      type: "",
      date_interaction: localDateTime,
      contenu: "",
      fichier_joint: "",
      id_contact: 0,
    })
    setSelectedFile(null)
    setIsAddModalOpen(true)
  }

  const handleEditInteraction = (interaction: Interaction) => {
    setCurrentInteraction(interaction)
    const dateForInput = new Date(interaction.date_interaction).toISOString().slice(0, 16)
    setFormData({
      type: interaction.type,
      date_interaction: dateForInput,
      contenu: interaction.contenu,
      fichier_joint: interaction.fichier_joint,
      id_contact: interaction.id_contact,
    })
    setSelectedFile(null)
    setIsEditModalOpen(true)
  }

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFormData((prev) => ({ ...prev, fichier_joint: file.name }))
      toast({
        title: "Fichier sélectionné",
        description: `Fichier "${file.name}" prêt à être uploadé`,
      })
    }
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.id_contact === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un contact",
        variant: "destructive",
      })
      return
    }
    setIsUploading(true)
    try {
      await createInteraction(formData, selectedFile || undefined)
      toast({
        title: "Succès",
        description: "Interaction ajoutée avec succès",
      })
      setIsAddModalOpen(false)
      setSelectedFile(null)
      refreshData()
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'interaction",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentInteraction) return
    if (formData.id_contact === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un contact",
        variant: "destructive",
      })
      return
    }
    setIsUploading(true)
    try {
      await updateInteraction(currentInteraction.id_interaction, formData, selectedFile || undefined)
      toast({
        title: "Succès",
        description: "Interaction modifiée avec succès",
      })
      setIsEditModalOpen(false)
      setSelectedFile(null)
      refreshData()
    } catch (error) {
      console.error("Erreur lors de la modification:", error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'interaction",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteInteraction = async (interactionId: number) => {
    try {
      await deleteInteraction(interactionId)
      toast({
        title: "Succès",
        description: "Interaction supprimée avec succès",
      })
      refreshData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'interaction",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "id_contact") {
      setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const getInteractionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "appel téléphonique":
        return <Phone className="w-4 h-4" />
      case "email":
        return <Mail className="w-4 h-4" />
      case "réunion":
        return <Calendar className="w-4 h-4" />
      case "visite":
        return <User className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getInteractionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "appel téléphonique":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "email":
        return "bg-green-100 text-green-800 border-green-200"
      case "réunion":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "visite":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredData = data.filter((interaction) => {
    const contactName = getContactName(interaction.id_contact).toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return (
      interaction.type.toLowerCase().includes(searchLower) ||
      contactName.includes(searchLower) ||
      interaction.contenu.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading) return <p className="text-center py-10">Chargement...</p>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Interactions</h1>
            <p className="text-gray-600 mt-1">Gérez toutes vos interactions clients</p>
          </div>
          <Button onClick={handleAddInteraction} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle interaction
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une interaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <span className="bg-white px-3 py-1 rounded-full border">
              Total: <span className="font-semibold text-gray-900">{filteredData.length}</span>
            </span>
          </div>
        </div>

        {/* Table Container */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex-shrink-0 w-32">Type</div>
                  <div className="flex-shrink-0 w-48">Contact</div>
                  <div className="flex-shrink-0 w-40">Date</div>
                  <div className="flex-1 min-w-0 px-2">Contenu</div>
                  <div className="flex-shrink-0 w-24">Fichier</div>
                  <div className="flex-shrink-0 w-32">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune interaction trouvée</p>
                    </div>
                  </div>
                ) : (
                  filteredData.map((interaction) => (
                    <div
                      key={interaction.id_interaction}
                      className="flex items-center py-4 px-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Type */}
                      <div className="flex-shrink-0 w-32">
                        <Badge className={`flex items-center gap-1 ${getInteractionColor(interaction.type)}`}>
                          {getInteractionIcon(interaction.type)}
                          <span className="truncate text-xs">{interaction.type}</span>
                        </Badge>
                      </div>

                      {/* Contact */}
                      <div className="flex-shrink-0 w-48 px-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-900 truncate">
                            {getContactName(interaction.id_contact)}
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex-shrink-0 w-40 px-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 truncate">
                            {formatDate(interaction.date_interaction)}
                          </span>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0 px-2">
                        <p className="text-sm text-gray-900 truncate" title={interaction.contenu}>
                          {interaction.contenu}
                        </p>
                      </div>

                      {/* Fichier */}
                      <div className="flex-shrink-0 w-24 px-2">
                        {interaction.fichier_joint ? (
                          <a
                            href={`http://127.0.0.1:8000/${interaction.fichier_joint}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                            title="Voir le fichier joint"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        ) : (
                          <div className="w-8 h-8 flex items-center justify-center">
                            <span className="text-gray-300">-</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 w-32">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditInteraction(interaction)}
                            className="h-8 w-8 p-0"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cette interaction ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteInteraction(interaction.id_interaction)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Modal Ajouter Interaction */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter une interaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type d'interaction</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERACTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {getInteractionIcon(type)}
                          {type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Select
                  value={formData.id_contact.toString()}
                  onValueChange={(value) => handleSelectChange("id_contact", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingContacts ? (
                      <SelectItem value="loading" disabled>
                        Chargement des contacts...
                      </SelectItem>
                    ) : contacts.length === 0 ? (
                      <SelectItem value="no-contacts" disabled>
                        Aucun contact disponible
                      </SelectItem>
                    ) : (
                      contacts.map((contact) => (
                        <SelectItem key={contact.id_contact} value={contact.id_contact.toString()}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {contact.nom} {contact.prenom}
                              </span>
                              {contact.email && <span className="text-xs text-gray-500">{contact.email}</span>}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_interaction">Date et heure</Label>
                <Input
                  id="date_interaction"
                  name="date_interaction"
                  type="datetime-local"
                  value={formData.date_interaction}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contenu">Contenu</Label>
                <Textarea
                  id="contenu"
                  name="contenu"
                  value={formData.contenu}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fichier">Fichier joint (optionnel)</Label>
                <Input id="fichier" type="file" onChange={handleFileUpload} disabled={isUploading} />
                {selectedFile && <p className="text-sm text-green-600">Fichier sélectionné: {selectedFile.name}</p>}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Ajout en cours..." : "Ajouter"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Modifier Interaction */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier l'interaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type d'interaction</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERACTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {getInteractionIcon(type)}
                          {type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-contact">Contact</Label>
                <Select
                  value={formData.id_contact.toString()}
                  onValueChange={(value) => handleSelectChange("id_contact", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingContacts ? (
                      <SelectItem value="loading" disabled>
                        Chargement des contacts...
                      </SelectItem>
                    ) : contacts.length === 0 ? (
                      <SelectItem value="no-contacts" disabled>
                        Aucun contact disponible
                      </SelectItem>
                    ) : (
                      contacts.map((contact) => (
                        <SelectItem key={contact.id_contact} value={contact.id_contact.toString()}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {contact.nom} {contact.prenom}
                              </span>
                              {contact.email && <span className="text-xs text-gray-500">{contact.email}</span>}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-date_interaction">Date et heure</Label>
                <Input
                  id="edit-date_interaction"
                  name="date_interaction"
                  type="datetime-local"
                  value={formData.date_interaction}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-contenu">Contenu</Label>
                <Textarea
                  id="edit-contenu"
                  name="contenu"
                  value={formData.contenu}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-fichier">Fichier joint (optionnel)</Label>
                <Input id="edit-fichier" type="file" onChange={handleFileUpload} disabled={isUploading} />
                {formData.fichier_joint && !selectedFile && (
                  <p className="text-sm text-blue-600">Fichier actuel: {formData.fichier_joint}</p>
                )}
                {selectedFile && <p className="text-sm text-green-600">Nouveau fichier: {selectedFile.name}</p>}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Modification en cours..." : "Modifier"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default InteractionPage
