"use client"
import { useState, useEffect } from "react"
import type React from "react"

import {
  Building2,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import Navbar from "@/components/navbarLink/nav"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type { Entreprise } from "@/types/Entreprise.type"
import { createEntreprise, deleteEntreprise, getAllEntreprises, updateEntreprise } from "@/service/Entreprise.service"

export default function EntreprisesPage() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])
  const [filteredEntreprises, setFilteredEntreprises] = useState<Entreprise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [secteurFilter, setSecteurFilter] = useState("all")

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentEntreprise, setCurrentEntreprise] = useState<Entreprise | null>(null)
  const [formData, setFormData] = useState({
    nom: "",
    secteur: "",
    adresse: "",
    telephone: "",
    email: "",
  })

  useEffect(() => {
    loadEntreprises()
  }, [])

  useEffect(() => {
    filterEntreprises()
  }, [entreprises, searchTerm, secteurFilter])

  const loadEntreprises = async () => {
    try {
      setIsLoading(true)
      const data = await getAllEntreprises()
      setEntreprises(data)
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les entreprises",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterEntreprises = () => {
    let filtered = entreprises

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (entreprise) =>
          entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entreprise.secteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entreprise.adresse?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrer par secteur
    if (secteurFilter !== "all") {
      filtered = filtered.filter((entreprise) => entreprise.secteur === secteurFilter)
    }

    setFilteredEntreprises(filtered)
  }

  const getSecteurs = () => {
    const secteurs = entreprises.map((e) => e.secteur).filter(Boolean)
    return [...new Set(secteurs)]
  }

  const handleAddEntreprise = () => {
    setFormData({
      nom: "",
      secteur: "",
      adresse: "",
      telephone: "",
      email: "",
    })
    setIsAddModalOpen(true)
  }

  const handleEditEntreprise = (entreprise: Entreprise) => {
    setCurrentEntreprise(entreprise)
    setFormData({
      nom: entreprise.nom,
      secteur: entreprise.secteur || "",
      adresse: entreprise.adresse || "",
      telephone: entreprise.telephone || "",
      email: entreprise.email || "",
    })
    setIsEditModalOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Appeler l'API pour ajouter l'entreprise
      await createEntreprise(formData);
      console.log("Ajout entreprise:", formData)
      toast({
        title: "Succès",
        description: "Entreprise ajoutée avec succès",
      })
      setIsAddModalOpen(false)
      loadEntreprises()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'entreprise",
        variant: "destructive",
      })
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentEntreprise) return

    try {
      // TODO: Appeler l'API pour modifier l'entreprise
      await updateEntreprise(currentEntreprise.id_entreprise, formData);
      console.log("Modification entreprise:", currentEntreprise.id_entreprise, formData)
      toast({
        title: "Succès",
        description: "Entreprise modifiée avec succès",
      })
      setIsEditModalOpen(false)
      loadEntreprises()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'entreprise",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEntreprise = async (entrepriseId: number) => {
    try {
      // TODO: Appeler l'API pour supprimer l'entreprise
      await deleteEntreprise(entrepriseId);
      console.log("Suppression entreprise:", entrepriseId)
      toast({
        title: "Succès",
        description: "Entreprise supprimée avec succès",
      })
      loadEntreprises()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'entreprise",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex-1 p-6">
          <div className="text-center py-10">Chargement des entreprises...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Entreprises</h1>
            <p className="text-gray-600">Gérez toutes vos entreprises clientes</p>
          </div>
          <Button onClick={handleAddEntreprise}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle entreprise
          </Button>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher une entreprise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={secteurFilter} onValueChange={setSecteurFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrer par secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  {getSecteurs().map((secteur) => (
                    <SelectItem key={secteur} value={secteur}>
                      {secteur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total entreprises</p>
                  <p className="text-2xl font-bold">{entreprises.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Secteurs</p>
                  <p className="text-2xl font-bold">{getSecteurs().length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Résultats</p>
                  <p className="text-2xl font-bold">{filteredEntreprises.length}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Actives</p>
                  <p className="text-2xl font-bold">{filteredEntreprises.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des entreprises */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntreprises.map((entreprise) => (
            <Card key={entreprise.id_entreprise} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Link href={`/entreprise/${entreprise.id_entreprise}`} className="flex items-center space-x-3 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{entreprise.nom}</CardTitle>
                      <CardDescription>{entreprise.secteur}</CardDescription>
                    </div>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Actif
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditEntreprise(entreprise)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'entreprise "{entreprise.nom}" ? Cette action est
                                irréversible et supprimera également tous les contacts et opportunités associés.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEntreprise(entreprise.id_entreprise)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{entreprise.adresse}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">ID:</span>
                    <span>{entreprise.id_entreprise}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Contacts</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Opportunités</span>
                    <span className="font-medium">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEntreprises.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise trouvée</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || secteurFilter !== "all"
                  ? "Aucune entreprise ne correspond à vos critères de recherche."
                  : "Commencez par ajouter votre première entreprise."}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une entreprise
              </Button>
            </CardContent>
          </Card>
        )}
        {/* Modal Ajouter Entreprise */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter une entreprise</DialogTitle>
              <DialogDescription>Créez une nouvelle entreprise dans votre CRM</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de l'entreprise *</Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    placeholder="Ex: Tech Solutions"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secteur">Secteur d'activité</Label>
                  <Input
                    id="secteur"
                    name="secteur"
                    value={formData.secteur}
                    onChange={handleInputChange}
                    placeholder="Ex: Technologie"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Textarea
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Adresse complète de l'entreprise"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@entreprise.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter l'entreprise</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Modifier Entreprise */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier l'entreprise</DialogTitle>
              <DialogDescription>Modifiez les informations de l'entreprise {currentEntreprise?.nom}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nom">Nom de l'entreprise *</Label>
                  <Input
                    id="edit-nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    placeholder="Ex: Tech Solutions"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-secteur">Secteur d'activité</Label>
                  <Input
                    id="edit-secteur"
                    name="secteur"
                    value={formData.secteur}
                    onChange={handleInputChange}
                    placeholder="Ex: Technologie"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-adresse">Adresse</Label>
                <Textarea
                  id="edit-adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Adresse complète de l'entreprise"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-telephone">Téléphone</Label>
                  <Input
                    id="edit-telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@entreprise.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Modifier l'entreprise</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
