'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ChessBoard from '../../components/chess-board'
import GameTimer from '../../components/game-timer'
import { Button } from '../../components/ui/button'
import type { GameState, Move, Position } from '../../lib/types'
import { ChessPiece } from '../../lib/types'
import { initializeChessBoard } from '../../lib/chess-logic'
import { createFirebaseGame, joinFirebaseGame, updateFirebaseGame, subscribeToFirebaseGame } from '../../lib/firebase-game'

export default function PlayPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'local'
  const gameId = searchParams.get('gameId')
  const playerColor = searchParams.get('color') as 'white' | 'black' | null

  const [gameState, setGameState] = useState<GameState>({
    board: initializeChessBoard(),
    currentPlayer: 'white',
    moves: [],
    isCheck: false,
    isCheckmate: false,
    whiteTime: 600,
    blackTime: 600,
    gameMode: mode as 'local' | 'online'
  })

  const [isOnlineGame, setIsOnlineGame] = useState(false)
  const [myColor, setMyColor] = useState<'white' | 'black' | null>(null)

  useEffect(() => {
    if (mode === 'online' && gameId) {
      setIsOnlineGame(true)
      setMyColor(playerColor)

      if (playerColor === 'white') {
        // Create new game
        createFirebaseGame(gameId, gameState).catch(console.error)
      } else if (playerColor === 'black') {
        // Join existing game
        joinFirebaseGame(gameId, 'black').then(joinedGameState => {
          if (joinedGameState) {
            setGameState(joinedGameState)
          }
        }).catch(console.error)
      }

      // Subscribe to game updates
      const unsubscribe = subscribeToFirebaseGame(gameId, (updatedGameState) => {
        setGameState(updatedGameState)
      })

      return () => unsubscribe()
    }
  }, [mode, gameId, playerColor])

  const handleGameStateChange = (newGameState: GameState) => {
    setGameState(newGameState)

    if (isOnlineGame && gameId) {
      updateFirebaseGame(gameId, newGameState).catch(error => {
        console.error('Error updating Firebase game:', error)
      })
    }
  }

  const handleMove = (move: Move): boolean => {
    // In online mode, only allow moves when it's the player's turn
    if (isOnlineGame && myColor && gameState.currentPlayer !== myColor) {
      return false
    }

    return true
  }

  const resetGame = () => {
    const newGameState: GameState = {
      board: initializeChessBoard(),
      currentPlayer: 'white',
      moves: [],
      isCheck: false,
      isCheckmate: false,
      whiteTime: 600,
      blackTime: 600,
      gameMode: mode as 'local' | 'online'
    }
    handleGameStateChange(newGameState)
  }

  const getGameStatus = () => {
    if (gameState.isCheckmate) {
      const winner = gameState.currentPlayer === 'white' ? 'Black' : 'White'
      return `Checkmate! ${winner} wins!`
    } else if (gameState.isCheck) {
      return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'} is in check!`
    } else {
      return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'}'s turn`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChessBoard 
            gameState={gameState} 
            onGameStateChange={handleGameStateChange}
            onMove={handleMove}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Game Status</h2>
            <p className="text-white/90 mb-4">{getGameStatus()}</p>

            {isOnlineGame && (
              <div className="mb-4">
                <p className="text-white/70">You are playing as: <span className="font-semibold text-white">{myColor}</span></p>
                <p className="text-white/70">Game ID: <span className="font-mono text-white">{gameId}</span></p>
              </div>
            )}

            <Button 
              onClick={resetGame}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isOnlineGame} // Disable reset for online games
            >
              {isOnlineGame ? 'Online Game' : 'Reset Game'}
            </Button>
          </div>

          <GameTimer 
            whiteTime={gameState.whiteTime}
            blackTime={gameState.blackTime}
            currentPlayer={gameState.currentPlayer}
            isGameOver={gameState.isCheckmate}
            onTimeUp={(player) => {
              const winner = player === 'white' ? 'Black' : 'White'
              alert(`Time's up! ${winner} wins!`)
            }}
          />
        </div>
      </div>
    </div>
  )
}