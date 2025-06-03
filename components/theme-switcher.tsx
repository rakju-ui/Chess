"use client"

import { useTheme } from "@/lib/theme-context"
import type { Theme } from "@/lib/types"

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const themes: { value: Theme; label: string }[] = [
    { value: "ocean-breeze", label: "Ocean Breeze" },
    { value: "black-silver", label: "Black & Silver" },
    { value: "forest-canopy", label: "Forest Canopy" },
    { value: "beige-brown", label: "Beige & Brown" },
  ]

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-current opacity-60" />
      </div>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="bg-white/90 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium min-w-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {themes.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
