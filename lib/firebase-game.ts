
import { db } from './firebase'
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  getDoc,
  collection,
  Timestamp 
} from 'firebase/firestore'
import type { GameState, Move, Position } from './types'

export interface FirebaseGameState {
  board: string // Store as JSON string instead of 2D array
  currentPlayer: 'white' | 'black'
  moves: Move[]
  isCheck: boolean
  isCheckmate: boolean
  whiteTime: number
  blackTime: number
  gameMode: 'online'
  gameId: string
  players: {
    white?: string
    black?: string
  }
  createdAt: Timestamp
  lastMoveAt: Timestamp
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
  
  await updateDoc(gameRef, {
    board: JSON.stringify(gameState.board), // Serialize the 2D array
    currentPlayer: gameState.currentPlayer,
    moves: gameState.moves,
    isCheck: gameState.isCheck,
    isCheckmate: gameState.isCheckmate,
    whiteTime: gameState.whiteTime,
    blackTime: gameState.blackTime,
    lastMoveAt: Timestamp.now()
  })
}

// Listen to game state changes
export function subscribeToGame(gameId: string, callback: (gameState: GameState) => void): () => void {
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
