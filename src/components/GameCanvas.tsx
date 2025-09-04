import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Game, GameState } from '../game/game'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game/constants'
import { Play, RefreshCw, Pause } from 'lucide-react' // Import Pause icon
import Starfield from './Starfield' // Import Starfield component

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void
  onLivesUpdate: (lives: number) => void
  onGameStateChange: (state: GameState) => void
  onLevelUpdate: (level: number) => void // Add onLevelUpdate to props
  gameState: GameState
  score: number
  lives: number
  level: number // Add level to props
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  onScoreUpdate,
  onLivesUpdate,
  onGameStateChange,
  onLevelUpdate, // Destructure onLevelUpdate
  gameState,
  score,
  lives,
  level, // Destructure level
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)

  const startGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.startGame()
    }
  }, [])

  const togglePause = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.togglePause()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameCallbacks = {
      onScoreUpdate,
      onLivesUpdate,
      onGameStateChange,
      onLevelUpdate, // Include onLevelUpdate in the callbacks object
    }

    gameRef.current = new Game(ctx, gameCallbacks)

    // Cleanup function
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy()
      }
    }
  }, [onScoreUpdate, onLivesUpdate, onGameStateChange, onLevelUpdate]) // Add onLevelUpdate to dependency array

  return (
    <div className="relative bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <Starfield /> {/* Render Starfield component */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block border border-gray-700 relative z-10" // Ensure game canvas is above starfield
      />

      {gameState !== 'playing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4 z-20">
          {gameState === 'start' && (
            <>
              <h2 className="text-4xl font-bold mb-4 text-lime-400">
                Space Invaders
              </h2>
              <p className="text-lg mb-6 text-gray-300">
                Use ← → to move, Spacebar to shoot. Press 'P' to Pause.
              </p>
              <button
                onClick={startGame}
                className="flex items-center px-6 py-3 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold rounded-full text-xl transition-colors duration-200"
              >
                <Play className="mr-2" size={24} /> Start Game
              </button>
            </>
          )}
          {gameState === 'gameOver' && (
            <>
              <h2 className="text-5xl font-bold mb-4 text-red-500">
                GAME OVER!
              </h2>
              <p className="text-2xl mb-6 text-gray-300">
                Your Score: <span className="font-bold text-yellow-400">{score}</span>
              </p>
              <button
                onClick={startGame}
                className="flex items-center px-6 py-3 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold rounded-full text-xl transition-colors duration-200"
              >
                <RefreshCw className="mr-2" size={24} /> Play Again
              </button>
            </>
          )}
          {gameState === 'won' && (
            <>
              <h2 className="text-5xl font-bold mb-4 text-green-500">
                YOU WON!
              </h2>
              <p className="text-2xl mb-6 text-gray-300">
                Final Score: <span className="font-bold text-yellow-400">{score}</span>
              </p>
              <button
                onClick={startGame}
                className="flex items-center px-6 py-3 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold rounded-full text-xl transition-colors duration-200"
              >
                <RefreshCw className="mr-2" size={24} /> Play Again
              </button>
            </>
          )}
          {gameState === 'paused' && (
            <>
              <h2 className="text-5xl font-bold mb-4 text-blue-400">
                PAUSED
              </h2>
              <p className="text-2xl mb-6 text-gray-300">
                Press 'P' or click to resume.
              </p>
              <button
                onClick={togglePause}
                className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full text-xl transition-colors duration-200"
              >
                <Play className="mr-2" size={24} /> Resume Game
              </button>
            </>
          )}
        </div>
      )}

      {/* Pause/Resume button always visible when playing */}
      {gameState === 'playing' && (
        <button
          onClick={togglePause}
          className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow-lg transition-colors duration-200 z-20"
          title="Pause Game (P)"
        >
          <Pause size={24} />
        </button>
      )}
    </div>
  )
}

export default GameCanvas
