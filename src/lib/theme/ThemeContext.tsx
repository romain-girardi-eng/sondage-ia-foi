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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const mounted = useRef(false)

  // Hydrate theme from localStorage after mount (default: dark)
  useEffect(() => {
    mounted.current = true
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration pattern
      setThemeState(stored)
    }
    // Default to dark mode - no system preference check
  }, [])

  useEffect(() => {
    if (!mounted.current) return

    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

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
