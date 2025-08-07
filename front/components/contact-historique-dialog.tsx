"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Calendar, CheckCircle, Clock, XCircle, Info, ListTodo } from 'lucide-react' // Added ListTodo icon
import { getTachesByContact } from "@/service/tache.service" // Import the task service
import type { TacheOut } from "@/types/Tache.type" // Import the task type
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface TaskHistoryDialogProps {
  contactId: number
  contactName: string
  children: React.ReactNode
}

const getStatutColor = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "terminée":
      return "bg-green-100 text-green-800"
    case "en cours":
      return "bg-blue-100 text-blue-800"
    case "annulée":
      return "bg-red-100 text-red-800"
    case "en attente":
    default:
      return "bg-yellow-100 text-yellow-800"
  }
}

const getStatutIcon = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "terminée":
      return <CheckCircle className="h-4 w-4" />
    case "en cours":
      return <Clock className="h-4 w-4" />
    case "annulée":
      return <XCircle className="h-4 w-4" />
    case "en attente":
    default:
      return <Info className="h-4 w-4" />
  }
}

export function TaskHistoryDialog({ contactId, contactName, children }: TaskHistoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [taches, setTaches] = useState<TacheOut[]>([])
  const [loading, setLoading] = useState(false)

  const loadTasks = async () => {
    if (!contactId) return
    try {
      setLoading(true)
      const tasks = await getTachesByContact(contactId)
      setTaches(Array.isArray(tasks) ? tasks : [])
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique des tâches:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des tâches pour ce contact",
        variant: "destructive",
      })
      setTaches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadTasks()
    }
  }, [open, contactId])

  const formatTaskDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd/MM/yyyy à HH:mm", { locale: fr })
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Historique des tâches pour {contactName}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-700">Chargement de l'historique des tâches...</span>
            </div>
          ) : taches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune tâche trouvée pour ce contact</p>
            </div>
          ) : (
            <div className="space-y-4">
              {taches
                .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
                .map((tache, index) => (
                  <div key={tache.id || index} className="border rounded-lg p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatutColor(tache.statut)} flex items-center gap-1`}>
                          {getStatutIcon(tache.statut)}
                          {tache.statut}
                        </Badge>
                        <span className="text-sm text-gray-500">Créée le: {formatTaskDate(tache.date_creation)}</span>
                      </div>
                      {tache.date_echeance && (
                        <Badge variant="outline" className="text-blue-600">
                          Échéance: {formatTaskDate(tache.date_echeance)}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">{tache.titre}</h3>
                    {tache.description && (
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-700">{tache.description}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <ListTodo className="h-3 w-3" />
                        Tâche ID: {tache.id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Contact ID: {tache.contact_id}
                      </span>
                    </div>
                    {index < taches.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500">
            {taches.length} tâche{taches.length > 1 ? "s" : ""} trouvée{taches.length > 1 ? "s" : ""}
          </div>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
