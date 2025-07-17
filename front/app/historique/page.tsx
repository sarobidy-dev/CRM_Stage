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
import { createHistorique, deleteHistorique, getAllHistoriques, updateHistorique } from "@/service/historiqueAction.service"
import { HistoriqueAction } from "@/types/HistoriqueAction.type"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Progress } from "@/components/ui/progress"

export default function HistoriquePage() {
  const [historiques, setHistoriques] = useState<HistoriqueAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentHistorique, setCurrentHistorique] = useState<HistoriqueAction | null>(null)
  const [formData, setFormData] = useState({
    date: "",
    commentaire: "",
    action: "",
    pourcentageVente: 0,
    entreprise_id: 1,
    campagne_id: 1,
    utilisateur_id: 1,
  })

  useEffect(() => {
    reloadHistoriques()
  }, [])

  const reloadHistoriques = async () => {
    setIsLoading(true)
    try {
      const res = await getAllHistoriques()
      setHistoriques(res.data)
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les historiques", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddHistorique = () => {
    setCurrentHistorique(null)
    setFormData({
      date: "",
      commentaire: "",
      action: "",
      pourcentageVente: 0,
      entreprise_id: 1,
      campagne_id: 1,
      utilisateur_id: 1,
    })
    setIsAddModalOpen(true)
  }

  const handleEditHistorique = (historique: HistoriqueAction) => {
    setCurrentHistorique(historique)
    setFormData({
      date: historique.date,
      commentaire: historique.commentaire || "",
      action: historique.action,
      pourcentageVente: historique.pourcentageVente || 0,
      entreprise_id: historique.entreprise_id,
      campagne_id: historique.campagne_id,
      utilisateur_id: historique.utilisateur_id,
    })
    setIsEditModalOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "pourcentageVente" ? parseFloat(value) : value }))
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createHistorique(formData)
      toast({ title: "Succès", description: "Historique ajouté avec succès" })
      setIsAddModalOpen(false)
      reloadHistoriques()
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ajouter l'historique", variant: "destructive" })
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentHistorique) return
    try {
      await updateHistorique(currentHistorique.id, formData)
      toast({ title: "Succès", description: "Historique modifié avec succès" })
      setIsEditModalOpen(false)
      reloadHistoriques()
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier l'historique", variant: "destructive" })
    }
  }

  const handleDeleteHistorique = async (id: number) => {
    try {
      await deleteHistorique(id)
      toast({ title: "Succès", description: "Historique supprimé avec succès" })
      reloadHistoriques()
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer l'historique", variant: "destructive" })
    }
  }

  const chartData = historiques.map(h => ({
    name: h.action,
    pourcentageVente: h.pourcentageVente ?? 0,
  }))

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-1 p-6 space-y-8">
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historiques d'action</h1>
            <p className="text-gray-600">Nombre total : <span className="font-bold">{historiques.length}</span></p>
          </div>
          <Button onClick={handleAddHistorique} className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouvel historique
          </Button>
        </section>

        {/* Diagramme */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Diagramme des probabilités de vente</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="pourcentageVente" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Liste */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Liste des historiques</h2>
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Chargement des historiques...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historiques.length === 0 && (
                <div className="col-span-full text-center p-4 text-gray-500">
                  Aucun historique trouvé.
                </div>
              )}
              {historiques.map((h) => (
                <div key={h.id} className="border rounded-lg p-4 bg-gray-50 shadow flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-700">{h.action}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditHistorique(h)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteHistorique(h.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Date : <span className="font-medium">{h.date}</span></div>
                  <div className="text-sm text-gray-600">Commentaire : <span className="font-medium">{h.commentaire || "-"}</span></div>
                  <div className="text-sm text-gray-600">Pourcentage Vente :</div>
                  <Progress value={h.pourcentageVente ?? 0} className="h-2" />
                  <div className="text-xs text-right text-gray-500">
                    {h.pourcentageVente ?? 0}%
                  </div>
                  <div className="text-sm text-gray-600">Entreprise ID : <span className="font-medium">{h.entreprise_id}</span></div>
                  <div className="text-sm text-gray-600">Campagne ID : <span className="font-medium">{h.campagne_id}</span></div>
                  <div className="text-sm text-gray-600">Utilisateur ID : <span className="font-medium">{h.utilisateur_id}</span></div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modals inchangés */}
        {/* ... [Les deux Dialogs sont inchangés, tu peux garder ceux de ton code actuel] ... */}
      </main>
    </div>
  )
}
