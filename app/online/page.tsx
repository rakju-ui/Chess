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

    try {
      // Import Firebase functions dynamically to avoid SSR issues
      const { createFirebaseGame } = await import('@/lib/firebase-game')
      const { createInitialGameState } = await import('@/lib/chess-logic')
      
      const initialState = createInitialGameState('online')
      initialState.gameId = newGameId
      
      await createFirebaseGame(newGameId, initialState)
      router.push(`/play?mode=online&gameId=${newGameId}&color=white`)
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Failed to create game. Please check your Firebase configuration.')
    } finally {
      setIsCreating(false)
    }
  }

  const joinGame = () => {
    if (gameId.trim()) {
      router.push(`/play?mode=online&gameId=${gameId.trim()}&color=black`)
    }
  }

  return (
    <div className="min-h-screen chess-wallpaper-bg flex items-center justify-center">
      <Card className="w-96 bg-white/90 backdrop-blur-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">𝔹𝕆𝔸ℝ𝔻𝕨𝕚𝕤𝕖 - Online Multiplayer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button onClick={createGame} disabled={isCreating} className="w-full h-12 text-lg">
              {isCreating ? "Creating Game..." : "Create New Game"}
            </Button>

            <div className="text-center text-gray-500">or</div>

            <div className="space-y-2">
              <Input
                placeholder="Enter Game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                className="text-center text-lg"
                maxLength={6}
              />
              <Button onClick={joinGame} disabled={!gameId.trim()} variant="outline" className="w-full h-12 text-lg">
                Join Game
              </Button>
            </div>
          </div>

          <Button onClick={() => router.push("/modes")} variant="ghost" className="w-full">
            Back to Modes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
