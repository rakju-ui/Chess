"use client"

import { useState } from "react"
import type { GameState, Position, PieceType } from "@/lib/types"
import { makeMove, isValidMove, isPawnPromotion } from "@/lib/chess-logic"
import { useTheme } from "@/lib/theme-context"
import ChessPieceComponent from "./chess-piece"
import PawnPromotionModal from "./pawn-promotion-modal"

interface ChessBoardProps {
  gameState: GameState
  onGameStateChange: (gameState: GameState) => void
  onMove?: (from: Position, to: Position) => void
}

export default function ChessBoard({ gameState, onGameStateChange, onMove }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Position[]>([])
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Position; to: Position } | null>(null)
  const { colors } = useTheme()

  const handleSquareClick = (row: number, col: number) => {
    // Don't allow moves if game is over
    if (gameState.isCheckmate) return

    const position = { row, col }
    const piece = gameState.board[row][col]

    if (selectedSquare) {
      // Try to make a move
      if (validMoves.some((move) => move.row === row && move.col === col)) {
        // Check if this is a pawn promotion
        if (isPawnPromotion(gameState.board, selectedSquare, position)) {
          setPendingPromotion({ from: selectedSquare, to: position })
        } else {
          const newGameState = makeMove(gameState, selectedSquare, position)
          if (newGameState) {
            onGameStateChange(newGameState)
            onMove?.(selectedSquare, position)
          }
        }
      }
      setSelectedSquare(null)
      setValidMoves([])
    } else if (piece && piece.color === gameState.currentPlayer) {
      // Select a piece
      setSelectedSquare(position)

      // Calculate valid moves
      const moves: Position[] = []
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (isValidMove(gameState.board, position, { row: r, col: c })) {
            moves.push({ row: r, col: c })
          }
        }
      }
      setValidMoves(moves)
    }
  }

  const handlePromotion = (pieceType: PieceType) => {
    if (pendingPromotion) {
      const newGameState = makeMove(gameState, pendingPromotion.from, pendingPromotion.to, pieceType)
      if (newGameState) {
        onGameStateChange(newGameState)
        onMove?.(pendingPromotion.from, pendingPromotion.to)
      }
      setPendingPromotion(null)
    }
  }

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col
  }

  const isValidMoveSquare = (row: number, col: number) => {
    return validMoves.some((move) => move.row === row && move.col === col)
  }

  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0
    const piece = gameState.board[row][col]

    // Highlight king in red if in check (but not if game is over)
    if (piece && piece.type === "king" && piece.color === gameState.currentPlayer && gameState.isCheck && !gameState.isCheckmate) {
      return colors.check
    }

    if (isSquareSelected(row, col)) {
      return colors.highlight
    }

    if (isValidMoveSquare(row, col)) {
      return `${colors.highlight}80` // Semi-transparent highlight
    }

    return isLight ? colors.lightSquare : colors.darkSquare
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-8 gap-0 border-4 border-gray-600 w-[400px] h-[400px] shadow-lg">
        {gameState.board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-[50px] h-[50px] flex items-center justify-center cursor-pointer relative transition-colors duration-200 ${
                gameState.isCheckmate ? "cursor-not-allowed" : ""
              }`}
              style={{ backgroundColor: getSquareColor(rowIndex, colIndex) }}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && <ChessPieceComponent piece={piece} size={36} />}
            </div>
          )),
        )}
      </div>

      <PawnPromotionModal
        isOpen={!!pendingPromotion}
        color={gameState.currentPlayer}
        onPromotion={handlePromotion}
      />
    </div>
  )
}
