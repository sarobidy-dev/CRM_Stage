"use client"
import { useState, useEffect } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Contact {
  id: number
  nom: string
  prenom: string
  telephone: string
  email: string
  adresse: string
  fonction: string
  entreprise_id: number
}

interface FilterOptions {
  fonction: string[]
}

interface FilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: Contact[]
  activeFilters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

export function FilterDialog({ open, onOpenChange, contacts, activeFilters, onFiltersChange }: FilterDialogProps) {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(activeFilters)

  useEffect(() => {
    setTempFilters(activeFilters)
  }, [activeFilters, open])

  // Get unique values for fonction
  const getUniqueFonctions = () => {
    const fonctions = contacts.map((contact) => contact.fonction).filter(Boolean)
    return [...new Set(fonctions)].sort()
  }

  const fonctions = getUniqueFonctions()

  const handleFilterChange = (value: string, checked: boolean) => {
    setTempFilters((prev) => ({
      ...prev,
      fonction: checked ? [...prev.fonction, value] : prev.fonction.filter((item) => item !== value),
    }))
  }

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters)
    onOpenChange(false)
  }

  const handleClearAll = () => {
    const emptyFilters = { fonction: [] }
    setTempFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const getTotalActiveFilters = () => {
    return tempFilters.fonction.length
  }

  const getFilteredCount = () => {
    let filtered = contacts
    if (tempFilters.fonction.length > 0) {
      filtered = filtered.filter((contact) => tempFilters.fonction.includes(contact.fonction))
    }
    return filtered.length
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Filtrer les contacts</DialogTitle>
              <DialogDescription>Affinez votre recherche en sélectionnant les fonctions souhaitées</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé des filtres */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">{getTotalActiveFilters()} filtre(s) actif(s)</span>
              <span className="text-sm text-blue-700">{getFilteredCount()} contact(s) trouvé(s)</span>
            </div>
          </div>

          {/* Fonction */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Fonction</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {fonctions.length > 0 ? (
                fonctions.map((fonction) => (
                  <div key={fonction} className="flex items-center space-x-2">
                    <Checkbox
                      id={`fonction-${fonction}`}
                      checked={tempFilters.fonction.includes(fonction)}
                      onCheckedChange={(checked) => handleFilterChange(fonction, checked as boolean)}
                    />
                    <Label htmlFor={`fonction-${fonction}`} className="text-sm font-normal cursor-pointer">
                      {fonction}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Aucune fonction disponible</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClearAll} className="mr-auto bg-transparent">
            <X className="h-4 w-4 mr-2" />
            Effacer tout
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleApplyFilters}>
            Appliquer les filtres
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
