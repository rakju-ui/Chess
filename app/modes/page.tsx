"use client"

import { useRouter } from "next/navigation"

export default function ModesPage() {
  const router = useRouter()

  const handleGameMode = (mode: string) => {
    if (mode === "online") {
      router.push("/online")
    } else if (mode === "bot") {
      router.push("/bot")
    } else {
      router.push(`/play?mode=${mode}`)
    }
  }

  return (
    <div className="min-h-screen chess-wallpaper-bg flex flex-col items-center justify-center">
      <h1 className="font-abril text-6xl font-bold text-white mb-16 drop-shadow-2xl text-center">𝔹𝕆𝔸ℝ𝔻𝕨𝕚𝕤𝕖</h1>

      <div className="flex flex-col gap-6 w-80">
        <button
          onClick={() => handleGameMode("pvp")}
          className="h-16 text-xl font-semibold bg-gray-800/90 hover:bg-gray-700/90 text-white border-2 border-gray-600/80 backdrop-blur-sm transition-all duration-200 shadow-lg rounded-md cursor-pointer"
        >
          Player vs Player
        </button>

        <button
          onClick={() => handleGameMode("bot")}
          className="h-16 text-xl font-semibold bg-gray-800/90 hover:bg-gray-700/90 text-white border-2 border-gray-600/80 backdrop-blur-sm transition-all duration-200 shadow-lg rounded-md cursor-pointer"
        >
          Player (White) vs Bot
        </button>

        <button
          onClick={() => handleGameMode("online")}
          className="h-16 text-xl font-semibold bg-gray-800/90 hover:bg-gray-700/90 text-white border-2 border-gray-600/80 backdrop-blur-sm transition-all duration-200 shadow-lg rounded-md cursor-pointer"
        >
          Online Multiplayer
        </button>
      </div>
    </div>
  )
}
