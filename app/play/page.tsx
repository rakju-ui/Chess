"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ChessBoard from "../../components/chess-board"
import GameTimer from "../../components/game-timer"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { 
  initializeGame, 
  makeMove, 
  isValidMove, 
  isKingInCheck, 
  isCheckmate,
  type GameState, 
  type Move, 
  type Position 
} from "../../lib/chess-logic"
import { makeBotMove } from "../../lib/chess-engine"
import { 
  createFirebaseGame, 
  joinFirebaseGame, 
  updateFirebaseGame, 
  subscribeToGameUpdates 
} from "../../lib/firebase-game"
import type { PieceColor } from "../../lib/types"

export default function PlayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") as "pvp" | "bot" | "online" | null
  const gameId = searchParams.get("gameId")
  const playerColor = searchParams.get("color") as PieceColor | null

  const [gameState, setGameState] = useState<GameState>(initializeGame(mode || "pvp"))
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [waitingForPlayer, setWaitingForPlayer] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>("")

  // Initialize game when component mounts
  useEffect(() => {
    if (mode) {
      setGameState(initializeGame(mode, gameId))
      setGameStarted(true)
    }
  }, [mode, gameId])

  // Initialize Firebase game for online mode
  useEffect(() => {
    if (mode === "online" && gameId && gameStarted) {
      if (playerColor === "white") {
        // Creator initializes the game
        createFirebaseGame(gameId, gameState)
          .then(() => {
            console.log("Game created successfully")
            setConnectionStatus("Waiting for opponent...")
            setWaitingForPlayer(true)
          })
          .catch((error) => {
            console.error("Error creating game:", error)
            setConnectionStatus("Error creating game")
          })
      } else if (playerColor === "black") {
        // Joiner joins the game
        joinFirebaseGame(gameId, "black")
          .then((fetchedGameState) => {
            if (fetchedGameState) {
              setGameState(fetchedGameState)
              setConnectionStatus("Connected to game!")
              setWaitingForPlayer(false)
            }
          })
          .catch((error) => {
            console.error("Error joining game:", error)
            setConnectionStatus("Error joining game")
          })
      }

      // Subscribe to game updates
      const unsubscribe = subscribeToGameUpdates(gameId, (updatedGameState) => {
        setGameState(updatedGameState)
        setWaitingForPlayer(false)
        setConnectionStatus("Connected")
      })

      return unsubscribe
    }
  }, [mode, gameId, gameStarted, playerColor])

  const handleGameStateChange = useCallback((newGameState: GameState) => {
    setGameState(newGameState)

    // Update Firebase for online games
    if (mode === "online" && gameId) {
      updateFirebaseGame(gameId, newGameState).catch((error) => {
        console.error("Error updating Firebase game:", error)
      })
    }
  }, [mode, gameId])

  const handleMove = useCallback((from: Position, to: Position) => {
    // For online mode, only allow moves if it's the player's turn
    if (mode === "online" && playerColor && gameState.currentPlayer !== playerColor) {
      return false
    }

    if (isValidMove(gameState, from, to)) {
      const newGameState = makeMove(gameState, from, to)
      handleGameStateChange(newGameState)
      return true
    }
    return false
  }, [gameState, handleGameStateChange, mode, playerColor])

  const handleSquareClick = (position: Position) => {
    if (selectedSquare) {
      if (selectedSquare.row === position.row && selectedSquare.col === position.col) {
        setSelectedSquare(null)
        return
      }

      const moveSuccessful = handleMove(selectedSquare, position)
      setSelectedSquare(null)

      if (moveSuccessful && mode === "bot" && gameState.currentPlayer === "black") {
        setTimeout(() => {
          const botMove = makeBotMove(gameState)
          if (botMove) {
            handleGameStateChange(botMove)
          }
        }, 500)
      }
    } else {
      const piece = gameState.board[position.row][position.col]
      if (piece && piece.color === gameState.currentPlayer) {
        // For online mode, only allow selecting own pieces
        if (mode === "online" && playerColor && piece.color !== playerColor) {
          return
        }
        setSelectedSquare(position)
      }
    }
  }

  const resetGame = () => {
    setGameState(initializeGame(mode || "pvp", gameId))
    setSelectedSquare(null)
  }

  const goBack = () => {
    router.back()
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Game Mode Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={goBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={goBack}>
            ← Back
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {mode === "pvp" ? "Player vs Player" : mode === "bot" ? "vs Computer" : "Online"}
            </Badge>
            {mode === "online" && gameId && (
              <Badge variant="outline" className="text-sm">
                Game ID: {gameId}
              </Badge>
            )}
            {mode === "online" && playerColor && (
              <Badge variant="outline" className="text-sm">
                Playing as: {playerColor}
              </Badge>
            )}
          </div>
          <Button variant="outline" onClick={resetGame}>
            Reset Game
          </Button>
        </div>

        {mode === "online" && connectionStatus && (
          <div className="mb-4 text-center">
            <Badge variant={waitingForPlayer ? "destructive" : "default"}>
              {connectionStatus}
            </Badge>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChessBoard
              gameState={gameState}
              selectedSquare={selectedSquare}
              onSquareClick={handleSquareClick}
            />
          </div>

          <div className="space-y-6">
            <GameTimer
              whiteTime={gameState.whiteTime}
              blackTime={gameState.blackTime}
              currentPlayer={gameState.currentPlayer}
              isGameActive={!gameState.isCheckmate}
            />

            <Card>
              <CardHeader>
                <CardTitle>Game Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Current Player:</span>
                  <Badge variant={gameState.currentPlayer === "white" ? "default" : "secondary"}>
                    {gameState.currentPlayer === "white" ? "White" : "Black"}
                  </Badge>
                </div>

                {gameState.isCheck && (
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant="destructive">Check!</Badge>
                  </div>
                )}

                {gameState.isCheckmate && (
                  <div className="flex items-center justify-between">
                    <span>Game Over:</span>
                    <Badge variant="destructive">
                      Checkmate! {gameState.currentPlayer === "white" ? "Black" : "White"} Wins!
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Moves Played:</span>
                  <span>{gameState.moves.length}</span>
                </div>
              </CardContent>
            </Card>

            {gameState.moves.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Move History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {gameState.moves.slice(-5).map((move, index) => (
                      <div key={gameState.moves.length - 5 + index} className="text-sm">
                        {gameState.moves.length - 5 + index + 1}. {move.notation || `${String.fromCharCode(97 + move.from.col)}${8 - move.from.row} → ${String.fromCharCode(97 + move.to.col)}${8 - move.to.row}`}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}