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