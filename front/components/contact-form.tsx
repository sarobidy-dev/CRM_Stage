"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getAllEntreprises } from "@/service/Entreprise.service"
import { createContact, updateContact, getAllContacts } from "@/service/Contact.service"
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
  const [existingContacts, setExistingContacts] = useState<Contact[]>([])
  const [formData, setFormData] = useState<Contact>({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    adresse: "",
    fonction: "",
    entreprise_id: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)

  // Domaines email autorisés par continent
  const allowedEmailDomains = [
    // Afrique
    "@gmail.dz", // Algérie
    "@gmail.ma", // Maroc
    "@gmail.tn", // Tunisie
    "@gmail.eg", // Égypte
    "@gmail.za", // Afrique du Sud
    "@gmail.ng", // Nigeria
    "@gmail.ke", // Kenya
    "@gmail.gh", // Ghana
    "@gmail.sn", // Sénégal
    "@gmail.ci", // Côte d'Ivoire
    "@gmail.cm", // Cameroun
    "@gmail.bf", // Burkina Faso
    "@gmail.ml", // Mali
    "@gmail.ne", // Niger
    "@gmail.td", // Tchad
    "@gmail.cf", // République centrafricaine
    "@gmail.cg", // Congo
    "@gmail.cd", // République démocratique du Congo
    "@gmail.ga", // Gabon
    "@gmail.gq", // Guinée équatoriale
    "@gmail.st", // São Tomé-et-Principe
    "@gmail.ao", // Angola
    "@gmail.mz", // Mozambique
    "@gmail.zw", // Zimbabwe
    "@gmail.bw", // Botswana
    "@gmail.na", // Namibie
    "@gmail.sz", // Eswatini
    "@gmail.ls", // Lesotho
    "@gmail.mg", // Madagascar
    "@gmail.mu", // Maurice
    "@gmail.sc", // Seychelles
    "@gmail.km", // Comores
    "@gmail.dj", // Djibouti
    "@gmail.so", // Somalie
    "@gmail.et", // Éthiopie
    "@gmail.er", // Érythrée
    "@gmail.sd", // Soudan
    "@gmail.ss", // Soudan du Sud
    "@gmail.ug", // Ouganda
    "@gmail.rw", // Rwanda
    "@gmail.bi", // Burundi
    "@gmail.tz", // Tanzanie
    "@gmail.mw", // Malawi
    "@gmail.zm", // Zambie
    "@gmail.lr", // Liberia
    "@gmail.sl", // Sierra Leone
    "@gmail.gn", // Guinée
    "@gmail.gw", // Guinée-Bissau
    "@gmail.cv", // Cap-Vert
    "@gmail.mr", // Mauritanie
    "@gmail.ly", // Libye

    // Europe
    "@gmail.fr", // France
    "@gmail.de", // Allemagne
    "@gmail.it", // Italie
    "@gmail.es", // Espagne
    "@gmail.uk", // Royaume-Uni
    "@gmail.co.uk", // Royaume-Uni
    "@gmail.nl", // Pays-Bas
    "@gmail.be", // Belgique
    "@gmail.ch", // Suisse
    "@gmail.at", // Autriche
    "@gmail.pt", // Portugal
    "@gmail.se", // Suède
    "@gmail.no", // Norvège
    "@gmail.dk", // Danemark
    "@gmail.fi", // Finlande
    "@gmail.pl", // Pologne
    "@gmail.cz", // République tchèque
    "@gmail.sk", // Slovaquie
    "@gmail.hu", // Hongrie
    "@gmail.ro", // Roumanie
    "@gmail.bg", // Bulgarie
    "@gmail.hr", // Croatie
    "@gmail.si", // Slovénie
    "@gmail.rs", // Serbie
    "@gmail.ba", // Bosnie-Herzégovine
    "@gmail.me", // Monténégro
    "@gmail.mk", // Macédoine du Nord
    "@gmail.al", // Albanie
    "@gmail.gr", // Grèce
    "@gmail.cy", // Chypre
    "@gmail.mt", // Malte
    "@gmail.ie", // Irlande
    "@gmail.is", // Islande
    "@gmail.lu", // Luxembourg
    "@gmail.li", // Liechtenstein
    "@gmail.mc", // Monaco
    "@gmail.sm", // Saint-Marin
    "@gmail.va", // Vatican
    "@gmail.ad", // Andorre

    // Asie
    "@gmail.cn", // Chine
    "@gmail.jp", // Japon
    "@gmail.kr", // Corée du Sud
    "@gmail.in", // Inde
    "@gmail.id", // Indonésie
    "@gmail.th", // Thaïlande
    "@gmail.vn", // Vietnam
    "@gmail.ph", // Philippines
    "@gmail.my", // Malaisie
    "@gmail.sg", // Singapour
    "@gmail.tw", // Taïwan
    "@gmail.hk", // Hong Kong
    "@gmail.mo", // Macao
    "@gmail.kh", // Cambodge
    "@gmail.la", // Laos
    "@gmail.mm", // Myanmar
    "@gmail.bn", // Brunei
    "@gmail.tl", // Timor oriental
    "@gmail.mn", // Mongolie
    "@gmail.kz", // Kazakhstan
    "@gmail.kg", // Kirghizistan
    "@gmail.tj", // Tadjikistan
    "@gmail.tm", // Turkménistan
    "@gmail.uz", // Ouzbékistan
    "@gmail.af", // Afghanistan
    "@gmail.pk", // Pakistan
    "@gmail.bd", // Bangladesh
    "@gmail.lk", // Sri Lanka
    "@gmail.mv", // Maldives
    "@gmail.bt", // Bhoutan
    "@gmail.np", // Népal
    "@gmail.ir", // Iran
    "@gmail.iq", // Irak
    "@gmail.sy", // Syrie
    "@gmail.lb", // Liban
    "@gmail.jo", // Jordanie
    "@gmail.il", // Israël
    "@gmail.ps", // Palestine
    "@gmail.sa", // Arabie saoudite
    "@gmail.ae", // Émirats arabes unis
    "@gmail.qa", // Qatar
    "@gmail.bh", // Bahreïn
    "@gmail.kw", // Koweït
    "@gmail.om", // Oman
    "@gmail.ye", // Yémen
    "@gmail.tr", // Turquie
    "@gmail.am", // Arménie
    "@gmail.az", // Azerbaïdjan
    "@gmail.ge", // Géorgie

    // Amériques
    "@gmail.com", // États-Unis (domaine principal)
    "@gmail.ca", // Canada
    "@gmail.mx", // Mexique
    "@gmail.br", // Brésil
    "@gmail.ar", // Argentine
    "@gmail.cl", // Chili
    "@gmail.co", // Colombie
    "@gmail.pe", // Pérou
    "@gmail.ve", // Venezuela
    "@gmail.ec", // Équateur
    "@gmail.bo", // Bolivie
    "@gmail.py", // Paraguay
    "@gmail.uy", // Uruguay
    "@gmail.gf", // Guyane française
    "@gmail.sr", // Suriname
    "@gmail.gy", // Guyana
    "@gmail.cr", // Costa Rica
    "@gmail.pa", // Panama
    "@gmail.ni", // Nicaragua
    "@gmail.hn", // Honduras
    "@gmail.sv", // Salvador
    "@gmail.gt", // Guatemala
    "@gmail.bz", // Belize
    "@gmail.cu", // Cuba
    "@gmail.jm", // Jamaïque
    "@gmail.ht", // Haïti
    "@gmail.do", // République dominicaine
    "@gmail.pr", // Porto Rico
    "@gmail.tt", // Trinité-et-Tobago
    "@gmail.bb", // Barbade
    "@gmail.gd", // Grenade
    "@gmail.vc", // Saint-Vincent-et-les-Grenadines
    "@gmail.lc", // Sainte-Lucie
    "@gmail.dm", // Dominique
    "@gmail.ag", // Antigua-et-Barbuda
    "@gmail.kn", // Saint-Christophe-et-Niévès
    "@gmail.bs", // Bahamas

    // Océanie
    "@gmail.au", // Australie
    "@gmail.nz", // Nouvelle-Zélande
    "@gmail.fj", // Fidji
    "@gmail.pg", // Papouasie-Nouvelle-Guinée
    "@gmail.sb", // Îles Salomon
    "@gmail.vu", // Vanuatu
    "@gmail.nc", // Nouvelle-Calédonie
    "@gmail.pf", // Polynésie française
    "@gmail.ws", // Samoa
    "@gmail.to", // Tonga
    "@gmail.tv", // Tuvalu
    "@gmail.ki", // Kiribati
    "@gmail.nr", // Nauru
    "@gmail.pw", // Palaos
    "@gmail.fm", // Micronésie
    "@gmail.mh", // Îles Marshall
  ]

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entreprisesData, contactsData] = await Promise.all([getAllEntreprises(), getAllContacts()])

        // S'assurer que les données sont des tableaux
        setEntreprises(Array.isArray(entreprisesData) ? entreprisesData : [])
        setExistingContacts(Array.isArray(contactsData) ? contactsData : [])

        console.log("Contacts chargés:", contactsData)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        setEntreprises([])
        setExistingContacts([])
      }
    }
    fetchData()
  }, [])

  // Vérification des doublons
  const checkDuplicates = async (field: "email" | "telephone", value: string) => {
    if (!value.trim()) return false

    setIsCheckingDuplicates(true)
    try {
      // S'assurer que existingContacts est un tableau
      if (!Array.isArray(existingContacts)) {
        console.warn("existingContacts n'est pas un tableau:", existingContacts)
        return false
      }

      // Vérifier dans les contacts existants (exclure le contact en cours d'édition)
      const isDuplicate = existingContacts.some((existingContact) => {
        // Exclure le contact actuel si on est en mode édition
        if (contact && existingContact.id === contact.id) {
          return false
        }

        if (field === "email") {
          return existingContact.email?.toLowerCase() === value.toLowerCase()
        } else {
          // Normaliser les numéros de téléphone pour la comparaison
          const normalizePhone = (phone: string) => phone.replace(/\D/g, "")
          return normalizePhone(existingContact.telephone || "") === normalizePhone(value)
        }
      })

      return isDuplicate
    } catch (error) {
      console.error("Erreur lors de la vérification des doublons:", error)
      return false
    } finally {
      setIsCheckingDuplicates(false)
    }
  }

  const validateField = async (name: string, value: string) => {
    const newErrors = { ...errors }

    switch (name) {
      case "nom":
        if (!value.trim()) {
          newErrors.nom = "Le nom est obligatoire"
        } else if (value.trim().length < 2) {
          newErrors.nom = "Le nom doit contenir au moins 2 caractères"
        } else if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(value)) {
          newErrors.nom = "Le nom ne doit contenir que des lettres"
        } else {
          delete newErrors.nom
        }
        break

      case "prenom":
        if (!value.trim()) {
          newErrors.prenom = "Le prénom est obligatoire"
        } else if (value.trim().length < 2) {
          newErrors.prenom = "Le prénom doit contenir au moins 2 caractères"
        } else if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(value)) {
          newErrors.prenom = "Le prénom ne doit contenir que des lettres"
        } else {
          delete newErrors.prenom
        }
        break

      case "email":
        if (!value.trim()) {
          newErrors.email = "L'email est obligatoire"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Format d'email invalide"
        } else {
          // Vérifier si le domaine est autorisé
          const isValidDomain = allowedEmailDomains.some((domain) => value.toLowerCase().endsWith(domain.toLowerCase()))

          if (!isValidDomain) {
            newErrors.email = "❌ Domaine email non autorisé. Utilisez un domaine Gmail valide pour votre continent"
          } else {
            // Vérifier les doublons
            try {
              const isDuplicate = await checkDuplicates("email", value)
              if (isDuplicate) {
                newErrors.email = "⚠️ Cet email existe déjà dans la base de données"
              } else {
                delete newErrors.email
              }
            } catch (error) {
              newErrors.email = "❌ Erreur lors de la vérification des doublons"
            }
          }
        }
        break

      case "telephone":
        const phoneDigits = value.replace(/\D/g, "")
        if (!value.trim()) {
          newErrors.telephone = "Le téléphone est obligatoire"
        } else if (phoneDigits.length < 10) {
          newErrors.telephone = "Le téléphone doit contenir au moins 10 chiffres"
        } else if (phoneDigits.length > 15) {
          newErrors.telephone = "Le téléphone ne peut pas dépasser 15 chiffres"
        } else if (!/^[\d\s\-+().]+$/.test(value)) {
          newErrors.telephone = "Format de téléphone invalide"
        } else {
          // Vérifier les doublons
          try {
            const isDuplicate = await checkDuplicates("telephone", value)
            if (isDuplicate) {
              newErrors.telephone = "⚠️ Ce numéro de téléphone existe déjà dans la base de données"
            } else {
              delete newErrors.telephone
            }
          } catch (error) {
            newErrors.telephone = "❌ Erreur lors de la vérification des doublons"
          }
        }
        break

      case "adresse":
        if (value.trim() && value.trim().length < 5) {
          newErrors.adresse = "L'adresse doit contenir au moins 5 caractères"
        } else {
          delete newErrors.adresse
        }
        break

      case "fonction":
        if (value.trim() && value.trim().length < 2) {
          newErrors.fonction = "La fonction doit contenir au moins 2 caractères"
        } else if (value.trim() && !/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value)) {
          newErrors.fonction = "La fonction ne doit contenir que des lettres"
        } else {
          delete newErrors.fonction
        }
        break

      case "entreprise_id":
        if (!value || value === "0") {
          newErrors.entreprise_id = "Veuillez sélectionner une entreprise"
        } else {
          delete newErrors.entreprise_id
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validation complète du formulaire
  const isFormValid = () => {
    const requiredFields = ["nom", "prenom", "email", "telephone", "entreprise_id"]

    // Vérifier que tous les champs obligatoires sont remplis
    const hasRequiredFields = requiredFields.every((field) => {
      if (field === "entreprise_id") {
        return formData[field] && formData[field] !== 0
      }
      return formData[field as keyof Contact]?.toString().trim()
    })

    // Vérifier qu'il n'y a pas d'erreurs de validation
    const hasNoErrors = Object.keys(errors).length === 0

    return hasRequiredFields && hasNoErrors && !isCheckingDuplicates
  }

  useEffect(() => {
    if (contact) {
      setFormData({ ...contact })
      setErrors({}) // Reset errors when editing
    } else if (entreprises.length > 0) {
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        adresse: "",
        fonction: "",
        entreprise_id: 0, // Forcer la sélection
      })
      setErrors({})
    }
  }, [contact, entreprises, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newValue = name === "entreprise_id" ? Number.parseInt(value) : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Valider le champ en temps réel (avec délai pour email et téléphone)
    if (name === "email" || name === "telephone") {
      // Délai pour éviter trop de requêtes
      setTimeout(() => {
        validateField(name, value)
      }, 500)
    } else {
      validateField(name, value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Valider tous les champs avant soumission
    const fieldsToValidate = ["nom", "prenom", "email", "telephone", "adresse", "fonction", "entreprise_id"]
    let isValid = true

    for (const field of fieldsToValidate) {
      const value =
        field === "entreprise_id" ? formData[field].toString() : formData[field as keyof Contact]?.toString() || ""

      const fieldValid = await validateField(field, value)
      if (!fieldValid) {
        isValid = false
      }
    }

    if (!isValid) {
      alert("Veuillez corriger les erreurs dans le formulaire")
      return
    }

    try {
      const saved = contact ? await updateContact(contact.id!, formData) : await createContact(formData)
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
          {/* Résumé des erreurs */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">⚠️ Erreurs à corriger :</h4>
              <ul className="text-xs text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Prénom <span className="text-red-500">*</span>
              </Label>
              <Input
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className={errors.prenom ? "border-red-300" : ""}
              />
              {errors.prenom && <p className="text-xs text-red-500 mt-1">{errors.prenom}</p>}
            </div>
            <div>
              <Label>
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className={errors.nom ? "border-red-300" : ""}
              />
              {errors.nom && <p className="text-xs text-red-500 mt-1">{errors.nom}</p>}
            </div>
          </div>
          {/* Section Email avec meilleur affichage des erreurs */}
          <div>
            <Label>
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="exemple@gmail.fr"
              className={errors.email ? "border-red-500 bg-red-50" : ""}
            />
            {isCheckingDuplicates && formData.email && (
              <div className="flex items-center mt-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                <p className="text-xs text-blue-600">Vérification des doublons en cours...</p>
              </div>
            )}
            {errors.email && (
              <div className="mt-1 p-2 bg-red-100 border border-red-300 rounded">
                <p className="text-xs text-red-700 font-medium">{errors.email}</p>
              </div>
            )}
          </div>
          {/* Section Téléphone avec meilleur affichage des erreurs */}
          <div>
            <Label>
              Téléphone <span className="text-red-500">*</span>
            </Label>
            <Input
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
              placeholder="Ex: 01 23 45 67 89"
              className={errors.telephone ? "border-red-500 bg-red-50" : ""}
            />
            {isCheckingDuplicates && formData.telephone && (
              <div className="flex items-center mt-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                <p className="text-xs text-blue-600">Vérification des doublons en cours...</p>
              </div>
            )}
            {errors.telephone && (
              <div className="mt-1 p-2 bg-red-100 border border-red-300 rounded">
                <p className="text-xs text-red-700 font-medium">{errors.telephone}</p>
              </div>
            )}
          </div>
          <div>
            <Label>Adresse</Label>
            <Input
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              className={errors.adresse ? "border-red-300" : ""}
            />
            {errors.adresse && <p className="text-xs text-red-500 mt-1">{errors.adresse}</p>}
          </div>
          <div>
            <Label>Fonction</Label>
            <Input
              name="fonction"
              value={formData.fonction}
              onChange={handleChange}
              className={errors.fonction ? "border-red-300" : ""}
            />
            {errors.fonction && <p className="text-xs text-red-500 mt-1">{errors.fonction}</p>}
          </div>
          <div>
            <Label>
              Entreprise <span className="text-red-500">*</span>
            </Label>
            <select
              name="entreprise_id"
              value={formData.entreprise_id ? String(formData.entreprise_id) : ""}
              onChange={handleChange}
              required
              className={`w-full border p-2 rounded ${errors.entreprise_id ? "border-red-300" : ""}`}
            >
              <option value="">-- Sélectionner une entreprise --</option>
              {entreprises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom ?? e.raisonSocial}
                </option>
              ))}
            </select>
            {errors.entreprise_id && <p className="text-xs text-red-500 mt-1">{errors.entreprise_id}</p>}
          </div>

          {/* Aide pour les domaines email */}
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            <strong>Domaines email autorisés :</strong> @gmail.com, @gmail.fr, @gmail.de, @gmail.ma, @gmail.dz, etc.
            <br />
            Utilisez le domaine Gmail correspondant à votre continent/pays.
          </div>

          <div className="text-right">
            <Button
              type="submit"
              disabled={!isFormValid()}
              className={!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isCheckingDuplicates ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Vérification...
                </div>
              ) : contact ? (
                "Enregistrer"
              ) : (
                "Créer"
              )}
            </Button>
            {!isFormValid() && Object.keys(errors).length > 0 && (
              <p className="text-xs text-red-500 mt-2">⚠️ Veuillez corriger les erreurs avant de continuer</p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
