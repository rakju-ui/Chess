
import type { GameState } from "./types"

export interface LocalRoom {
  id: string
  playerWhite: string | null
  playerBlack: string | null
  gameState: GameState | null
  createdAt: number
  lastUpdated: number
}

export function createLocalRoom(roomCode: string): LocalRoom {
  const room: LocalRoom = {
    id: roomCode,
    playerWhite: "waiting",
    playerBlack: null,
    gameState: null,
    createdAt: Date.now(),
    lastUpdated: Date.now()
  }
  
  localStorage.setItem(`room_${roomCode}`, JSON.stringify(room))
  return room
}

export function joinLocalRoom(roomCode: string, playerColor: "white" | "black"): LocalRoom | null {
  const roomData = localStorage.getItem(`room_${roomCode}`)
  if (!roomData) return null
  
  const room: LocalRoom = JSON.parse(roomData)
  
  if (playerColor === "black" && !room.playerBlack) {
    room.playerBlack = "connected"
    room.lastUpdated = Date.now()
    localStorage.setItem(`room_${roomCode}`, JSON.stringify(room))
  }
  
  return room
}

export function updateLocalRoom(roomCode: string, gameState: GameState): void {
  const roomData = localStorage.getItem(`room_${roomCode}`)
  if (!roomData) return
  
  const room: LocalRoom = JSON.parse(roomData)
  room.gameState = gameState
  room.lastUpdated = Date.now()
  
  localStorage.setItem(`room_${roomCode}`, JSON.stringify(room))
  
  // Trigger storage event for real-time updates
  window.dispatchEvent(new StorageEvent('storage', {
    key: `room_${roomCode}`,
    newValue: JSON.stringify(room),
    storageArea: localStorage
  }))
}

export function subscribeToLocalRoom(
  roomCode: string, 
  callback: (room: LocalRoom) => void
): () => void {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === `room_${roomCode}` && e.newValue) {
      const room: LocalRoom = JSON.parse(e.newValue)
      callback(room)
    }
  }
  
  // Listen for storage changes
  window.addEventListener('storage', handleStorageChange)
  
  // Also listen for custom events (for same-tab updates)
  const handleCustomEvent = (e: Event) => {
    if (e instanceof StorageEvent) {
      handleStorageChange(e)
    }
  }
  window.addEventListener('storage', handleCustomEvent)
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener('storage', handleCustomEvent)
  }
}

export function getLocalRoom(roomCode: string): LocalRoom | null {
  const roomData = localStorage.getItem(`room_${roomCode}`)
  return roomData ? JSON.parse(roomData) : null
}

export function cleanupOldRooms(): void {
  const now = Date.now()
  const maxAge = 24 * 60 * 60 * 1000 // 24 hours
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('room_')) {
      const roomData = localStorage.getItem(key)
      if (roomData) {
        const room: LocalRoom = JSON.parse(roomData)
        if (now - room.lastUpdated > maxAge) {
          localStorage.removeItem(key)
        }
      }
    }
  }
}
