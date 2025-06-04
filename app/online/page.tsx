"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OnlineSetupPage() {
  const [gameId, setGameId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const createGame = async () => {
    setIsCreating(true)
    // Generate a random game ID
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase()

    // In a real implementation, you would create the game in Firebase here
    setTimeout(() => {
      router.push(`/play?mode=online&gameId=${newGameId}&color=white`)
    }, 1000)
  }

  const joinGame = () => {
    if (gameId.trim()) {
      router.push(`/play?mode=online&gameId=${gameId.trim()}&color=black`)
    }
  }

  return (
    <div className="min-h-screen chess-wallpaper-bg flex items-center justify-center">
      <Card className="w-96 bg-gray-800/90 backdrop-blur-sm shadow-2xl border-2 border-gray-600">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-silver">𝔹𝕆𝔸ℝ𝔻𝕨𝕚𝕤𝕖 - Online Multiplayer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button onClick={createGame} disabled={isCreating} className="w-full h-12 text-lg bg-gray-700 hover:bg-gray-600 text-silver border border-gray-500">
              {isCreating ? "Creating Game..." : "Create New Game"}
            </Button>

            <div className="text-center text-gray-400">or</div>

            <div className="space-y-2">
              <Input
                placeholder="Enter Game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                className="text-center text-lg bg-gray-700 border-gray-500 text-silver placeholder-gray-400"
                maxLength={6}
              />
              <Button onClick={joinGame} disabled={!gameId.trim()} variant="outline" className="w-full h-12 text-lg bg-gray-600 hover:bg-gray-500 text-silver border-gray-500">
                Join Game
              </Button>
            </div>
          </div>

          <Button onClick={() => router.push("/modes")} variant="ghost" className="w-full text-gray-300 hover:text-silver hover:bg-gray-700">
            Back to Modes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
