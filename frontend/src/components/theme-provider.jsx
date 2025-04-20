"use client"

import { createContext, useContext, useEffect, useState } from "react"

// Create a context for the theme
const ThemeContext = createContext({
  theme: "light",
  setTheme: () => null,
})

// Theme provider component
export function ThemeProvider({ children, defaultTheme = "light", storageKey = "trustchain-theme" }) {
  // Initialize theme from localStorage or use default
  const [theme, setTheme] = useState(() => {
    // Check for system preference if defaultTheme is "system"
    if (defaultTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      try {
        return localStorage.getItem(storageKey) || systemTheme
      } catch (error) {
        return systemTheme
      }
    }

    // Otherwise use localStorage or default
    try {
      return localStorage.getItem(storageKey) || defaultTheme
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      return defaultTheme
    }
  })

  // Update the document with the current theme
  useEffect(() => {
    const root = window.document.documentElement
    const isDark = theme === "dark"

    // Remove existing theme classes
    root.classList.remove("light", "dark")

    // Add the current theme class
    root.classList.add(isDark ? "dark" : "light")

    // Set color scheme meta tag
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]')
    if (metaColorScheme) {
      metaColorScheme.setAttribute("content", isDark ? "dark" : "light")
    } else {
      const meta = document.createElement("meta")
      meta.name = "color-scheme"
      meta.content = isDark ? "dark" : "light"
      document.head.appendChild(meta)
    }
  }, [theme])

  // Create the context value
  const value = {
    theme,
    setTheme: (newTheme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch (error) {
        console.error("Error setting localStorage:", error)
      }
      setTheme(newTheme)
    },
  }

  // Provide the theme context to children
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// Hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
