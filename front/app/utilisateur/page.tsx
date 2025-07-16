"use client"

import Navbar from "@/components/navbarLink/nav"
import {
  fetchUtilisateurs,
  createUtilisateur,
  updateUtilisateur,
  deleteUtilisateur,
} from "@/service/Utlisateur.service"
import type { Utilisateur } from "@/types/Utilisateur.type"
import { Edit, Plus, Trash2, User, Briefcase, X, Save, AlertTriangle, Search } from "lucide-react"
import { useEffect, useState, useMemo, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Page de gestion des utilisateurs.
 * - Recherche full‑text (nom, email, rôle)
 * - CRUD complet via API
 * - Validation e‑mail « @gmail.com » uniquement (ex : `nomPersonne@gmail.com`)
 * - Responsive mobile → desktop
 */
const UtilisateurPage = () => {
  /* --------------------------------------------------- */
  /* ÉTATS                                               */
  /* --------------------------------------------------- */
  const [data, setData] = useState<Utilisateur[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // recherche
  const [search, setSearch] = useState("")
  // formulaire / modale
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<Utilisateur | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // suppression
  const [deleteError, setDeleteError] = useState<string | null>(null)
  // données du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    mot2pass: "",
    role: "",
    actif: true,
    photo_profil: "",
  })

  useEffect(() => {
    refreshData()
  }, [])
  const refreshData = async () => {
    setIsLoading(true)
    try {
      const response = await fetchUtilisateurs()
      setData(response || [])
    } catch (err) {
      console.error("Erreur de récupération :", err)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  /* --------------------------------------------------- */
  /* OUTILS                                              */
  /* --------------------------------------------------- */
  const getImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return "/placeholder.svg?height=100&width=100"
    if (imagePath.startsWith("http")) return imagePath
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    return `${baseUrl}/${imagePath.replace(/^\/+/, "").replace(/\\/g, "/")}`
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "commercial":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "manager":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  /* --------------------------------------------------- */
  /* RECHERCHE : filtrage MEMOISÉ                        */
  /* --------------------------------------------------- */
  const displayedUsers = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(
      (u) => u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q),
    )
  }, [search, data])

  /* --------------------------------------------------- */
  /* FORMULAIRE : ouvrir / changer / soumettre           */
  /* --------------------------------------------------- */
  const openForm = (user?: Utilisateur) => {
    setErrorMessage(null)
    setDeleteError(null)
    setPhotoPreview(null)
    if (user) {
      setEditUser(user)
      setFormData({
        nom: user.nom,
        email: user.email,
        mot2pass: "",
        role: user.role,
        actif: user.actif ?? true,
        photo_profil: user.photo_profil || "",
      })
      setPhotoPreview(getImageUrl(user.photo_profil))
    } else {
      setEditUser(null)
      setFormData({
        nom: "",
        email: "",
        mot2pass: "",
        role: "",
        actif: true,
        photo_profil: "",
      })
    }
    setPhotoFile(null)
    setShowForm(true)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((p) => ({ ...p, [name]: checked }))
    } else {
      setFormData((p) => ({ ...p, [name]: value }))
    }
  }

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  // Validation « @gmail.com » – commence par une lettre
  const EMAIL_PATTERN = /^[A-Za-z][A-Za-z0-9._%+-]*@gmail\.com$/

  const handleSubmit = async () => {
    if (!formData.nom || !formData.email) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.")
      return
    }
    // Vérif e‑mail @gmail.com
    if (!EMAIL_PATTERN.test(formData.email)) {
      setErrorMessage("E‑mail invalide. Il doit se terminer par @gmail.com, ex : nomPersonne@gmail.com")
      return
    }
    if (!editUser && !formData.mot2pass) {
      setErrorMessage("Le mot de passe est obligatoire pour un nouvel utilisateur.")
      return
    }
    if (
      !window.confirm(
        editUser ? "Confirmer la modification de l'utilisateur ?" : "Confirmer l'ajout de l'utilisateur ?",
      )
    )
      return

    setIsSubmitting(true)
    const payload = new FormData()
    payload.append("nom", formData.nom)
    payload.append("email", formData.email)
    payload.append("role", formData.role)
    payload.append("actif", formData.actif ? "true" : "false")
    if (formData.mot2pass) payload.append("mot2pass", formData.mot2pass)
    if (photoFile) payload.append("photo_profil", photoFile)

    try {
      if (editUser) {
        await updateUtilisateur(editUser.id_utilisateur, payload)
        alert(`L'utilisateur ${formData.nom} a été modifié avec succès.`)
      } else {
        await createUtilisateur(payload)
        alert(`L'utilisateur ${formData.nom} a été créé avec succès.`)
      }
      setShowForm(false)
      refreshData()
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || ""
      setErrorMessage(
        /not found|404/i.test(msg)
          ? "L'utilisateur n'existe plus ou a déjà été supprimé."
          : `Une erreur est survenue : ${msg}`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleDelete = async (id: number | string): Promise<void> => {
    // Conversion de l'ID en number si c'est une string
    const userId = typeof id === "string" ? Number.parseInt(id, 10) : id

    // Vérification de l'ID
    if (typeof userId !== "number" || !Number.isFinite(userId) || userId <= 0 || isNaN(userId)) {
      setDeleteError("ID utilisateur invalide")
      return
    }

    // Reset des erreurs précédentes
    setDeleteError(null)

    // Trouver l'utilisateur dans les données
    const user = data.find((u) => u.id_utilisateur === userId)
    const name = user ? ` ${user.nom}` : ""

    // Confirmation de suppression
    if (
      !window.confirm(
        `Voulez‑vous vraiment supprimer${name} ?\n\nAttention : si cet utilisateur a des contacts associés, la suppression échouera.`,
      )
    )
      return

    try {
      // Appel de l'API de suppression avec l'ID converti
      await deleteUtilisateur(userId)

      // Actualiser les données
      await refreshData()

      // Message de succès
      alert(`L'utilisateur${name} a été supprimé avec succès.`)
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err)

      // Extraction du message d'erreur
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || err?.toString() || ""

      // Gestion des différents types d'erreurs
      if (/foreign key|constraint|référence|contact/i.test(msg)) {
        setDeleteError(`Impossible de supprimer${name} car il/elle a des contacts associés.`)
      } else if (/not\s?found|404/i.test(msg)) {
        setDeleteError(`L'utilisateur${name} n'existe plus ou a déjà été supprimé.`)
      } else if (/id introuvable|user not found|utilisateur introuvable/i.test(msg)) {
        setDeleteError(`L'utilisateur${name} est introuvable dans la base de données.`)
      } else {
        setDeleteError(`Une erreur inattendue est survenue lors de la suppression${name}: ${msg}`)
      }
    }
  }


  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Navbar />
      {/* —— CONTENU PRINCIPAL —— */}
      <div className={showForm ? "flex-1 p-6 filter blur-sm pointer-events-none select-none" : "flex-1 p-6"}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide">Gestion des Utilisateurs</h1>
              <p className="text-gray-600 mt-1">Gérez les utilisateurs de votre système</p>
            </div>
            {/* Bouton + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
              {/* Champ de recherche */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Recherche nom / email / rôle"
                  className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <Button
                onClick={() => openForm()}
                className="bg-blue-600 hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvel Utilisateur
              </Button>
            </div>
          </div>

          {/* Alert suppression */}
          {deleteError && (
            <Alert className="mb-6 border-red-300 bg-red-100 flex items-center space-x-3 rounded-lg shadow-sm">
              <AlertTriangle className="h-5 w-5 text-red-700" />
              <AlertDescription className="text-red-900 flex-1">{deleteError}</AlertDescription>
              <Button
                onClick={() => setDeleteError(null)}
                variant="ghost"
                size="sm"
                className="text-red-700 hover:text-red-900"
              >
                <X className="h-5 w-5" />
              </Button>
            </Alert>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center space-x-4">
                <User className="h-10 w-10 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Utilisateurs</p>
                  <p className="text-3xl font-bold text-gray-900">{displayedUsers.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center space-x-4">
                <Briefcase className="h-10 w-10 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Admins</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {displayedUsers.filter((u) => u.role.toLowerCase() === "admin").length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center space-x-4">
                <Briefcase className="h-10 w-10 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Commerciaux</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {displayedUsers.filter((u) => u.role.toLowerCase() === "commercial").length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste utilisateurs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              <p className="text-gray-500 text-center col-span-full">Chargement des utilisateurs…</p>
            ) : displayedUsers.length === 0 ? (
              <p className="text-gray-500 text-center col-span-full">
                Aucun utilisateur ne correspond à votre recherche.
              </p>
            ) : (
              displayedUsers.map((user, idx) => (
                <Card
                  key={`${user.id_utilisateur}-${idx}`}
                  className="flex flex-col shadow-sm hover:shadow-md transition-shadow rounded-lg"
                >
                  <CardContent className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={getImageUrl(user.photo_profil) || "/placeholder.svg"}
                        alt={`${user.nom} photo`}
                      />
                      <AvatarFallback>{user.nom[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">{user.nom}</h3>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      <Badge
                        className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Modifier ${user.nom}`}
                        onClick={() => openForm(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        aria-label={`Supprimer ${user.nom}`}
                        onClick={() => handleDelete(Number(user.id_utilisateur))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* —— MODALE FORM —— */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg relative overflow-auto max-h-[90vh]">
            {/* Titre */}
            <h2 className="text-xl font-bold mb-4">
              {editUser ? "Modifier un utilisateur" : "Ajouter un nouvel utilisateur"}
            </h2>
            {/* Erreur formulaire */}
            {errorMessage && (
              <Alert className="mb-4 border-red-300 bg-red-100 flex items-center space-x-3 rounded-lg shadow-sm">
                <AlertTriangle className="h-5 w-5 text-red-700" />
                <AlertDescription className="text-red-900 flex-1">{errorMessage}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-700 hover:text-red-900"
                >
                  <X className="h-5 w-5" />
                </Button>
              </Alert>
            )}
            {/* Formulaire */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!isSubmitting) handleSubmit()
              }}
              className="space-y-4"
              autoComplete="off"
            >
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50 transition"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E‑mail <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50 transition"
                />
              </div>
              <div>
                <label htmlFor="mot2pass" className="block text-sm font-medium text-gray-700">
                  Mot de passe{" "}
                  {editUser ? "(laisser vide pour ne pas changer)" : <span className="text-red-500">*</span>}
                </label>
                <input
                  id="mot2pass"
                  name="mot2pass"
                  type="password"
                  autoComplete="new-password"
                  value={formData.mot2pass}
                  onChange={handleChange}
                  {...(!editUser && { required: true })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50 transition"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rôle
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50 transition"
                  required
                >
                  <option value="">-- Sélectionner un rôle --</option>
                  <option value="Administrateur">Administrateur</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Superviseur">Superviseur</option>
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  id="actif"
                  name="actif"
                  type="checkbox"
                  checked={formData.actif}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="actif" className="text-sm font-medium text-gray-700">
                  Actif
                </label>
              </div>
              <div>
                <label htmlFor="photo_profil" className="block text-sm font-medium text-gray-700">
                  Photo de profil
                </label>
                <input
                  id="photo_profil"
                  name="photo_profil"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                />
                {photoPreview && (
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Aperçu"
                    className="mt-2 h-20 w-20 rounded-full object-cover border border-gray-300"
                  />
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? "Enregistrement…" : "Enregistrer"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UtilisateurPage
