"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { deleteContact } from "@/service/Contact.service"

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  contactName?: string
  isMultiple?: boolean
  count?: number
  contactId?: number
  contactIds?: number[]
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  contactName,
  isMultiple = false,
  count = 0,
  contactId,
  contactIds = [],
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string>("")

  const handleConfirm = async () => {
    console.log("=== DÉBUT SUPPRESSION ===")
    console.log("Contact unique ID:", contactId)
    console.log("Contacts multiples IDs:", contactIds)
    console.log("Mode multiple:", isMultiple)

    setDeleting(true)
    setError("")

    try {
      if (isMultiple && contactIds.length > 0) {
        const deletePromises = contactIds.map(async (id) => {
          try {
            await deleteContact(id)
            console.log(`✅ Contact ${id} supprimé avec succès`)
            return { id, success: true }
          } catch (error) {
            console.warn(`❌ Erreur suppression contact ${id}:`, error)
            let errorMessage = "Erreur inconnue"
            if (error instanceof Error) {
              errorMessage = error.message
            } else if (typeof error === "string") {
              errorMessage = error
            }
            return { id, success: false, error: errorMessage }
          }
        })

        const results = await Promise.all(deletePromises)
        const failures = results.filter((r) => !r.success)

        if (failures.length > 0) {
          console.warn("Échecs de suppression:", failures)
          setError(`${failures.length} contact(s) n'ont pas pu être supprimés`)
          onConfirm()
        } else {
          console.log("✅ Tous les contacts supprimés avec succès")
          onConfirm()
          onOpenChange(false)
        }
      } else if (contactId) {
        await deleteContact(contactId)
        console.log("✅ Contact supprimé avec succès")
        onConfirm()
        onOpenChange(false)
      } else {
        console.warn("Aucun contact spécifié pour la suppression")
        setError("Aucun contact sélectionné pour la suppression.")
      }
    } catch (error: any) {
      console.warn("Erreur lors de la suppression :", error)

      let errorMessage = "Erreur lors de la suppression du contact"

      if (error.name === "HttpError") {
        if (error.response?.detail) {
          errorMessage = error.response.detail
        } else if (error.response?.message) {
          errorMessage = error.response.message
        } else {
          errorMessage = `Erreur HTTP ${error.status}: ${error.message}`
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (!deleting) {
      setError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {isMultiple ? "Supprimer les contacts" : "Supprimer le contact"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">Cette action est irréversible</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-700">
            {isMultiple ? (
              <>
                Êtes-vous sûr de vouloir supprimer <strong>{count} contacts</strong> sélectionnés ? Cette action supprimera
                définitivement tous les contacts sélectionnés et leurs données associées.
              </>
            ) : (
              <>
                Êtes-vous sûr de vouloir supprimer le contact <strong>{contactName}</strong> ? Cette action supprimera
                définitivement ce contact et toutes ses données associées.
              </>
            )}
          </p>

          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-800 font-medium">⚠️ Attention : Cette action ne peut pas être annulée</p>
            <p className="text-xs text-red-700 mt-1">Toutes les données du contact seront perdues définitivement.</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={deleting}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Suppression...
              </>
            ) : isMultiple ? (
              `Supprimer ${count} contacts`
            ) : (
              "Supprimer le contact"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
