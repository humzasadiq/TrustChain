"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, LogIn, Menu, X, History, Info, Layers, CarFront, Warehouse, CircleUserRound, Package, PlusCircle } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated, logout } = useAuth();
  const [user, setUser] = useState('');

  // Add scroll event listener to track when page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    // Add event listener
    window.addEventListener('scroll', handleScroll)

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUser = async () => {
        const response = await fetch("http://localhost:5000/api/get-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setUser(data.username);
      }
      fetchUser();
    }
  }, [isAuthenticated]

  )

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300",
        isScrolled
          ? "bg-background/40 backdrop-blur-lg"
          : "bg-background/95 backdrop-blur-sm"
      )}
    >
      <div className={cn(
        "flex h-16 items-center px-4 md:px-6 transition-all duration-300",
        isScrolled
          ? "bg-transparent"
          : "bg-[#E7FFFE] dark:bg-black"
      )}>
        {/* Logo - Left aligned */}
        <Link to="/" className="flex items-center gap-2 mr-4">
          <img src="/logo.svg" alt="TrustChain" className="h-10 w-10 dark:invert" />
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
              to="/logs"
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                isActive("/logs") && "text-primary",
              )}
            >
              <Layers className="h-4 w-4" />
              Logs
            </Link>
            <Link
              to="/inventory"
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                isActive("/inventory") && "text-primary",
              )}
            >
              <Warehouse className="h-4 w-4" />
              Inventory
            </Link>
            <Link
              to="/adar"
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                isActive("/orders") && "text-primary",
              )}
            >
              <Package className="h-4 w-4" />
              Orders
            </Link>
            {/* <Link
              to="/sad"
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                isActive("/about") && "text-primary",
              )}
            >
              <PlusCircle className="h-4 w-4" />
              New Order
            </Link> */}
            <Link
              to="/about"
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                isActive("/about") && "text-primary",
              )}
            >
              <Info className="h-4 w-4" />
              About
            </Link>
            <Link
              to="/contact"
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                isActive("/contact") && "text-primary",
              )}
            >
              <CircleUserRound className="h-4 w-4" />
              Contact
            </Link>
          </nav>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden ml-auto" onClick={toggleMenu} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Auth buttons - Right aligned */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <div>{user}</div>
          <ThemeToggle />
          {isAuthenticated() ? (
            <Button variant="outline" size="sm" onClick={() => {
              logout();
              navigate('/login');
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background/90 backdrop-blur-md border-b p-4 flex flex-col gap-4 md:hidden">
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
              to="/logs"
              className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-muted", isActive("/logs") && "bg-muted")}
              onClick={toggleMenu}
            >
              <History className="h-5 w-5" />
              Logs
            </Link>
            <Link
              to="/inventory"
              className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-muted", isActive("/inventory") && "bg-muted")}
              onClick={toggleMenu}
            >
              <Warehouse className="h-5 w-5" />
              Inventory
            </Link>
            <Link
              to="/adar"
              className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-muted", isActive("/orders") && "bg-muted")}
              onClick={toggleMenu}
            >
              <Package className="h-5 w-5" />
              Orders
            </Link>
            {/* <Link
              to="/sad"
              className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-muted", isActive("/sad") && "bg-muted")}
              onClick={toggleMenu}
            >
              <PlusCircle className="h-5 w-5" />
              New Order
            </Link> */}
            <Link
              to="/about"
              className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-muted", isActive("/about") && "bg-muted")}
              onClick={toggleMenu}
            >
              <Info className="h-5 w-5" />
              About
            </Link>
            <Link
              to="/contact"
              className={cn("flex items-center gap-2 p-2 rounded-md hover:bg-muted", isActive("/contact") && "bg-muted")}
              onClick={toggleMenu}
            >
              <CircleUserRound className="h-5 w-5" />
              Contact
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