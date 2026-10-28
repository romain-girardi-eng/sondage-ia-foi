"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_KEY = "ia-foi-theme"

interface ThemeProviderProps {
  children: ReactNode
  // Theme rendered by the server and used until a stored choice is found.
  defaultTheme?: Theme
  // The CNEF entry keeps its own key: every visit to the general site writes
  // "dark" under THEME_KEY, which would otherwise override its light default.
  storageKey?: string
}

export function ThemeProvider({ children, defaultTheme = "dark", storageKey = THEME_KEY }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const mounted = useRef(false)

  // Hydrate theme from localStorage after mount (default: defaultTheme)
  useEffect(() => {
    mounted.current = true
    const stored = localStorage.getItem(storageKey)
    if (stored === "dark" || stored === "light") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration pattern
      setThemeState(stored)
    }
    // No system preference check
  }, [storageKey])

  useEffect(() => {
    if (!mounted.current) return

    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
