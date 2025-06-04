export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king"
export type PieceColor = "white" | "black"

export interface ChessPiece {
  type: PieceType
  color: PieceColor
}

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  piece: ChessPiece
  capturedPiece?: ChessPiece
  promotion?: PieceType
  isCheck?: boolean
  isCheckmate?: boolean
  notation?: string
}

export interface GameState {
  board: (ChessPiece | null)[][]
  currentPlayer: PieceColor
  moves: Move[]
  isCheck: boolean
  isCheckmate: boolean
  whiteTime: number
  blackTime: number
  gameMode: "pvp" | "bot" | "online"
  gameId?: string
}

export type Theme = "ocean-breeze" | "black-silver" | "forest-canopy" | "beige-brown"

export interface ThemeColors {
  lightSquare: string
  darkSquare: string
  highlight: string
  check: string
}