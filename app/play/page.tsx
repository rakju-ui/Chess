"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import ChessBoard from "@/components/chess-board"
import GameTimer from "@/components/game-timer"
import ThemeSwitcher from "@/components/theme-switcher"
import { useTheme } from "@/lib/theme-context"
import type { GameState } from "@/lib/types"
import { createInitialGameState, makeMove, getGameResult } from "@/lib/chess-logic"
import { getBestMove, getSmartRandomMove } from "@/lib/chess-engine"

export default function PlayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const mode = searchParams.get("mode") || "pvp"
  const gameId = searchParams.get("gameId")
  const playerColor = searchParams.get("color")

  const urlDifficulty = searchParams.get("difficulty") as "easy" | "medium" | "hard" | null

  const [countdown, setCountdown] = useState(5)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(mode as "pvp" | "bot" | "online"))
  const [gameResult, setGameResult] = useState<string | null>(null)
  const [botDifficulty, setBotDifficulty] = useState<"easy" | "medium" | "hard">(urlDifficulty || "medium")
  const [botThinking, setBotThinking] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setGameStarted(true)
    }
  }, [countdown])

  // Timer system - only runs for PvP and Online modes, not for bot mode
  useEffect(() => {
    if (!gameStarted || gameState.isCheckmate || mode === "bot") return

    const interval = setInterval(() => {
      setGameState((prev) => {
        const newState = { ...prev }

        // Only run timers for PvP/Online mode
        if (prev.currentPlayer === "white") {
          newState.whiteTime = Math.max(0, prev.whiteTime - 1000)
        } else {
          newState.blackTime = Math.max(0, prev.blackTime - 1000)
        }

        return newState
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameStarted, gameState.currentPlayer, gameState.isCheckmate, mode])

  // Check for game end conditions
  useEffect(() => {
    const result = getGameResult(gameState)
    if (result) {
      setGameResult(result)
    }
  }, [gameState])

  // Enhanced AI Bot logic
  const makeBotMove = useCallback(async () => {
    if (mode !== "bot" || gameState.currentPlayer !== "black" || gameState.isCheckmate) return

    setBotThinking(true)

    try {
      console.log(`🤖 Chess Engine analyzing position at ${botDifficulty} difficulty...`)

      // Add thinking delay for realism - no timer pressure in bot mode
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200))

      let botMove = null

      // Try the advanced engine first
      try {
        botMove = getBestMove(gameState, botDifficulty)
      } catch (error) {
        console.warn("🤖 Advanced engine failed, using fallback:", error)
        botMove = getSmartRandomMove(gameState, botDifficulty)
      }

      if (botMove) {
        const newGameState = makeMove(gameState, botMove.from, botMove.to)
        if (newGameState) {
          setGameState(newGameState)
          console.log("🤖 Bot move executed successfully")
        }
      } else {
        console.log("🤖 No valid moves available for bot")
      }
    } catch (error) {
      console.error("🤖 Bot move failed:", error)
      // Final fallback - try any random valid move
      const fallbackMove = getSmartRandomMove(gameState, "easy")
      if (fallbackMove) {
        const newGameState = makeMove(gameState, fallbackMove.from, fallbackMove.to)
        if (newGameState) {
          setGameState(newGameState)
        }
      }
    } finally {
      setBotThinking(false)
    }
  }, [mode, gameState, botDifficulty])

  useEffect(() => {
    if (
      gameStarted &&
      mode === "bot" &&
      gameState.currentPlayer === "black" &&
      !gameState.isCheckmate &&
      !botThinking
    ) {
      const timer = setTimeout(makeBotMove, 300)
      return () => clearTimeout(timer)
    }
  }, [gameStarted, mode, gameState.currentPlayer, gameState.isCheckmate, makeBotMove, botThinking])

  const handleGameStateChange = (newGameState: GameState) => {
    setGameState(newGameState)

    if (mode === "online" && gameId) {
      console.log("Syncing game state to Firebase:", gameId)
    }
  }

  const handleTimeUp = () => {
    console.log("Time up!")
    const result = getGameResult(gameState)
    if (result) {
      setGameResult(result)
    }
  }

  const handleNewGame = () => {
    setGameState(createInitialGameState(mode as "pvp" | "bot" | "online"))
    setGameResult(null)
    setBotThinking(false)
  }

  const getThemeClass = () => {
    switch (theme) {
      case "ocean-breeze":
        return "theme-ocean-breeze"
      case "black-silver":
        return "theme-black-silver"
      case "forest-canopy":
        return "theme-forest-canopy"
      case "beige-brown":
        return "theme-beige-brown"
      default:
        return "theme-black-silver"
    }
  }

  const getTextColor = () => {
    return theme === "black-silver" ? "text-white" : "text-gray-800"
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8">{countdown}</h1>
          <p className="text-xl text-gray-300">Game starting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getThemeClass()} p-4 md:p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={() => router.push("/modes")}
            variant="ghost"
            className={`${getTextColor()} hover:bg-white/20`}
          >
            ← Back
          </Button>

          <div className="flex items-center gap-4">
            {gameResult && (
              <Button onClick={handleNewGame} className="bg-green-600 hover:bg-green-700 text-white">
                New Game
              </Button>
            )}
            {mode === "bot" && (
              <select
                value={botDifficulty}
                onChange={(e) => setBotDifficulty(e.target.value as "easy" | "medium" | "hard")}
                className="bg-white/90 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
                disabled={gameState.moves.length > 0}
              >
                <option value="easy">Easy Bot</option>
                <option value="medium">Medium Bot</option>
                <option value="hard">Hard Bot</option>
              </select>
            )}
            <ThemeSwitcher />
          </div>
        </div>

        {/* Game Result - Enhanced for all modes */}
        {gameResult && (
          <div className="flex justify-center mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center shadow-xl border-4 border-red-500 checkmate-announcement">
              <h2 className="text-3xl font-bold text-red-600 mb-4">🏆 CHECKMATE! 🏆</h2>
              <p className="text-xl text-gray-800 font-semibold">{gameResult}</p>
              <div className="mt-4 text-sm text-gray-600">
                Game completed in {gameState.moves.length} moves
              </div>
            </div>
          </div>
        )}

        {/* Checkmate Overlay for Chess Board */}
        {gameState.isCheckmate && !gameResult && (
          <div className="flex justify-center mb-8">
            <div className="bg-red-100/95 backdrop-blur-sm rounded-lg p-6 text-center shadow-xl border-4 border-red-500 checkmate-announcement">
              <h2 className="text-3xl font-bold text-red-600 mb-2">🏆 CHECKMATE! 🏆</h2>
              <p className="text-xl text-gray-800 font-semibold">
                {gameState.currentPlayer === "white" ? "PlayerWhite" : "PlayerBlack"} wins!
              </p>
              <div className="mt-4 text-sm text-gray-600">
                Game completed in {gameState.moves.length} moves
              </div>
            </div>
          </div>
        )}

        {/* Current Player Indicator */}
        {!gameResult && !gameState.isCheckmate && (
          <div className="flex justify-center mb-8">
            <div className="current-player-indicator">
              {gameState.currentPlayer === "white" ? (
                "PlayerWhite's turn"
              ) : botThinking ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  Bot is thinking...
                </div>
              ) : (
                "PlayerBlack's turn"
              )}
            </div>
          </div>
        )}

        {/* Game Area - Responsive Layout */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Chess Board */}
          <div className="order-1">
            <ChessBoard gameState={gameState} onGameStateChange={handleGameStateChange} />
          </div>

          {/* Timers - Only show for PvP and Online modes, hidden for bot mode */}
          {mode !== "bot" && (
            <div className="order-2 md:order-3 flex flex-row md:flex-col gap-4 justify-center">
              <GameTimer
                time={gameState.blackTime}
                isActive={gameState.currentPlayer === "black" && !gameState.isCheckmate}
                onTimeUp={handleTimeUp}
                label="PlayerBlack"
              />
              <GameTimer
                time={gameState.whiteTime}
                isActive={gameState.currentPlayer === "white" && !gameState.isCheckmate}
                onTimeUp={handleTimeUp}
                label="PlayerWhite"
              />
            </div>
          )}
        </div>

        {/* Game Info */}
        {mode === "online" && gameId && (
          <div className="text-center mt-8">
            <p className={`text-lg ${getTextColor()}`}>
              Game ID: <span className="font-bold">{gameId}</span>
            </p>
            <p className={`text-sm ${getTextColor()} opacity-70`}>
              You are playing as {playerColor === "white" ? "White" : "Black"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
