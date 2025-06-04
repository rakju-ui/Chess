
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  Unsubscribe 
} from "firebase/firestore"
import { db } from "./firebase"
import type { GameState } from "./types"

export async function createFirebaseGame(gameId: string, gameState: GameState): Promise<void> {
  try {
    const gameRef = doc(db, "games", gameId)
    
    // Serialize the board data for Firestore
    const serializedGameState = {
      ...gameState,
      board: JSON.stringify(gameState.board), // Convert nested array to string
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
    
    await setDoc(gameRef, serializedGameState)
    console.log("Game created successfully:", gameId)
  } catch (error) {
    console.error("Error creating game:", error)
    throw error
  }
}

export async function joinFirebaseGame(gameId: string, playerColor: "white" | "black"): Promise<GameState | null> {
  try {
    const gameRef = doc(db, "games", gameId)
    const gameSnap = await getDoc(gameRef)
    
    if (gameSnap.exists()) {
      const data = gameSnap.data()
      // Parse the serialized board data
      const gameState: GameState = {
        ...data,
        board: JSON.parse(data.board), // Deserialize the board
      } as GameState
      
      console.log("Joined game successfully:", gameId)
      return gameState
    } else {
      console.log("Game not found:", gameId)
      return null
    }
  } catch (error) {
    console.error("Error joining game:", error)
    throw error
  }
}

export async function updateFirebaseGame(gameId: string, gameState: GameState): Promise<void> {
  try {
    const gameRef = doc(db, "games", gameId)
    
    // Serialize the board data for Firestore
    const serializedGameState = {
      ...gameState,
      board: JSON.stringify(gameState.board), // Convert nested array to string
      lastUpdated: new Date().toISOString()
    }
    
    await updateDoc(gameRef, serializedGameState)
    console.log("Game updated successfully:", gameId)
  } catch (error) {
    console.error("Error updating game:", error)
    throw error
  }
}

export function subscribeToFirebaseGame(
  gameId: string, 
  callback: (gameState: GameState) => void
): Unsubscribe {
  const gameRef = doc(db, "games", gameId)
  
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

// Alias for backward compatibility
export const subscribeToGameUpdates = subscribeToFirebaseGame
