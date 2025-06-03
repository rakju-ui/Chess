"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Theme, ThemeColors } from "./types"

const themes: Record<Theme, ThemeColors> = {
  "ocean-breeze": {
    lightSquare: "#B8E6E6",
    darkSquare: "#4A9FD9",
    highlight: "#FFD700",
    check: "#FF4444",
  },
  "black-silver": {
    lightSquare: "#A8A8A8",
    darkSquare: "#404040",
    highlight: "#FFD700",
    check: "#FF4444",
  },
  "forest-canopy": {
    lightSquare: "#C8E6C9",
    darkSquare: "#4CAF50",
    highlight: "#FFD700",
    check: "#FF4444",
  },
  "beige-brown": {
    lightSquare: "#F5DEB3",
    darkSquare: "#D2691E",
    highlight: "#FFD700",
    check: "#FF4444",
  },
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  colors: ThemeColors
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("black-silver")

  useEffect(() => {
    const savedTheme = localStorage.getItem("boardwise-theme") as Theme
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("boardwise-theme", theme)
    document.documentElement.style.setProperty("--light-square", themes[theme].lightSquare)
    document.documentElement.style.setProperty("--dark-square", themes[theme].darkSquare)
    document.documentElement.style.setProperty("--highlight", themes[theme].highlight)
    document.documentElement.style.setProperty("--check", themes[theme].check)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
