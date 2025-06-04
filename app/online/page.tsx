
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMultiplayer } from "@/hooks/use-multiplayer"

export default function OnlineSetupPage() {
  const [gameId, setGameId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { createGame, joinGame, gameState, connectionStatus, error } = useMultiplayer()

  useEffect(() => {
    if (gameState?.gameId) {
      router.push(`/play?mode=online&gameId=${gameState.gameId}&color=${gameState.playerColor}`)
    }
  }, [gameState, router])

  const handleCreateGame = async () => {
    setIsCreating(true)
    createGame()
    setTimeout(() => setIsCreating(false), 3000) // Timeout for better UX
  }

  const handleJoinGame = () => {
    if (gameId.trim()) {
      joinGame(gameId.trim().toUpperCase())
    }
  }

  return (
    <div className="min-h-screen chess-wallpaper-bg flex items-center justify-center">
      <Card className="w-96 bg-gray-800/90 backdrop-blur-sm shadow-2xl border-2 border-gray-600">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-silver">𝔹𝕆𝔸ℝ𝔻𝕨𝕚𝕤𝕖 - Online Multiplayer</CardTitle>
          <div className="text-center">
            <span className={`text-xs px-2 py-1 rounded ${
              connectionStatus === 'connected' ? 'bg-green-600 text-white' :
              connectionStatus === 'connecting' ? 'bg-yellow-600 text-white' :
              'bg-red-600 text-white'
            }`}>
              {connectionStatus === 'connected' ? '🟢 Connected' :
               connectionStatus === 'connecting' ? '🟡 Connecting...' :
               '🔴 Disconnected'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Button 
              onClick={handleCreateGame} 
              disabled={isCreating || connectionStatus !== 'connected'} 
              className="w-full h-12 text-lg bg-gray-700 hover:bg-gray-600 text-silver border border-gray-500"
            >
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
              <Button 
                onClick={handleJoinGame} 
                disabled={!gameId.trim() || connectionStatus !== 'connected'} 
                variant="outline" 
                className="w-full h-12 text-lg bg-gray-600 hover:bg-gray-500 text-silver border-gray-500"
              >
                Join Game
              </Button>
            </div>
          </div>

          <Button 
            onClick={() => router.push("/modes")} 
            variant="ghost" 
            className="w-full text-gray-300 hover:text-silver hover:bg-gray-700"
          >
            Back to Modes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
