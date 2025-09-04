import React, { useRef, useEffect } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants'

interface Star {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationFrameId = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize stars
    const numStars = 100
    starsRef.current = Array.from({ length: numStars }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      size: Math.random() * 1.5 + 0.5, // 0.5 to 2
      speed: Math.random() * 0.5 + 0.1, // 0.1 to 0.6
      opacity: Math.random() * 0.5 + 0.5, // 0.5 to 1
    }))

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = 'white'

      starsRef.current.forEach((star) => {
        star.y += star.speed

        // Reset star if it goes off-screen
        if (star.y > CANVAS_HEIGHT) {
          star.y = 0
          star.x = Math.random() * CANVAS_WIDTH
        }

        ctx.globalAlpha = star.opacity
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
  }, [])

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
