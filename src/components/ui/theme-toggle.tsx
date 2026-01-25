"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme/ThemeContext"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        isDark
          ? "bg-slate-700 focus-visible:ring-offset-slate-900"
          : "bg-slate-200 focus-visible:ring-offset-white",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Background icons */}
      <Sun
        className={cn(
          "absolute left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-opacity duration-300",
          isDark ? "opacity-30 text-slate-400" : "opacity-0"
        )}
        strokeWidth={2}
      />
      <Moon
        className={cn(
          "absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-opacity duration-300",
          isDark ? "opacity-0" : "opacity-30 text-slate-500"
        )}
        strokeWidth={2}
      />

      {/* Sliding knob */}
      <span
        className={cn(
          "flex items-center justify-center w-6 h-6 rounded-full shadow-md transition-all duration-300",
          isDark
            ? "translate-x-6 bg-slate-900"
            : "translate-x-0 bg-white"
        )}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
        )}
      </span>
    </button>
  )
}
