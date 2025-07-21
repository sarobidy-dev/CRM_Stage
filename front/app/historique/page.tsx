"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/components/navbarLink/nav"
import { deleteHistorique, getAllHistoriques } from "@/service/historiqueAction.service"
import { HistoriqueAction } from "@/types/historiqueAction.type"
import { Progress } from "@/components/ui/progress"
import { getAllCampagnes } from "@/service/campagne.service"
import { Campagne } from "@/types/campagne.type"

export default function HistoriquePage() {
  const [historiques, setHistoriques] = useState<HistoriqueAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [selectedHistorique, setSelectedHistorique] = useState<HistoriqueAction | null>(null)
  const [campagnes, setCampagnes] = useState<Campagne[]>([])

  const reloadCampagnes = async () => {
    try {
      const res = await getAllCampagnes()
      setCampagnes(res.data)
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les campagnes", variant: "destructive" })
    }
  }

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

  useEffect(() => {
    reloadCampagnes()
    reloadHistoriques()
  }, [])

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return
    try {
      await deleteHistorique(deleteConfirmId)
      toast({ title: "Succès", description: "Historique supprimé" })
      reloadHistoriques()
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer l'historique", variant: "destructive" })
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const groupedHistoriques = {
    appel: historiques.filter(h => h.action.toLowerCase().includes("appel")),
    email: historiques.filter(h => h.action.toLowerCase().includes("email")),
    reunion: historiques.filter(h => h.action.toLowerCase().includes("réunion")),
  }

  const renderSection = (title: string, data: HistoriqueAction[]) => (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-primary">{title} ({data.length})</h2>
      <div className="bg-white rounded-lg shadow p-6 w-full overflow-x-auto">
        {isLoading ? (
          <p className="text-center text-gray-500 text-lg">Chargement...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">Aucun historique {title.toLowerCase()} trouvé.</p>
        ) : (
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
              <tr>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Commentaire</th>
                <th className="px-4 py-2">Entreprise</th>
                <th className="px-4 py-2">Campagne</th>
                <th className="px-4 py-2">Utilisateur</th>
                <th className="px-4 py-2">Pourcentage Vente</th>
                <th className="px-4 py-2">Suppression</th>
              </tr>
            </thead>
            <tbody>
              {data.map((h) => (
                <tr key={h.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-semibold text-blue-700">{h.action}</td>
                  <td className="px-4 py-2">{new Date(h.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{h.commentaire || <em>-</em>}</td>
                  <td className="px-4 py-2 text-indigo-600">{h.entreprise?.nom ?? `ID ${h.entreprise_id}`}</td>
                  <td className="px-4 py-2 text-teal-600">{h.campagne?.libelle ?? `ID ${h.campagne_id}`}</td>
                  <td className="px-4 py-2 text-orange-600">{h.utilisateur?.nom ?? `ID ${h.utilisateur_id}`}</td>
                  <td className="px-4 py-2">
                    <div className="mb-1">{h.pourcentageVente ?? 0}%</div>
                    <Progress value={h.pourcentageVente ?? 0} className="h-2 w-24 rounded" />
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedHistorique(h)}
                      aria-label={`Voir l'historique ${h.id}`}
                    >
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteConfirmId(h.id)}
                      aria-label={`Supprimer l'historique ${h.action}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 p-8 w-full">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-primary mb-2">Historiques d'action</h1>
          <p className="text-muted-foreground">
            Total : <span className="font-semibold text-accent-foreground">{historiques.length}</span>
          </p>
        </header>

        {renderSection("Appels", groupedHistoriques.appel)}
        {renderSection("Emails", groupedHistoriques.email)}
        {renderSection("Réunions", groupedHistoriques.reunion)}

     
        <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
            </DialogHeader>
            <p>Êtes-vous sûr de vouloir supprimer cet historique ? Cette action est irréversible.</p>
            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>Annuler</Button>
              <Button variant="destructive" onClick={confirmDelete}>Supprimer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={selectedHistorique !== null} onOpenChange={() => setSelectedHistorique(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détail de l’historique</DialogTitle>
            </DialogHeader>
            {selectedHistorique && (
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Action :</strong> {selectedHistorique.action}</p>
                <p><strong>Date :</strong> {new Date(selectedHistorique.date).toLocaleString()}</p>
                <p><strong>Commentaire :</strong> {selectedHistorique.commentaire || <em>Aucun</em>}</p>
                <p><strong>Entreprise :</strong> {selectedHistorique.entreprise?.nom ?? `ID ${selectedHistorique.entreprise_id}`}</p>
                <p><strong>Campagne :</strong> {selectedHistorique.campagne?.libelle ?? `ID ${selectedHistorique.campagne_id}`}</p>
                <p><strong>Utilisateur :</strong> {selectedHistorique.utilisateur?.nom ?? `ID ${selectedHistorique.utilisateur_id}`}</p>
                <p><strong>Pourcentage vente :</strong> {selectedHistorique.pourcentageVente ?? 0}%</p>
              </div>
            )}
            <DialogFooter className="flex justify-end pt-4">
              <Button onClick={() => setSelectedHistorique(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
