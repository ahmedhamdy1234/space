import React, { useState, useCallback } from 'react'
import GameCanvas from './components/GameCanvas'
import { GameState } from './game/game'
import { Heart, Star, TrendingUp } from 'lucide-react'

function App() {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState<GameState>('start')
  const [level, setLevel] = useState(1) // New state for current level

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore)
  }, [])

  const handleLivesUpdate = useCallback((newLives: number) => {
    setLives(newLives)
  }, [])

  const handleGameStateChange = useCallback((newState: GameState) => {
    setGameState(newState)
  }, [])

  const handleLevelUpdate = useCallback((newLevel: number) => {
    setLevel(newLevel)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4 font-sans text-white">
      <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-green-500 drop-shadow-lg">
        Space Invaders
      </h1>

      <div className="flex justify-between w-full max-w-3xl mb-4 px-2">
        <div className="flex items-center text-xl font-semibold text-yellow-400">
          <Star className="mr-2" size={24} /> Score: {score}
        </div>
        <div className="flex items-center text-xl font-semibold text-blue-400">
          <TrendingUp className="mr-2" size={24} /> Level: {level}
        </div>
        <div className="flex items-center text-xl font-semibold text-red-400">
          {/* Render Heart icons for lives */}
          <span className="flex items-center mr-2">
            {Array.from({ length: lives }).map((_, index) => (
              <Heart key={index} size={24} fill="red" stroke="none" className={index > 0 ? 'ml-1' : ''} />
            ))}
          </span>
          Lives: {lives}
        </div>
      </div>

      <GameCanvas
        onScoreUpdate={handleScoreUpdate}
        onLivesUpdate={handleLivesUpdate}
        onGameStateChange={handleGameStateChange}
        onLevelUpdate={handleLevelUpdate} // Pass the new callback
        gameState={gameState}
        score={score}
        lives={lives}
        level={level} // Pass the new level state
      />

      <p className="mt-8 text-gray-400 text-sm">
        &copy; 2024 Bolt. All rights reserved.
      </p>
    </div>
  )
}

export default App
