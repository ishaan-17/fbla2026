"use client"

import { Home, Search, FileText, Trophy, Info, Shield } from "lucide-react"
import { AnimeNavBar } from "@/components/ui/anime-navbar"

const navItems = [
  { name: "Home", url: "/", icon: Home },
  { name: "Report", url: "/report", icon: FileText },
  { name: "Browse", url: "/items", icon: Search },
  { name: "Leaderboard", url: "/leaderboard", icon: Trophy },
  { name: "About", url: "/about", icon: Info },
  { name: "Admin", url: "/admin", icon: Shield },
]

export default function NavbarAnimated() {
  return <AnimeNavBar items={navItems} defaultActive="Home" />
}
