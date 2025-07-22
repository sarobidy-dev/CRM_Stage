"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, Building, Target, MessageSquare, Phone, Users } from "lucide-react"
import { getContactHistory, type ContactHistoryItem } from "@/service/HAContact.service"
import { toast } from "@/hooks/use-toast"

interface ContactHistoryDialogProps {
  contactId: number
  contactName: string
  children: React.ReactNode
}

export function ContactHistoryDialog({ contactId, contactName, children }: ContactHistoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [historiques, setHistoriques] = useState<ContactHistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  // Mapping des IDs d'action vers les libellés
  const getActionLabel = (actionId: string | number) => {
    const actionMap: Record<string, string> = {
      "1": "Email",
      "2": "Appel",
      "3": "Réunions",
      "21": "Action spéciale",
      // Ajoutez d'autres mappings selon vos besoins
    }
    return actionMap[actionId.toString()] || `Action ${actionId}`
  }

  const loadHistory = async () => {
    if (!contactId) return

    try {
      setLoading(true)
      const history = await getContactHistory(contactId)
      setHistoriques(Array.isArray(history) ? history : [])
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique du contact",
        variant: "destructive",
      })
      setHistoriques([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadHistory()
    }
  }, [open, contactId])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const getActionIcon = (actionId: string | number) => {
    const actionIdStr = actionId.toString()
    switch (actionIdStr) {
      case "1": // Email
        return <MessageSquare className="h-4 w-4" />
      case "2": // Appel
        return <Phone className="h-4 w-4" />
      case "3": // Réunions
        return <Users className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getActionColor = (actionId: string | number) => {
    const actionIdStr = actionId.toString()
    switch (actionIdStr) {
      case "1": // Email
        return "bg-blue-100 text-blue-800"
      case "2": // Appel
        return "bg-green-100 text-green-800"
      case "3": // Réunions
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique de {contactName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Chargement de l'historique...</span>
            </div>
          ) : historiques.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun historique trouvé pour ce contact</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historiques
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((item, index) => (
                  <div key={item.id || index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getActionColor(item.action)} flex items-center gap-1`}>
                          {getActionIcon(item.action)}
                          {getActionLabel(item.action)}
                        </Badge>
                        <span className="text-sm text-gray-500">{formatDate(item.date)}</span>
                      </div>
                      {item.pourcentageVente > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          {item.pourcentageVente}% vente
                        </Badge>
                      )}
                    </div>

                    {item.commentaire && (
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-700">{item.commentaire}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Utilisateur ID: {item.utilisateur_id}
                      </span>
                      {item.entreprise_id && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          Entreprise ID: {item.entreprise_id}
                        </span>
                      )}
                      {item.campagne_id && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Campagne ID: {item.campagne_id}
                        </span>
                      )}
                    </div>

                    {index < historiques.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500">
            {historiques.length} action{historiques.length > 1 ? "s" : ""} trouvée{historiques.length > 1 ? "s" : ""}
          </div>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
