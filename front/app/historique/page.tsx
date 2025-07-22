
// "use client"

// import { getAllEntreprises } from "@/service/Entreprise.service"
// import { fetchUtilisateurs } from "@/service/Utlisateur.service"
// import type { Entreprise } from "@/types/Entreprise.type"
// import type { Utilisateur } from "@/types/Utilisateur.type"
// import { getAllCampagnes } from "@/service/campagne.service"
// import { getAllHistoriques } from "@/service/historiqueAction.service"
// import type { Campagne } from "@/types/campagne.type"
// import type { HistoriqueAction  } from "@/types/historiqueAction.type"
// import { useEffect, useState } from "react"

// const HistoriquesPage = () => {
//   const [historiques, setHistoriques] = useState<HistoriqueAction[]>([])
//   const [campagnes, setCampagnes] = useState<Campagne[]>([])
//   const [entreprises, setEntreprises] = useState<Entreprise[]>([])
//   const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
//   const [selectedHistorique, setSelectedHistorique] = useState<HistoriqueAction | null>(null)
//   const [isModalOpen, setIsModalOpen] = useState(false)

//   const reloadCampagnes = async () => {
//     try {
//       const res = await getAllCampagnes()
//       setCampagnes(res.data || [])
//     } catch {
//       console.error("Impossible de charger les campagnes")
//     }
//   }

//   const reloadHistoriques = async () => {
//     try {
//       const res = await getAllHistoriques()
//       setHistoriques(res.data || [])
//     } catch {
//       console.error("Impossible de charger les historiques")
//     }
//   }

//   const reloadEntreprises = async () => {
//     try {
//       const res = await getAllEntreprises()
//       setEntreprises(res || [])
//     } catch {
//       console.error("Impossible de charger les entreprises")
//     }
//   }

//   const reloadUtilisateurs = async () => {
//     try {
//       const res = await fetchUtilisateurs()
//       setUtilisateurs(res || [])
//     } catch {
//       console.error("Impossible de charger les utilisateurs")
//     }
//   }

//   const getEntrepriseNom = (id: number) => {
//     const entreprise = entreprises.find((e) => e.id === id)
//     return entreprise ? entreprise.nom || entreprise.raisonSocial || `Entreprise #${id}` : `Entreprise #${id}`
//   }

//   const getCampagneNom = (id: number | null) => {
//     if (!id) return "-"
//     const campagne = campagnes.find((c) => c.id === id)
//     return campagne ? campagne.libelle : `Campagne #${id}`
//   }

//   const getUtilisateurNom = (id: number) => {
//     const utilisateur = utilisateurs.find((u) => u.id === id)
//     return utilisateur
//       ? `${utilisateur.prenom || ""} ${utilisateur.nom || ""}`.trim() || `Utilisateur #${id}`
//       : `Utilisateur #${id}`
//   }

//   useEffect(() => {
//     reloadCampagnes()
//     reloadHistoriques()
//     reloadEntreprises()
//     reloadUtilisateurs()
//   }, [])
//   useEffect(() => {
//     reloadUtilisateurs()
//   }, [])
//   const openModal = (historique: HistoriqueAction) => {
//     setSelectedHistorique(historique)
//     setIsModalOpen(true)
//   }

//   const closeModal = () => {
//     setIsModalOpen(false)
//   }

//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-4">Historiques</h1>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border border-gray-200">
//           <thead>
//             <tr>
//               <th className="px-4 py-2">Date</th>
//               <th className="px-4 py-2">Type</th>
//               <th className="px-4 py-2">Entreprise</th>
//               <th className="px-4 py-2">Campagne</th>
//               <th className="px-4 py-2">Utilisateur</th>
//               <th className="px-4 py-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {historiques.map((h) => (
//               <tr key={h.id} className="hover:bg-gray-100">
//                 <td className="px-4 py-2">{h.date}</td>
//                 <td className="px-4 py-2">{h.type}</td>
//                 <td className="px-4 py-2 text-indigo-600">{getEntrepriseNom(h.entreprise_id)}</td>
//                 <td className="px-4 py-2 text-teal-600">{getCampagneNom(h.campagne_id)}</td>
//                 <td className="px-4 py-2 text-orange-600">{getUtilisateurNom(h.utilisateur_id)}</td>
//                 <td className="px-4 py-2">
//                   <button
//                     onClick={() => openModal(h)}
//                     className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//                   >
//                     Détails
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
//           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
//             <div className="mt-3 text-center">
//               <h3 className="text-lg leading-6 font-medium text-gray-900">Détails de l'historique</h3>
//               <div className="mt-2">
//                 {selectedHistorique && (
//                   <div>
//                     <p>
//                       <strong>Date :</strong> {selectedHistorique.date}
//                     </p>
//                     <p>
//                       <strong>Type :</strong> {selectedHistorique.type}
//                     </p>
//                     <p>
//                       <strong>Entreprise :</strong> {getEntrepriseNom(selectedHistorique.entreprise_id)}
//                     </p>
//                     <p>
//                       <strong>Campagne :</strong> {getCampagneNom(selectedHistorique.campagne_id)}
//                     </p>
//                     <p>
//                       <strong>Utilisateur :</strong> {getUtilisateurNom(selectedHistorique.utilisateur_id)}
//                     </p>
//                     <p>
//                       <strong>Description :</strong> {selectedHistorique.description}
//                     </p>
//                   </div>
//                 )}
//               </div>
//               <div className="items-center px-4 py-3">
//                 <button
//                   onClick={closeModal}
//                   className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
//                 >
//                   Fermer
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default HistoriquesPage




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
import { Utilisateur } from "@/types/Utilisateur.type"
import { fetchUtilisateurs } from "@/service/Utlisateur.service"
import { Entreprise } from "@/types/Entreprise.type"
import { getAllEntreprises } from "@/service/Entreprise.service"

export default function HistoriquePage() {
  const [historiques, setHistoriques] = useState<HistoriqueAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [selectedHistorique, setSelectedHistorique] = useState<HistoriqueAction | null>(null)
  const [campagnes, setCampagnes] = useState<Campagne[]>([])
  const [searchTerm, setSearchTerm] = useState("")
 const [entreprises, setEntreprises] = useState<Entreprise[]>([])
 const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const reloadUtilisateurs = async () => {
    try {
      const res = await fetchUtilisateurs()
      setUtilisateurs(res || [])
    } catch {
      console.error("Impossible de charger les utilisateurs")
    }
  }
  const getUtilisateurNom = (id: number) => {
    const utilisateur = utilisateurs.find((u) => u.id === id)
    return utilisateur
      ? `${utilisateur.prenom || ""} ${utilisateur.nom || ""}`.trim() || `Utilisateur #${id}`
      : `Utilisateur #${id}`
  }
  useEffect(() => {
    reloadUtilisateurs()
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

    const reloadCampagnes = async () => {
    try {
      const res = await getAllCampagnes()
      setCampagnes(res.data || [])
    } catch {
      console.error("Impossible de charger les campagnes")
    }
  }

  const reloadEntreprises = async () => {
    try {
      const res = await getAllEntreprises()
      setEntreprises(res || [])
    } catch {
      console.error("Impossible de charger les entreprises")
    }
  }
  const getEntrepriseNom = (id: number) => {
    const entreprise = entreprises.find((e) => e.id === id)
    return entreprise ? entreprise.nom || entreprise.raisonSocial || `Entreprise #${id}` : `Entreprise #${id}`
  }

  const getCampagneNom = (id: number | null) => {
    if (!id) return "-"
    const campagne = campagnes.find((c) => c.id === id)
    return campagne ? campagne.libelle : `Campagne #${id}`
  }
  useEffect(() => {
    reloadCampagnes()
    reloadEntreprises()
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

  const filteredHistoriques = historiques.filter(h => {
    const search = searchTerm.toLowerCase()
    return (
      h.date.toLowerCase().includes(search) ||
      h.utilisateur?.nom?.toLowerCase().includes(search) ||
      h.entreprise?.nom?.toLowerCase().includes(search) ||
      h.campagne?.libelle?.toLowerCase().includes(search)
    )
  })

  const groupedHistoriques = {
    appel: filteredHistoriques.filter(h => h.action.toLowerCase().includes("appel")),
    email: filteredHistoriques.filter(h => h.action.toLowerCase().includes("email")),
    reunion: filteredHistoriques.filter(h => h.action.toLowerCase().includes("réunion")),
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
                  <td className="px-4 py-2 text-indigo-600">{getEntrepriseNom(h.entreprise_id)}</td>
                  <td className="px-4 py-2 text-teal-600">{getCampagneNom(h.campagne_id)}</td>
                  <td className="px-4 py-2 text-orange-600">{getUtilisateurNom(h.utilisateur_id)}</td>
                  <td className="px-4 py-2">
                    <div className="mb-1">{h.pourcentageVente ?? 0}%</div>
                    <Progress value={h.pourcentageVente ?? 0} className="h-2 w-24 rounded"/>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedHistorique(h)} aria-label={`Voir l'historique ${h.id}`}>
                      Voir
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setDeleteConfirmId(h.id)} aria-label={`Supprimer l'historique ${h.action}`}>
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
          <p className="text-muted-foreground mb-4">
            Total : <span className="font-semibold text-accent-foreground">{historiques.length}</span>
          </p>
          <input
            type="text"
            placeholder="Rechercher par date, nom d'utilisateur, nom d'entreprise ou campagne..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-primary"
          />
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
                <p><strong>Entreprise :</strong>  {getEntrepriseNom(selectedHistorique.entreprise_id)}</p>
                <p><strong>Campagne :</strong> {getCampagneNom(selectedHistorique.campagne_id)}</p>
                <p><strong>Utilisateur :</strong> {getUtilisateurNom(selectedHistorique.utilisateur_id)}</p>
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