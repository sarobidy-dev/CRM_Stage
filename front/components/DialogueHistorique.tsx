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
import { Campagne } from "@/types/Campagne.type"
import { Entreprise } from "@/types/Entreprise.type"
import { CreateHistoriqueInput } from "@/types/historiqueAction.type"
import { createHistorique } from "@/service/historiqueAction.service"
import { getCookie } from "@/service/cookieUtil"

interface Props {
  entrepriseId: number
  campagnes?: Campagne[] // <--- rendu facultatif pour éviter erreur initiale
  entreprises: Entreprise[]
  onSuccess?: () => void
}

export default function AddHistoriqueDialog({
  entrepriseId,
  campagnes = [], // <--- fallback vide si undefined
  entreprises,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false)
  const [commentaire, setCommentaire] = useState("")
  const [action, setAction] = useState("")
  const [pourcentageVente, setPourcentageVente] = useState(0)
  const [campagneId, setCampagneId] = useState<number>(0)
  const [utilisateurId, setUtilisateurId] = useState<number | null>(null)

  // Lecture de l’ID utilisateur depuis le cookie
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
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'historique :", error)
      alert(
        `Erreur : ${error instanceof Error ? error.message : "Erreur inconnue"}`
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Ajouter Historique</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un historique</DialogTitle>
          <DialogDescription>
            Complétez les informations pour enregistrer un historique.
          </DialogDescription>
        </DialogHeader>

      <div className="space-y-4">
  <div>
    <label htmlFor="commentaire" className="block mb-1 font-medium">
      Commentaire
    </label>
    <Textarea
      id="commentaire"
      placeholder="Commentaire"
      value={commentaire}
      onChange={(e) => setCommentaire(e.target.value)}
    />
  </div>

  <div>
    <label htmlFor="action" className="block mb-1 font-medium">
      Action
    </label>
    <select
      id="action"
      value={action}
      onChange={(e) => setAction(e.target.value)}
      className="w-full border rounded px-2 py-1"
    >
      <option value="">Sélectionnez une action</option>
      <option value="Email">Email</option>
      <option value="Appel">Appel</option>
    </select>
  </div>

  <div>
    <label htmlFor="pourcentageVente" className="block mb-1 font-medium">
      Pourcentage Vente
    </label>
    <Input
      id="pourcentageVente"
      type="number"
      placeholder="Pourcentage Vente"
      value={pourcentageVente}
      onChange={(e) => setPourcentageVente(Number(e.target.value))}
    />
  </div>

  <div>
    <label htmlFor="campagne" className="block mb-1 font-medium">
      Campagne
    </label>
    <select
      id="campagne"
      value={campagneId}
      onChange={(e) => setCampagneId(Number(e.target.value))}
      className="w-full border rounded px-2 py-1"
    >
      {Array.isArray(campagnes) && campagnes.length > 0 ? (
        campagnes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.libelle}
          </option>
        ))
      ) : (
        <option value={0}>Aucune campagne disponible</option>
      )}
    </select>
  </div>

  <div className="text-xs text-gray-500">
    ID Entreprise : <strong>{entrepriseId}</strong> <br />
    ID Utilisateur (depuis cookie) : <strong>{utilisateurId ?? "Non trouvé"}</strong>
  </div>

  <Button
    onClick={handleSave}
    className="w-full"
    disabled={!utilisateurId || campagneId === 0}
  >
    Enregistrer
  </Button>
</div>

      </DialogContent>
    </Dialog>
  )
}
