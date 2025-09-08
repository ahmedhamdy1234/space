import React, { useRef, useEffect } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants'

interface Star {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  color: string
}

interface Planet {
  x: number
  y: number
  size: number
  color: string
  speed: number
  opacity: number
}

interface StarfieldProps {
  level: number
}

const Starfield: React.FC<StarfieldProps> = ({ level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const planetsRef = useRef<Planet[]>([])
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // --- Initialize Stars based on level ---
    const numStars = 100 + level * 10 // More stars for higher levels
    starsRef.current = Array.from({ length: numStars }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      size: Math.random() * 1.5 + 0.5 + (level * 0.1), // 0.5 to 2, slightly larger for higher levels
      speed: Math.random() * 0.5 + 0.1 + (level * 0.05), // 0.1 to 0.6, faster for higher levels
      opacity: Math.random() * 0.5 + 0.5, // 0.5 to 1
      color: 'white', // Default star color
    }))

    // --- Initialize Planets based on level ---
    const numPlanets = Math.min(Math.floor(level / 3), 3) // Max 3 planets, one every 3 levels
    planetsRef.current = Array.from({ length: numPlanets }, (_, i) => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT * 0.5, // Planets appear in the upper half
      size: Math.random() * 50 + 30, // 30 to 80
      color: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random vibrant color
      speed: Math.random() * 0.1 + 0.05, // Very slow movement
      opacity: Math.random() * 0.3 + 0.2, // Subtle opacity
    }))

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw Planets
      planetsRef.current.forEach((planet) => {
        planet.y += planet.speed * 0.5 // Planets move slower than stars

        // Reset planet if it goes off-screen
        if (planet.y > CANVAS_HEIGHT + planet.size) {
          planet.y = -planet.size
          planet.x = Math.random() * CANVAS_WIDTH
          planet.color = `hsl(${Math.random() * 360}, 70%, 50%)`
        }

        ctx.globalAlpha = planet.opacity
        ctx.fillStyle = planet.color
        ctx.beginPath()
        ctx.arc(planet.x, planet.y, planet.size / 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw Stars
      starsRef.current.forEach((star) => {
        star.y += star.speed

        // Reset star if it goes off-screen
        if (star.y > CANVAS_HEIGHT) {
          star.y = 0
          star.x = Math.random() * CANVAS_WIDTH
        }

        ctx.globalAlpha = star.opacity
        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1 // Reset global alpha

      animationFrameId.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [level]) // Re-initialize stars and planets when level changes

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="absolute inset-0 z-0" // Position behind game canvas
    />
  )
}

export default Starfield
