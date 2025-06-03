"use client"

import { useEffect, useState } from "react"

interface GameTimerProps {
  time: number
  isActive: boolean
  onTimeUp: () => void
  label: string
}

export default function GameTimer({ time, isActive, onTimeUp, label }: GameTimerProps) {
  const [currentTime, setCurrentTime] = useState(time)

  useEffect(() => {
    setCurrentTime(time)
  }, [time])

  useEffect(() => {
    if (!isActive || currentTime <= 0) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1000) {
          onTimeUp()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, currentTime, onTimeUp])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const isLowTime = currentTime < 60000 // Less than 1 minute

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 min-w-[120px] shadow-md border border-gray-200">
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      <div className={`text-xl font-bold ${isLowTime ? "text-red-600" : "text-gray-900"}`}>
        {formatTime(currentTime)}
      </div>
    </div>
  )
}
