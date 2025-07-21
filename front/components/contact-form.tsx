"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getAllEntreprises } from "@/service/Entreprise.service"
import { createContact, updateContact } from "@/service/Contact.service"

import type { Entreprise } from "@/types/Entreprise.type"

export interface Contact {
  id?: number
  nom: string
  prenom: string
  telephone: string
  email: string
  adresse: string
  fonction: string
  entreprise_id: number
}

interface ContactFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  onSave: (contact: Contact) => void
}

export function ContactForm({ open, onOpenChange, contact, onSave }: ContactFormProps) {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([])
  const [formData, setFormData] = useState<Contact>({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    adresse: "",
    fonction: "",
    entreprise_id: 0,
  })

  // Chargement des entreprises une seule fois
  useEffect(() => {
    const fetchEntreprises = async () => {
      const data = await getAllEntreprises()
      setEntreprises(data)
    }
    fetchEntreprises()
  }, [])
  
  useEffect(() => {
    if (contact) {
      setFormData({ ...contact })
    } else if (entreprises.length > 0) {
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        adresse: "",
        fonction: "",
        entreprise_id: entreprises[0].id,
      })
    }
  }, [contact, entreprises, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "entreprise_id" ? parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const saved = contact
        ? await updateContact(contact.id!, formData)
        : await createContact(formData)
      onSave(saved)
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement du contact")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? "Modifier" : "Ajouter"} un contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prénom</Label>
              <Input name="prenom" value={formData.prenom} onChange={handleChange} required />
            </div>
            <div>
              <Label>Nom</Label>
              <Input name="nom" value={formData.nom} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input name="telephone" value={formData.telephone} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <Label>Adresse</Label>
            <Input name="adresse" value={formData.adresse} onChange={handleChange} />
          </div>
          <div>
            <Label>Fonction</Label>
            <Input name="fonction" value={formData.fonction} onChange={handleChange} />
          </div>
          <div>
            <Label>Entreprise</Label>
            <select
              name="entreprise_id"
              value={formData.entreprise_id ? String(formData.entreprise_id) : ""}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">-- Sélectionner une entreprise --</option>
              {entreprises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom ?? e.raisonSocial}
                </option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <Button type="submit">{contact ? "Enregistrer" : "Créer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
