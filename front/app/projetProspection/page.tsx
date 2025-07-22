"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { Search, Plus, Edit, Trash2, FolderOpen, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
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
import type { ProjetProspection } from "@/types/projetProspection.type"
import {
  getAllProjetsProspection,
  createProjetProspection,
  updateProjetProspection,
  deleteProjetProspection,
} from "@/service/projetProspection.service"

export default function ProjetsProspectionPage() {
  const [projets, setProjets] = useState<ProjetProspection[]>([])
  const [filteredProjets, setFilteredProjets] = useState<ProjetProspection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentProjet, setCurrentProjet] = useState<ProjetProspection | null>(null)
  const [formData, setFormData] = useState({
    projet: "",
    description: "",
  })

  // Charger les projets depuis l'API
  const loadProjets = async () => {
    try {
      setIsLoading(true)
      const data = await getAllProjetsProspection()
      setProjets(data)
      setFilteredProjets(data)
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des projets de prospection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjets()
  }, [])

  // Filtrage par recherche
  useEffect(() => {
    let filtered = [...projets]
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (projet) => projet.projet.toLowerCase().includes(search) || projet.description.toLowerCase().includes(search),
      )
    }
    setFilteredProjets(filtered)
  }, [projets, searchTerm])

  const handleAddProjet = () => {
    setCurrentProjet(null)
    setFormData({
      projet: "",
      description: "",
    })
    setIsAddModalOpen(true)
  }

  const handleEditProjet = (projet: ProjetProspection) => {
    setCurrentProjet(projet)
    setFormData({
      projet: projet.projet,
      description: projet.description,
    })
    setIsEditModalOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.projet.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du projet est requis",
        variant: "destructive",
      })
      return
    }

    try {
      await createProjetProspection(formData)
      toast({
        title: "Succès",
        description: "Projet de prospection ajouté avec succès",
      })
      setIsAddModalOpen(false)
      loadProjets()
    } catch (error: any) {
      console.error("Erreur création:", error)
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'ajouter le projet de prospection",
        variant: "destructive",
      })
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProjet) return

    if (!formData.projet.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du projet est requis",
        variant: "destructive",
      })
      return
    }

    try {
      await updateProjetProspection(currentProjet.id, formData)
      toast({
        title: "Succès",
        description: "Projet de prospection modifié avec succès",
      })
      setIsEditModalOpen(false)
      loadProjets()
    } catch (error: any) {
      console.error("Erreur modification:", error)
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de modifier le projet de prospection",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProjet = async (id: number) => {
    try {
      await deleteProjetProspection(id)
      toast({
        title: "Succès",
        description: "Projet de prospection supprimé avec succès",
      })
      loadProjets()
    } catch (error: any) {
      console.error("Erreur suppression:", error)
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de supprimer le projet de prospection",
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
      <div className="flex min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Chargement des projets de prospection...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen className="h-8 w-8 text-blue-600" />
              Projets de Prospection
            </h1>
            <p className="text-gray-600 mt-1">Gérez vos projets de prospection et leurs descriptions</p>
          </div>
          <Button onClick={handleAddProjet} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Button>
        </div>

        {/* Barre de recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un projet de prospection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total projets</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredProjets.length}</p>
                </div>
                <FolderOpen className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Projets actifs</p>
                  <p className="text-2xl font-bold text-green-600">{projets.length}</p>
                </div>
                <FileText className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des projets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Liste des projets ({filteredProjets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead>Nom du projet</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        {searchTerm ? "Aucun projet trouvé pour cette recherche" : "Aucun projet de prospection"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjets.map((projet) => (
                      <TableRow key={projet.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            #{projet.id}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{projet.projet}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-600 max-w-md truncate">{projet.description}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditProjet(projet)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer le projet "{projet.projet}" ? Cette action est
                                    irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProjet(projet.id)}>
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal ajout projet */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ajouter un projet de prospection
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau projet de prospection.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projet">Nom du projet *</Label>
                <Input
                  id="projet"
                  name="projet"
                  value={formData.projet}
                  onChange={handleInputChange}
                  placeholder="Ex: Gestion Produit"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez le projet de prospection..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter le projet</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal modification projet */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Modifier le projet de prospection
              </DialogTitle>
              <DialogDescription>Modifiez les informations du projet de prospection.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projetEdit">Nom du projet *</Label>
                <Input
                  id="projetEdit"
                  name="projet"
                  value={formData.projet}
                  onChange={handleInputChange}
                  placeholder="Ex: Gestion Produit"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionEdit">Description</Label>
                <Textarea
                  id="descriptionEdit"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez le projet de prospection..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Modifier le projet</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
