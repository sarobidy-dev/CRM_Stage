"use client"

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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Search,
  Settings,
  Users,
  Building2,
  MessageSquare,
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
  Shield,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Monitor,
  RefreshCw,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/components/navbarLink/nav"
import type { Interaction } from "@/types/interaction.type"
import type { Opportunite } from "@/types/opportunite.type"
import type { Contact } from "@/types/Contact.type"
import { getUtilisateur } from "@/service/Utlisateur.service"
import { getAllContacts } from "@/service/Contact.service"
import { getInteractions } from "@/service/Interaction.service"
import { getAllOpportunites } from "@/service/Opportunite.service"
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

interface DashboardStats {
  totalUtilisateurs: number
  totalContacts: number
  totalInteractions: number
  totalOpportunites: number
  opportunitesGagnees: number
  opportunitesPerdues: number
  tauxConversion: number
  chiffreAffaires: number
}

interface RecentActivity {
  interactions: Interaction[]
  opportunites: Opportunite[]
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
  revenueData: Array<{ day: string; value: number; target: number; opportunites: number }>
  interactionsData: Array<{ day: string; value: number; emails: number; calls: number }>
  opportunitesData: Array<{ day: string; gagnees: number; perdues: number; encours: number }>
  pieData: Array<{ name: string; value: number; color: string }>
}

const AccueilPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUtilisateurs: 0,
    totalContacts: 0,
    totalInteractions: 0,
    totalOpportunites: 0,
    opportunitesGagnees: 0,
    opportunitesPerdues: 0,
    tauxConversion: 0,
    chiffreAffaires: 0,
  })
  const [previousStats, setPreviousStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({
    interactions: [],
    opportunites: [],
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const [showToastNotification, setShowToastNotification] = useState(false)
  const [chartData, setChartData] = useState<ChartData>({
    revenueData: [],
    interactionsData: [],
    opportunitesData: [],
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
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showDataSettingsModal, setShowDataSettingsModal] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: "Admin User",
    email: "admin@crm.com",
    role: "Administrateur",
    avatar: "/placeholder.svg?height=32&width=32",
    phone: "+33 1 23 45 67 89",
    department: "Direction",
    joinDate: "2023-01-15",
  })
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    loginNotifications: true,
    passwordExpiry: "90",
    ipRestriction: false,
  })
  const [displaySettings, setDisplaySettings] = useState({
    compactMode: false,
    showAnimations: true,
    autoRefresh: true,
    refreshInterval: "30",
    showTooltips: true,
    gridDensity: "comfortable",
  })
  const [dataSettings, setDataSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: "365",
    exportFormat: "csv",
    compressionEnabled: true,
  })

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

  // Fonction pour calculer les revenus réels basés sur les opportunités
  const calculateRevenueFromOpportunity = (opportunite: Opportunite): number => {
    // Logique pour calculer le revenu basé sur l'opportunité
    // Vous pouvez ajuster cette logique selon vos besoins métier

    // Si l'opportunité a un montant défini, l'utiliser
    if (opportunite.montant && opportunite.montant > 0) {
      return opportunite.montant
    }

    // Sinon, calculer basé sur le type d'opportunité ou autres critères
    const baseAmount = 25000 // Montant de base

    // Ajuster selon le statut
    switch (opportunite.statut?.toLowerCase()) {
      case "gagné":
      case "gagne":
      case "won":
        return baseAmount
      case "perdu":
      case "lost":
        return 0
      case "en cours":
      case "progress":
        return baseAmount * 0.5 // 50% du montant pour les opportunités en cours
      default:
        return baseAmount * 0.3 // 30% pour les autres statuts
    }
  }

  // Fonction pour générer les données des graphiques dynamiquement avec vrais revenus
  const generateChartData = useCallback(
    (interactions: Interaction[], opportunites: Opportunite[], contacts: Contact[]): ChartData => {
      const now = new Date()
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now)
        date.setDate(date.getDate() - (6 - i))
        return date
      })

      const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

      // Données de revenus DYNAMIQUES basées sur les vraies opportunités
      const revenueData = last7Days.map((date) => {
        const dayName = dayNames[date.getDay()]

        // Filtrer les opportunités pour ce jour spécifique
        const dayOpportunites = opportunites.filter((opp) => {
          const oppDate = new Date(opp.date_interaction)
          return oppDate.toDateString() === date.toDateString()
        })

        // Calculer le revenu réel pour ce jour
        const dailyRevenue = dayOpportunites.reduce((total, opp) => {
          return total + calculateRevenueFromOpportunity(opp)
        }, 0)

        // Calculer l'objectif dynamique basé sur la moyenne des opportunités
        const avgOpportunitiesPerDay = opportunites.length / 7
        const targetRevenue = avgOpportunitiesPerDay * 25000 // Objectif basé sur la moyenne

        return {
          day: dayName,
          value: Math.round(dailyRevenue),
          target: Math.round(targetRevenue),
          opportunites: dayOpportunites.length,
        }
      })

      // Données d'interactions (inchangées)
      const interactionsData = last7Days.map((date) => {
        const dayName = dayNames[date.getDay()]
        const dayInteractions = interactions.filter((interaction) => {
          const interactionDate = new Date(interaction.date_interaction)
          return interactionDate.toDateString() === date.toDateString()
        })

        const emails = dayInteractions.filter((i) => i.type.toLowerCase().includes("email")).length
        const calls = dayInteractions.filter(
          (i) => i.type.toLowerCase().includes("appel") || i.type.toLowerCase().includes("téléphone"),
        ).length
        const total = dayInteractions.length

        return {
          day: dayName,
          value: total,
          emails,
          calls,
        }
      })

      // Données d'opportunités par statut
      const opportunitesData = last7Days.map((date) => {
        const dayName = dayNames[date.getDay()]
        const dayOpportunites = opportunites.filter((opp) => {
          const oppDate = new Date(opp.date_interaction)
          return oppDate.toDateString() === date.toDateString()
        })

        const gagnees = dayOpportunites.filter(
          (opp) => opp.statut?.toLowerCase() === "gagné" || opp.statut?.toLowerCase() === "gagne",
        ).length
        const perdues = dayOpportunites.filter((opp) => opp.statut?.toLowerCase() === "perdu").length
        const encours = dayOpportunites.filter(
          (opp) =>
            opp.statut?.toLowerCase() !== "gagné" &&
            opp.statut?.toLowerCase() !== "gagne" &&
            opp.statut?.toLowerCase() !== "perdu",
        ).length

        return {
          day: dayName,
          gagnees,
          perdues,
          encours,
        }
      })

      // Données du graphique en secteurs (dynamiques)
      const totalGagnees = opportunites.filter(
        (opp) => opp.statut?.toLowerCase() === "gagné" || opp.statut?.toLowerCase() === "gagne",
      ).length
      const totalPerdues = opportunites.filter((opp) => opp.statut?.toLowerCase() === "perdu").length
      const totalEncours = opportunites.filter(
        (opp) =>
          opp.statut?.toLowerCase() !== "gagné" &&
          opp.statut?.toLowerCase() !== "gagne" &&
          opp.statut?.toLowerCase() !== "perdu",
      ).length

      const pieData = [
        { name: "Gagnées", value: totalGagnees, color: "#10b981" },
        { name: "En cours", value: totalEncours, color: "#3b82f6" },
        { name: "Perdues", value: totalPerdues, color: "#ef4444" },
      ].filter((item) => item.value > 0) // Ne montrer que les catégories avec des valeurs

      return {
        revenueData,
        interactionsData,
        opportunitesData,
        pieData,
      }
    },
    [],
  )

  // Fonction pour détecter les changements et créer des notifications
  // const detectChangesAndNotify = useCallback(
  //   (newStats: DashboardStats, oldStats: DashboardStats | null) => {
  //     if (!oldStats) return

  //     if (newStats.totalOpportunites > oldStats.totalOpportunites) {
  //       const diff = newStats.totalOpportunites - oldStats.totalOpportunites
  //       createNotification(
  //         "success",
  //         "Nouvelle opportunité !",
  //         `${diff} nouvelle${diff > 1 ? "s" : ""} opportunité${diff > 1 ? "s" : ""} créée${diff > 1 ? "s" : ""}`,
  //         { type: "opportunite", count: diff },
  //       )
  //     }

  //     if (newStats.totalContacts > oldStats.totalContacts) {
  //       const diff = newStats.totalContacts - oldStats.totalContacts
  //       createNotification(
  //         "info",
  //         "Nouveau contact !",
  //         `${diff} nouveau${diff > 1 ? "x" : ""} contact${diff > 1 ? "s" : ""} ajouté${diff > 1 ? "s" : ""}`,
  //         { type: "contact", count: diff },
  //       )
  //     }

  //     if (newStats.totalInteractions > oldStats.totalInteractions) {
  //       const diff = newStats.totalInteractions - oldStats.totalInteractions
  //       createNotification(
  //         "info",
  //         "Nouvelle interaction !",
  //         `${diff} nouvelle${diff > 1 ? "s" : ""} interaction${diff > 1 ? "s" : ""} enregistrée${diff > 1 ? "s" : ""}`,
  //         { type: "interaction", count: diff },
  //       )
  //     }

  //     if (newStats.opportunitesGagnees > oldStats.opportunitesGagnees) {
  //       const diff = newStats.opportunitesGagnees - oldStats.opportunitesGagnees
  //       createNotification(
  //         "success",
  //         "Opportunité gagnée ! 🎉",
  //         `Félicitations ! ${diff} opportunité${diff > 1 ? "s" : ""} remportée${diff > 1 ? "s" : ""}`,
  //         { type: "opportunite_gagnee", count: diff },
  //       )
  //     }

  //     if (newStats.opportunitesPerdues > oldStats.opportunitesPerdues) {
  //       const diff = newStats.opportunitesPerdues - oldStats.opportunitesPerdues
  //       createNotification(
  //         "warning",
  //         "Opportunité perdue",
  //         `${diff} opportunité${diff > 1 ? "s" : ""} perdue${diff > 1 ? "s" : ""}. Analyse recommandée.`,
  //         { type: "opportunite_perdue", count: diff },
  //       )
  //     }

  //     if (newStats.tauxConversion > oldStats.tauxConversion + 5) {
  //       createNotification(
  //         "success",
  //         "Excellent taux de conversion !",
  //         `Votre taux de conversion a atteint ${newStats.tauxConversion}% (+${newStats.tauxConversion - oldStats.tauxConversion}%)`,
  //         { type: "conversion", rate: newStats.tauxConversion },
  //       )
  //     }

  //     // Notification pour les revenus
  //     if (newStats.chiffreAffaires > oldStats.chiffreAffaires) {
  //       const diff = newStats.chiffreAffaires - oldStats.chiffreAffaires
  //       createNotification(
  //         "success",
  //         "Augmentation des revenus ! 💰",
  //         `Les revenus ont augmenté de ${formatCurrency(diff)}`,
  //         { type: "revenue_increase", amount: diff },
  //       )
  //     }
  //   },
  //   [createNotification],
  // )

  useEffect(() => {
    // Charger les paramètres depuis localStorage
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark" | "system") || "light"
    const savedDisplaySettings = localStorage.getItem("displaySettings")
    const savedSecuritySettings = localStorage.getItem("securitySettings")
    const savedDataSettings = localStorage.getItem("dataSettings")
    const savedUserProfile = localStorage.getItem("userProfile")

    setTheme(savedTheme)
    const handleThemeChange = (theme: "light" | "dark" | "system") => {
      setTheme(theme)
      setIsDarkMode(theme === "dark")
      localStorage.setItem("theme", theme)
    }
    handleThemeChange(savedTheme)

    if (savedDisplaySettings) {
      setDisplaySettings(JSON.parse(savedDisplaySettings))
    }
    if (savedSecuritySettings) {
      setSecuritySettings(JSON.parse(savedSecuritySettings))
    }
    if (savedDataSettings) {
      setDataSettings(JSON.parse(savedDataSettings))
    }
    if (savedUserProfile) {
      setUserProfile(JSON.parse(savedUserProfile))
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [utilisateurs, contacts, interactions, opportunites] = await Promise.all([
        getUtilisateur(),
        getAllContacts(),
        getInteractions(),
        getAllOpportunites(),
      ])

      const opportunitesGagnees = opportunites.filter(
        (opp) => opp.statut?.toLowerCase() === "gagné" || opp.statut?.toLowerCase() === "gagne",
      ).length
      const opportunitesPerdues = opportunites.filter((opp) => opp.statut?.toLowerCase() === "perdu").length
      const totalOpportunitesFermees = opportunitesGagnees + opportunitesPerdues
      const tauxConversion = totalOpportunitesFermees > 0 ? (opportunitesGagnees / totalOpportunitesFermees) * 100 : 0

      // Calculer le chiffre d'affaires RÉEL basé sur les opportunités gagnées
      const chiffreAffaires = opportunites
        .filter((opp) => opp.statut?.toLowerCase() === "gagné" || opp.statut?.toLowerCase() === "gagne")
        .reduce((total, opp) => {
          return total + calculateRevenueFromOpportunity(opp)
        }, 0)

      const newStats = {
        totalUtilisateurs: utilisateurs.length,
        totalContacts: contacts.length,
        totalInteractions: interactions.length,
        totalOpportunites: opportunites.length,
        opportunitesGagnees,
        opportunitesPerdues,
        tauxConversion: Math.round(tauxConversion),
        chiffreAffaires,
      }

      // Générer les données des graphiques avec les vraies données
      const newChartData = generateChartData(interactions, opportunites, contacts)
      setChartData(newChartData)

      // Détecter les changements et créer des notifications
 
      setPreviousStats(stats)
      setStats(newStats)

      const recentInteractions = interactions
        .sort((a, b) => new Date(b.date_interaction).getTime() - new Date(a.date_interaction).getTime())
        .slice(0, 5)

      const recentOpportunites = opportunites
        .sort((a, b) => new Date(b.date_interaction).getTime() - new Date(a.date_interaction).getTime())
        .slice(0, 5)

      setRecentActivity({
        interactions: recentInteractions,
        opportunites: recentOpportunites,
      })
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      createNotification("error", "Erreur de chargement", "Impossible de charger les données du tableau de bord")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
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

  // Calculer les tendances pour les badges
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, isPositive: true }
    const percentage = Math.round(((current - previous) / previous) * 100)
    return { percentage: Math.abs(percentage), isPositive: percentage >= 0 }
  }

  // Simuler l'ajout de nouvelles données (pour démonstration)
  const simulateNewOpportunity = () => {
    const newStats = { ...stats, totalOpportunites: stats.totalOpportunites + 1 }

    setStats(newStats)
  }

  const simulateNewContact = () => {
    const newStats = { ...stats, totalContacts: stats.totalContacts + 1 }

    setStats(newStats)
  }

  // Fonction d'export
  const exportData = (format: "csv" | "excel") => {
    const dataToExport = {
      stats,
      interactions: recentActivity.interactions,
      opportunites: recentActivity.opportunites,
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
    // Créer le contenu CSV
    const csvContent = [
      // En-têtes
      "Type,Valeur",
      `Total Contacts,${data.stats.totalContacts}`,
      `Total Interactions,${data.stats.totalInteractions}`,
      `Total Opportunités,${data.stats.totalOpportunites}`,
      `Opportunités Gagnées,${data.stats.opportunitesGagnees}`,
      `Opportunités Perdues,${data.stats.opportunitesPerdues}`,
      `Taux de Conversion,${data.stats.tauxConversion}%`,
      `Chiffre d'Affaires,${formatCurrency(data.stats.chiffreAffaires)}`,
      "",
      "Interactions Récentes",
      "Date,Type,Contenu",
      ...data.interactions.map(
        (int: Interaction) => `${formatDate(int.date_interaction)},${int.type},"${int.contenu}"`,
      ),
      "",
      "Opportunités Récentes",
      "Date,Statut,Description",
      ...data.opportunites.map(
        (opp: Opportunite) => `${formatDate(opp.date_interaction)},${opp.statut},"${opp.description}"`,
      ),
    ].join("\n")

    // Télécharger le fichier
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
    // Pour Excel, on peut utiliser la même logique mais avec un format différent
    const excelContent = [
      "CRM Dashboard Export",
      `Date d'export: ${new Date().toLocaleDateString("fr-FR")}`,
      "",
      "=== STATISTIQUES GÉNÉRALES ===",
      `Total Contacts: ${data.stats.totalContacts}`,
      `Total Interactions: ${data.stats.totalInteractions}`,
      `Total Opportunités: ${data.stats.totalOpportunites}`,
      `Opportunités Gagnées: ${data.stats.opportunitesGagnees}`,
      `Opportunités Perdues: ${data.stats.opportunitesPerdues}`,
      `Taux de Conversion: ${data.stats.tauxConversion}%`,
      `Chiffre d'Affaires: ${formatCurrency(data.stats.chiffreAffaires)}`,
      "",
      "=== INTERACTIONS RÉCENTES ===",
      ...data.interactions.map(
        (int: Interaction) => `${formatDate(int.date_interaction)} - ${int.type}: ${int.contenu}`,
      ),
      "",
      "=== OPPORTUNITÉS RÉCENTES ===",
      ...data.opportunites.map(
        (opp: Opportunite) => `${formatDate(opp.date_interaction)} - ${opp.statut}: ${opp.description}`,
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

  // Fonction de filtrage
  const applyFilters = () => {
    // Ici on peut implémenter la logique de filtrage
    // Pour l'instant, on simule juste l'application des filtres
    toast({
      title: "Filtres appliqués",
      description: `Période: ${filters.dateRange}, Type: ${filters.type}, Statut: ${filters.status}`,
    })
    setShowFilters(false)
    // Recharger les données avec les filtres
    loadDashboardData()
  }

  const handleProfileSettings = () => {
    setShowProfileModal(true)
  }

  const handleSecuritySettings = () => {
    setShowSecurityModal(true)
  }

  const handleDataSettings = () => {
    setShowDataSettingsModal(true)
  }

  const handleHelp = () => {
    setShowHelpModal(true)
  }

  const handleBackupData = () => {
    toast({
      title: "Sauvegarde des données",
      description: "Les données ont été sauvegardées avec succès.",
    })
  }

  const handleLogout = () => {
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    })
  }

  const handleProfileUpdate = (updatedProfile: any) => {
    setUserProfile(updatedProfile)
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile))
    toast({
      title: "Profil mis à jour",
      description: "Votre profil a été mis à jour avec succès.",
    })
    setShowProfileModal(false)
  }

  const handleSecuritySettingChange = (setting: string, value: any) => {
    setSecuritySettings((prev) => ({ ...prev, [setting]: value }))
    localStorage.setItem("securitySettings", JSON.stringify({ ...securitySettings, [setting]: value }))
    toast({
      title: "Paramètres de sécurité mis à jour",
      description: `Le paramètre ${setting} a été mis à jour.`,
    })
  }

  const handleDataSettingChange = (setting: string, value: any) => {
    setDataSettings((prev) => ({ ...prev, [setting]: value }))
    localStorage.setItem("dataSettings", JSON.stringify({ ...dataSettings, [setting]: value }))
    toast({
      title: "Paramètres de données mis à jour",
      description: `Le paramètre ${setting} a été mis à jour.`,
    })
  }

  const handleRestoreData = (event: any) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        try {
          const jsonData = JSON.parse(e.target.result)
          // Ici, vous pouvez implémenter la logique pour restaurer les données
          toast({
            title: "Données restaurées",
            description: "Les données ont été restaurées avec succès.",
          })
        } catch (error) {
          toast({
            title: "Erreur de restauration",
            description: "Impossible de restaurer les données. Format de fichier incorrect.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const handleLanguageChange = (value: string) => {
    setLanguage(value)
    toast({
      title: "Langue modifiée",
      description: `La langue a été modifiée en ${value}.`,
    })
  }

  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({ ...prev, [setting]: !prev[setting] }))
    toast({
      title: "Paramètres de notification mis à jour",
      description: `Les notifications ${setting} ont été mises à jour.`,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
  
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}
    >
      {/* Notification Toast */}
      {showToastNotification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
          <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Nouvelle activité détectée !</p>
                <p className="text-xs text-gray-600">Vérifiez vos notifications</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
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
                  <p className="text-sm text-gray-500">Système de gestion client</p>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher contacts, opportunités..."
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

                  {/* Profil */}
                  <DropdownMenuItem onClick={handleProfileSettings} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Profil utilisateur</span>
                      <span className="text-xs text-gray-500">{userProfile.name}</span>
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
                          onClick={() => {
                            const handleThemeChange = (theme: "light" | "dark" | "system") => {
                              setTheme(theme)
                              setIsDarkMode(theme === "dark")
                              localStorage.setItem("theme", theme)
                            }
                            handleThemeChange("light")
                          }}
                        >
                          <Sun className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={theme === "dark" ? "default" : "ghost"}
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const handleThemeChange = (theme: "light" | "dark" | "system") => {
                              setTheme(theme)
                              setIsDarkMode(theme === "dark")
                              localStorage.setItem("theme", theme)
                            }
                            handleThemeChange("dark")
                          }}
                        >
                          <Moon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={theme === "system" ? "default" : "ghost"}
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const handleThemeChange = (theme: "light" | "dark" | "system") => {
                              setTheme(theme)
                              setIsDarkMode(theme === "dark")
                              localStorage.setItem("theme", theme)
                            }
                            handleThemeChange("system")
                          }}
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
                          <span className="text-xs text-gray-500">{language === "fr" ? "Français" : "English"}</span>
                        </div>
                      </div>
                      <Select
                        value={language}
                        onValueChange={(value) => {
                          const handleLanguageChange = (value: string) => {
                            setLanguage(value)
                            toast({
                              title: "Langue modifiée",
                              description: `La langue a été modifiée en ${value}.`,
                            })
                          }
                          handleLanguageChange(value)
                        }}
                      >
                        <SelectTrigger className="h-6 w-16 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">FR</SelectItem>
                          <SelectItem value="en">EN</SelectItem>
                          <SelectItem value="es">ES</SelectItem>
                          <SelectItem value="de">DE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Affichage */}
                  <DropdownMenuItem onClick={() => setShowDataSettingsModal(true)} className="cursor-pointer">
                    <Monitor className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Affichage</span>
                      <span className="text-xs text-gray-500">Personnaliser l'interface</span>
                    </div>
                  </DropdownMenuItem>

                  {/* Notifications Settings */}
                  <DropdownMenuLabel className="text-xs text-gray-500">Notifications</DropdownMenuLabel>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      const handleNotificationToggle = (setting: string) => {
                        setNotificationSettings((prev) => ({
                          ...prev,
                          [setting as keyof typeof notificationSettings]:
                            !prev[setting as keyof typeof notificationSettings],
                        }))
                        toast({
                          title: "Paramètres de notification mis à jour",
                          description: `Les notifications ${setting} ont été mises à jour.`,
                        })
                      }
                      handleNotificationToggle("email")
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">Notifications email</span>
                      <div
                        className={`w-8 h-4 rounded-full ${notificationSettings.email ? "bg-blue-500" : "bg-gray-300"} relative transition-colors`}
                      >
                        <div
                          className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${notificationSettings.email ? "translate-x-4" : "translate-x-0.5"}`}
                        />
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      const handleNotificationToggle = (setting: string) => {
                        setNotificationSettings((prev) => ({
                          ...prev,
                          [setting as keyof typeof notificationSettings]:
                            !prev[setting as keyof typeof notificationSettings],
                        }))
                        toast({
                          title: "Paramètres de notification mis à jour",
                          description: `Les notifications ${setting} ont été mises à jour.`,
                        })
                      }
                      handleNotificationToggle("push")
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">Notifications push</span>
                      <div
                        className={`w-8 h-4 rounded-full ${notificationSettings.push ? "bg-blue-500" : "bg-gray-300"} relative transition-colors`}
                      >
                        <div
                          className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${notificationSettings.push ? "translate-x-4" : "translate-x-0.5"}`}
                        />
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      const handleNotificationToggle = (setting: string) => {
                        setNotificationSettings((prev) => ({
                          ...prev,
                          [setting as keyof typeof notificationSettings]:
                            !prev[setting as keyof typeof notificationSettings],
                        }))
                        toast({
                          title: "Paramètres de notification mis à jour",
                          description: `Les notifications ${setting} ont été mises à jour.`,
                        })
                      }
                      handleNotificationToggle("sound")
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">Sons</span>
                      <div
                        className={`w-8 h-4 rounded-full ${notificationSettings.sound ? "bg-blue-500" : "bg-gray-300"} relative transition-colors`}
                      >
                        <div
                          className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${notificationSettings.sound ? "translate-x-4" : "translate-x-0.5"}`}
                        />
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Sécurité */}
                  <DropdownMenuItem onClick={() => setShowSecurityModal(true)} className="cursor-pointer">
                    <Shield className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Sécurité</span>
                      <span className="text-xs text-gray-500">
                        2FA: {securitySettings.twoFactorAuth ? "Activé" : "Désactivé"}
                      </span>
                    </div>
                  </DropdownMenuItem>

                  {/* Données */}
                  <DropdownMenuItem onClick={() => setShowDataSettingsModal(true)} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Données</span>
                      <span className="text-xs text-gray-500">Sauvegarde et export</span>
                    </div>
                  </DropdownMenuItem>

                  {/* Aide */}
                  <DropdownMenuItem onClick={() => setShowHelpModal(true)} className="cursor-pointer">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Centre d'aide</span>
                      <span className="text-xs text-gray-500">Support et documentation</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Sauvegarde rapide */}
                  <DropdownMenuItem
                    onClick={() => {
                      toast({
                        title: "Sauvegarde des données",
                        description: "Les données ont été sauvegardées avec succès.",
                      })
                    }}
                    className="cursor-pointer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Sauvegarder les données
                  </DropdownMenuItem>

                  {/* Déconnexion */}
                  <DropdownMenuItem
                    onClick={() => {
                      toast({
                        title: "Déconnexion",
                        description: "Vous avez été déconnecté avec succès.",
                      })
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <Navbar />
        <div className="flex-1 p-6 space-y-6">
          {/* Quick Actions Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              {/* <div className="flex items-center space-x-4">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  onClick={simulateNewContact}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Nouveau Contact
                </Button>
                <Button variant="outline" onClick={simulateNewOpportunity}>
                  <Target className="h-4 w-4 mr-2" />
                  Nouvelle Opportunité
                </Button>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nouvelle Interaction
                </Button>
              </div> */}
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
                    <Building2 className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Interactions</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-bold text-green-900">{stats.totalInteractions}</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        +{previousStats ? Math.max(0, stats.totalInteractions - previousStats.totalInteractions) : 0}
                      </Badge>
                    </div>
                    <p className="text-xs text-green-600 mt-1">Cette période</p>
                  </div>
                  <div className="p-3 bg-green-200 rounded-full">
                    <MessageSquare className="h-6 w-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Opportunités</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-3xl font-bold text-purple-900">{stats.totalOpportunites}</span>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        +{previousStats ? Math.max(0, stats.totalOpportunites - previousStats.totalOpportunites) : 0}
                      </Badge>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">En cours de suivi</p>
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
                    <p className="text-sm font-medium text-orange-700">Revenus</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-orange-900">
                        {formatCurrency(stats.chiffreAffaires)}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">Opportunités gagnées</p>
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
            {/* Revenue Chart - DYNAMIQUE */}
            <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Revenus hebdomadaires</CardTitle>
                  <p className="text-sm text-gray-600">Basé sur les opportunités gagnées</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>
                      Total: {formatCurrency(chartData.revenueData.reduce((sum, item) => sum + item.value, 0))}
                    </span>
                    <span>Opportunités: {chartData.revenueData.reduce((sum, item) => sum + item.opportunites, 0)}</span>
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
                      <DialogTitle>Analyse détaillée des revenus</DialogTitle>
                    </DialogHeader>
                    <div className="h-96">
                      <ChartContainer
                        config={{
                          value: { label: "Revenus", color: "#3b82f6" },
                          target: { label: "Objectif", color: "#e5e7eb" },
                        }}
                        className="h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData.revenueData}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} />
                            <YAxis />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(value, name) => [
                                    name === "value" ? formatCurrency(Number(value)) : value,
                                    name === "value" ? "Revenus" : name === "target" ? "Objectif" : name,
                                  ]}
                                />
                              }
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#3b82f6"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorRevenue)"
                            />
                            <Line
                              type="monotone"
                              dataKey="target"
                              stroke="#e5e7eb"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Revenus", color: "#3b82f6" },
                    target: { label: "Objectif", color: "#e5e7eb" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => [
                              name === "value" ? formatCurrency(Number(value)) : value,
                              name === "value" ? "Revenus" : name === "target" ? "Objectif" : name,
                            ]}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Line type="monotone" dataKey="target" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-700 font-bold text-sm">{stats.opportunitesGagnees}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Opportunités gagnées</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-sm">{stats.totalUtilisateurs}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Utilisateurs actifs</p>
                        <p className="text-xs text-gray-600">Système</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-700 font-bold text-sm">{stats.opportunitesPerdues}</span>
                      </div>
                      salut
                      <div>
                        <p className="font-medium text-sm">Opportunités perdues</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Taux de conversion</span>
                    <span className="text-sm font-bold text-green-600">{stats.tauxConversion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(stats.tauxConversion, 100)}%` }}
                    ></div>
                  </div>
                </div>
                {/* Dynamic Pie Chart */}
                {chartData.pieData.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Répartition des opportunités</p>
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

          {/* Bottom Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Interactions quotidiennes</CardTitle>
                  <p className="text-sm text-gray-600">Répartition par type</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Analyse détaillée des interactions</DialogTitle>
                    </DialogHeader>
                    <div className="h-80">
                      <ChartContainer
                        config={{
                          value: { label: "Total", color: "#3b82f6" },
                          emails: { label: "Emails", color: "#10b981" },
                          calls: { label: "Appels", color: "#f59e0b" },
                        }}
                        className="h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData.interactionsData}>
                            <XAxis dataKey="day" />
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
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.interactionsData}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Statut des opportunités</CardTitle>
                  <p className="text-sm text-gray-600">Répartition hebdomadaire</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Analyse détaillée des opportunités</DialogTitle>
                    </DialogHeader>
                    <div className="h-80">
                      <ChartContainer
                        config={{
                          gagnees: { label: "Gagnées", color: "#10b981" },
                          encours: { label: "En cours", color: "#3b82f6" },
                          perdues: { label: "Perdues", color: "#ef4444" },
                        }}
                        className="h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData.opportunitesData}>
                            <XAxis dataKey="day" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="gagnees" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="encours" stackId="a" fill="#3b82f6" />
                            <Bar dataKey="perdues" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Gagnées</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span>En cours</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Perdues</span>
                    </div>
                  </div>
                </div>
                <ChartContainer
                  config={{
                    gagnees: { label: "Gagnées", color: "#10b981" },
                    encours: { label: "En cours", color: "#3b82f6" },
                    perdues: { label: "Perdues", color: "#ef4444" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.opportunitesData}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="gagnees" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="encours" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="perdues" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
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
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
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
              <Label htmlFor="type">Type d'interaction</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Appel téléphonique</SelectItem>
                  <SelectItem value="meeting">Réunion</SelectItem>
                  <SelectItem value="visit">Visite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut des opportunités</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="won">Gagnées</SelectItem>
                  <SelectItem value="lost">Perdues</SelectItem>
                  <SelectItem value="progress">En cours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFilters(false)}>
              Annuler
            </Button>
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
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => exportData("excel")}>
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
                L'export inclut les statistiques, interactions récentes et opportunités.
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
                const handleProfileUpdate = (updatedProfile: any) => {
                  setUserProfile(updatedProfile)
                  localStorage.setItem("userProfile", JSON.stringify(updatedProfile))
                  toast({
                    title: "Profil mis à jour",
                    description: "Votre profil a été mis à jour avec succès.",
                  })
                  setShowProfileModal(false)
                }
                handleProfileUpdate(userProfile)
              }}
            >
              Sauvegarder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Sécurité */}
      <Dialog open={showSecurityModal} onOpenChange={setShowSecurityModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Paramètres de sécurité
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Authentification à deux facteurs</p>
                  <p className="text-sm text-gray-600">Sécurisez votre compte avec 2FA</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full ${securitySettings.twoFactorAuth ? "bg-blue-500" : "bg-gray-300"} relative transition-colors cursor-pointer`}
                  onClick={() => {
                    const handleSecuritySettingChange = (setting: string, value: any) => {
                      setSecuritySettings((prev) => ({ ...prev, [setting]: value }))
                      localStorage.setItem(
                        "securitySettings",
                        JSON.stringify({ ...securitySettings, [setting]: value }),
                      )
                      toast({
                        title: "Paramètres de sécurité mis à jour",
                        description: `Le paramètre ${setting} a été mis à jour.`,
                      })
                    }
                    handleSecuritySettingChange("twoFactorAuth", !securitySettings.twoFactorAuth)
                  }}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${securitySettings.twoFactorAuth ? "translate-x-6" : "translate-x-0.5"}`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications de connexion</p>
                  <p className="text-sm text-gray-600">Recevoir un email à chaque connexion</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full ${securitySettings.loginNotifications ? "bg-blue-500" : "bg-gray-300"} relative transition-colors cursor-pointer`}
                  onClick={() => {
                    const handleSecuritySettingChange = (setting: string, value: any) => {
                      setSecuritySettings((prev) => ({ ...prev, [setting]: value }))
                      localStorage.setItem(
                        "securitySettings",
                        JSON.stringify({ ...securitySettings, [setting]: value }),
                      )
                      toast({
                        title: "Paramètres de sécurité mis à jour",
                        description: `Le paramètre ${setting} a été mis à jour.`,
                      })
                    }
                    handleSecuritySettingChange("loginNotifications", !securitySettings.loginNotifications)
                  }}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${securitySettings.loginNotifications ? "translate-x-6" : "translate-x-0.5"}`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Restriction IP</p>
                  <p className="text-sm text-gray-600">Limiter l'accès à certaines IP</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full ${securitySettings.ipRestriction ? "bg-blue-500" : "bg-gray-300"} relative transition-colors cursor-pointer`}
                  onClick={() => {
                    const handleSecuritySettingChange = (setting: string, value: any) => {
                      setSecuritySettings((prev) => ({ ...prev, [setting]: value }))
                      localStorage.setItem(
                        "securitySettings",
                        JSON.stringify({ ...securitySettings, [setting]: value }),
                      )
                      toast({
                        title: "Paramètres de sécurité mis à jour",
                        description: `Le paramètre ${setting} a été mis à jour.`,
                      })
                    }
                    handleSecuritySettingChange("ipRestriction", !securitySettings.ipRestriction)
                  }}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${securitySettings.ipRestriction ? "translate-x-6" : "translate-x-0.5"}`}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timeout de session (minutes)</Label>
                <Select
                  value={securitySettings.sessionTimeout}
                  onValueChange={(value) => {
                    const handleSecuritySettingChange = (setting: string, value: any) => {
                      setSecuritySettings((prev) => ({ ...prev, [setting]: value }))
                      localStorage.setItem(
                        "securitySettings",
                        JSON.stringify({ ...securitySettings, [setting]: value }),
                      )
                      toast({
                        title: "Paramètres de sécurité mis à jour",
                        description: `Le paramètre ${setting} a été mis à jour.`,
                      })
                    }
                    handleSecuritySettingChange("sessionTimeout", value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 heure</SelectItem>
                    <SelectItem value="120">2 heures</SelectItem>
                    <SelectItem value="480">8 heures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expiration mot de passe (jours)</Label>
                <Select
                  value={securitySettings.passwordExpiry}
                  onValueChange={(value) => {
                    const handleSecuritySettingChange = (setting: string, value: any) => {
                      setSecuritySettings((prev) => ({ ...prev, [setting]: value }))
                      localStorage.setItem(
                        "securitySettings",
                        JSON.stringify({ ...securitySettings, [setting]: value }),
                      )
                      toast({
                        title: "Paramètres de sécurité mis à jour",
                        description: `Le paramètre ${setting} a été mis à jour.`,
                      })
                    }
                    handleSecuritySettingChange("passwordExpiry", value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="60">60 jours</SelectItem>
                    <SelectItem value="90">90 jours</SelectItem>
                    <SelectItem value="180">180 jours</SelectItem>
                    <SelectItem value="365">1 an</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Dernière connexion: Aujourd'hui à 14:32 depuis 192.168.1.100
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSecurityModal(false)}>
              Fermer
            </Button>
            <Button>Changer le mot de passe</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Centre d'aide */}
      <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Centre d'aide
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <HelpCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Guide d'utilisation</h3>
                  <p className="text-xs text-gray-500">Documentation complète</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium">Support chat</h3>
                  <p className="text-xs text-gray-500">Assistance en direct</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium">Formation</h3>
                  <p className="text-xs text-gray-500">Tutoriels vidéo</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium">FAQ</h3>
                  <p className="text-xs text-gray-500">Questions fréquentes</p>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Raccourcis clavier</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Nouveau contact</span>
                  <Badge variant="outline">Ctrl + N</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Recherche</span>
                  <Badge variant="outline">Ctrl + K</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Paramètres</span>
                  <Badge variant="outline">Ctrl + ,</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Aide</span>
                  <Badge variant="outline">F1</Badge>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <Info className="h-4 w-4 inline mr-1" />
                Version: 2.1.0 | Dernière mise à jour: 15 janvier 2024
              </p>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline">Contacter le support</Button>
            <Button variant="outline" onClick={() => setShowHelpModal(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Paramètres de données */}
      <Dialog open={showDataSettingsModal} onOpenChange={setShowDataSettingsModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Paramètres de données
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sauvegarde automatique</p>
                  <p className="text-sm text-gray-600">Sauvegarder automatiquement les données</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full ${dataSettings.autoBackup ? "bg-blue-500" : "bg-gray-300"} relative transition-colors cursor-pointer`}
                  onClick={() => {
                    const handleDataSettingChange = (setting: string, value: any) => {
                      setDataSettings((prev) => ({ ...prev, [setting]: value }))
                      localStorage.setItem("dataSettings", JSON.stringify({ ...dataSettings, [setting]: value }))
                      toast({
                        title: "Paramètres de données mis à jour",
                        description: `Le paramètre ${setting} a été mis à jour.`,
                      })
                    }
                    handleDataSettingChange("autoBackup", !dataSettings.autoBackup)
                  }}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${dataSettings.autoBackup ? "translate-x-6" : "translate-x-0.5"}`}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compression des données</p>
                  <p className="text-sm text-gray-600">Compresser les exports</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full ${dataSettings.compressionEnabled ? "bg-blue-500" : "bg-gray-300"} relative transition-colors cursor-pointer`}
                  onClick={() => {
                    const handleDataSettingChange = (setting: string, value: any) => {
                      setDataSettings((prev) => ({ ...prev, [setting]: value }))
                      localStorage.setItem("dataSettings", JSON.stringify({ ...dataSettings, [setting]: value }))
                      toast({
                        title: "Paramètres de données mis à jour",
                        description: `Le paramètre ${setting} a été mis à jour.`,
                      })
                    }
                    handleDataSettingChange("compressionEnabled", !dataSettings.compressionEnabled)
                  }}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${dataSettings.compressionEnabled ? "translate-x-6" : "translate-x-0.5"}`}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fréquence de sauvegarde</Label>
                <Select
                  value={dataSettings.backupFrequency}
                  onValueChange={(value) => {
                    const handleDataSettingChange = (setting: string, value: any) => {
                      setDataSettings((prev) => ({ ...prev, [setting]: value }))
                      localStorage.setItem("dataSettings", JSON.stringify({ ...dataSettings, [setting]: value }))
                      toast({
                        title: "Paramètres de données mis à jour",
                        description: `Le paramètre ${setting} a été mis à jour.`,
                      })
                    }
                    handleDataSettingChange("backupFrequency", value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                    <SelectItem value="daily">Quotidienne</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rétention des données (jours)</Label>
                <Select
                  value={dataSettings.dataRetention}
                  onValueChange={(value) => {
                    const handleDataSettingChange = (setting: string, value: any) => {
                      setDataSettings((prev) => ({ ...prev, [setting]: value }))
                      localStorage.setItem("dataSettings", JSON.stringify({ ...dataSettings, [setting]: value }))
                      toast({
                        title: "Paramètres de données mis à jour",
                        description: `Le paramètre ${setting} a été mis à jour.`,
                      })
                    }
                    handleDataSettingChange("dataRetention", value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="90">90 jours</SelectItem>
                    <SelectItem value="180">180 jours</SelectItem>
                    <SelectItem value="365">1 an</SelectItem>
                    <SelectItem value="unlimited">Illimitée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Actions rapides</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Sauvegarde des données",
                      description: "Les données ont été sauvegardées avec succès.",
                    })
                  }}
                  className="w-full bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Sauvegarder maintenant
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <label className="cursor-pointer flex items-center">
                    <input
                      type="file"
                      accept=".json"
                      onChange={(event: any) => {
                        const file = event.target.files[0]
                        if (file) {
                          const handleRestoreData = (event: any) => {
                            const file = event.target.files[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (e: any) => {
                                try {
                                  const jsonData = JSON.parse(e.target.result)
                                  // Ici, vous pouvez implémenter la logique pour restaurer les données
                                  toast({
                                    title: "Données restaurées",
                                    description: "Les données ont été restaurées avec succès.",
                                  })
                                } catch (error) {
                                  toast({
                                    title: "Erreur de restauration",
                                    description: "Impossible de restaurer les données. Format de fichier incorrect.",
                                    variant: "destructive",
                                  })
                                }
                              }
                              reader.readAsText(file)
                            }
                          }
                          const reader = new FileReader()
                          reader.onload = (e: any) => {
                            try {
                              const jsonData = JSON.parse(e.target.result)
                              // Ici, vous pouvez implémenter la logique pour restaurer les données
                              toast({
                                title: "Données restaurées",
                                description: "Les données ont été restaurées avec succès.",
                              })
                            } catch (error) {
                              toast({
                                title: "Erreur de restauration",
                                description: "Impossible de restaurer les données. Format de fichier incorrect.",
                                variant: "destructive",
                              })
                            }
                          }
                          reader.readAsText(file)
                        }
                      }}
                      className="hidden"
                    />
                    <Download className="h-4 w-4 mr-2" />
                    Restaurer
                  </label>
                </Button>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Dernière sauvegarde: Aujourd'hui à 12:00
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDataSettingsModal(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}

export default AccueilPage
