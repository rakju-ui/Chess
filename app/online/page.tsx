
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OnlineSetupPage() {
  const [gameId, setGameId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()

  const createGame = async () => {
    setIsCreating(true)
    // Generate a random game ID
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Navigate to the game as white player (creator)
    setTimeout(() => {
      router.push(`/play?mode=online&gameId=${newGameId}&color=white`)
    }, 1000)
  }

  const joinGame = () => {
    if (gameId.trim()) {
      setIsJoining(true)
      // Navigate to the game as black player (joiner)
      setTimeout(() => {
        router.push(`/play?mode=online&gameId=${gameId.trim()}&color=black`)
      }, 500)
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
            
            <div className="text-center text-gray-600">
              Share the game ID with your opponent
            </div>
            
            <div className="border-t pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Join Game with ID:</label>
                <Input
                  type="text"
                  placeholder="Enter game ID"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value.toUpperCase())}
                  className="text-center"
                />
              </div>
              
              <Button 
                onClick={joinGame} 
                disabled={!gameId.trim() || isJoining} 
                className="w-full h-12 text-lg mt-4"
                variant="outline"
              >
                {isJoining ? "Joining Game..." : "Join Game"}
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => router.push("/modes")} 
              variant="ghost"
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Game Modes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
