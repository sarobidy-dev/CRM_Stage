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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Trash2, Eye, Calendar, User, Building2, Target } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/components/navbarLink/nav"
import type { Opportunite, CreateOpportuniteData } from "@/types/opportunite.type"
import type { Entreprise } from "@/types/Entreprise.type"
import type { Utilisateur } from "@/types/Utilisateur.type"
import { getOpportunites, createOpportunite, updateOpportunite, deleteOpportunite } from "@/service/Opportunite.service"
import { getAllEntreprises } from "@/service/Entreprise.service"
import { getUtilisateur } from "@/service/Utlisateur.service"

const STATUTS = ["En cours", "Gagné", "Perdu", "En attente", "Qualifié"]
const ETAPES_PIPELINE = ["Prospection", "Qualification", "Proposition", "Négociation", "Conclusion"]

const OpportunitePage = () => {
  const [data, setData] = useState<Opportunite[]>([])
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentOpportunite, setCurrentOpportunite] = useState<Opportunite | null>(null)
  const [formData, setFormData] = useState<CreateOpportuniteData>({
    titre: "",
    description: "",
    date_interaction: "",
    contenu: "",
    date_creation: "",
    prob_abill_suc: 0,
    statut: "",
    etape_pipeline: "",
    id_utilisateur: 0,
    id_entreprise: 0,
  })

  useEffect(() => {
    refreshData()
    loadReferenceData()
  }, [])

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const response = await getOpportunites()
      setData(response || [])
    } catch (err) {
      console.error("Erreur de récupération:", err)
      setData([])
      toast({
        title: "Erreur",
        description: "Impossible de charger les opportunités",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadReferenceData = async () => {
    setIsLoadingData(true)
    try {
      const [entreprisesData, utilisateursData] = await Promise.all([getAllEntreprises(), getUtilisateur()])
      setEntreprises(entreprisesData || [])
      setUtilisateurs(utilisateursData || [])
    } catch (err) {
      console.error("Erreur de récupération des données de référence:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de référence",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const getEntrepriseName = (id_entreprise: number): string => {
    const entreprise = entreprises.find((e) => e.id_entreprise === id_entreprise)
    return entreprise ? entreprise.nom : `Entreprise #${id_entreprise}`
  }

  const getUtilisateurName = (id_utilisateur: number): string => {
    const utilisateur = utilisateurs.find((u) => u.id_utilisateur === id_utilisateur)
    return utilisateur ? `${utilisateur.nom} ${utilisateur.prenom}` : `Utilisateur #${id_utilisateur}`
  }

  const handleAddOpportunite = () => {
    const now = new Date()
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    const today = new Date().toISOString().slice(0, 10)

    setFormData({
      titre: "",
      description: "",
      date_interaction: localDateTime,
      contenu: "",
      date_creation: today,
      prob_abill_suc: 0,
      statut: "",
      etape_pipeline: "",
      id_utilisateur: 0,
      id_entreprise: 0,
    })
    setIsAddModalOpen(true)
  }

  const handleEditOpportunite = (opportunite: Opportunite) => {
    setCurrentOpportunite(opportunite)
    const dateForInput = new Date(opportunite.date_interaction).toISOString().slice(0, 16)

    setFormData({
      titre: opportunite.titre,
      description: opportunite.description,
      date_interaction: dateForInput,
      contenu: opportunite.contenu,
      date_creation: opportunite.date_creation,
      prob_abill_suc: opportunite.prob_abill_suc,
      statut: opportunite.statut,
      etape_pipeline: opportunite.etape_pipeline,
      id_utilisateur: opportunite.id_utilisateur,
      id_entreprise: opportunite.id_entreprise,
    })
    setIsEditModalOpen(true)
  }

  const handleViewOpportunite = (opportunite: Opportunite) => {
    setCurrentOpportunite(opportunite)
    setIsViewModalOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.id_entreprise === 0 || formData.id_utilisateur === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une entreprise et un utilisateur",
        variant: "destructive",
      })
      return
    }

    try {
      await createOpportunite(formData)
      toast({
        title: "Succès",
        description: "Opportunité ajoutée avec succès",
      })
      setIsAddModalOpen(false)
      refreshData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'opportunité",
        variant: "destructive",
      })
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentOpportunite) return

    if (formData.id_entreprise === 0 || formData.id_utilisateur === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une entreprise et un utilisateur",
        variant: "destructive",
      })
      return
    }

    try {
      await updateOpportunite(currentOpportunite.id_opportunite, formData)
      toast({
        title: "Succès",
        description: "Opportunité modifiée avec succès",
      })
      setIsEditModalOpen(false)
      refreshData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'opportunité",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOpportunite = async (opportuniteId: number) => {
    try {
      await deleteOpportunite(opportuniteId)
      toast({
        title: "Succès",
        description: "Opportunité supprimée avec succès",
      })
      refreshData()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'opportunité",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "prob_abill_suc") {
      const numValue = Number.parseInt(value) || 0
      setFormData((prev) => ({ ...prev, [name]: Math.min(100, Math.max(0, numValue)) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "id_entreprise" || name === "id_utilisateur") {
      setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "gagné":
        return "bg-green-100 text-green-800"
      case "perdu":
        return "bg-red-100 text-red-800"
      case "en cours":
        return "bg-blue-100 text-blue-800"
      case "en attente":
        return "bg-yellow-100 text-yellow-800"
      case "qualifié":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEtapeColor = (etape: string) => {
    switch (etape.toLowerCase()) {
      case "prospection":
        return "bg-orange-100 text-orange-800"
      case "qualification":
        return "bg-blue-100 text-blue-800"
      case "proposition":
        return "bg-purple-100 text-purple-800"
      case "négociation":
        return "bg-yellow-100 text-yellow-800"
      case "conclusion":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) return <p className="text-center py-10">Chargement...</p>

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <Navbar />
      <div className="flex flex-col gap-4 p-6 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Gestion des Opportunités</h1>
          <Button onClick={handleAddOpportunite} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ajouter une opportunité
          </Button>
        </div>

        <div className=" flex flex-wrap gap-4 ">
          {data.map((opportunite) => (
            <Card key={opportunite.id_opportunite} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{opportunite.titre}</h3>
                      <Badge className={`${getStatutColor(opportunite.statut)}`}>{opportunite.statut}</Badge>
                      <Badge className={`${getEtapeColor(opportunite.etape_pipeline)}`}>
                        {opportunite.etape_pipeline}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">{getEntrepriseName(opportunite.id_entreprise)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{getUtilisateurName(opportunite.id_utilisateur)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOpportunite(opportunite)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditOpportunite(opportunite)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex items-center gap-1">
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer l'opportunité "{opportunite.titre}" ? Cette action est
                            irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteOpportunite(opportunite.id_opportunite)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700">{opportunite.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Dernière interaction: {formatDate(opportunite.date_interaction)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Probabilité de succès</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{opportunite.prob_abill_suc}%</span>
                    </div>
                    <Progress value={opportunite.prob_abill_suc} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal Ajouter Opportunité */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter une opportunité</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre</Label>
                  <Input id="titre" name="titre" value={formData.titre} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prob_abill_suc">Probabilité de succès (%)</Label>
                  <Input
                    id="prob_abill_suc"
                    name="prob_abill_suc"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.prob_abill_suc}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entreprise">Entreprise</Label>
                  <Select
                    value={formData.id_entreprise.toString()}
                    onValueChange={(value) => handleSelectChange("id_entreprise", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingData ? (
                        <SelectItem value="loading" disabled>
                          Chargement...
                        </SelectItem>
                      ) : (
                        entreprises.map((entreprise) => (
                          <SelectItem key={entreprise.id_entreprise} value={entreprise.id_entreprise.toString()}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              {entreprise.nom}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utilisateur">Utilisateur</Label>
                  <Select
                    value={formData.id_utilisateur.toString()}
                    onValueChange={(value) => handleSelectChange("id_utilisateur", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingData ? (
                        <SelectItem value="loading" disabled>
                          Chargement...
                        </SelectItem>
                      ) : (
                        utilisateurs.map((utilisateur) => (
                          <SelectItem key={utilisateur.id_utilisateur} value={utilisateur.id_utilisateur.toString()}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {utilisateur.nom} {utilisateur.prenom}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statut">Statut</Label>
                  <Select value={formData.statut} onValueChange={(value) => handleSelectChange("statut", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUTS.map((statut) => (
                        <SelectItem key={statut} value={statut}>
                          {statut}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etape_pipeline">Étape du pipeline</Label>
                  <Select
                    value={formData.etape_pipeline}
                    onValueChange={(value) => handleSelectChange("etape_pipeline", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une étape" />
                    </SelectTrigger>
                    <SelectContent>
                      {ETAPES_PIPELINE.map((etape) => (
                        <SelectItem key={etape} value={etape}>
                          {etape}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_creation">Date de création</Label>
                  <Input
                    id="date_creation"
                    name="date_creation"
                    type="date"
                    value={formData.date_creation}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_interaction">Date d'interaction</Label>
                  <Input
                    id="date_interaction"
                    name="date_interaction"
                    type="datetime-local"
                    value={formData.date_interaction}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Modifier Opportunité */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'opportunité</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-titre">Titre</Label>
                  <Input id="edit-titre" name="titre" value={formData.titre} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-prob_abill_suc">Probabilité de succès (%)</Label>
                  <Input
                    id="edit-prob_abill_suc"
                    name="prob_abill_suc"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.prob_abill_suc}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-entreprise">Entreprise</Label>
                  <Select
                    value={formData.id_entreprise.toString()}
                    onValueChange={(value) => handleSelectChange("id_entreprise", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      {entreprises.map((entreprise) => (
                        <SelectItem key={entreprise.id_entreprise} value={entreprise.id_entreprise.toString()}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {entreprise.nom}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-utilisateur">Utilisateur</Label>
                  <Select
                    value={formData.id_utilisateur.toString()}
                    onValueChange={(value) => handleSelectChange("id_utilisateur", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {utilisateurs.map((utilisateur) => (
                        <SelectItem key={utilisateur.id_utilisateur} value={utilisateur.id_utilisateur.toString()}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {utilisateur.nom} {utilisateur.prenom}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-statut">Statut</Label>
                  <Select value={formData.statut} onValueChange={(value) => handleSelectChange("statut", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUTS.map((statut) => (
                        <SelectItem key={statut} value={statut}>
                          {statut}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-etape_pipeline">Étape du pipeline</Label>
                  <Select
                    value={formData.etape_pipeline}
                    onValueChange={(value) => handleSelectChange("etape_pipeline", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une étape" />
                    </SelectTrigger>
                    <SelectContent>
                      {ETAPES_PIPELINE.map((etape) => (
                        <SelectItem key={etape} value={etape}>
                          {etape}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date_creation">Date de création</Label>
                  <Input
                    id="edit-date_creation"
                    name="date_creation"
                    type="date"
                    value={formData.date_creation}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-date_interaction">Date d'interaction</Label>
                  <Input
                    id="edit-date_interaction"
                    name="date_interaction"
                    type="datetime-local"
                    value={formData.date_interaction}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Modifier</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Voir Opportunité */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de l'opportunité</DialogTitle>
            </DialogHeader>
            {currentOpportunite && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Titre</Label>
                    <p className="text-lg font-semibold">{currentOpportunite.titre}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Probabilité de succès</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={currentOpportunite.prob_abill_suc} className="h-2 flex-1" />
                      <span className="text-sm font-bold text-green-600">{currentOpportunite.prob_abill_suc}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="text-gray-800">{currentOpportunite.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Entreprise</Label>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{getEntrepriseName(currentOpportunite.id_entreprise)}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Utilisateur</Label>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{getUtilisateurName(currentOpportunite.id_utilisateur)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Statut</Label>
                    <Badge className={`${getStatutColor(currentOpportunite.statut)} mt-1`}>
                      {currentOpportunite.statut}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Étape du pipeline</Label>
                    <Badge className={`${getEtapeColor(currentOpportunite.etape_pipeline)} mt-1`}>
                      {currentOpportunite.etape_pipeline}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date de création</Label>
                    <p>{formatDateOnly(currentOpportunite.date_creation)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Dernière interaction</Label>
                    <p>{formatDate(currentOpportunite.date_interaction)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Contenu</Label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-md">{currentOpportunite.contenu}</p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setIsViewModalOpen(false)}>Fermer</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default OpportunitePage
