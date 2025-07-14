"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, AlertCircle, X, Camera } from "lucide-react"
import { createContact, updateContact } from "@/service/Contact.service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Utilisateur } from "@/types/Utilisateur.type"
import type { Contact } from "@/types/Contact.type"
import { getUtilisateur } from "@/service/Utlisateur.service"
import { toast } from "./ui/use-toast"

// Liste des pays avec indicatifs et drapeaux
const COUNTRIES = [
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", dialCode: "+261" },
  { code: "US", name: "États-Unis", flag: "🇺🇸", dialCode: "+1" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧", dialCode: "+44" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪", dialCode: "+49" },
  { code: "ES", name: "Espagne", flag: "🇪🇸", dialCode: "+34" },
  { code: "IT", name: "Italie", flag: "🇮🇹", dialCode: "+39" },
  { code: "BE", name: "Belgique", flag: "🇧🇪", dialCode: "+32" },
  { code: "CH", name: "Suisse", flag: "🇨🇭", dialCode: "+41" },
  { code: "MA", name: "Maroc", flag: "🇲🇦", dialCode: "+212" },
  { code: "DZ", name: "Algérie", flag: "🇩🇿", dialCode: "+213" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳", dialCode: "+216" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", dialCode: "+221" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", dialCode: "+225" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲", dialCode: "+237" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", dialCode: "+241" },
  { code: "CD", name: "RD Congo", flag: "🇨🇩", dialCode: "+243" },
  { code: "MU", name: "Maurice", flag: "🇲🇺", dialCode: "+230" },
  { code: "RE", name: "La Réunion", flag: "🇷🇪", dialCode: "+262" },
  { code: "CN", name: "Chine", flag: "🇨🇳", dialCode: "+86" },
  { code: "JP", name: "Japon", flag: "🇯🇵", dialCode: "+81" },
  { code: "IN", name: "Inde", flag: "🇮🇳", dialCode: "+91" },
  { code: "BR", name: "Brésil", flag: "🇧🇷", dialCode: "+55" },
  { code: "AR", name: "Argentine", flag: "🇦🇷", dialCode: "+54" },
  { code: "AU", name: "Australie", flag: "🇦🇺", dialCode: "+61" },
]

interface ContactFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact | null
  onSave: (contact: Contact) => void
}

export function ContactForm({ open, onOpenChange, contact, onSave }: ContactFormProps) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    entreprise: "",
    telephone: "",
    email: "",
    adresse: "",
    fonction: "",
    source: "",
    secteur: "",
    type: "",
    id_utilisateur: "1",
  })

  const [countryCode, setCountryCode] = useState("FR") // Pays par défaut
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [isLoadingUtilisateurs, setIsLoadingUtilisateurs] = useState(true)
  const [uploadError, setUploadError] = useState<string>("")

  // Fonctions de validation
  const validateName = (name: string): string => {
    if (!name.trim()) return "Ce champ est requis"
    if (name.trim().length < 2) return "Minimum 2 caractères"
    if (name.trim().length > 50) return "Maximum 50 caractères"
    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name.trim())) {
      return "Seules les lettres, espaces, apostrophes et tirets sont autorisés"
    }
    return ""
  }

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "L'email est requis"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) return "Format d'email invalide"
    if (email.trim().length > 100) return "Email trop long (maximum 100 caractères)"
    return ""
  }

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return "Le téléphone est requis"
    // Supprimer tous les espaces, tirets et parenthèses
    const cleanPhone = phone.replace(/[\s\-$$$$]/g, "")
    if (!/^\d+$/.test(cleanPhone)) {
      return "Seuls les chiffres, espaces, tirets et parenthèses sont autorisés"
    }
    if (cleanPhone.length < 8) return "Numéro trop court (minimum 8 chiffres)"
    if (cleanPhone.length > 15) return "Numéro trop long (maximum 15 chiffres)"
    return ""
  }

  const validateText = (text: string, fieldName: string, maxLength = 100): string => {
    if (text.trim().length > maxLength) return `${fieldName} trop long (maximum ${maxLength} caractères)`
    return ""
  }

  const validateAddress = (address: string): string => {
    if (address.trim().length > 200) return "Adresse trop longue (maximum 200 caractères)"
    return ""
  }

  // Charger la liste des utilisateurs
  const loadUtilisateurs = async () => {
    setIsLoadingUtilisateurs(true)
    try {
      console.log("Chargement des utilisateurs...")
      const utilisateursData = await getUtilisateur()
      console.log("Utilisateurs chargés:", utilisateursData)
      setUtilisateurs(utilisateursData || [])
    } catch (err) {
      console.error("Erreur de récupération des utilisateurs:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs",
        variant: "destructive",
      })
      setUtilisateurs([])
    } finally {
      setIsLoadingUtilisateurs(false)
    }
  }

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    if (open) {
      loadUtilisateurs()
    }
  }, [open])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const getUtilisateurName = (id_utilisateur: string): string => {
    const utilisateur = utilisateurs.find((u) => u.id_utilisateur.toString() === id_utilisateur)
    return utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : `Utilisateur #${id_utilisateur}`
  }

  const getSelectedCountry = () => {
    return COUNTRIES.find((country) => country.code === countryCode) || COUNTRIES[0]
  }

  useEffect(() => {
    if (contact) {
      setFormData({
        nom: contact.nom || "",
        prenom: contact.prenom || "",
        entreprise: contact.entreprise || "",
        telephone: contact.telephone || "",
        email: contact.email || "",
        adresse: contact.adresse || "",
        fonction: contact.fonction || "",
        source: contact.source || "",
        secteur: contact.secteur || "",
        type: contact.type || "",
        id_utilisateur: contact.id_utilisateur?.toString() || "1",
      })

      // Essayer de détecter le pays à partir du numéro de téléphone
      if (contact.telephone) {
        const foundCountry = COUNTRIES.find((country) => contact.telephone?.startsWith(country.dialCode))
        if (foundCountry) {
          setCountryCode(foundCountry.code)
        }
      }

      if (contact.photo_de_profil) {
        const imageUrl = contact.photo_de_profil.startsWith("http")
          ? contact.photo_de_profil
          : `${process.env.NEXT_PUBLIC_API_URL}${contact.photo_de_profil}`
        setPreviewUrl(imageUrl)
      }
    } else {
      setFormData({
        nom: "",
        prenom: "",
        entreprise: "",
        telephone: "",
        email: "",
        adresse: "",
        fonction: "",
        source: "",
        secteur: "",
        type: "",
        id_utilisateur: "1",
      })
      setCountryCode("FR")
      setPreviewUrl("")
    }
    setErrors({})
    setApiError("")
    setUploadError("")
    setSelectedFile(null)
  }, [contact, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validation nom et prénom
    const nomError = validateName(formData.nom)
    if (nomError) newErrors.nom = nomError

    const prenomError = validateName(formData.prenom)
    if (prenomError) newErrors.prenom = prenomError

    // Validation email
    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    // Validation téléphone
    const phoneError = validatePhone(formData.telephone)
    if (phoneError) newErrors.telephone = phoneError

    // Validation autres champs
    const entrepriseError = validateText(formData.entreprise, "Entreprise", 100)
    if (entrepriseError) newErrors.entreprise = entrepriseError

    const fonctionError = validateText(formData.fonction, "Fonction", 100)
    if (fonctionError) newErrors.fonction = fonctionError

    const adresseError = validateAddress(formData.adresse)
    if (adresseError) newErrors.adresse = adresseError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Fonction pour préparer FormData pour l'API
  const prepareFormDataForAPI = (): FormData => {
    console.log("=== PRÉPARATION FORMDATA ===")
    const formDataToSend = new FormData()

    // Préparer le numéro de téléphone complet avec indicatif
    const selectedCountry = getSelectedCountry()
    const fullPhoneNumber = formData.telephone.startsWith(selectedCountry.dialCode)
      ? formData.telephone
      : `${selectedCountry.dialCode} ${formData.telephone}`

    // Ajouter tous les champs texte
    formDataToSend.append("nom", formData.nom.trim())
    formDataToSend.append("prenom", formData.prenom.trim())
    formDataToSend.append("entreprise", formData.entreprise.trim())
    formDataToSend.append("telephone", fullPhoneNumber)
    formDataToSend.append("email", formData.email.trim().toLowerCase())
    formDataToSend.append("adresse", formData.adresse.trim())
    formDataToSend.append("fonction", formData.fonction.trim())
    formDataToSend.append("source", formData.source)
    formDataToSend.append("secteur", formData.secteur)
    formDataToSend.append("type", formData.type)
    formDataToSend.append("id_utilisateur", formData.id_utilisateur)

    // Ajouter le fichier photo si sélectionné
    if (selectedFile) {
      formDataToSend.append("photo_de_profil", selectedFile)
    }

    return formDataToSend
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setApiError("")

    try {
      const formDataToSend = prepareFormDataForAPI()

      let savedContact
      if (contact) {
        savedContact = await updateContact(Number(contact.id_contact), formDataToSend)
      } else {
        savedContact = await createContact(formDataToSend)
      }

      onSave(savedContact)
      onOpenChange(false)

      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        prenom: "",
        entreprise: "",
        telephone: "",
        email: "",
        adresse: "",
        fonction: "",
        source: "",
        secteur: "",
        type: "",
        id_utilisateur: "1",
      })
      setCountryCode("FR")
      setSelectedFile(null)
      setPreviewUrl("")
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error)
      let errorMessage = "Une erreur est survenue lors de la sauvegarde du contact"

      if (error.name === "HttpError") {
        if (error.response?.detail) {
          if (Array.isArray(error.response.detail)) {
            const errorMessages = error.response.detail
              .map((err: any) => {
                const field = err.loc ? err.loc.join(".") : "champ inconnu"
                const message = err.msg || "erreur de validation"
                return `${field}: ${message}`
              })
              .join("\n")
            errorMessage = `Erreurs de validation:\n${errorMessages}`
          } else {
            errorMessage = error.response.detail
          }
        } else {
          errorMessage = `Erreur HTTP ${error.status}: ${error.message}`
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      setApiError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    // Validation en temps réel pour certains champs
    let processedValue = value

    // Traitement spécial pour nom et prénom (supprimer les chiffres)
    if (field === "nom" || field === "prenom") {
      processedValue = value.replace(/[0-9]/g, "")
    }

    // Traitement spécial pour téléphone (supprimer les lettres sauf espaces, tirets, parenthèses)
    if (field === "telephone") {
      processedValue = value.replace(/[^0-9\s\-$$$$]/g, "")
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }))

    // Validation en temps réel
    if (field === "nom" || field === "prenom") {
      const error = validateName(processedValue)
      setErrors((prev) => ({ ...prev, [field]: error }))
    } else if (field === "email") {
      const error = validateEmail(processedValue)
      setErrors((prev) => ({ ...prev, [field]: error }))
    } else if (field === "telephone") {
      const error = validatePhone(processedValue)
      setErrors((prev) => ({ ...prev, [field]: error }))
    } else {
      // Effacer l'erreur du champ modifié
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    }

    if (apiError) {
      setApiError("")
    }
  }

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.")
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setUploadError("Le fichier est trop volumineux. Taille maximum : 5MB.")
      return
    }

    setUploadError("")
    setSelectedFile(file)

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  const handleRemovePhoto = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setUploadError("")
    const fileInput = document.getElementById("photo-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const triggerFileInput = () => {
    const fileInput = document.getElementById("photo-upload") as HTMLInputElement
    fileInput?.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{contact ? "Modifier le contact" : "Nouveau contact"}</DialogTitle>
          <DialogDescription>
            {contact
              ? "Modifiez les informations du contact ci-dessous."
              : "Ajoutez un nouveau contact à votre liste en remplissant les informations ci-dessous."}
          </DialogDescription>
        </DialogHeader>

        {/* Affichage des erreurs API */}
        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-wrap">{apiError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo de profil */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Photo de profil</h3>
            <div className="flex items-start space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl || "/placeholder.svg"} alt="Photo de profil" />
                  <AvatarFallback>
                    {formData.prenom && formData.nom ? (
                      getInitials(formData.prenom, formData.nom)
                    ) : (
                      <User className="h-12 w-12" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {(previewUrl || selectedFile) && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleRemovePhoto}
                    disabled={loading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={triggerFileInput} disabled={loading}>
                    <Camera className="h-4 w-4 mr-2" />
                    {previewUrl || selectedFile ? "Changer la photo" : "Ajouter une photo"}
                  </Button>
                  {(previewUrl || selectedFile) && (
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemovePhoto} disabled={loading}>
                      Supprimer
                    </Button>
                  )}
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">Formats acceptés : JPG, PNG, GIF, WebP (max 5MB)</p>
                {uploadError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{uploadError}</AlertDescription>
                  </Alert>
                )}
                {selectedFile && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    <p>
                      <strong>Fichier sélectionné :</strong> {selectedFile.name}
                    </p>
                    <p>
                      <strong>Taille :</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => handleChange("prenom", e.target.value)}
                  className={errors.prenom ? "border-red-500" : ""}
                  disabled={loading}
                  placeholder="Prénom (lettres uniquement)"
                />
                {errors.prenom && <p className="text-sm text-red-500">{errors.prenom}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => handleChange("nom", e.target.value)}
                  className={errors.nom ? "border-red-500" : ""}
                  disabled={loading}
                  placeholder="Nom (lettres uniquement)"
                />
                {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                disabled={loading}
                placeholder="exemple@email.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode} disabled={loading}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSelectedCountry().flag}</span>
                        <span className="text-sm">{getSelectedCountry().dialCode}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm">{country.dialCode}</span>
                          <span className="text-sm text-gray-600">{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1">
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    className={errors.telephone ? "border-red-500" : ""}
                    disabled={loading}
                    placeholder="12 34 56 78 90"
                  />
                </div>
              </div>
              {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
              <p className="text-xs text-gray-500">
                Numéro complet : {getSelectedCountry().dialCode} {formData.telephone}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Textarea
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleChange("adresse", e.target.value)}
                rows={2}
                placeholder="Adresse complète"
                disabled={loading}
              />
              {errors.adresse && <p className="text-sm text-red-500">{errors.adresse}</p>}
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations professionnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entreprise">Entreprise</Label>
                <Input
                  id="entreprise"
                  value={formData.entreprise}
                  onChange={(e) => handleChange("entreprise", e.target.value)}
                  placeholder="Nom de l'entreprise"
                  disabled={loading}
                />
                {errors.entreprise && <p className="text-sm text-red-500">{errors.entreprise}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fonction">Fonction</Label>
                <Input
                  id="fonction"
                  value={formData.fonction}
                  onChange={(e) => handleChange("fonction", e.target.value)}
                  placeholder="Poste occupé"
                  disabled={loading}
                />
                {errors.fonction && <p className="text-sm text-red-500">{errors.fonction}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secteur">Secteur d'activité</Label>
              <Select
                value={formData.secteur}
                onValueChange={(value) => handleSelectChange("secteur", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technologie">🖥️ Technologie</SelectItem>
                  <SelectItem value="marketing">📢 Marketing</SelectItem>
                  <SelectItem value="conseil">💼 Conseil</SelectItem>
                  <SelectItem value="finance">💰 Finance</SelectItem>
                  <SelectItem value="sante">🏥 Santé</SelectItem>
                  <SelectItem value="education">🎓 Éducation</SelectItem>
                  <SelectItem value="commerce">🛍️ Commerce</SelectItem>
                  <SelectItem value="industrie">🏭 Industrie</SelectItem>
                  <SelectItem value="immobilier">🏠 Immobilier</SelectItem>
                  <SelectItem value="transport">🚚 Transport</SelectItem>
                  <SelectItem value="agriculture">🌾 Agriculture</SelectItem>
                  <SelectItem value="tourisme">✈️ Tourisme</SelectItem>
                  <SelectItem value="autre">❓ Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Classification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de contact</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">👤 Client</SelectItem>
                    <SelectItem value="prospect">🎯 Prospect</SelectItem>
                    <SelectItem value="partenaire">🤝 Partenaire</SelectItem>
                    <SelectItem value="fournisseur">📦 Fournisseur</SelectItem>
                    <SelectItem value="autre">❓ Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => handleSelectChange("source", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Comment avez-vous connu ce contact ?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                    <SelectItem value="reference">👥 Référence</SelectItem>
                    <SelectItem value="site-web">🌐 Site web</SelectItem>
                    <SelectItem value="salon">🏢 Salon/Événement</SelectItem>
                    <SelectItem value="publicite">📺 Publicité</SelectItem>
                    <SelectItem value="appel-froid">📞 Appel à froid</SelectItem>
                    <SelectItem value="reseaux-sociaux">📱 Réseaux sociaux</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="autre">❓ Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Assignation utilisateur */}
          <div className="space-y-2">
            <Label htmlFor="utilisateur">Utilisateur assigné *</Label>
            <Select
              value={formData.id_utilisateur}
              onValueChange={(value) => handleSelectChange("id_utilisateur", value)}
              disabled={loading || isLoadingUtilisateurs}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingUtilisateurs ? (
                  <SelectItem value="loading" disabled>
                    Chargement des utilisateurs...
                  </SelectItem>
                ) : utilisateurs.length === 0 ? (
                  <SelectItem value="no-users" disabled>
                    Aucun utilisateur disponible
                  </SelectItem>
                ) : (
                  utilisateurs.map((utilisateur) => (
                    <SelectItem key={utilisateur.id_utilisateur} value={utilisateur.id_utilisateur.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          {utilisateur.prenom} {utilisateur.nom}
                        </span>
                        <span className="text-xs text-gray-500">({utilisateur.email})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {formData.id_utilisateur && !isLoadingUtilisateurs && (
              <p className="text-xs text-gray-600">
                Utilisateur sélectionné : {getUtilisateurName(formData.id_utilisateur)}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || isLoadingUtilisateurs}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {contact ? "Mise à jour..." : "Création..."}
                </>
              ) : contact ? (
                "Mettre à jour"
              ) : (
                "Créer le contact"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
