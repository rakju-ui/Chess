import type { ChessPiece, Move, GameState, PieceColor } from "./types"
import { getAllValidMoves, makeMove, isInCheck } from "./chess-logic"

// Piece values for evaluation
const PIECE_VALUES = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
}

// Position bonus tables for better piece placement
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
]

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
]

const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
]

const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
]

const KING_MIDDLE_GAME_TABLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
]

function getPiecePositionValue(piece: ChessPiece, row: number, col: number): number {
  const adjustedRow = piece.color === "white" ? 7 - row : row

  switch (piece.type) {
    case "pawn":
      return PAWN_TABLE[adjustedRow][col]
    case "knight":
      return KNIGHT_TABLE[adjustedRow][col]
    case "bishop":
      return BISHOP_TABLE[adjustedRow][col]
    case "rook":
      return ROOK_TABLE[adjustedRow][col]
    case "queen":
      return QUEEN_TABLE[adjustedRow][col]
    case "king":
      return KING_MIDDLE_GAME_TABLE[adjustedRow][col]
    default:
      return 0
  }
}

function evaluateBoard(board: (ChessPiece | null)[][], color: PieceColor): number {
  let score = 0

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece) {
        const pieceValue = PIECE_VALUES[piece.type]
        const positionValue = getPiecePositionValue(piece, row, col)
        const totalValue = pieceValue + positionValue

        if (piece.color === color) {
          score += totalValue
        } else {
          score -= totalValue
        }
      }
    }
  }

  // Bonus for controlling center
  const centerSquares = [
    [3, 3],
    [3, 4],
    [4, 3],
    [4, 4],
  ]

  for (const [row, col] of centerSquares) {
    const piece = board[row][col]
    if (piece) {
      if (piece.color === color) {
        score += 30
      } else {
        score -= 30
      }
    }
  }

  // Penalty for being in check
  if (isInCheck(board, color)) {
    score -= 50
  }

  return score
}

function minimax(
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  botColor: PieceColor,
): { score: number; move: Move | null } {
  if (depth === 0 || gameState.isCheckmate) {
    return {
      score: evaluateBoard(gameState.board, botColor),
      move: null,
    }
  }

  const currentColor = maximizingPlayer ? botColor : botColor === "white" ? "black" : "white"
  const validMoves = getAllValidMoves(gameState.board, currentColor)

  if (validMoves.length === 0) {
    return {
      score: maximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      move: null,
    }
  }

  let bestMove: Move | null = null

  if (maximizingPlayer) {
    let maxEval = Number.NEGATIVE_INFINITY

    for (const move of validMoves) {
      const newGameState = makeMove(gameState, move.from, move.to)
      if (newGameState) {
        const evaluation = minimax(newGameState, depth - 1, alpha, beta, false, botColor)

        if (evaluation.score > maxEval) {
          maxEval = evaluation.score
          bestMove = move
        }

        alpha = Math.max(alpha, evaluation.score)
        if (beta <= alpha) {
          break // Alpha-beta pruning
        }
      }
    }

    return { score: maxEval, move: bestMove }
  } else {
    let minEval = Number.POSITIVE_INFINITY

    for (const move of validMoves) {
      const newGameState = makeMove(gameState, move.from, move.to)
      if (newGameState) {
        const evaluation = minimax(newGameState, depth - 1, alpha, beta, true, botColor)

        if (evaluation.score < minEval) {
          minEval = evaluation.score
          bestMove = move
        }

        beta = Math.min(beta, evaluation.score)
        if (beta <= alpha) {
          break // Alpha-beta pruning
        }
      }
    }

    return { score: minEval, move: bestMove }
  }
}

export function getBestMove(gameState: GameState, difficulty: "easy" | "medium" | "hard" = "medium"): Move | null {
  const botColor = "black" // Bot always plays as black

  // Adjust search depth based on difficulty
  const depth = {
    easy: 2,
    medium: 3,
    hard: 4,
  }[difficulty]

  console.log(`🤖 Chess Engine thinking at ${difficulty} difficulty (depth: ${depth})...`)

  const startTime = Date.now()
  const result = minimax(gameState, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true, botColor)
  const endTime = Date.now()

  console.log(`🤖 Analysis complete in ${endTime - startTime}ms`)
  console.log(`🤖 Best move evaluation: ${result.score}`)

  if (result.move) {
    const from = `${String.fromCharCode(97 + result.move.from.col)}${8 - result.move.from.row}`
    const to = `${String.fromCharCode(97 + result.move.to.col)}${8 - result.move.to.row}`
    console.log(`🤖 Playing: ${from} → ${to}`)
  }

  return result.move
}

export function getRandomMove(board: (ChessPiece | null)[][], color: PieceColor): Move | null {
  const validMoves = getAllValidMoves(board, color)
  if (validMoves.length === 0) return null
  return validMoves[Math.floor(Math.random() * validMoves.length)]
}

// Fallback function that combines smart play with some randomness for easier difficulties
export function getSmartRandomMove(gameState: GameState, difficulty: "easy" | "medium" | "hard"): Move | null {
  const botColor = "black"
  const validMoves = getAllValidMoves(gameState.board, botColor)

  if (validMoves.length === 0) return null

  // For easy difficulty, mix random moves with some smart moves
  if (difficulty === "easy" && Math.random() < 0.4) {
    console.log("🤖 Playing random move (easy mode)")
    return validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  // Look for captures and good moves
  const captureMoves = validMoves.filter((move) => move.capturedPiece)
  const centerMoves = validMoves.filter(
    (move) => move.to.row >= 3 && move.to.row <= 4 && move.to.col >= 3 && move.to.col <= 4,
  )

  // Prioritize captures
  if (captureMoves.length > 0 && Math.random() < 0.7) {
    console.log("🤖 Playing capture move")
    return captureMoves[Math.floor(Math.random() * captureMoves.length)]
  }

  // Then center control
  if (centerMoves.length > 0 && Math.random() < 0.5) {
    console.log("🤖 Playing center control move")
    return centerMoves[Math.floor(Math.random() * centerMoves.length)]
  }

  // Otherwise random valid move
  console.log("🤖 Playing strategic move")
  return validMoves[Math.floor(Math.random() * validMoves.length)]
}
