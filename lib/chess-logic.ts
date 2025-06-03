import type { ChessPiece, Position, Move, GameState, PieceType, PieceColor } from "./types"

export function createInitialBoard(): (ChessPiece | null)[][] {
  const board: (ChessPiece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: "pawn", color: "black" }
    board[6][col] = { type: "pawn", color: "white" }
  }

  // Place other pieces
  const pieceOrder: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]

  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: "black" }
    board[7][col] = { type: pieceOrder[col], color: "white" }
  }

  return board
}

export function createInitialGameState(gameMode: "pvp" | "bot" | "online" = "pvp"): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: "white",
    moves: [],
    isCheck: false,
    isCheckmate: false,
    whiteTime: 600000, // 10 minutes in milliseconds
    blackTime: 600000,
    gameMode,
  }
}

export function isValidMove(board: (ChessPiece | null)[][], from: Position, to: Position): boolean {
  const piece = board[from.row][from.col]
  if (!piece) return false

  const targetPiece = board[to.row][to.col]
  if (targetPiece && targetPiece.color === piece.color) return false

  const rowDiff = to.row - from.row
  const colDiff = to.col - from.col

  switch (piece.type) {
    case "pawn":
      return isValidPawnMove(piece, from, to, rowDiff, colDiff, targetPiece)
    case "rook":
      return isValidRookMove(board, from, to, rowDiff, colDiff)
    case "knight":
      return isValidKnightMove(rowDiff, colDiff)
    case "bishop":
      return isValidBishopMove(board, from, to, rowDiff, colDiff)
    case "queen":
      return isValidQueenMove(board, from, to, rowDiff, colDiff)
    case "king":
      return isValidKingMove(rowDiff, colDiff)
    default:
      return false
  }
}

function isValidPawnMove(
  piece: ChessPiece,
  from: Position,
  to: Position,
  rowDiff: number,
  colDiff: number,
  targetPiece: ChessPiece | null,
): boolean {
  const direction = piece.color === "white" ? -1 : 1
  const startRow = piece.color === "white" ? 6 : 1

  // Forward move
  if (colDiff === 0 && !targetPiece) {
    if (rowDiff === direction) return true
    if (from.row === startRow && rowDiff === 2 * direction) return true
  }

  // Capture
  if (Math.abs(colDiff) === 1 && rowDiff === direction && targetPiece) {
    return true
  }

  return false
}

function isValidRookMove(
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  rowDiff: number,
  colDiff: number,
): boolean {
  if (rowDiff !== 0 && colDiff !== 0) return false
  return isPathClear(board, from, to)
}

function isValidKnightMove(rowDiff: number, colDiff: number): boolean {
  return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
}

function isValidBishopMove(
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  rowDiff: number,
  colDiff: number,
): boolean {
  if (Math.abs(rowDiff) !== Math.abs(colDiff)) return false
  return isPathClear(board, from, to)
}

function isValidQueenMove(
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  rowDiff: number,
  colDiff: number,
): boolean {
  return isValidRookMove(board, from, to, rowDiff, colDiff) || isValidBishopMove(board, from, to, rowDiff, colDiff)
}

function isValidKingMove(rowDiff: number, colDiff: number): boolean {
  return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1
}

function isPathClear(board: (ChessPiece | null)[][], from: Position, to: Position): boolean {
  const rowStep = to.row > from.row ? 1 : to.row < from.row ? -1 : 0
  const colStep = to.col > from.col ? 1 : to.col < from.col ? -1 : 0

  let currentRow = from.row + rowStep
  let currentCol = from.col + colStep

  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol] !== null) return false
    currentRow += rowStep
    currentCol += colStep
  }

  return true
}

export function makeMove(gameState: GameState, from: Position, to: Position): GameState | null {
  if (!isValidMove(gameState.board, from, to)) return null

  const newBoard = gameState.board.map((row) => [...row])
  const piece = newBoard[from.row][from.col]
  const capturedPiece = newBoard[to.row][to.col]

  // Check if king is being captured
  const isKingCaptured = capturedPiece && capturedPiece.type === "king"

  newBoard[to.row][to.col] = piece
  newBoard[from.row][from.col] = null

  const move: Move = {
    from,
    to,
    piece: piece!,
    capturedPiece: capturedPiece || undefined,
  }

  const nextPlayer = gameState.currentPlayer === "white" ? "black" : "white"

  // Check for check and checkmate
  const isCheck = isInCheck(newBoard, nextPlayer)
  const isCheckmate = isKingCaptured || (isCheck && isInCheckmate(newBoard, nextPlayer))

  return {
    ...gameState,
    board: newBoard,
    currentPlayer: isCheckmate ? gameState.currentPlayer : nextPlayer, // Don't switch if checkmate
    moves: [...gameState.moves, move],
    isCheck,
    isCheckmate,
  }
}

export function isInCheck(board: (ChessPiece | null)[][], color: PieceColor): boolean {
  const kingPosition = findKing(board, color)
  if (!kingPosition) return false

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.color !== color) {
        if (isValidMove(board, { row, col }, kingPosition)) {
          return true
        }
      }
    }
  }

  return false
}

function isInCheckmate(board: (ChessPiece | null)[][], color: PieceColor): boolean {
  // If king is missing, it's checkmate
  if (!findKing(board, color)) return true

  // Check if any move can get out of check
  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol]
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            const from = { row: fromRow, col: fromCol }
            const to = { row: toRow, col: toCol }

            if (isValidMove(board, from, to)) {
              // Simulate the move
              const testBoard = board.map((row) => [...row])
              testBoard[toRow][toCol] = testBoard[fromRow][fromCol]
              testBoard[fromRow][fromCol] = null

              // If this move gets out of check, it's not checkmate
              if (!isInCheck(testBoard, color)) {
                return false
              }
            }
          }
        }
      }
    }
  }

  return true
}

function findKing(board: (ChessPiece | null)[][], color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece && piece.type === "king" && piece.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

export function getAllValidMoves(board: (ChessPiece | null)[][], color: PieceColor): Move[] {
  const moves: Move[] = []

  for (let fromRow = 0; fromRow < 8; fromRow++) {
    for (let fromCol = 0; fromCol < 8; fromCol++) {
      const piece = board[fromRow][fromCol]
      if (piece && piece.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            const from = { row: fromRow, col: fromCol }
            const to = { row: toRow, col: toCol }
            if (isValidMove(board, from, to)) {
              moves.push({
                from,
                to,
                piece,
                capturedPiece: board[toRow][toCol] || undefined,
              })
            }
          }
        }
      }
    }
  }

  return moves
}

export function getRandomMove(board: (ChessPiece | null)[][], color: PieceColor): Move | null {
  const validMoves = getAllValidMoves(board, color)
  if (validMoves.length === 0) return null
  return validMoves[Math.floor(Math.random() * validMoves.length)]
}

export function getGameResult(gameState: GameState): string | null {
  if (gameState.isCheckmate) {
    const winner = gameState.currentPlayer === "white" ? "PlayerWhite" : "PlayerBlack"
    return `${winner} wins by checkmate!`
  }

  if (gameState.whiteTime <= 0) {
    return "PlayerBlack wins by timeout!"
  }

  if (gameState.blackTime <= 0) {
    return "PlayerWhite wins by timeout!"
  }

  return null
}
