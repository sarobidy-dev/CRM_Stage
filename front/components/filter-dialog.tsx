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
import { Separator } from "@/components/ui/separator"

interface Contact {
  secteur: string
  type: string
  source: string
}

interface FilterOptions {
  secteur: string[]
  type: string[]
  source: string[]
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

  // Get unique values for each filter category
  const getUniqueValues = (field: keyof Contact) => {
    const values = contacts.map((contact) => contact[field]).filter(Boolean)
    return [...new Set(values)].sort()
  }

  const secteurs = getUniqueValues("secteur")
  const types = getUniqueValues("type")
  const sources = getUniqueValues("source")

  const handleFilterChange = (category: keyof FilterOptions, value: string, checked: boolean) => {
    setTempFilters((prev) => ({
      ...prev,
      [category]: checked ? [...prev[category], value] : prev[category].filter((item) => item !== value),
    }))
  }

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters)
    onOpenChange(false)
  }

  const handleClearAll = () => {
    const emptyFilters = { secteur: [], type: [], source: [] }
    setTempFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const getTotalActiveFilters = () => {
    return tempFilters.secteur.length + tempFilters.type.length + tempFilters.source.length
  }

  const getFilteredCount = () => {
    let filtered = contacts

    if (tempFilters.secteur.length > 0) {
      filtered = filtered.filter((contact) => tempFilters.secteur.includes(contact.secteur))
    }
    if (tempFilters.type.length > 0) {
      filtered = filtered.filter((contact) => tempFilters.type.includes(contact.type))
    }
    if (tempFilters.source.length > 0) {
      filtered = filtered.filter((contact) => tempFilters.source.includes(contact.source))
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
              <DialogDescription>Affinez votre recherche en sélectionnant les critères souhaités</DialogDescription>
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

          {/* Secteur */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Secteur d'activité</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {secteurs.map((secteur) => (
                <div key={secteur} className="flex items-center space-x-2">
                  <Checkbox
                    id={`secteur-${secteur}`}
                    checked={tempFilters.secteur.includes(secteur)}
                    onCheckedChange={(checked) => handleFilterChange("secteur", secteur, checked as boolean)}
                  />
                  <Label htmlFor={`secteur-${secteur}`} className="text-sm font-normal cursor-pointer">
                    {secteur}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Type de contact</Label>
            <div className="space-y-2">
              {types.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={tempFilters.type.includes(type)}
                    onCheckedChange={(checked) => handleFilterChange("type", type, checked as boolean)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Source */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Source</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sources.map((source) => (
                <div key={source} className="flex items-center space-x-2">
                  <Checkbox
                    id={`source-${source}`}
                    checked={tempFilters.source.includes(source)}
                    onCheckedChange={(checked) => handleFilterChange("source", source, checked as boolean)}
                  />
                  <Label htmlFor={`source-${source}`} className="text-sm font-normal cursor-pointer">
                    {source}
                  </Label>
                </div>
              ))}
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
