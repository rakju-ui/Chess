
"use client"

import { useState } from "react"
import type { PieceType, PieceColor } from "@/lib/types"
import ChessPieceComponent from "./chess-piece"

interface PawnPromotionModalProps {
  isOpen: boolean
  color: PieceColor
  onPromotion: (pieceType: PieceType) => void
}

export default function PawnPromotionModal({ isOpen, color, onPromotion }: PawnPromotionModalProps) {
  const promotionOptions: PieceType[] = ["queen", "rook", "bishop", "knight"]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl border-2 border-silver">
        <h3 className="text-lg font-semibold mb-4 text-center text-silver">
          Choose promotion piece:
        </h3>
        <div className="flex gap-4">
          {promotionOptions.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onPromotion(pieceType)}
              className="w-16 h-16 flex items-center justify-center border-2 border-gray-500 rounded-lg hover:border-silver hover:bg-gray-700 transition-colors bg-gray-600"
            >
              <ChessPieceComponent 
                piece={{ type: pieceType, color }} 
                size={48} 
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
