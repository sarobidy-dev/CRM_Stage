"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Target,
  Building2,
  User,
  Menu,
  PhoneCall,
  BookOpen,
  Briefcase,
  Calendar,
  ClipboardList,
  DollarSign,
  FileText,
  Globe,
  Home,
  Inbox,
  Key,
  Layers,
  MapPin,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Tag,
  ThumbsUp,
  Truck,
  UserCheck,
  UserPlus,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Exemple d'association lettre -> icône
const letterIcons: Record<string, React.ComponentType<any>> = {
  A: BookOpen,
  B: Briefcase,
  C: Calendar,
  D: ClipboardList,
  E: DollarSign,
  F: FileText,
  G: Globe,
  H: Home,
  I: Inbox,
  J: Key,
  K: Layers,
  L: MapPin,
  M: MessageSquare,
  N: Settings,
  O: Shield,
  P: ShoppingCart,
  Q: Star,
  R: Tag,
  S: ThumbsUp,
  T: Truck,
  U: UserCheck,
  V: UserPlus,
  W: Zap,
  X: LayoutDashboard,
  Y: Target,
  Z: Building2,
}

const links = {
  Management: [
    { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
    { name: "Interaction", href: "/interaction", icon: MessageSquare },
    { name: "Contact", href: "/contacts", icon: Users },
    { name: "Projet prospection", href: "/projetProspection", icon: Target },
    { name: "Entreprise", href: "/entreprise", icon: Building2 },
    { name: "Utilisateur", href: "/utilisateur", icon: User },
    { name: "Tache", href: "/tache", icon: PhoneCall },
  ],
  Historique: [
    { name: "Historques d'action", href: "/historique", icon: Target },
    { name: "Campagne", href: "/campagne", icon: Building2 },
    { name: "Utilisateur", href: "/utilisateur", icon: User },
  ],
}

const getIconForName = (name: string, defaultIcon: React.ComponentType<any>) => {
  const firstLetter = name.charAt(0).toUpperCase()
  return letterIcons[firstLetter] || defaultIcon
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">CRM.io</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-6">
        {Object.entries(links).map(([section, items]) => (
          <div key={section}>
            <h2 className="text-sm text-gray-400 mb-3 font-medium uppercase tracking-wider">{section}</h2>
            <ul className="space-y-1">
              {items.map(({ name, href, icon }) => {
                const isActive = pathname === href
                const Icon = getIconForName(name, icon)
                return (
                  <li key={name}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                        "hover:bg-blue-600/20 hover:text-blue-300",
                        isActive ? "bg-blue-600 text-white shadow-lg" : "text-gray-300 hover:text-white",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 transition-colors",
                          isActive ? "text-white" : "text-gray-400 group-hover:text-blue-300",
                        )}
                      />
                      <span className="font-medium">{name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button - Fixed */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-[#0d1530] border-gray-600 text-white hover:bg-[#1a2142] hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-[#0d1530] border-gray-700">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden md:block fixed top-0 left-0 z-40 w-64 h-screen bg-[#0d1530] border-r border-gray-700">
        <NavContent />
      </aside>

      {/* Spacer for main content */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  )
}

export default Navbar