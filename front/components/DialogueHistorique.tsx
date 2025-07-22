"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Campagne } from "@/types/campagne.type"
import type { Entreprise } from "@/types/Entreprise.type"
import type { CreateHistoriqueInput } from "@/types/historiqueAction.type"
import { createHistorique } from "@/service/historiqueAction.service"
import { fetchUtilisateurs } from "@/service/Utlisateur.service"
import type { Utilisateur } from "@/types/Utilisateur.type"
import { getCookie } from "@/service/cookieUtil"

interface Props {
  entrepriseId: number
  campagnes?: Campagne[]
  entreprises: Entreprise[]
  onSuccess?: () => void
}

export default function AddHistoriqueDialog({ entrepriseId, campagnes = [], entreprises, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [commentaire, setCommentaire] = useState("")
  const [action, setAction] = useState("")
  const [pourcentageVente, setPourcentageVente] = useState(0)
  const [campagneId, setCampagneId] = useState<number>(0)
  const [utilisateurId, setUtilisateurId] = useState<number | null>(null)
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fonction de validation des champs
  const isFormValid = () => {
    return (
      commentaire.trim() !== "" &&
      action.trim() !== "" &&
      pourcentageVente >= 0 &&
      campagneId !== 0 &&
      utilisateurId !== null
    )
  }

  // Fonction pour récupérer le nom de l'entreprise
  const getEntrepriseNom = (id: number) => {
    const entreprise = entreprises.find((e) => e.id === id)
    return entreprise ? entreprise.nom || entreprise.raisonSocial || `Entreprise #${id}` : `Entreprise #${id}`
  }

  // Fonction pour récupérer le nom de l'utilisateur
  const getUtilisateurNom = (id: number | null) => {
    if (!id) return "Non trouvé"
    const utilisateur = utilisateurs.find((u) => (u.id_utilisateur || u.id) === id)
    return utilisateur
      ? `${utilisateur.prenom || ""} ${utilisateur.nom || ""}`.trim() || `Utilisateur #${id}`
      : `Utilisateur #${id}`
  }

  // Charger les utilisateurs
  useEffect(() => {
    const loadUtilisateurs = async () => {
      try {
        const data = await fetchUtilisateurs()
        setUtilisateurs(data || [])
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error)
      }
    }
    loadUtilisateurs()
  }, [])

  // Lecture de l'ID utilisateur depuis le cookie
  useEffect(() => {
    const idFromCookie = getCookie("userId")
    if (idFromCookie) {
      setUtilisateurId(Number(idFromCookie))
    }
  }, [])

  // Mettre à jour campagneId si campagnes changent
  useEffect(() => {
    if (Array.isArray(campagnes) && campagnes.length > 0) {
      setCampagneId(campagnes[0].id)
    } else {
      setCampagneId(0)
    }
  }, [campagnes])

  const handleSave = async () => {
    if (!utilisateurId) {
      alert("Impossible de récupérer l'utilisateur depuis les cookies.")
      return
    }

    if (!isFormValid()) {
      alert("Veuillez remplir tous les champs obligatoires.")
      return
    }

    setIsLoading(true)
    try {
      const historique: CreateHistoriqueInput = {
        date: new Date().toISOString().split("T")[0],
        commentaire,
        action,
        pourcentageVente,
        entreprise_id: entrepriseId,
        campagne_id: campagneId === 0 ? null : campagneId,
        utilisateur_id: utilisateurId,
      }

      console.log("Payload envoyé:", historique)
      await createHistorique(historique)

      // Reset form
      setCommentaire("")
      setAction("")
      setPourcentageVente(0)
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'historique :", error)
      alert(`Erreur : ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={isLoading}>
          {isLoading ? "Enregistrement..." : "Ajouter Historique"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un historique</DialogTitle>
          <DialogDescription>Complétez les informations pour enregistrer un historique.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="commentaire" className="block mb-1 font-medium">
              Commentaire <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="commentaire"
              placeholder="Commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              className={commentaire.trim() === "" ? "border-red-300" : ""}
            />
            {commentaire.trim() === "" && <p className="text-xs text-red-500 mt-1">Le commentaire est obligatoire</p>}
          </div>
          <div>
            <label htmlFor="action" className="block mb-1 font-medium">
              Action <span className="text-red-500">*</span>
            </label>
            <select
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className={`w-full border rounded px-2 py-1 ${action === "" ? "border-red-300" : ""}`}
            >
              <option value="">Sélectionnez une action</option>
              <option value="Email">Email</option>
              <option value="Appel">Appel</option>
              <option value="Réunions">Réunion</option>
            </select>
            {action === "" && <p className="text-xs text-red-500 mt-1">Veuillez sélectionner une action</p>}
          </div>
          <div>
            <label htmlFor="pourcentageVente" className="block mb-1 font-medium">
              Pourcentage Vente <span className="text-red-500">*</span>
            </label>
            <Input
              id="pourcentageVente"
              type="number"
              min="0"
              max="100"
              placeholder="Pourcentage Vente"
              value={pourcentageVente}
              onChange={(e) => setPourcentageVente(Number(e.target.value))}
              className={pourcentageVente < 0 ? "border-red-300" : ""}
            />
            {pourcentageVente < 0 && <p className="text-xs text-red-500 mt-1">Le pourcentage doit être positif</p>}
          </div>
          <div>
            <label htmlFor="campagne" className="block mb-1 font-medium">
              Campagne <span className="text-red-500">*</span>
            </label>
            <select
              id="campagne"
              value={campagneId}
              onChange={(e) => setCampagneId(Number(e.target.value))}
              className={`w-full border rounded px-2 py-1 ${campagneId === 0 ? "border-red-300" : ""}`}
            >
              {Array.isArray(campagnes) && campagnes.length > 0 ? (
                <>
                  <option value={0}>Sélectionnez une campagne</option>
                  {campagnes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.libelle}
                    </option>
                  ))}
                </>
              ) : (
                <option value={0}>Aucune campagne disponible</option>
              )}
            </select>
            {campagneId === 0 && <p className="text-xs text-red-500 mt-1">Veuillez sélectionner une campagne</p>}
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <div className="mb-1">
              <strong>Entreprise :</strong> {getEntrepriseNom(entrepriseId)}
            </div>
            <div>
              <strong>Utilisateur :</strong> {getUtilisateurNom(utilisateurId)}
            </div>
          </div>
          <Button onClick={handleSave} className="w-full" disabled={!isFormValid() || isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
