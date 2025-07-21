"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/components/navbarLink/nav"

import { createCampagne, getAllCampagnes, updateCampagne, deleteCampagne } from "@/service/campagne.service"
import { Campagne } from "@/types/campagne.type"

export default function CampagnePage() {
  const [campagnes, setCampagnes] = useState<Campagne[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentCampagne, setCurrentCampagne] = useState<Campagne | null>(null)
  const [formData, setFormData] = useState({
    libelle: "",
    description: "",
    projetProspection_id: 1,
  })

  useEffect(() => {
    reloadCampagnes()
  }, [])

  const reloadCampagnes = async () => {
    setIsLoading(true)
    try {
      const res = await getAllCampagnes()
      setCampagnes(res.data)
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les campagnes", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCampagne = () => {
    setCurrentCampagne(null)
    setFormData({ libelle: "", description: "", projetProspection_id: 1 })
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

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCampagne(formData)
      toast({ title: "Succès", description: "Campagne ajoutée avec succès" })
      setIsAddModalOpen(false)
      reloadCampagnes()
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ajouter la campagne", variant: "destructive" })
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCampagne) return
    try {
      await updateCampagne(currentCampagne.id, formData)
      toast({ title: "Succès", description: "Campagne modifiée avec succès" })
      setIsEditModalOpen(false)
      reloadCampagnes()
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier la campagne", variant: "destructive" })
    }
  }

  const handleDeleteCampagne = async (id: number) => {
    try {
      await deleteCampagne(id)
      toast({ title: "Succès", description: "Campagne supprimée avec succès" })
      reloadCampagnes()
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer la campagne", variant: "destructive" })
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 space-y-8 overflow-x-auto">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campagnes</h1>
            <p className="text-gray-600">Gérez vos campagnes de prospection</p>
          </div>
          <Button onClick={handleAddCampagne} className="flex items-center gap-2 self-start md:self-auto">
            <Plus className="h-5 w-5" />
            Nouvelle campagne
          </Button>
        </section>

        <section className="bg-white rounded-lg shadow p-4 md:p-6 overflow-auto">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Chargement des campagnes...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto md:table-fixed">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-2 md:p-3 font-semibold text-gray-700">Libellé</th>
                    <th className="text-left p-2 md:p-3 font-semibold text-gray-700 hidden sm:table-cell">Description</th>
                    <th className="text-left p-2 md:p-3 font-semibold text-gray-700 hidden md:table-cell">Projet Prospection ID</th>
                    <th className="text-right p-2 md:p-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campagnes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center p-4 text-gray-500">
                        Aucune campagne trouvée.
                      </td>
                    </tr>
                  )}
                  {campagnes.map((campagne) => (
                    <tr key={campagne.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-2 md:p-3 break-words max-w-[150px]">{campagne.libelle}</td>
                      <td className="p-2 md:p-3 hidden sm:table-cell break-words max-w-[250px]">{campagne.description || "-"}</td>
                      <td className="p-2 md:p-3 hidden md:table-cell">{campagne.projetProspection_id}</td>
                      <td className="p-2 md:p-3 text-right space-x-1 md:space-x-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => handleEditCampagne(campagne)}
                          aria-label="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="rounded-full"
                          onClick={() => handleDeleteCampagne(campagne.id)}
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Modal ajout */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une campagne</DialogTitle>
              <DialogDescription>Remplissez le formulaire pour ajouter une nouvelle campagne.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <Label htmlFor="libelle">Libellé</Label>
                <Input
                  id="libelle"
                  name="libelle"
                  value={formData.libelle}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom de la campagne"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description (optionnel)"
                />
              </div>
              <div>
                <Label htmlFor="projetProspection_id">Projet Prospection ID</Label>
                <Input
                  id="projetProspection_id"
                  name="projetProspection_id"
                  type="number"
                  value={formData.projetProspection_id}
                  onChange={handleInputChange}
                  required
                  min={1}
                  placeholder="ID du projet de prospection"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full md:w-auto">Ajouter</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal édition */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la campagne</DialogTitle>
              <DialogDescription>Modifiez les informations de la campagne.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <Label htmlFor="libelleEdit">Libellé</Label>
                <Input
                  id="libelleEdit"
                  name="libelle"
                  value={formData.libelle}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom de la campagne"
                />
              </div>
              <div>
                <Label htmlFor="descriptionEdit">Description</Label>
                <Input
                  id="descriptionEdit"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description (optionnel)"
                />
              </div>
              <div>
                <Label htmlFor="projetProspection_idEdit">Projet Prospection ID</Label>
                <Input
                  id="projetProspection_idEdit"
                  name="projetProspection_id"
                  type="number"
                  value={formData.projetProspection_id}
                  onChange={handleInputChange}
                  required
                  min={1}
                  placeholder="ID du projet de prospection"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full md:w-auto">Modifier</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
