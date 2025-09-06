import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Game, GameState } from '../game/game'
import { CANVAS_HEIGHT, CANVAS_WIDTH, GAME_LIVES } from '../game/constants'
import { Play, RefreshCw, Pause, Info, User } from 'lucide-react' // Import User icon
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
  const [playerDeathPosition, setPlayerDeathPosition] = useState<{ x: number; y: number } | null>(null) // State to store player's death position

  const startGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.startGame()
    }  }, [])

  const togglePause = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.togglePause()
    }
  }, [])

  const showInstructions = useCallback(() => {
    onGameStateChange('instructions')
  }, [onGameStateChange])

  const hideInstructions = useCallback(() => {
    onGameStateChange('start')
  }, [onGameStateChange])

  const showAbout = useCallback(() => {
    onGameStateChange('about')
  }, [onGameStateChange])

  const hideAbout = useCallback(() => {
    onGameStateChange('start')
  }, [onGameStateChange])

  // Function to handle reviving the player after watching the ad
  const revivePlayer = useCallback(() => {
    if (gameRef.current && playerDeathPosition) {
      gameRef.current.player.x = playerDeathPosition.x; // Restore the player's position
      gameRef.current.player.y = playerDeathPosition.y;
      gameRef.current.lives = GAME_LIVES; // Restore the player's lives
      onLivesUpdate(GAME_LIVES); // Update the lives in the parent component
      gameRef.current.gameState = 'playing'; // Change the game state to playing
      onGameStateChange('playing');
      setPlayerDeathPosition(null); // Clear the stored death position
      gameRef.current.loop(); // Resume the game loop
    }
  }, [gameRef, playerDeathPosition, onGameStateChange, onLivesUpdate]);

  // Function to open the ad popup and pause the game
  const openAdPopup = useCallback(() => {
    const adLink = 'https://t.me/AhmedRe3oo0'
    const popupWidth = 600
    const popupHeight = 400
    const left = (window.innerWidth - popupWidth) / 2
    const top = (window.innerHeight - popupHeight) / 2

    // Pause the game
    if (gameRef.current && gameRef.current.gameState === 'playing') {
      gameRef.current.togglePause();
    }

    // Open the ad popup
    const popupWindow = window.open(
      adLink,
      '_blank',
      `width=${popupWidth}, height=${popupHeight}, left=${left}, top=${top}`,
    );

    if (popupWindow) {
      popupWindow.focus();

      const popupInterval = setInterval(() => {
        if (popupWindow.closed) {
          clearInterval(popupInterval);
          revivePlayer();
        }
      }, 500);
    } else {
      // Handle the case where the popup was blocked
      revivePlayer();
    }
  }, [revivePlayer, togglePause])

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
      onPlayerDeath: (x: number, y: number) => {
        // Store the player's death position
        setPlayerDeathPosition({ x, y })
        onGameStateChange('gameOver') // Ensure game over state is set
      },
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

      {gameState !== 'playing' && gameState !== 'levelComplete' && (
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
                className="flex items-center px-6 py-3 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold rounded-full text-xl transition-colors duration-200 mb-4"
              >
                <Play className="mr-2" size={24} /> Start Game
              </button>
              <button
                onClick={showInstructions}
                className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full text-xl transition-colors duration-200 mb-4"
              >
                <Info className="mr-2" size={24} /> Instructions
              </button>
              <button
                onClick={showAbout}
                className="flex items-center px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full text-xl transition-colors duration-200"
              >
                <User className="mr-2" size={24} /> About Developer
              </button>
            </>
          )}
          {gameState === 'instructions' && (
            <div className="text-left max-w-2xl mx-auto w-full h-full flex flex-col"> {/* Added h-full and flex-col */}
              <h2 className="text-4xl font-bold mb-4 text-blue-400 text-center">
                Game Instructions
              </h2>
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar"> {/* Added flex-grow, overflow-y-auto, and custom-scrollbar */}
                <p className="text-lg mb-4 text-gray-300">
                  Welcome to Space Invaders! Protect your planet from alien invaders.
                </p>
                <h3 className="text-2xl font-semibold mb-2 text-cyan-400">Controls:</h3>
                <ul className="list-disc list-inside mb-4 ml-4 text-gray-300">
                  <li><kbd>←</kbd> / <kbd>→</kbd>: Move Player</li>
                  <li><kbd>Spacebar</kbd>: Fire Bullets</li>
                  <li><kbd>Q</kbd>: Fire Missile (if available)</li>
                  <li><kbd>P</kbd>: Pause/Resume Game</li>
                </ul>

                <h3 className="text-2xl font-semibold mb-2 text-cyan-400">Game Features:</h3>
                <ul className="list-disc list-inside mb-4 ml-4 text-gray-300">
                  <li><b>Shields:</b> Three shields protect you, but they can be destroyed.</li>
                  <li><b>Boosts:</b> Invaders sometimes drop boosts. Collect them for temporary advantages:
                    <ul className="list-disc list-inside ml-6"> {/* Changed list-circle to list-disc */}
                      <li>⚡ Speed Boost: Increases player movement speed.</li>
                      <li>💥 Double Shot: Fires multiple bullets at once.</li>
                      <li>💰 x2 Score Multiplier: Doubles your score for a short period.</li>
                      <li>✨ Piercing Shot: Bullets pass through multiple enemies.</li>
                      <li>❤️ Extra Life: Grants an additional life.</li>
                      <li>🛡️ Shield Repair: Repairs all damaged shields.</li>
                    </ul>
                  </li>
                  <li><b>Missiles:</b> Powerful projectiles that deal high damage.
                    <ul className="list-disc list-inside ml-6"> {/* Changed list-circle to list-disc */}
                      <li>Earn 5 missiles by defeating a Boss Invader.</li>
                      <li>Fire with the <kbd>Q</kbd> key.</li>
                    </ul>
                  </li>
                  <li><b>Boss Invaders:</b> Appear every few levels. They are tougher and have more health.</li>
                  <li><b>Kamikaze Invaders:</b> (New!) These fast, red triangular invaders fly directly towards you. Destroy them before they collide, as they deal damage on impact!</li>
                  <li><b>Player Invincibility:</b> After taking damage, you become temporarily invincible (flashing effect).</li>
                </ul>
              </div>
              <button
                onClick={hideInstructions}
                className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-full text-xl transition-colors duration-200 mt-6 mx-auto"
              >
                Back to Main Menu
              </button>
            </div>
          )}
          {gameState === 'about' && (
            <div className="text-center max-w-2xl mx-auto w-full h-full flex flex-col justify-center">
              <h2 className="text-4xl font-bold mb-4 text-purple-400">
                About the Developer
              </h2>
              <p className="text-lg mb-6 text-gray-300">
                I am Ahmed Hamdy, I work on developing light and distinctive games, and also on designing professional websites.
              </p>
              <button
                onClick={hideAbout}
                className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-full text-xl transition-colors duration-200 mt-6 mx-auto"
              >
                Back to Main Menu
              </button>
            </div>
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
              {/* Revive after watching Ad button */}
              <button
                onClick={openAdPopup}
                className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full text-xl transition-colors duration-200 mt-4"
              >
                Revive after watching Ad
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

      {/* Level Complete screen */}
      {gameState === 'levelComplete' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4 z-20">
          <h2 className="text-5xl font-bold mb-4 text-green-500">
            YOU WIN!
          </h2>
          <button
            onClick={() => {
              if (gameRef.current) {
                gameRef.current.goToNextLevel();
              }
            }}
            className="flex items-center px-6 py-3 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold rounded-full text-xl transition-colors duration-200"
          >
            Continue
          </button>
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
