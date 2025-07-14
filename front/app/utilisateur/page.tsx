"use client"

import Navbar from "@/components/navbarLink/nav"
import { getUtilisateur, createUtilisateur, updateUtilisateur, deleteUtilisateur } from "@/service/Utlisateur.service"
import type { Utilisateur } from "@/types/Utilisateur.type"
import { Edit, Plus, Trash2, User, Mail, Phone, Briefcase, Camera, X, Save, AlertTriangle } from "lucide-react"
import { useEffect, useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

const UtilisateurPage = () => {
  const [data, setData] = useState<Utilisateur[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<Utilisateur | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "",
    numero_tel: "",
    mot_de_passe: "",
  })

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const response = await getUtilisateur()
      setData(response || [])
    } catch (err) {
      console.error("Erreur de récupération:", err)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Construire l'URL complète pour les images
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "/placeholder.svg?height=100&width=100"
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (imagePath.startsWith("http")) return imagePath
    // Si c'est un chemin relatif, construire l'URL complète
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    return `${baseUrl}/${imagePath.replace(/^\/+/, "").replace(/\\/g, "/")}`
  }

  const openForm = (user?: Utilisateur) => {
    setErrorMessage(null)
    setDeleteError(null)
    setPhotoPreview(null)
    if (user) {
      setEditUser(user)
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        numero_tel: user.numero_tel,
        mot_de_passe: "",
      })
      // Définir l'aperçu de la photo existante
      setPhotoPreview(getImageUrl(user.photo_profil))
    } else {
      setEditUser(null)
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        role: "",
        numero_tel: "",
        mot_de_passe: "",
      })
    }
    setPhotoFile(null)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    // Validation des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.email || !formData.numero_tel) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.")
      return
    }

    if (!editUser && !formData.mot_de_passe) {
      setErrorMessage("Le mot de passe est obligatoire pour un nouvel utilisateur.")
      return
    }

    const confirmed = window.confirm(
      editUser ? "Confirmer la modification de l'utilisateur ?" : "Confirmer l'ajout de l'utilisateur ?",
    )
    if (!confirmed) return

    setIsSubmitting(true)
    const payload = new FormData()
    payload.append("nom", formData.nom)
    payload.append("prenom", formData.prenom)
    payload.append("email", formData.email)
    payload.append("role", formData.role)
    payload.append("numero_tel", formData.numero_tel)

    if (formData.mot_de_passe) {
      payload.append("mot_de_passe", formData.mot_de_passe)
    }

    if (photoFile) {
      payload.append("photo_profil", photoFile)
    }

    try {
      if (editUser) {
        await updateUtilisateur(editUser.id_utilisateur.toString(), payload)
      } else {
        await createUtilisateur(payload)
      }
      setShowForm(false)
      setErrorMessage(null)
      refreshData()
    } catch (error: any) {
      console.error("Erreur lors de l'envoi:", error)
      const message = error?.response?.data?.detail || error?.response?.data?.message || error?.message || ""
      if (typeof message === "string" && message.toLowerCase().includes("email")) {
        setErrorMessage("L'adresse e-mail est déjà utilisée.")
      } else {
        setErrorMessage("Une erreur est survenue. Veuillez réessayer.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)
      // Créer un aperçu de l'image
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = async (userId: number) => {
    // Réinitialiser les erreurs précédentes
    setDeleteError(null)

    const user = data.find((u) => u.id_utilisateur === userId)
    const userName = user ? `${user.prenom} ${user.nom}` : "cet utilisateur"

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer ${userName} ?\n\nAttention: Si cet utilisateur a des contacts associés, la suppression échouera.`,
    )
    if (!confirmed) return

    try {
      await deleteUtilisateur(userId.toString())
      refreshData()
      // Afficher un message de succès
      alert(`L'utilisateur ${userName} a été supprimé avec succès.`)
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error)

      // Analyser le type d'erreur
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || ""

      if (
        errorMessage.toLowerCase().includes("foreign key") ||
        errorMessage.toLowerCase().includes("constraint") ||
        errorMessage.toLowerCase().includes("référence") ||
        errorMessage.toLowerCase().includes("contact")
      ) {
        setDeleteError(
          `Impossible de supprimer ${userName} car il/elle a des contacts associés. ` +
            `Vous devez d'abord supprimer ou réassigner tous les contacts de cet utilisateur avant de pouvoir le supprimer.`,
        )
      } else if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("404")) {
        setDeleteError(`L'utilisateur ${userName} n'existe plus ou a déjà été supprimé.`)
        // Rafraîchir les données pour mettre à jour la liste
        refreshData()
      } else {
        setDeleteError(
          `Une erreur est survenue lors de la suppression de ${userName}. ` +
            `Veuillez vérifier que cet utilisateur n'a pas de données associées et réessayer.`,
        )
      }
    }
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
              <p className="text-gray-600 mt-1">Gérez les utilisateurs de votre système</p>
            </div>
            <Button onClick={() => openForm()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          </div>

          {/* Affichage des erreurs de suppression */}
          {deleteError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{deleteError}</AlertDescription>
              <Button
                onClick={() => setDeleteError(null)}
                variant="ghost"
                size="sm"
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900">{data.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Briefcase className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Commerciaux</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.filter((u) => u.role.toLowerCase() === "commercial").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.filter((u) => u.role.toLowerCase() === "admin").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des utilisateurs */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Chargement...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((user) => (
                <Card key={user.id_utilisateur} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={getImageUrl(user.photo_profil) || "/placeholder.svg"}
                          alt={`${user.prenom} ${user.nom}`}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=100&width=100"
                          }}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                          {user.prenom[0]}
                          {user.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {user.prenom} {user.nom}
                        </h3>
                        <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>{user.role}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {user.numero_tel}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => openForm(user)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        onClick={() => handleDelete(user.id_utilisateur)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </h2>
              <Button
                onClick={() => setShowForm(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {/* Photo de profil */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoPreview || "/placeholder.svg?height=100&width=100"} alt="Aperçu" />
                    <AvatarFallback className="bg-gray-100">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                    <Camera className="h-4 w-4" />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Cliquez sur l'icône pour changer la photo</p>
              </div>

              {/* Champs du formulaire */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Prénom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="numero_tel"
                  value={formData.numero_tel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0345353588"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un rôle</option>
                  <option value="Admin">Admin</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Manager">Manager</option>
                  <option value="Utilisateur">Utilisateur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe {!editUser && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="mot_de_passe"
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={editUser ? "Laisser vide pour ne pas changer" : "Mot de passe"}
                />
              </div>

              {errorMessage && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
              <Button onClick={() => setShowForm(false)} variant="outline" disabled={isSubmitting}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editUser ? "Modifier" : "Créer"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UtilisateurPage
