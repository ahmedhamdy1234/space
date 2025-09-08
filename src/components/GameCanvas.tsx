import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Game, GameState } from '../game/game'
import { CANVAS_HEIGHT, CANVAS_WIDTH, GAME_LIVES, DEFAULT_SHIP_SKIN, MAX_LEVELS } from '../game/constants' // Import MAX_LEVELS
import { Play, RefreshCw, Pause, Info, User, Rocket, LogOut, Palette, ListOrdered } from 'lucide-react' // Import ListOrdered icon
import Starfield from './Starfield' // Import Starfield component
import ShipPreviewCanvas from './ShipPreviewCanvas' // Import ShipPreviewCanvas

// Define available ship skins (moved from App.tsx)
const shipSkins = [
  { id: 'default', name: 'Default', color: 'lime' },
  { id: 'red_baron', name: 'Red Baron', color: 'red' },
  { id: 'blue_streak', name: 'Blue Streak', color: 'blue' },
  { id: 'gold_finger', name: 'Gold Finger', color: 'gold' },
  { id: 'dark_knight', name: 'Dark Knight', color: 'darkgray' },
  { id: 'space_ranger', name: 'Space Ranger', color: 'green' },
  { id: 'purple_haze', name: 'Purple Haze', color: 'purple' },
  { id: 'silver_surfer', name: 'Silver Surfer', color: 'silver' },
  { id: 'toxic_avenger', name: 'Toxic Avenger', color: 'darkgreen' },
  { id: 'phoenix', name: 'Phoenix', color: 'orange' },
  { id: 'ice_queen', name: 'Ice Queen', color: 'lightblue' },
  { id: 'lava_lord', name: 'Lava Lord', color: 'darkred' },
  { id: 'emerald_dream', name: 'Emerald Dream', color: 'emerald' },
  { id: 'ruby_star', name: 'Ruby Star', color: 'crimson' },
  { id: 'sapphire_sky', name: 'Sapphire Sky', color: 'darkblue' },
  { id: 'cosmic_comet', name: 'Cosmic Comet', color: 'darkviolet' },
  { id: 'galaxy_guardian', name: 'Galaxy Guardian', color: 'teal' },
  { id: 'solar_flare', name: 'Solar Flare', color: 'yellow' },
  { id: 'nebula_navigator', name: 'Nebula Navigator', color: 'indigo' },
  { id: 'quantum_quill', name: 'Quantum Quill', color: 'gray' },
  { id: 'void_vanguard', name: 'Void Vanguard', color: 'black' },
]

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void
  onLivesUpdate: (lives: number) => void
  onGameStateChange: (state: GameState) => void
  onLevelUpdate: (level: number) => void
  onMissileCountUpdate: (count: number) => void
  gameState: GameState
  score: number
  lives: number
  level: number
  missileCount: number
  // Remove selectedSkin from props as it will be managed internally
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  onScoreUpdate,
  onLivesUpdate,
  onGameStateChange,
  onLevelUpdate,
  onMissileCountUpdate,
  gameState,
  score,
  lives,
  level,
  missileCount,
  // Remove selectedSkin from destructuring
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const [playerDeathPosition, setPlayerDeathPosition] = useState<{ x: number; y: number } | null>(null)

  // Add selectedSkin state and its management (moved from App.tsx)
  const [selectedSkin, setSelectedSkin] = useState<string>(() => {
    return localStorage.getItem('selectedShipSkin') || DEFAULT_SHIP_SKIN
  })

  // State for selected level in the level selection screen
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  useEffect(() => {
    localStorage.setItem('selectedShipSkin', selectedSkin)
  }, [selectedSkin])

  const handleSkinChange = useCallback((skinId: string) => {
    setSelectedSkin(skinId)
  }, [])

  const startGame = useCallback((startLevel: number = 1) => { // Modified to accept startLevel
    if (gameRef.current) {
      gameRef.current.startGame(startLevel) // Pass startLevel to game instance
    }
  }, [])

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

  const showShipSkinSelection = useCallback(() => {
    onGameStateChange('shipSkinSelection')
  }, [onGameStateChange])

  const hideShipSkinSelection = useCallback(() => {
    onGameStateChange('start')
  }, [onGameStateChange])

  const showLevelSelection = useCallback(() => {
    onGameStateChange('levelSelection');
  }, [onGameStateChange]);

  const hideLevelSelection = useCallback(() => {
    onGameStateChange('start');
  }, [onGameStateChange]);

  // Modified to handle level selection via box click
  const handleLevelSelect = useCallback((levelNum: number) => {
    setSelectedLevel(levelNum);
  }, []);

  const startSelectedLevel = useCallback(() => {
    startGame(selectedLevel);
  }, [startGame, selectedLevel]);

  const exitGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.resetGame();
      onGameStateChange('start');
    }
  }, [onGameStateChange]);

  const revivePlayer = useCallback(() => {
    if (gameRef.current && playerDeathPosition) {
      gameRef.current.player.x = playerDeathPosition.x;
      gameRef.current.player.y = playerDeathPosition.y;
      gameRef.current.lives = GAME_LIVES;
      onLivesUpdate(GAME_LIVES);
      gameRef.current.gameState = 'playing';
      onGameStateChange('playing');
      setPlayerDeathPosition(null);
      gameRef.current.loop();
    }
  }, [gameRef, playerDeathPosition, onGameStateChange, onLivesUpdate]);

  const openAdPopup = useCallback(() => {
    const adLink = 'https://t.me/AhmedRe3oo0'
    const popupWidth = 600
    const popupHeight = 400
    const left = (window.innerWidth - popupWidth) / 2
    const top = (window.innerHeight - popupHeight) / 2

    if (gameRef.current && gameRef.current.gameState === 'playing') {
      gameRef.current.togglePause();
    }

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
      onLevelUpdate,
      onMissileCountUpdate: onMissileCountUpdate || (() => {}),
      onPlayerDeath: (x: number, y: number) => {
        setPlayerDeathPosition({ x, y })
        onGameStateChange('gameOver')
      },
    }

    gameRef.current = new Game(ctx, gameCallbacks, selectedSkin) // Use internal selectedSkin state

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy()
      }
    }
  }, [onScoreUpdate, onLivesUpdate, onGameStateChange, onLevelUpdate, onMissileCountUpdate, selectedSkin]) // Add selectedSkin to dependency array

  return (
    <div className="relative bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <Starfield level={level} /> {/* Pass the current level to Starfield */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="block border border-gray-700 relative z-10"
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
                onClick={() => startGame(1)} // Start from level 1 by default
                className="flex items-center px-6 py-3 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold rounded-full text-xl transition-colors duration-200 mb-4"
              >
                <Play className="mr-2" size={24} /> Start Game
              </button>
              <button
                onClick={showLevelSelection}
                className="flex items-center px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-full text-xl transition-colors duration-200 mb-4"
              >
                <ListOrdered className="mr-2" size={24} /> Select Level
              </button>
              <button
                onClick={showShipSkinSelection}
                className="flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full text-xl transition-colors duration-200 mb-4"
              >
                <Rocket className="mr-2" size={24} /> Ship Skin
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
            <div className="text-left max-w-2xl mx-auto w-full h-full flex flex-col">
              <h2 className="text-4xl font-bold mb-4 text-blue-400 text-center">
                Game Instructions
              </h2>
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
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
                    <ul className="list-disc list-inside ml-6">
                      <li>⚡ Speed Boost: Increases player movement speed.</li>
                      <li>💥 Double Shot: Fires multiple bullets at once.</li>
                      <li>💰 x2 Score Multiplier: Doubles your score for a short period.</li>
                      <li>✨ Piercing Shot: Bullets pass through multiple enemies.</li>
                      <li>❤️ Extra Life: Grants an additional life.</li>
                      <li>🛡️ Shield Repair: Repairs all damaged shields.</li>
                    </ul>
                  </li>
                  <li><b>Missiles:</b> Powerful projectiles that deal high damage.
                    <ul className="list-disc list-inside ml-6">
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
          {gameState === 'shipSkinSelection' && (
            <div className="text-center max-w-4xl mx-auto w-full h-full flex flex-col">
              <h2 className="text-4xl font-bold mb-6 text-orange-400">
                Select Your Ship Skin
              </h2>
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4 justify-items-center">
                  {shipSkins.map((skin) => (
                    <button
                      key={skin.id}
                      onClick={() => handleSkinChange(skin.id)}
                      className={`
                        flex flex-col items-center justify-center
                        w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36
                        rounded-lg shadow-lg transition-all duration-200 ease-in-out
                        text-white font-bold text-lg sm:text-xl
                        ${selectedSkin === skin.id
                          ? 'bg-orange-600 border-4 border-lime-400 scale-105'
                          : 'bg-gray-700 border-2 border-gray-600 hover:bg-gray-600 hover:scale-105'
                        }
                      `}
                    >
                      <span>{skin.name}</span>
                      <div className="mt-2">
                        <ShipPreviewCanvas skin={skin.id} width={60} height={60} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={hideShipSkinSelection}
                className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-full text-xl transition-colors duration-200 mt-6 mx-auto"
              >
                Back to Main Menu
              </button>
            </div>
          )}
          {gameState === 'levelSelection' && (
            <div className="text-center max-w-4xl mx-auto w-full h-full flex flex-col">
              <h2 className="text-4xl font-bold mb-6 text-teal-400">
                Select Your Starting Level
              </h2>
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 p-4 justify-items-center">
                  {Array.from({ length: MAX_LEVELS }, (_, i) => i + 1).map((levelNum) => (
                    <button
                      key={levelNum}
                      onClick={() => handleLevelSelect(levelNum)}
                      className={`
                        flex flex-col items-center justify-center
                        w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32
                        rounded-lg shadow-lg transition-all duration-200 ease-in-out
                        text-white font-bold text-xl sm:text-2xl
                        ${selectedLevel === levelNum
                          ? 'bg-teal-600 border-4 border-lime-400 scale-105'
                          : 'bg-gray-700 border-2 border-gray-600 hover:bg-gray-600 hover:scale-105'
                        }
                        ${levelNum >= 4 && levelNum <= 25
                          ? 'text-lime-300' // Style for 3x Shots levels
                          : 'text-white'
                        }
                      `}
                    >
                      <span>Level {levelNum}</span>
                      {levelNum >= 4 && levelNum <= 25 && (
                        <span className="text-sm sm:text-base text-lime-400 font-semibold mt-1">(3x Shots)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={startSelectedLevel}
                className="flex items-center px-6 py-3 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold rounded-full text-xl transition-colors duration-200 mt-6 mx-auto"
              >
                <Play className="mr-2" size={24} /> Start Level {selectedLevel}
              </button>
              <button
                onClick={hideLevelSelection}
                className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-full text-xl transition-colors duration-200 mt-4 mx-auto"
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
                onClick={exitGame} // Call exitGame to go back to the start screen
                className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-full text-xl transition-colors duration-200 mb-4"
              >
                <LogOut className="mr-2" size={24} /> Back To Home
              </button>
              <button
                onClick={() => startGame(1)} // Start from level 1 again
                className="flex items-center px-6 py-3 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold rounded-full text-xl transition-colors duration-200"
              >
                <RefreshCw className="mr-2" size={24} /> Play Again
              </button>
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
                onClick={() => startGame(1)} // Start from level 1 again
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
                className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full text-xl transition-colors duration-200 mb-4"
              >
                <Play className="mr-2" size={24} /> Resume Game
              </button>
              <button
                onClick={exitGame}
                className="flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full text-xl transition-colors duration-200"
              >
                <LogOut className="mr-2" size={24} /> Exit Game
              </button>
            </>
          )}
        </div>
      )}

      {gameState === 'levelComplete' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4 z-20">
          <h2 className="text-5xl font-bold mb-4 text-green-500">
            LEVEL {level} COMPLETE!
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
