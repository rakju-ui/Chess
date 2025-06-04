
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
  board: (any | null)[][]
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
  
  const firebaseGameState: FirebaseGameState = {
    ...initialGameState,
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
  
  const gameData = gameSnap.data() as FirebaseGameState
  
  // Update player info
  await updateDoc(gameRef, {
    [`players.${playerColor}`]: 'joined'
  })
  
  return gameData as GameState
}

// Update game state in Firebase
export async function updateFirebaseGame(gameId: string, gameState: GameState): Promise<void> {
  const gameRef = doc(db, 'games', gameId)
  
  await updateDoc(gameRef, {
    board: gameState.board,
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
      const data = doc.data() as FirebaseGameState
      callback(data as GameState)
    }
  })
}
