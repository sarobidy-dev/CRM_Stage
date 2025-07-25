"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { Building2, Users, Plus, Search, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import type { Entreprise } from "@/types/Entreprise.type"
import type { Adresse } from "@/types/Adresse.type"
import type { Utilisateur } from "@/types/Utilisateur.type"
import { createEntreprise, deleteEntreprise, getAllEntreprises, updateEntreprise } from "@/service/Entreprise.service"
import { getAllAdresses, postAdresse } from "@/service/Adresse.service"
import { fetchUtilisateurs } from "@/service/Utlisateur.service"

export default function EntreprisesPage() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])
  const [adresses, setAdresses] = useState<Adresse[]>([])
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [filteredEntreprises, setFilteredEntreprises] = useState<Entreprise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddAdresseOpen, setIsAddAdresseOpen] = useState(false)
  const [currentEntreprise, setCurrentEntreprise] = useState<Entreprise | null>(null)
  const [formData, setFormData] = useState({
    raisonSocial: "",
    adresse_id: null as number | null,
    telephoneStandard: "",
    emailStandart: "",
    utilisateur_id: null as number | null,
  })
  const [adresseForm, setAdresseForm] = useState({
    ligneAdresse1: "",
    ligneAdresse2: "",
    ville: "",
    cp: "",
    pays: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [entrepriseRes, adresseRes, utilisateurRes] = await Promise.all([
          getAllEntreprises(),
          getAllAdresses(),
          fetchUtilisateurs(),
        ])

        console.log("Données chargées:", { entrepriseRes, adresseRes, utilisateurRes })

        setEntreprises(Array.isArray(entrepriseRes) ? entrepriseRes : [])
        setAdresses(Array.isArray(adresseRes?.data) ? adresseRes.data : Array.isArray(adresseRes) ? adresseRes : [])
        setUtilisateurs(Array.isArray(utilisateurRes) ? utilisateurRes : [])
      } catch (error) {
        console.error("Erreur lors du chargement:", error)
        toast({ title: "Erreur", description: "Erreur lors du chargement des données", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const reloadEntreprises = async () => {
    try {
      const res = await getAllEntreprises()
      setEntreprises(Array.isArray(res) ? res : [])
    } catch (error) {
      console.error("Erreur reload entreprises:", error)
      toast({ title: "Erreur", description: "Impossible de recharger les entreprises", variant: "destructive" })
    }
  }

  const reloadAdresses = async () => {
    try {
      const res = await getAllAdresses()
      setAdresses(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [])
    } catch (error) {
      console.error("Erreur reload adresses:", error)
      toast({ title: "Erreur", description: "Impossible de recharger les adresses", variant: "destructive" })
    }
  }

  useEffect(() => {
    let filtered = [...entreprises]
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter((e) => {
        const adresseStr = formatAdresse(getAdresseById(e.adresse_id)).toLowerCase()
        const utilisateur = getUtilisateurById(e.utilisateur_id)
        const utilisateurStr = utilisateur ? `${utilisateur.nom}`.toLowerCase() : ""

        return (
          e.raisonSocial.toLowerCase().includes(search) ||
          (e.telephoneStandard?.toLowerCase().includes(search) ?? false) ||
          (e.emailStandart?.toLowerCase().includes(search) ?? false) ||
          adresseStr.includes(search) ||
          utilisateurStr.includes(search)
        )
      })
    }
    setFilteredEntreprises(filtered)
  }, [entreprises, searchTerm, adresses, utilisateurs])

  const getAdresseById = (id: number | null | undefined) => adresses.find((a) => a.id === id)

  const getUtilisateurById = (id: number | null | undefined) => {
    if (!id) return null
    return utilisateurs.find((u) => u.id === id || u.id_utilisateur === id)
  }

  const formatAdresse = (adresse?: Adresse) =>
    adresse
      ? [adresse.ligneAdresse1, adresse.ligneAdresse2, adresse.ville, adresse.cp, adresse.pays]
          .filter(Boolean)
          .join(", ")
      : "-"

  const formatUtilisateur = (utilisateur?: Utilisateur | null) => {
    if (!utilisateur) return "-"
    return `${utilisateur.nom} `.trim()
  }

  const handleAddEntreprise = () => {
    setCurrentEntreprise(null)
    setFormData({
      raisonSocial: "",
      adresse_id: null,
      telephoneStandard: "",
      emailStandart: "",
      utilisateur_id: null,
    })
    setIsAddModalOpen(true)
  }

  const handleEditEntreprise = (entreprise: Entreprise) => {
    setCurrentEntreprise(entreprise)
    setFormData({
      raisonSocial: entreprise.raisonSocial,
      adresse_id: entreprise.adresse_id,
      telephoneStandard: entreprise.telephoneStandard || "",
      emailStandart: entreprise.emailStandart || "",
      utilisateur_id: entreprise.utilisateur_id || null,
    })
    setIsEditModalOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("Données à envoyer:", formData)
      await createEntreprise(formData)
      toast({ title: "Succès", description: "Entreprise ajoutée avec succès" })
      setIsAddModalOpen(false)
      reloadEntreprises()
    } catch (error: any) {
      console.error("Erreur création:", error)
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'ajouter l'entreprise",
        variant: "destructive",
      })
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentEntreprise) return

    try {
      console.log("Données à modifier:", formData)
      await updateEntreprise(currentEntreprise.id, formData)
      toast({ title: "Succès", description: "Entreprise modifiée avec succès" })
      setIsEditModalOpen(false)
      reloadEntreprises()
    } catch (error: any) {
      console.error("Erreur modification:", error)
      const errorMessage = error?.message || "Impossible de modifier l'entreprise"
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    }
  }

  const handleDeleteEntreprise = async (id: number) => {
    try {
      console.log("Suppression entreprise ID:", id)
      await deleteEntreprise(id)
      toast({ title: "Succès", description: "Entreprise supprimée avec succès" })
      reloadEntreprises()
    } catch (error: any) {
      console.error("Erreur suppression:", error)
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de supprimer l'entreprise",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdresseChange = (adresseId: number | null) => {
    setFormData((prev) => ({ ...prev, adresse_id: adresseId }))
  }

  const handleUtilisateurChange = (utilisateurId: number | null) => {
    setFormData((prev) => ({ ...prev, utilisateur_id: utilisateurId }))
  }

  const handleAdresseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAdresseForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitAdresse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await postAdresse(adresseForm)
      toast({ title: "Succès", description: "Adresse ajoutée avec succès" })
      setIsAddAdresseOpen(false)
      setAdresseForm({
        ligneAdresse1: "",
        ligneAdresse2: "",
        ville: "",
        cp: "",
        pays: "",
      })
      reloadAdresses()

      if (res?.data?.id) {
        setFormData((prev) => ({ ...prev, adresse_id: res.data.id }))
      }
    } catch (error: any) {
      console.error("Erreur ajout adresse:", error)
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'ajouter l'adresse",
        variant: "destructive",
      })
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Entreprises</h1>
            <p className="text-gray-600">Gérez toutes vos entreprises clientes</p>
          </div>
          <Button onClick={handleAddEntreprise}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle entreprise
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total entreprises</p>
                  <p className="text-2xl font-bold">{filteredEntreprises.length}</p>
                </div>
                <Building2 className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total utilisateurs</p>
                  <p className="text-2xl font-bold">{utilisateurs.length}</p>
                </div>
                <Users className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-md shadow">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Raison sociale</th>
                <th className="text-left p-3">Adresse</th>
                <th className="text-left p-3">Téléphone</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Utilisateur</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntreprises.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    Aucune entreprise trouvée.
                  </td>
                </tr>
              )}
              {filteredEntreprises.map((entreprise) => {
                const adresse = getAdresseById(entreprise.adresse_id)
                const utilisateur = getUtilisateurById(entreprise.utilisateur_id)
                return (
                  <tr key={entreprise.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{entreprise.raisonSocial}</td>
                    <td className="p-3">{formatAdresse(adresse)}</td>
                    <td className="p-3">{entreprise.telephoneStandard || "-"}</td>
                    <td className="p-3">{entreprise.emailStandart || "-"}</td>
                    <td className="p-3">{formatUtilisateur(utilisateur)}</td>
                    <td className="p-3 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditEntreprise(entreprise)}>
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
                              Êtes-vous sûr de vouloir supprimer l'entreprise "{entreprise.raisonSocial}" ? Cette action
                              est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteEntreprise(entreprise.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Modal ajout entreprise */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une entreprise</DialogTitle>
              <DialogDescription>Remplissez le formulaire pour ajouter une nouvelle entreprise.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <Label htmlFor="raisonSocial">Raison sociale</Label>
                <Input
                  id="raisonSocial"
                  name="raisonSocial"
                  value={formData.raisonSocial}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.adresse_id !== null ? String(formData.adresse_id) : ""}
                    onValueChange={(val) => handleAdresseChange(val ? Number(val) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une adresse" />
                    </SelectTrigger>
                    <SelectContent side="bottom" alignOffset={-4}>
                      {adresses.map((adresse) => (
                        <SelectItem key={adresse.id} value={adresse.id.toString()}>
                          {formatAdresse(adresse)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setIsAddAdresseOpen(true)}>
                    + Ajouter adresse
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="telephoneStandard">Téléphone</Label>
                <Input
                  id="telephoneStandard"
                  name="telephoneStandard"
                  value={formData.telephoneStandard}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="emailStandart">Email</Label>
                <Input
                  id="emailStandart"
                  name="emailStandart"
                  type="email"
                  value={formData.emailStandart}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="utilisateur">Utilisateur</Label>
                <Select
                  value={formData.utilisateur_id !== null ? String(formData.utilisateur_id) : ""}
                  onValueChange={(val) => handleUtilisateurChange(val ? Number(val) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent side="bottom" alignOffset={-4}>
                    {utilisateurs.map((utilisateur) => (
                      <SelectItem key={utilisateur.id} value={utilisateur.id.toString()}>
                        {formatUtilisateur(utilisateur)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal modification entreprise */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'entreprise</DialogTitle>
              <DialogDescription>Modifiez les informations de l'entreprise.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <Label htmlFor="raisonSocialEdit">Raison sociale</Label>
                <Input
                  id="raisonSocialEdit"
                  name="raisonSocial"
                  value={formData.raisonSocial}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="adresseEdit">Adresse</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.adresse_id !== null ? String(formData.adresse_id) : ""}
                    onValueChange={(val) => handleAdresseChange(val ? Number(val) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une adresse" />
                    </SelectTrigger>
                    <SelectContent side="bottom" alignOffset={-4}>
                      {adresses.map((adresse) => (
                        <SelectItem key={adresse.id} value={adresse.id.toString()}>
                          {formatAdresse(adresse)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setIsAddAdresseOpen(true)}>
                    + Ajouter adresse
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="telephoneStandardEdit">Téléphone</Label>
                <Input
                  id="telephoneStandardEdit"
                  name="telephoneStandard"
                  value={formData.telephoneStandard}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="emailStandartEdit">Email</Label>
                <Input
                  id="emailStandartEdit"
                  name="emailStandart"
                  type="email"
                  value={formData.emailStandart}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="utilisateurEdit">Utilisateur</Label>
                <Select
                  value={formData.utilisateur_id !== null ? String(formData.utilisateur_id) : ""}
                  onValueChange={(val) => handleUtilisateurChange(val ? Number(val) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent side="bottom" alignOffset={-4}>
                    {utilisateurs.map((utilisateur) => (
                      <SelectItem key={utilisateur.id} value={utilisateur.id.toString()}>
                        {formatUtilisateur(utilisateur)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Modifier</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal ajout adresse */}
        <Dialog open={isAddAdresseOpen} onOpenChange={setIsAddAdresseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une adresse</DialogTitle>
              <DialogDescription>Remplissez les champs pour ajouter une nouvelle adresse.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdresse} className="space-y-3">
              <div>
                <Label htmlFor="ligneAdresse1">Ligne adresse 1</Label>
                <Input
                  id="ligneAdresse1"
                  name="ligneAdresse1"
                  value={adresseForm.ligneAdresse1}
                  onChange={handleAdresseInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ligneAdresse2">Ligne adresse 2</Label>
                <Input
                  id="ligneAdresse2"
                  name="ligneAdresse2"
                  value={adresseForm.ligneAdresse2}
                  onChange={handleAdresseInputChange}
                />
              </div>
              <div>
                <Label htmlFor="ville">Ville</Label>
                <Input id="ville" name="ville" value={adresseForm.ville} onChange={handleAdresseInputChange} required />
              </div>
              <div>
                <Label htmlFor="cp">Code postal</Label>
                <Input id="cp" name="cp" value={adresseForm.cp} onChange={handleAdresseInputChange} required />
              </div>
              <div>
                <Label htmlFor="pays">Pays</Label>
                <Input id="pays" name="pays" value={adresseForm.pays} onChange={handleAdresseInputChange} required />
              </div>
              <DialogFooter>
                <Button type="submit">Ajouter adresse</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
