import type { ChessPiece } from "@/lib/types"

interface ChessPieceProps {
  piece: ChessPiece
  size?: number
}

const pieceSymbols = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙",
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟",
  },
}

export default function ChessPieceComponent({ piece, size = 40 }: ChessPieceProps) {
  const symbol = pieceSymbols[piece.color][piece.type]

  return (
    <span className="select-none cursor-pointer flex items-center justify-center" style={{ fontSize: `${size}px` }}>
      {symbol}
    </span>
  )
}
