
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LocalMultiplayerPage() {
  const [roomCode, setRoomCode] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const createRoom = async () => {
    setIsCreating(true)
    // Generate a simple room code
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Store room in localStorage for local multiplayer
    localStorage.setItem(`room_${newRoomCode}`, JSON.stringify({
      id: newRoomCode,
      playerWhite: "waiting",
      playerBlack: null,
      gameState: null,
      createdAt: Date.now()
    }))
    
    setTimeout(() => {
      router.push(`/play?mode=local-multiplayer&roomCode=${newRoomCode}&color=white`)
    }, 1000)
  }

  const joinRoom = () => {
    if (roomCode.trim()) {
      const room = localStorage.getItem(`room_${roomCode.trim()}`)
      if (room) {
        router.push(`/play?mode=local-multiplayer&roomCode=${roomCode.trim()}&color=black`)
      } else {
        alert("Room not found!")
      }
    }
  }

  return (
    <div className="min-h-screen chess-wallpaper-bg flex items-center justify-center">
      <Card className="w-96 bg-white/90 backdrop-blur-sm shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">𝔹𝕆𝔸ℝ𝔻𝕨𝕚𝕤𝕖 - Local Multiplayer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button onClick={createRoom} disabled={isCreating} className="w-full h-12 text-lg">
              {isCreating ? "Creating Room..." : "Create New Room"}
            </Button>

            <div className="text-center text-gray-500">or</div>

            <div className="space-y-2">
              <Input
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="text-center text-lg"
                maxLength={6}
              />
              <Button onClick={joinRoom} disabled={!roomCode.trim()} variant="outline" className="w-full h-12 text-lg">
                Join Room
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
