import React, { useRef, useEffect } from 'react'
import { Player } from '../game/entities'
import { PLAYER_WIDTH, PLAYER_HEIGHT } from '../game/constants'

interface ShipPreviewCanvasProps {
  skin: string
  width?: number
  height?: number
}

const ShipPreviewCanvas: React.FC<ShipPreviewCanvasProps> = ({ skin, width = PLAYER_WIDTH * 2, height = PLAYER_HEIGHT * 2 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Create a dummy player for drawing
    const player = new Player(width / 2 - PLAYER_WIDTH / 2, height / 2 - PLAYER_HEIGHT / 2, skin)
    player.draw(ctx)
  }, [skin, width, height])

  return <canvas ref={canvasRef} width={width} height={height} className="rounded-md border border-gray-600 bg-gray-800" />
}

export default ShipPreviewCanvas
