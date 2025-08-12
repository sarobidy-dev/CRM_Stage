
"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
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
  HelpCircle,
  LayoutDashboard,
  FileText,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Table as TableIcon,
  Database,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Upload,
  DownloadCloud,
  Printer,
  Share2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  BellRing,
  BellOff,
  Languages,
  HelpCircle as HelpIcon,
  Info as InfoIcon,
  AlertTriangle,
  Check,
  XCircle,
  Loader2,
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
import { getAllHistoriques, getNombreEntreprisesActivesAujourdHui, getStatistiques } from "@/service/historiqueAction.service"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

// Multi-language support
const languages = {
  fr: {
    dashboard: "Dashboard",
    system: "Système de gestion client - Données en temps réel",
    contacts: "Contacts",
    entreprises: "Entreprises",
    campagnes: "Campagnes",
    actions: "Actions",
    pourcentageVenteMoyen: "Pourcentage vente moyen",
    // Add more translations as needed
  },
  en: {
    dashboard: "Dashboard",
    system: "Client Management System - Real-time Data",
    contacts: "Contacts",
    entreprises: "Companies",
    campagnes: "Campaigns",
    actions: "Actions",
    pourcentageVenteMoyen: "Average Sales Percentage",
    // Add more
  },
  // Add more languages
}

// Interfaces (existing + new)
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
  nom: string
  email: string
  role: string
  photo_profil: string | null
  actif: boolean
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

// Fonctions utilitaires pour les cookies (existing)

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

// Service pour récupérer un utilisateur par ID (existing)

const fetchUtilisateurById = async (id: string): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/utilisateurs/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()

    if (result.success && result.data) {
      return {
        id: result.data.id.toString(),
        nom: result.data.nom,
        email: result.data.email,
        role: result.data.role,
        photo_profil: result.data.photo_profil,
        actif: result.data.actif,
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
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return null
  }
}

// Form schema for profile update
const profileSchema = z.object({
  nom: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Component
const AccueilPage = () => {
  // Existing states
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
  const [userLoading, setUserLoading] = useState(true)
  const [statsNombre, setstatsNombre] = useState<{ gagnes: number; encours: number; perdus: number } | null>(null)
  const [error, setError] = useState("")
  const [campagnes, setCampagnes] = useState<any[]>([])
  const [selectedCampagneId, setSelectedCampagneId] = useState<number | null>(null)
  const [nombre, setNombre] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // New states for additional features
  const [searchQuery, setSearchQuery] = useState("")
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [showInfoPopover, setShowInfoPopover] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showDataTable, setShowDataTable] = useState(false)
  const [showCustomChart, setShowCustomChart] = useState(false)
  const [notificationVolume, setNotificationVolume] = useState(50)
  const [enableTwoFactor, setEnableTwoFactor] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [customThemeColor, setCustomThemeColor] = useState("#3b82f6")

  // État utilisateur avec gestion des cookies
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "",
    nom: "Utilisateur",
    email: "user@crm.com",
    role: "Utilisateur",
    photo_profil: null,
    actif: true,
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

  // Multi-language dictionary
  const t = useMemo(() => languages[language] || languages.fr, [language])

  // Profile form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nom: userProfile.nom,
      email: userProfile.email,
      password: "",
      confirmPassword: "",
    },
  })

  // Chargement des statistiques (existing)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStatistiques(selectedCampagneId)
        setstatsNombre(res)
      } catch (err) {
        console.error(err)
        setError("Impossible de charger les statistiques")
      }
    }
    fetchStats()
  }, [selectedCampagneId])

  // Chargement nombre entreprises actives (existing)
  useEffect(() => {
    getNombreEntreprisesActivesAujourdHui()
      .then(data => {
        setNombre(data.nombre_entreprises_actives_aujourdhui);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [])

  // Fonction pour sauvegarder l'utilisateur dans les cookies (existing)
  const saveUserToCookies = useCallback((user: UserProfile) => {
    setCookie("crm_user_profile", JSON.stringify(user), 30)
    setCookie("crm_user_id", user.id, 30)
    setCookie("crm_user_name", user.nom, 30)
    setCookie("crm_user_email", user.email, 30)
    setCookie("crm_user_role", user.role, 30)
    setCookie("crm_last_login", new Date().toISOString(), 30)
  }, [])

  // Chargement des données utilisateur depuis l'API (existing)
  const loadUserFromAPI = useCallback(async () => {
    setUserLoading(true)
    try {
      const userId = getCookie("userId")
      if (userId) {
        const userData = await fetchUtilisateurById(userId)
        if (userData) {
          setUserProfile(userData)
          saveUserToCookies(userData)
          setTheme(userData.preferences.theme)
          setLanguage(userData.preferences.language)
          setNotificationSettings(userData.preferences.notifications)
          setIsDarkMode(userData.preferences.theme === "dark")
        } else {
          console.warn("Utilisateur non trouvé, utilisation des données par défaut")
        }
      } else {
        console.warn("Aucun ID utilisateur trouvé dans les cookies")
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'utilisateur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations utilisateur",
        variant: "destructive",
      })
    } finally {
      setUserLoading(false)
    }
  }, [saveUserToCookies])

  // Fonction pour créer une notification dynamique (existing)
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

  // Fonction pour générer les données des graphiques dynamiquement (existing)
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
      const meetings = dayActions.filter((a) => a.action.toLowerCase() === "réunion").length
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

  // Chargement initial des données utilisateur
  useEffect(() => {
    loadUserFromAPI()
  }, [loadUserFromAPI])

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
      const campagnes = campagnesResult.status === "fulfilled" ? campagnesResult.value.data || [] : []
      const actionsResponse = actionsResult.status === "fulfilled" ? actionsResult.value : { data: [] }
      let actions = actionsResponse.data || []

      setCampagnes(campagnes)

      if (utilisateursResult.status === "rejected") {
        console.error("Erreur utilisateurs:", utilisateursResult.reason)
        createNotification("warning", t.dashboard, "Impossible de charger les utilisateurs")
      }
      if (contactsResult.status === "rejected") {
        console.error("Erreur contacts:", contactsResult.reason)
        createNotification("warning", t.dashboard, "Impossible de charger les contacts")
      }
      if (entreprisesResult.status === "rejected") {
        console.error("Erreur entreprises:", entreprisesResult.reason)
        createNotification("warning", t.dashboard, "Impossible de charger les entreprises")
      }
      if (campagnesResult.status === "rejected") {
        console.error("Erreur campagnes:", campagnesResult.reason)
        createNotification("warning", t.dashboard, "Impossible de charger les campagnes")
      }
      if (actionsResult.status === "rejected") {
        console.error("Erreur actions:", actionsResult.reason)
        createNotification("warning", t.dashboard, "Impossible de charger l'historique des actions")
      }

      // Filter actions by selectedCampagneId if selected
      if (selectedCampagneId) {
        actions = actions.filter(a => a.campagne_id === selectedCampagneId)
      }

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
      createNotification("error", t.dashboard, "Impossible de charger les données du tableau de bord")
    } finally {
      setIsLoading(false)
    }
  }

  // Update pourcentageVenteMoyen when selectedCampagneId changes
  useEffect(() => {
    loadDashboardData() // Reload data to filter by campaign
  }, [selectedCampagneId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language, {
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

  const exportData = (format: "csv" | "excel" | "pdf" | "json") => {
    // Existing CSV and TXT, add PDF and JSON
    const dataToExport = {
      stats,
      actions: recentActivity.actions,
      contacts: recentActivity.contacts,
      chartData,
    }
    if (format === "csv") {
      exportToCSV(dataToExport)
    } else if (format === "excel") {
      exportToExcel(dataToExport)
    } else if (format === "pdf") {
      // Implement PDF export, e.g., using jspdf
      toast({
        title: "Export PDF",
        description: "PDF export not implemented yet",
      })
    } else if (format === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `crm-dashboard-${new Date().toISOString().split("T")[0]}.json`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    toast({
      title: "Export réussi",
      description: `Données exportées en format ${format.toUpperCase()}`,
    })
    setShowExportDialog(false)
  }

  const exportToCSV = (data: any) => {
    // Existing
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
    // Existing (TXT, but can be updated to actual Excel if library added)
    const excelContent = [
      "CRM Dashboard Export",
      `Date d'export: ${new Date().toLocaleDateString(language)}`,
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

  const handleThemeChange = (newTheme: "light" | "dark" | "system" | "custom") => {
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
    if (newTheme === "custom") {
      // Apply custom color
      document.documentElement.style.setProperty('--primary', customThemeColor)
    }
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

  const getPhotoUrl = (photoPath: string | null) => {
    if (!photoPath) return null
    if (photoPath.startsWith("http")) return photoPath
    return `http://127.0.0.1:8000/${photoPath}`
  }

  // Filtered recent activity for search
  const filteredActions = recentActivity.actions.filter(action => action.commentaire.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredContacts = recentActivity.contacts.filter(contact => contact.nom.toLowerCase().includes(searchQuery.toLowerCase()))

  // Profile update handler
  const onProfileUpdate = (data: z.infer<typeof profileSchema>) => {
    // Implement API call to update profile
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été mises à jour.",
    })
    setShowProfileModal(false)
  }

  // Password visibility
  const [showPassword, setShowPassword] = useState(false)

  // All possible features: help dialog
  const helpContent = [
    { title: "Dashboard Overview", description: "This dashboard provides real-time data on your CRM activities." },
    { title: "Campaign Selection", description: "Select a campaign to filter statistics and charts." },
    // Add more help items
  ]

  // Info popover content
  const infoContent = "This section shows a summary of your key metrics."

  // Advanced filter form
  const advancedFilterForm = useForm()

  // Custom chart data (example)
  const customChartData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    // Add more
  ]

  if (error) return <p className="text-red-500">{error}</p>
  if (!stats) return <p>Chargement...</p>

  if (isLoading || userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
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
          className={`min-h-screen w-full transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-gray-200" : "bg-gradient-to-br from-slate-50 to-slate-100 text-gray-800"
            }`}
        >
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
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">{t.dashboard}</h1>
                      <p className="text-sm text-gray-500">{t.system}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-md mx-8">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    {new Date().toLocaleDateString(language, {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setShowHelpDialog(true)}>
                          <HelpCircle className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Help</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Popover open={showInfoPopover} onOpenChange={setShowInfoPopover}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p>{infoContent}</p>
                    </PopoverContent>
                  </Popover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {t.settings || "Paramètres"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowProfileModal(true)} className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        <div className="flex flex-col">
                          <span>Profil utilisateur</span>
                          <span className="text-xs text-gray-500">{userProfile.nom}</span>
                          <span className="text-xs text-gray-400">{userProfile.role}</span>
                        </div>
                      </DropdownMenuItem>
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
                            <Button
                              variant={theme === "custom" ? "default" : "ghost"}
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleThemeChange("custom")}
                            >
                              <Palette className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </DropdownMenuItem>
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
                         
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      
                      <DropdownMenuItem
                        onClick={() => setShowLogoutConfirmation(true)}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Se déconnecter
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getPhotoUrl(userProfile.photo_profil) || "/placeholder.svg"}
                      alt={userProfile.nom}
                    />
                    <AvatarFallback>
                      {userProfile.nom
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Select
                      value={selectedCampagneId?.toString() || "all"}
                      onValueChange={(value) => setSelectedCampagneId(value === "all" ? null : Number(value))}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Sélectionner une campagne" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les campagnes</SelectItem>
                        {campagnes.map((campagne) => (
                          <SelectItem key={campagne.id} value={campagne.id.toString()}>
                            {campagne.libelle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={loadDashboardData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowExportDialog(true)}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Dernière mise à jour: {new Date().toLocaleTimeString(language)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Nombre d'entreprises actives aujourd'hui</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-3xl font-bold text-blue-900">{nombre}</span>

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
                        <p className="text-sm font-medium text-red-700">
                          Entreprises perdues {selectedCampagneId ? `(Campagne ${campagnes.find(c => c.id === selectedCampagneId)?.libelle})` : ""}
                        </p>
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
                        <p className="text-sm font-medium text-green-700">
                          Entreprises gagnées {selectedCampagneId ? `(Campagne ${campagnes.find(c => c.id === selectedCampagneId)?.libelle})` : ""}
                        </p>
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
                        <p className="text-sm font-medium text-green-700">
                          Entreprises en cours {selectedCampagneId ? `(Campagne ${campagnes.find(c => c.id === selectedCampagneId)?.libelle})` : ""}
                        </p>
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
              </div>

              <Tabs defaultValue="charts" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="charts">
                    <BarChartIcon className="h-4 w-4 mr-2" />
                    Charts
                  </TabsTrigger>
                  <TabsTrigger value="table">
                    <TableIcon className="h-4 w-4 mr-2" />
                    Table
                  </TabsTrigger>

                </TabsList>
                <TabsContent value="charts" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <div className="grid grid-cols-1 gap-6">
                      <Card className="bg-white border-0 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">Répartition des entreprises</CardTitle>
                          <p className="text-sm text-gray-600">
                            Gagnées, en cours, perdus {selectedCampagneId ? `(Campagne ${campagnes.find(c => c.id === selectedCampagneId)?.libelle})` : ""}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ChartContainer
                            config={{
                              gagnes: { label: "Gagnées", color: "#10b981" },
                              encours: { label: "En cours", color: "#f59e0b" },
                              perdus: { label: "Perdus", color: "#ef4444" },
                            }}
                            className="h-[200px]"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: "Gagnées", value: statsNombre?.gagnes || 0 },
                                    { name: "En cours", value: statsNombre?.encours || 0 },
                                    { name: "Perdus", value: statsNombre?.perdus || 0 },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={30}
                                  outerRadius={80}
                                  dataKey="value"
                                >
                                  <Cell fill="#10b981" />
                                  <Cell fill="#f59e0b" />
                                  <Cell fill="#ef4444" />
                                </Pie>
                                <ChartTooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Pie Chart for gagnes, encours, perdus */}

                </TabsContent>
                <TabsContent value="table" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Commentaire</TableHead>
                        <TableHead>Pourcentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActions.map((action) => (
                        <TableRow key={action.id}>
                          <TableCell>{action.action}</TableCell>
                          <TableCell>{formatDate(action.date)}</TableCell>
                          <TableCell>{action.commentaire}</TableCell>
                          <TableCell>{action.pourcentageVente}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4">
                  <Form {...advancedFilterForm}>
                    <form className="space-y-4">
                      <FormField
                        control={advancedFilterForm.control}
                        name="customFilter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Filter</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Apply</Button>
                    </form>
                  </Form>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includeArchived" />
                    <Label htmlFor="includeArchived">Include Archived</Label>
                  </div>
                  <RadioGroup defaultValue="all">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">All</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </RadioGroup>
                  <Command>
                    <CommandInput placeholder="Search roles..." />
                    <CommandList>
                      <CommandEmpty>No roles found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem>Admin</CommandItem>
                        <CommandItem>User</CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <ScrollArea className="h-[200px] w-full border rounded-md">
                    <div className="p-4">
                      <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
                      {["Tag1", "Tag2", "Tag3"].map((tag) => (
                        <>
                          <div key={tag} className="text-sm">
                            {tag}
                          </div>
                          <Separator className="my-2" />
                        </>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              {/* Help Dialog */}
              <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Help Center</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    {helpContent.map((item) => (
                      <div key={item.title} className="mb-4">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Logout Confirmation */}
              <Dialog open={showLogoutConfirmation} onOpenChange={setShowLogoutConfirmation}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Logout</DialogTitle>
                  </DialogHeader>
                  <p>Are you sure you want to log out?</p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowLogoutConfirmation(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                      Logout
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Profile Modal with Edit */}
              <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Settings
                    </DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="info">
                    <TabsList>
                      <TabsTrigger value="info">Info</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info">
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileUpdate)} className="space-y-4">
                          <FormField
                            control={profileForm.control}
                            name="nom"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit">Save</Button>
                        </form>
                      </Form>
                    </TabsContent>
                    <TabsContent value="security">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Change Password</span>
                          <Button variant="outline" onClick={() => setShowPasswordChange(!showPasswordChange)}>
                            Change
                          </Button>
                        </div>
                        {showPasswordChange && (
                          <div className="space-y-2">
                            <Label>New Password</Label>
                            <div className="relative">
                              <Input type={showPassword ? "text" : "password"} />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              {/* Export Dialog with more options */}
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Data</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => exportData("csv")}>CSV</Button>
                    <Button onClick={() => exportData("excel")}>Excel</Button>
                    <Button onClick={() => exportData("json")}>JSON</Button>
                  </div>
                </DialogContent>
              </Dialog>



            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AccueilPage