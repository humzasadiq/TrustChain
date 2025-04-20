"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Shield, LayoutDashboard, Shuffle, LogIn, Menu, X } from 'lucide-react'
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import { ThemeToggle } from "./theme-toggle"

export default function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Logo - Left aligned */}
        <Link to="/" className="flex items-center gap-2 mr-4">
          <Shield className="h-6 w-6" />
          <span className="text-xl font-bold">TrustChain</span>
        </Link>

        {/* Navigation - Center aligned with auto margins */}
        <div className="hidden md:flex flex-1 justify-center">
          <nav className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                isActive("/dashboard") && "text-primary",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/random"
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                isActive("/random") && "text-primary",
              )}
            >
              <Shuffle className="h-4 w-4" />
              Random
            </Link>
          </nav>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden ml-auto" onClick={toggleMenu} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Auth buttons - Right aligned */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b p-4 flex flex-col gap-4 md:hidden">
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center gap-2 p-2 rounded-md hover:bg-muted",
                isActive("/dashboard") && "bg-muted",
              )}
              onClick={toggleMenu}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              to="/random"
              className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-muted", isActive("/random") && "bg-muted")}
              onClick={toggleMenu}
            >
              <Shuffle className="h-5 w-5" />
              Random
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t">
              <div className="p-2">
                <ThemeToggle />
              </div>
              <Link to="/login" onClick={toggleMenu}>
                <Button variant="outline" className="w-full justify-start">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/signup" onClick={toggleMenu}>
                <Button className="w-full justify-start">Sign Up</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

