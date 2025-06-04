
import { doc, setDoc, getDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from './firebase'
import type { GameState, Move, Position } from './types'

export interface FirebaseGameState {
  board: string // Store as JSON string instead of 2D array
  currentPlayer: 'white' | 'black'
  moves: Move[]
  isCheck: boolean
  isCheckmate: boolean
  whiteTime: number
  blackTime: number
  gameMode: string
  players: { white?: string; black?: string }
  createdAt: any
  lastMoveAt: any
}

// Create a new game in Firebase
export async function createFirebaseGame(gameId: string, initialGameState: GameState): Promise<void> {
  const gameRef = doc(db, 'games', gameId)
  
  const firebaseGameState = {
    board: JSON.stringify(initialGameState.board), // Serialize the 2D array
    currentPlayer: initialGameState.currentPlayer,
    moves: initialGameState.moves,
    isCheck: initialGameState.isCheck,
    isCheckmate: initialGameState.isCheckmate,
    whiteTime: initialGameState.whiteTime,
    blackTime: initialGameState.blackTime,
    gameMode: initialGameState.gameMode,
    players: { white: 'creator' },
    createdAt: Timestamp.now(),
    lastMoveAt: Timestamp.now()
  }
  
  await setDoc(gameRef, firebaseGameState)
}

// Join an existing game
export async function joinFirebaseGame(gameId: string, playerColor: 'white' | 'black'): Promise<GameState | null> {
  const gameRef = doc(db, 'games', gameId)
  const gameSnap = await getDoc(gameRef)
  
  if (!gameSnap.exists()) {
    return null
  }
  
  const gameData = gameSnap.data()
  
  // Update player info
  await updateDoc(gameRef, {
    [`players.${playerColor}`]: 'joined'
  })
  
  // Parse the serialized board data
  const gameState: GameState = {
    ...gameData,
    board: JSON.parse(gameData.board), // Deserialize the board
  } as GameState
  
  return gameState
}

// Update game state in Firebase
export async function updateFirebaseGame(gameId: string, gameState: GameState): Promise<void> {
  const gameRef = doc(db, 'games', gameId)
  
  // Filter out undefined values to prevent Firebase errors
  const updateData: any = {
    board: JSON.stringify(gameState.board), // Serialize the 2D array
    currentPlayer: gameState.currentPlayer,
    moves: gameState.moves || [],
    isCheck: gameState.isCheck || false,
    isCheckmate: gameState.isCheckmate || false,
    lastMoveAt: Timestamp.now()
  }
  
  // Only include time fields if they are defined
  if (gameState.whiteTime !== undefined) {
    updateData.whiteTime = gameState.whiteTime
  }
  if (gameState.blackTime !== undefined) {
    updateData.blackTime = gameState.blackTime
  }
  
  await updateDoc(gameRef, updateData)
}

// Subscribe to game updates
export function subscribeToGameUpdates(gameId: string, callback: (gameState: GameState) => void) {
  const gameRef = doc(db, 'games', gameId)
  
  return onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data()
      // Parse the serialized board data
      const gameState: GameState = {
        ...data,
        board: JSON.parse(data.board), // Deserialize the board
      } as GameState
      callback(gameState)
    }
  })
}
