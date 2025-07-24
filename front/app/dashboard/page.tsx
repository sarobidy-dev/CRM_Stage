"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Search,
  Settings,
  Users,
  Building2,
  Target,
  DollarSign,
  Filter,
  Download,
  X,
  Maximize2,
  AlertCircle,
  CheckCircle,
  Info,
  User,
  Palette,
  Globe,
  LogOut,
  Moon,
  Sun,
  Monitor,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/components/navbarLink/nav"
import type { Contact } from "@/types/Contact.type"
import type { HistoriqueAction } from "@/types/historiqueAction.type"
import { fetchUtilisateurs } from "@/service/Utlisateur.service"
import { getAllContacts } from "@/service/Contact.service"
import { getAllEntreprises } from "@/service/Entreprise.service"
import { getAllCampagnes } from "@/service/campagne.service"
import { getAllHistoriques, getStatistiques } from "@/service/historiqueAction.service"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Interfaces
interface DashboardStats {
  totalUtilisateurs: number
  totalContacts: number
  totalEntreprises: number
  totalCampagnes: number
  totalActions: number
  pourcentageVenteMoyen: number
  actionsEmail: number
  actionsAppel: number
  actionsReunion: number
}

interface RecentActivity {
  actions: HistoriqueAction[]
  contacts: Contact[]
}

interface Notification {
  id: string
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  time: string
  read: boolean
  data?: any
}

interface ChartData {
  actionsData: Array<{ day: string; value: number; emails: number; calls: number; meetings: number }>
  ventesData: Array<{ day: string; pourcentage: number; actions: number }>
  pieData: Array<{ name: string; value: number; color: string }>
}

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  phone: string
  department: string
  joinDate: string
  lastLogin: string
  preferences: {
    theme: "light" | "dark" | "system"
    language: string
    notifications: {
      email: boolean
      push: boolean
      sound: boolean
    }
  }
}

// Fonctions utilitaires pour les cookies
const setCookie = (name: string, value: string, days = 30) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const getCookie = (name: string): string | null => {
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

const AccueilPage = () => {
  // États du composant
  const [stats, setStats] = useState<DashboardStats>({
    totalUtilisateurs: 0,
    totalContacts: 0,
    totalEntreprises: 0,
    totalCampagnes: 0,
    totalActions: 0,
    pourcentageVenteMoyen: 0,
    actionsEmail: 0,
    actionsAppel: 0,
    actionsReunion: 0,
  })

  const [previousStats, setPreviousStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({
    actions: [],
    contacts: [],
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showToastNotification, setShowToastNotification] = useState(false)
  const [chartData, setChartData] = useState<ChartData>({
    actionsData: [],
    ventesData: [],
    pieData: [],
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dateRange: "7days",
    type: "all",
    status: "all",
  })
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")
  const [language, setLanguage] = useState("fr")
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sound: false,
  })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // État utilisateur avec gestion des cookies
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "",
    name: "Admin User",
    email: "admin@crm.com",
    role: "Administrateur",
    avatar: "/placeholder.svg?height=32&width=32",
    phone: "+261 34 12 345 67",
    department: "Direction",
    joinDate: "2023-01-15",
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: "light",
      language: "fr",
      notifications: {
        email: true,
        push: true,
        sound: false,
      },
    },
  })

  const [statsNombre, setstatsNombre] = useState<{ gagnes: number; encours: number; perdus: number } | null>(null)
  const [error, setError] = useState("")

  // Chargement des statistiques
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStatistiques()
        setstatsNombre(res)
      } catch (err) {
        console.error(err)
        setError("Impossible de charger les statistiques")
      }
    }
    fetchStats()
  }, [])

  if (error) return <p className="text-red-500">{error}</p>
  if (!stats) return <p>Chargement...</p>

  // Fonction pour sauvegarder l'utilisateur dans les cookies
  const saveUserToCookies = useCallback((user: UserProfile) => {
    setCookie("crm_user_profile", JSON.stringify(user), 30)
    setCookie("crm_user_id", user.id, 30)
    setCookie("crm_user_name", user.name, 30)
    setCookie("crm_user_email", user.email, 30)
    setCookie("crm_user_role", user.role, 30)
    setCookie("crm_last_login", new Date().toISOString(), 30)
  }, [])

  const loadUserFromCookies = useCallback((): UserProfile | null => {
    const userProfileCookie = getCookie("crm_user_profile")
    if (userProfileCookie) {
      try {
        const user = JSON.parse(userProfileCookie)
        return {
          ...user,
          lastLogin: getCookie("crm_last_login") || user.lastLogin,
        }
      } catch (error) {
        console.error("Erreur lors du parsing du profil utilisateur:", error)
      }
    }

    const userId = getCookie("crm_user_id")
    const userName = getCookie("crm_user_name")
    const userEmail = getCookie("crm_user_email")
    const userRole = getCookie("crm_user_role")

    if (userId || userName || userEmail) {
      return {
        id: userId || "default_user",
        name: userName || "Admin User",
        email: userEmail || "admin@crm.com",
        role: userRole || "Administrateur",
        avatar: "/placeholder.svg?height=32&width=32",
        phone: "+261 34 12 345 67",
        department: "Direction",
        joinDate: "2023-01-15",
        lastLogin: getCookie("crm_last_login") || new Date().toISOString(),
        preferences: {
          theme: "light",
          language: "fr",
          notifications: {
            email: true,
            push: true,
            sound: false,
          },
        },
      }
    }

    return null
  }, [])

  // Fonction pour créer une notification dynamique
  const createNotification = useCallback((type: Notification["type"], title: string, message: string, data?: any) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      time: "À l'instant",
      read: false,
      data,
    }
    setNotifications((prev) => [newNotification, ...prev])
    toast({
      title: title,
      description: message,
      variant: type === "error" ? "destructive" : "default",
    })
    setShowToastNotification(true)
    setTimeout(() => setShowToastNotification(false), 3000)
  }, [])

  // Fonction pour générer les données des graphiques dynamiquement
  const generateChartData = useCallback((actions: HistoriqueAction[], contacts: Contact[]): ChartData => {
    const now = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

    // Données d'actions par jour
    const actionsData = last7Days.map((date) => {
      const dayName = dayNames[date.getDay()]
      const dayActions = actions.filter((action) => {
        const actionDate = new Date(action.date)
        return actionDate.toDateString() === date.toDateString()
      })

      const emails = dayActions.filter((a) => a.action.toLowerCase() === "email").length
      const calls = dayActions.filter((a) => a.action.toLowerCase() === "appel").length
      const meetings = dayActions.filter((a) => a.action.toLowerCase() === "reunion").length
      const total = dayActions.length

      return {
        day: dayName,
        value: total,
        emails,
        calls,
        meetings,
      }
    })

    // Données de pourcentage de vente par jour
    const ventesData = last7Days.map((date) => {
      const dayName = dayNames[date.getDay()]
      const dayActions = actions.filter((action) => {
        const actionDate = new Date(action.date)
        return actionDate.toDateString() === date.toDateString()
      })

      const avgPourcentage =
        dayActions.length > 0
          ? dayActions.reduce((sum, action) => sum + action.pourcentageVente, 0) / dayActions.length
          : 0

      return {
        day: dayName,
        pourcentage: Math.round(avgPourcentage),
        actions: dayActions.length,
      }
    })

    // Données du graphique en secteurs pour les types d'actions
    const emailCount = actions.filter((a) => a.action.toLowerCase() === "email").length
    const callCount = actions.filter((a) => a.action.toLowerCase() === "appel").length
    const meetingCount = actions.filter((a) => a.action.toLowerCase() === "réunion").length
    const visitCount = actions.filter((a) => a.action.toLowerCase() === "visite").length
    const otherCount = actions.length - emailCount - callCount - meetingCount - visitCount

    const pieData = [
      { name: "Emails", value: emailCount, color: "#3b82f6" },
      { name: "Appels", value: callCount, color: "#10b981" },
      { name: "Réunions", value: meetingCount, color: "#f59e0b" },
      { name: "Visites", value: visitCount, color: "#8b5cf6" },
      { name: "Autres", value: otherCount, color: "#ef4444" },
    ].filter((item) => item.value > 0)

    return {
      actionsData,
      ventesData,
      pieData,
    }
  }, [])

  // Chargement initial des données utilisateur depuis les cookies
  useEffect(() => {
    const savedUser = loadUserFromCookies()
    if (savedUser) {
      setUserProfile(savedUser)
      setTheme(savedUser.preferences.theme)
      setLanguage(savedUser.preferences.language)
      setNotificationSettings(savedUser.preferences.notifications)
      setIsDarkMode(savedUser.preferences.theme === "dark")
    } else {
      const defaultUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: "Admin User",
        email: "admin@crm.com",
        role: "Administrateur",
        avatar: "/placeholder.svg?height=32&width=32",
        phone: "+261 34 12 345 67",
        department: "Direction",
        joinDate: "2023-01-15",
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: "light",
          language: "fr",
          notifications: {
            email: true,
            push: true,
            sound: false,
          },
        },
      }
      setUserProfile(defaultUser)
      saveUserToCookies(defaultUser)
    }
  }, [loadUserFromCookies, saveUserToCookies])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Appels API parallèles avec gestion des erreurs individuelles
      const [utilisateursResult, contactsResult, entreprisesResult, campagnesResult, actionsResult] =
        await Promise.allSettled([
          fetchUtilisateurs(),
          getAllContacts(),
          getAllEntreprises(),
          getAllCampagnes(),
          getAllHistoriques(),
        ])

     
      const utilisateurs = utilisateursResult.status === "fulfilled" ? utilisateursResult.value : []
      const contacts = contactsResult.status === "fulfilled" ? contactsResult.value.data || [] : []
      const entreprises = entreprisesResult.status === "fulfilled" ? entreprisesResult.value : []

      // Gestion des réponses API avec format ApiResponse
      const campagnes = campagnesResult.status === "fulfilled" ? campagnesResult.value.data || [] : []
      const actionsResponse = actionsResult.status === "fulfilled" ? actionsResult.value : { data: [] }
      const actions = actionsResponse.data || []

      // Gestion des erreurs individuelles
      if (utilisateursResult.status === "rejected") {
        console.error("Erreur utilisateurs:", utilisateursResult.reason)
        createNotification("warning", "Données utilisateurs", "Impossible de charger les utilisateurs")
      }
      if (contactsResult.status === "rejected") {
        console.error("Erreur contacts:", contactsResult.reason)
        createNotification("warning", "Données contacts", "Impossible de charger les contacts")
      }
      if (entreprisesResult.status === "rejected") {
        console.error("Erreur entreprises:", entreprisesResult.reason)
        createNotification("warning", "Données entreprises", "Impossible de charger les entreprises")
      }
      if (campagnesResult.status === "rejected") {
        console.error("Erreur campagnes:", campagnesResult.reason)
        createNotification("warning", "Données campagnes", "Impossible de charger les campagnes")
      }
      if (actionsResult.status === "rejected") {
        console.error("Erreur actions:", actionsResult.reason)
        createNotification("warning", "Données actions", "Impossible de charger l'historique des actions")
      }

      // Calcul des statistiques
      const actionsEmail = actions.filter((a) => a.action?.toLowerCase() === "email").length
      const actionsAppel = actions.filter((a) => a.action?.toLowerCase() === "appel").length
      const actionsReunion = actions.filter((a) => a.action?.toLowerCase() === "réunion").length

      const pourcentageVenteMoyen =
        actions.length > 0
          ? Math.round(actions.reduce((sum, action) => sum + (action.pourcentageVente || 0), 0) / actions.length)
          : 0

      const newStats = {
        totalUtilisateurs: utilisateurs.length,
        totalContacts: contacts.length,
        totalEntreprises: entreprises.length,
        totalCampagnes: campagnes.length,
        totalActions: actions.length,
        pourcentageVenteMoyen,
        actionsEmail,
        actionsAppel,
        actionsReunion,
      }

      const newChartData = generateChartData(actions, contacts)
      setChartData(newChartData)

      setPreviousStats(stats)
      setStats(newStats)

      const recentActions = actions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
      const recentContacts = Array.isArray(contacts) ? contacts.slice(0, 5) : []

      setRecentActivity({
        actions: recentActions,
        contacts: recentContacts,
      })

      // Notification de succès si toutes les données sont chargées
      if (
        utilisateursResult.status === "fulfilled" &&
        contactsResult.status === "fulfilled" &&
        entreprisesResult.status === "fulfilled" &&
        campagnesResult.status === "fulfilled" &&
        actionsResult.status === "fulfilled"
      ) {
        return null
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      createNotification("error", "Erreur de chargement", "Impossible de charger les données du tableau de bord")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const exportData = (format: "csv" | "excel") => {
    const dataToExport = {
      stats,
      actions: recentActivity.actions,
      contacts: recentActivity.contacts,
      chartData,
    }
    if (format === "csv") {
      exportToCSV(dataToExport)
    } else {
      exportToExcel(dataToExport)
    }
    toast({
      title: "Export réussi",
      description: `Données exportées en format ${format.toUpperCase()}`,
    })
    setShowExportDialog(false)
  }

  const exportToCSV = (data: any) => {
    const csvContent = [
      "Type,Valeur",
      `Total Contacts,${data.stats.totalContacts}`,
      `Total Entreprises,${data.stats.totalEntreprises}`,
      `Total Campagnes,${data.stats.totalCampagnes}`,
      `Total Actions,${data.stats.totalActions}`,
      `Pourcentage Vente Moyen,${data.stats.pourcentageVenteMoyen}%`,
      "",
      "Actions Récentes",
      "Date,Commentaire,Pourcentage Vente",
      ...data.actions.map(
        (action: HistoriqueAction) => `${formatDate(action.date)},"${action.commentaire}",${action.pourcentageVente}%`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `crm-dashboard-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = (data: any) => {
    const excelContent = [
      "CRM Dashboard Export",
      `Date d'export: ${new Date().toLocaleDateString("fr-FR")}`,
      "",
      "=== STATISTIQUES GÉNÉRALES ===",
      `Total Contacts: ${data.stats.totalContacts}`,
      `Total Entreprises: ${data.stats.totalEntreprises}`,
      `Total Campagnes: ${data.stats.totalCampagnes}`,
      `Total Actions: ${data.stats.totalActions}`,
      `Pourcentage Vente Moyen: ${data.stats.pourcentageVenteMoyen}%`,
      "",
      "=== ACTIONS RÉCENTES ===",
      ...data.actions.map(
        (action: HistoriqueAction) =>
          `${formatDate(action.date)} - ${action.commentaire} (${action.pourcentageVente}%)`,
      ),
    ].join("\n")

    const blob = new Blob([excelContent], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `crm-dashboard-${new Date().toISOString().split("T")[0]}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const applyFilters = () => {
    toast({
      title: "Filtres appliqués",
      description: `Période: ${filters.dateRange}, Type: ${filters.type}`,
    })
    setShowFilters(false)
    loadDashboardData()
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    setIsDarkMode(newTheme === "dark")
    const updatedProfile = {
      ...userProfile,
      preferences: {
        ...userProfile.preferences,
        theme: newTheme,
      },
    }
    setUserProfile(updatedProfile)
    saveUserToCookies(updatedProfile)
    localStorage.setItem("theme", newTheme)
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    const updatedProfile = {
      ...userProfile,
      preferences: {
        ...userProfile.preferences,
        language: value,
      },
    }
    setUserProfile(updatedProfile)
    saveUserToCookies(updatedProfile)
    toast({
      title: "Langue modifiée",
      description: `La langue a été modifiée en ${value}.`,
    })
  }

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    const newSettings = { ...notificationSettings, [setting]: !notificationSettings[setting] }
    setNotificationSettings(newSettings)
    const updatedProfile = {
      ...userProfile,
      preferences: {
        ...userProfile.preferences,
        notifications: newSettings,
      },
    }
    setUserProfile(updatedProfile)
    saveUserToCookies(updatedProfile)
    toast({
      title: "Paramètres de notification mis à jour",
      description: `Les notifications ${setting} ont été mises à jour.`,
    })
  }

  const router = useRouter()

  const handleLogout = () => {
    deleteCookie("crm_user_profile")
    deleteCookie("crm_user_id")
    deleteCookie("crm_user_name")
    deleteCookie("crm_user_email")
    deleteCookie("crm_user_role")
    deleteCookie("crm_last_login")
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    })
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium">Chargement en cours...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-100 text-gray-800">
        <Navbar />
        <div
          className={`min-h-screen w-full transition-colors duration-300 ${
            isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 to-slate-100"
          }`}
        >
          {/* Notification Toast */}
          {showToastNotification && (
            <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
              <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">Données mises à jour !</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CRM</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                      <p className="text-sm text-gray-500">Système de gestion client - Données en temps réel</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-md mx-8">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Rechercher contacts, entreprises..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    {new Date().toLocaleDateString("fr-FR", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  {/* Notifications */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative"
                    >
                      <Bell className={`h-5 w-5 ${unreadNotifications > 0 ? "animate-pulse" : ""}`} />
                      {unreadNotifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs animate-bounce">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </Button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-slide-in-top">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {unreadNotifications} non lues
                            </Badge>
                            {notifications.length > 0 && (
                              <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="text-xs">
                                Tout effacer
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Aucune notification</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                }`}
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  {getNotificationIcon(notification.type)}
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                                    <p className="text-sm text-gray-600">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                  </div>
                                  {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Paramètres
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Profil utilisateur connecté */}
                      <DropdownMenuItem onClick={() => setShowProfileModal(true)} className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        <div className="flex flex-col">
                          <span>Profil utilisateur</span>
                          <span className="text-xs text-gray-500">{userProfile.name}</span>
                          <span className="text-xs text-gray-400">{userProfile.role}</span>
                        </div>
                      </DropdownMenuItem>

                      {/* Thème */}
                      <DropdownMenuItem className="cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Palette className="h-4 w-4 mr-2" />
                            <div className="flex flex-col">
                              <span>Thème</span>
                              <span className="text-xs text-gray-500">
                                {theme === "light" ? "Clair" : theme === "dark" ? "Sombre" : "Système"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant={theme === "light" ? "default" : "ghost"}
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleThemeChange("light")}
                            >
                              <Sun className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={theme === "dark" ? "default" : "ghost"}
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleThemeChange("dark")}
                            >
                              <Moon className="h-3 w-3" />
                            </Button>
                            <Button
                              variant={theme === "system" ? "default" : "ghost"}
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleThemeChange("system")}
                            >
                              <Monitor className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </DropdownMenuItem>

                      {/* Langue */}
                      <DropdownMenuItem className="cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            <div className="flex flex-col">
                              <span>Langue</span>
                              <span className="text-xs text-gray-500">
                                {language === "fr" ? "Français" : language === "en" ? "English" : "Malagasy"}
                              </span>
                            </div>
                          </div>
                          <Select value={language} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="h-6 w-16 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fr">FR</SelectItem>
                              <SelectItem value="en">EN</SelectItem>
                              <SelectItem value="mg">MG</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Notifications */}
                      <DropdownMenuLabel className="text-xs text-gray-500">Notifications</DropdownMenuLabel>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleNotificationToggle("email")}>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm">Notifications email</span>
                          <div
                            className={`w-8 h-4 rounded-full ${
                              notificationSettings.email ? "bg-blue-500" : "bg-gray-300"
                            } relative transition-colors`}
                          >
                            <div
                              className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                                notificationSettings.email ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                          </div>
                        </div>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Déconnexion */}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Se déconnecter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Avatar avec photo ou initiales */}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {userProfile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="flex-1 p-6 space-y-6">
              {/* Quick Actions Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={loadDashboardData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(true)}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrer
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowExportDialog(true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Dernière mise à jour: {new Date().toLocaleTimeString("fr-FR")}
                  </div>
                </div>
              </div>

              {/* Main KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Contacts</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-3xl font-bold text-blue-900">{stats.totalContacts}</span>
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            +{previousStats ? Math.max(0, stats.totalContacts - previousStats.totalContacts) : 0}
                          </Badge>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">Total enregistrés</p>
                      </div>
                      <div className="p-3 bg-blue-200 rounded-full">
                        <Users className="h-6 w-6 text-blue-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-300 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700">Entreprises perdu</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-3xl font-bold text-red-900">{statsNombre?.perdus || 0}</span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">Partenaires actifs</p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-full">
                        <Building2 className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-300 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Entreprises gagnee</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-3xl font-bold text-green-900">{statsNombre?.gagnes || 0}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Partenaires actifs</p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-full">
                        <Building2 className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Entreprises encours</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-3xl font-bold text-green-900">{statsNombre?.encours || 0}</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">Partenaires actifs</p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-full">
                        <Building2 className="h-6 w-6 text-green-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Campagnes</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-3xl font-bold text-purple-900">{stats.totalCampagnes}</span>
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            +{previousStats ? Math.max(0, stats.totalCampagnes - previousStats.totalCampagnes) : 0}
                          </Badge>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">En cours</p>
                      </div>
                      <div className="p-3 bg-purple-200 rounded-full">
                        <Target className="h-6 w-6 text-purple-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700">Vente Moyenne</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-3xl font-bold text-orange-900">{stats.pourcentageVenteMoyen}%</span>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">Pourcentage moyen</p>
                      </div>
                      <div className="p-3 bg-orange-200 rounded-full">
                        <DollarSign className="h-6 w-6 text-orange-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Actions Chart */}
                <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Actions quotidiennes</CardTitle>
                      <p className="text-sm text-gray-600">Répartition par type d'action</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Total: {chartData.actionsData.reduce((sum, item) => sum + item.value, 0)}</span>
                        <span>Emails: {stats.actionsEmail}</span>
                        <span>Appels: {stats.actionsAppel}</span>
                        <span>Réunions: {stats.actionsReunion}</span>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Analyse détaillée des actions</DialogTitle>
                        </DialogHeader>
                        <div className="h-96">
                          <ChartContainer
                            config={{
                              value: { label: "Total", color: "#3b82f6" },
                              emails: { label: "Emails", color: "#10b981" },
                              calls: { label: "Appels", color: "#f59e0b" },
                              meetings: { label: "Réunions", color: "#ef4444" },
                            }}
                            className="h-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData.actionsData}>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#3b82f6"
                                  strokeWidth={3}
                                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="emails"
                                  stroke="#10b981"
                                  strokeWidth={2}
                                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="calls"
                                  stroke="#f59e0b"
                                  strokeWidth={2}
                                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="meetings"
                                  stroke="#ef4444"
                                  strokeWidth={2}
                                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        value: { label: "Total", color: "#3b82f6" },
                        emails: { label: "Emails", color: "#10b981" },
                        calls: { label: "Appels", color: "#f59e0b" },
                        meetings: { label: "Réunions", color: "#ef4444" },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.actionsData}>
                          <defs>
                            <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorActions)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Résumé</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-700" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Actions Email</p>
                            <p className="text-xs text-gray-600">{stats.actionsEmail} envoyés</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Phone className="h-5 w-5 text-green-700" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Appels téléphoniques</p>
                            <p className="text-xs text-gray-600">{stats.actionsAppel} effectués</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-orange-700" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Réunions</p>
                            <p className="text-xs text-gray-600">{stats.actionsReunion} organisées</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Pourcentage vente moyen</span>
                        <span className="text-sm font-bold text-green-600">{stats.pourcentageVenteMoyen}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(stats.pourcentageVenteMoyen, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Dynamic Pie Chart */}
                    {chartData.pieData.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-3">Types d'actions</p>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData.pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={20}
                                outerRadius={50}
                                dataKey="value"
                              >
                                {chartData.pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <ChartTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Chart - Ventes */}
              <div className="grid grid-cols-1 gap-6">
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Évolution des ventes</CardTitle>
                      <p className="text-sm text-gray-600">Pourcentage de vente par jour</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Analyse détaillée des ventes</DialogTitle>
                        </DialogHeader>
                        <div className="h-80">
                          <ChartContainer
                            config={{
                              pourcentage: { label: "Pourcentage", color: "#10b981" },
                              actions: { label: "Actions", color: "#3b82f6" },
                            }}
                            className="h-full"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData.ventesData}>
                                <XAxis dataKey="day" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="pourcentage" fill="#10b981" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        pourcentage: { label: "Pourcentage", color: "#10b981" },
                      }}
                      className="h-[200px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.ventesData}>
                          <XAxis dataKey="day" axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="pourcentage" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Modal Filtres */}
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filtrer les données</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dateRange">Période</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 derniers jours</SelectItem>
                      <SelectItem value="30days">30 derniers jours</SelectItem>
                      <SelectItem value="3months">3 derniers mois</SelectItem>
                      <SelectItem value="6months">6 derniers mois</SelectItem>
                      <SelectItem value="1year">1 an</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type d'action</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="appel">Appel téléphonique</SelectItem>
                      <SelectItem value="reunion">Réunion</SelectItem>
                      <SelectItem value="visite">Visite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowFilters(false)}>
                  Annuler
                </Button>
                <Button onClick={() => setShowFilters(false)}>Annuler</Button>
                <Button onClick={applyFilters}>Appliquer les filtres</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal Export */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Exporter les données</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-gray-600">
                  Choisissez le format d'export pour télécharger les données du tableau de bord.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => exportData("csv")}>
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Download className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-medium">CSV</h3>
                      <p className="text-xs text-gray-500">Format tableur</p>
                    </CardContent>
                  </Card>
                  <Card
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => exportData("excel")}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Download className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-medium">TXT</h3>
                      <p className="text-xs text-gray-500">Format texte</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <Info className="h-4 w-4 inline mr-1" />
                    L'export inclut les statistiques, actions récentes et contacts.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Annuler
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal Profil */}
          <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Paramètres du profil
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {userProfile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Button variant="outline" size="sm">
                      Changer la photo
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom complet</Label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Département</Label>
                    <Select
                      value={userProfile.department}
                      onValueChange={(value) => setUserProfile((prev) => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direction">Direction</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select
                    value={userProfile.role}
                    onValueChange={(value) => setUserProfile((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrateur">Administrateur</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Utilisateur">Utilisateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowProfileModal(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={() => {
                    const updatedProfile = {
                      ...userProfile,
                      lastLogin: new Date().toISOString(),
                    }
                    setUserProfile(updatedProfile)
                    saveUserToCookies(updatedProfile)
                    toast({
                      title: "Profil mis à jour",
                      description: "Votre profil a été mis à jour avec succès.",
                    })
                    setShowProfileModal(false)
                  }}
                >
                  Sauvegarder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}

export default AccueilPage
