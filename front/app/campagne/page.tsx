"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Edit, Trash2, Plus, Search, Target, FolderOpen, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/components/navbarLink/nav"
import { createCampagne, getAllCampagnes, updateCampagne, deleteCampagne } from "@/service/campagne.service"
import { getAllProjetsProspection } from "@/service/projetProspection.service"
import type { Campagne } from "@/types/campagne.type"
import type { ProjetProspection } from "@/types/projetProspection.type"

export default function CampagnePage() {
  const [campagnes, setCampagnes] = useState<Campagne[]>([])
  const [projetsProspection, setProjetsProspection] = useState<ProjetProspection[]>([])
  const [filteredCampagnes, setFilteredCampagnes] = useState<Campagne[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentCampagne, setCurrentCampagne] = useState<Campagne | null>(null)
  const [formData, setFormData] = useState({
    libelle: "",
    description: "",
    projetProspection_id: null as number | null,
  })

  useEffect(() => {
    loadData()
  }, [])

  // Filtrage par recherche
  useEffect(() => {
    let filtered = [...campagnes]
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((campagne) => {
        const projetNom = getProjetNomById(campagne.projetProspection_id)?.toLowerCase() || ""
        return (
          campagne.libelle.toLowerCase().includes(search) ||
          (campagne.description?.toLowerCase().includes(search) ?? false) ||
          projetNom.includes(search)
        )
      })
    }
    setFilteredCampagnes(filtered)
  }, [campagnes, searchTerm, projetsProspection])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [campagnesRes, projetsRes] = await Promise.all([getAllCampagnes(), getAllProjetsProspection()])

      setCampagnes(Array.isArray(campagnesRes.data) ? campagnesRes.data : [])
      setProjetsProspection(Array.isArray(projetsRes) ? projetsRes : [])
    } catch (error) {
      console.error("Erreur lors du chargement:", error)
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const reloadCampagnes = async () => {
    try {
      const res = await getAllCampagnes()
      setCampagnes(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Erreur reload campagnes:", error)
      toast({ title: "Erreur", description: "Impossible de charger les campagnes", variant: "destructive" })
    }
  }

  const getProjetNomById = (id: number | null | undefined) => {
    if (!id) return "-"
    const projet = projetsProspection.find((p) => p.id === id)
    return projet ? projet.projet : `Projet #${id}`
  }

  const handleAddCampagne = () => {
    setCurrentCampagne(null)
    setFormData({ libelle: "", description: "", projetProspection_id: null })
    setIsAddModalOpen(true)
  }

  const handleEditCampagne = (campagne: Campagne) => {
    setCurrentCampagne(campagne)
    setFormData({
      libelle: campagne.libelle,
      description: campagne.description || "",
      projetProspection_id: campagne.projetProspection_id,
    })
    setIsEditModalOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProjetChange = (projetId: string) => {
    setFormData((prev) => ({ ...prev, projetProspection_id: projetId ? Number(projetId) : null }))
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.libelle.trim()) {
      toast({ title: "Erreur", description: "Le libellé est requis", variant: "destructive" })
      return
    }

    if (!formData.projetProspection_id) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un projet de prospection", variant: "destructive" })
      return
    }

    try {
      await createCampagne(formData)
      toast({ title: "Succès", description: "Campagne ajoutée avec succès" })
      setIsAddModalOpen(false)
      reloadCampagnes()
    } catch (error: any) {
      console.error("Erreur création:", error)
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'ajouter la campagne",
        variant: "destructive",
      })
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCampagne) return

    if (!formData.libelle.trim()) {
      toast({ title: "Erreur", description: "Le libellé est requis", variant: "destructive" })
      return
    }

    if (!formData.projetProspection_id) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un projet de prospection", variant: "destructive" })
      return
    }

    try {
      await updateCampagne(currentCampagne.id, formData)
      toast({ title: "Succès", description: "Campagne modifiée avec succès" })
      setIsEditModalOpen(false)
      reloadCampagnes()
    } catch (error: any) {
      console.error("Erreur modification:", error)
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de modifier la campagne",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCampagne = async (id: number) => {
    try {
      await deleteCampagne(id)
      toast({ title: "Succès", description: "Campagne supprimée avec succès" })
      reloadCampagnes()
    } catch (error: any) {
      console.error("Erreur suppression:", error)
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de supprimer la campagne",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Chargement des campagnes...</p>
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
              <Target className="h-8 w-8 text-green-600" />
              Campagnes
            </h1>
            <p className="text-gray-600 mt-1">Gérez vos campagnes de prospection et leurs projets associés</p>
          </div>
          <Button onClick={handleAddCampagne} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle campagne
          </Button>
        </div>

        {/* Barre de recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une campagne..."
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
                  <p className="text-sm text-gray-600">Total campagnes</p>
                  <p className="text-2xl font-bold text-green-600">{filteredCampagnes.length}</p>
                </div>
                <Target className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Projets liés</p>
                  <p className="text-2xl font-bold text-blue-600">{projetsProspection.length}</p>
                </div>
                <FolderOpen className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Campagnes actives</p>
                  <p className="text-2xl font-bold text-purple-600">{campagnes.length}</p>
                </div>
                <FileText className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des campagnes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Liste des campagnes ({filteredCampagnes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ID</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Projet de prospection</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampagnes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        {searchTerm ? "Aucune campagne trouvée pour cette recherche" : "Aucune campagne"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCampagnes.map((campagne) => (
                      <TableRow key={campagne.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            #{campagne.id}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{campagne.libelle}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-600 max-w-md truncate">
                            {campagne.description || <span className="italic text-gray-400">Aucune description</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {getProjetNomById(campagne.projetProspection_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditCampagne(campagne)}>
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
                                    Êtes-vous sûr de vouloir supprimer la campagne "{campagne.libelle}" ? Cette action
                                    est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteCampagne(campagne.id)}>
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

        {/* Modal ajout campagne */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ajouter une campagne
              </DialogTitle>
              <DialogDescription>Remplissez les informations pour créer une nouvelle campagne.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="libelle">Libellé *</Label>
                <Input
                  id="libelle"
                  name="libelle"
                  value={formData.libelle}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom de la campagne"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description de la campagne (optionnel)"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projetProspection">Projet de prospection *</Label>
                <Select
                  value={formData.projetProspection_id ? String(formData.projetProspection_id) : ""}
                  onValueChange={handleProjetChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un projet de prospection" />
                  </SelectTrigger>
                  <SelectContent>
                    {projetsProspection.length === 0 ? (
                      <SelectItem value="" disabled>
                        Aucun projet disponible
                      </SelectItem>
                    ) : (
                      projetsProspection.map((projet) => (
                        <SelectItem key={projet.id} value={projet.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{projet.projet}</span>
                            {projet.description && (
                              <span className="text-sm text-gray-500 truncate">{projet.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter la campagne</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal modification campagne */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Modifier la campagne
              </DialogTitle>
              <DialogDescription>Modifiez les informations de la campagne.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="libelleEdit">Libellé *</Label>
                <Input
                  id="libelleEdit"
                  name="libelle"
                  value={formData.libelle}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom de la campagne"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionEdit">Description</Label>
                <Textarea
                  id="descriptionEdit"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description de la campagne (optionnel)"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projetProspectionEdit">Projet de prospection *</Label>
                <Select
                  value={formData.projetProspection_id ? String(formData.projetProspection_id) : ""}
                  onValueChange={handleProjetChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un projet de prospection" />
                  </SelectTrigger>
                  <SelectContent>
                    {projetsProspection.length === 0 ? (
                      <SelectItem value="" disabled>
                        Aucun projet disponible
                      </SelectItem>
                    ) : (
                      projetsProspection.map((projet) => (
                        <SelectItem key={projet.id} value={projet.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{projet.projet}</span>
                            {projet.description && (
                              <span className="text-sm text-gray-500 truncate">{projet.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Modifier la campagne</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
