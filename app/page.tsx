"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => router.push("/modes"), 500)
          return 100
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen chess-wallpaper-bg flex flex-col">
      {/* Game name at the top */}
      <div className="flex-none pt-16 flex justify-center">
        <h1 className="font-abril text-8xl font-bold text-white drop-shadow-2xl text-center">𝔹𝕆𝔸ℝ𝔻𝕨𝕚𝕤𝕖</h1>
      </div>

      {/* Spacer to push loading bar to bottom */}
      <div className="flex-1"></div>

      {/* Loading bar at the bottom */}
      <div className="flex-none pb-16 flex flex-col items-center">
        <div className="w-96 bg-white/20 rounded-full p-2 backdrop-blur-sm mb-4">
          <div
            className="h-4 rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-silver-400 to-silver-600"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #C0C0C0 0%, #A8A8A8 100%)",
            }}
          />
        </div>
        <p className="text-white text-xl font-medium drop-shadow-lg">Loading... {progress}%</p>
      </div>
    </div>
  )
}
