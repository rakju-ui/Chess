"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BotSetupPage() {
  const router = useRouter()

  const difficulties = [
    {
      level: "easy",
      title: "Easy Bot",
      description: "Perfect for beginners. Makes some random moves and basic strategy.",
      icon: "🟢",
      features: ["Random moves mixed in", "Basic piece values", "2-move lookahead"],
    },
    {
      level: "medium",
      title: "Medium Bot",
      description: "Good challenge for intermediate players. Strategic thinking.",
      icon: "🟡",
      features: ["Strategic play", "Position evaluation", "3-move lookahead"],
    },
    {
      level: "hard",
      title: "Hard Bot",
      description: "Advanced chess engine. Challenging for experienced players.",
      icon: "🔴",
      features: ["Advanced tactics", "Deep analysis", "4-move lookahead"],
    },
  ]

  const handleDifficultySelect = (difficulty: string) => {
    router.push(`/play?mode=bot&difficulty=${difficulty}`)
  }

  return (
    <div className="min-h-screen chess-wallpaper-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-gray-800/95 backdrop-blur-sm shadow-2xl border-2 border-gray-600">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2 text-silver">𝔹𝕆𝔸ℝ𝔻𝕨𝕚𝕤𝕖 - Choose Your Opponent</CardTitle>
          <p className="text-gray-400">Select the difficulty level for your chess engine opponent</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {difficulties.map((diff) => (
              <div key={diff.level} className="group cursor-pointer" onClick={() => handleDifficultySelect(diff.level)}>
                <div className="bg-gray-700/90 border-2 border-gray-500 rounded-lg p-6 h-full transition-all duration-200 hover:border-silver hover:shadow-lg hover:shadow-gray-900/50 group-hover:scale-105 backdrop-blur-sm">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{diff.icon}</div>
                    <h3 className="text-xl font-bold text-silver">{diff.title}</h3>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 text-center">{diff.description}</p>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-silver text-sm">Features:</h4>
                    <ul className="space-y-1">
                      {diff.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-400 flex items-center">
                          <span className="w-1.5 h-1.5 bg-silver rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full mt-4 bg-gray-600 hover:bg-gray-500 text-silver border border-gray-500 transition-colors"
                    variant="outline"
                  >
                    Play vs {diff.title}
                  </Button></div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4 border-t border-gray-600">
            <Button
              onClick={() => router.push("/modes")}
              variant="ghost"
              className="text-gray-300 hover:text-silver hover:bg-gray-700"
            >
              ← Back to Game Modes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
