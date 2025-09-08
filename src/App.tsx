import React, { useState, useCallback, useEffect } from 'react'
import GameCanvas from './components/GameCanvas'
import { GameState } from './game/game'
import { Heart, Star, TrendingUp, Rocket } from 'lucide-react' // Remove Palette icon
import { DEFAULT_SHIP_SKIN } from './game/constants'
// Remove ShipPreviewCanvas import

function App() {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState<GameState>('start')
  const [level, setLevel] = useState(1) // New state for current level
  const [missileCount, setMissileCount] = useState(0) // New state for missile count
  // Remove selectedSkin state and its useEffect and handleSkinChange
  // The selectedSkin state will now be managed within GameCanvas.tsx

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

  const handleMissileCountUpdate = useCallback((newCount: number) => {
    setMissileCount(newCount)
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
        <div className="flex items-center text-xl font-semibold text-purple-400">
          <Rocket className="mr-2" size={24} /> Missiles: {missileCount}
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

      {/* Remove the ship skin selection UI from here */}
      {/* {gameState === 'start' && (
        <div className="w-full max-w-3xl mb-4 flex flex-col items-center">
          <div className="flex justify-center items-center mb-4">
            <label htmlFor="ship-skin-select" className="flex items-center text-lg font-semibold text-gray-300 mr-3">
              <Palette className="mr-2" size={20} /> Ship Skin:
            </label>
            <select
              id="ship-skin-select"
              value={selectedSkin}
              onChange={handleSkinChange}
              className="p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              {shipSkins.map((skin) => (
                <option key={skin.id} value={skin.id}>
                  {skin.name}
                </option>
              ))}
            </select>
            <div className="ml-4">
              <ShipPreviewCanvas skin={selectedSkin} />
            </div>
          </div>
        </div>
      )} */}

      <GameCanvas
        onScoreUpdate={handleScoreUpdate}
        onLivesUpdate={handleLivesUpdate}
        onGameStateChange={handleGameStateChange}
        onLevelUpdate={handleLevelUpdate} // Pass the new callback
        onMissileCountUpdate={handleMissileCountUpdate} // Pass the new callback
        gameState={gameState}
        score={score}
        lives={lives}
        level={level} // Pass the new level state
        missileCount={missileCount} // Pass the new missile count state
        // Remove selectedSkin prop as it will be managed internally by GameCanvas
      />

      <p className="mt-8 text-gray-400 text-sm">
        &copy; 2025 Ahmed Hamdy. All rights reserved.
      </p>
    </div>
  )
}

export default App
