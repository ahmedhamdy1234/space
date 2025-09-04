import {
  BULLET_WIDTH,
  BULLET_HEIGHT,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  INVADER_WIDTH,
  INVADER_HEIGHT,
  INVADER_MOVE_DOWN_AMOUNT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_BULLET_SPEED,
  INVADER_BULLET_SPEED,
  SHIELD_WIDTH,
  SHIELD_HEIGHT,
  SHIELD_HEALTH,
  BOOST_SIZE,
  BOOST_SPEED,
  PLAYER_FIRE_RATE_LIMIT,
  DOUBLE_SHOT_BULLET_OFFSET,
  INVADER_BASE_HEALTH, // Import INVADER_BASE_HEALTH
  PLAYER_FLASH_INTERVAL, // Import for player flashing
  EXPLOSION_INITIAL_SIZE, // Import for explosion
  EXPLOSION_MAX_SIZE, // Import for explosion
  EXPLOSION_MAX_FRAMES, // Import for explosion
  EXPLOSION_COLOR, // Import for explosion
} from './constants'

export class Player {
  x: number
  y: number
  width: number
  height: number
  speed: number
  baseSpeed: number // To store original speed for boosts
  isMovingLeft: boolean
  isMovingRight: boolean
  bullets: Bullet[]
  lastFireTime: number // Track the last time a bullet was fired
  hasDoubleShot: boolean // New property for double shot boost
  isFiringHeld: boolean // New property to track if fire button is held
  isInvincible: boolean // New property for invincibility

  constructor() {
    this.width = PLAYER_WIDTH
    this.height = PLAYER_HEIGHT
    this.x = CANVAS_WIDTH / 2 - this.width / 2
    this.y = CANVAS_HEIGHT - this.height - 20
    this.baseSpeed = PLAYER_SPEED
    this.speed = this.baseSpeed
    this.isMovingLeft = false
    this.isMovingRight = false
    this.bullets = []
    this.lastFireTime = 0
    this.hasDoubleShot = false // Initialize double shot to false
    this.isFiringHeld = false // Initialize isFiringHeld to false
    this.isInvincible = false // Initialize invincibility
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isInvincible && Math.floor(Date.now() / PLAYER_FLASH_INTERVAL) % 2 === 0) {
      // Flash effect: skip drawing every other interval when invincible
      return
    }
    ctx.fillStyle = 'lime'
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  update() {
    if (this.isMovingLeft && this.x > 0) {
      this.x -= this.speed
    }
    if (this.isMovingRight && this.x < CANVAS_WIDTH - this.width) {
      this.x += this.speed
    }

    // Continuous firing logic
    const now = Date.now()
    if ((this.isMovingLeft || this.isMovingRight || this.isFiringHeld) && (now - this.lastFireTime > PLAYER_FIRE_RATE_LIMIT)) {
      this.fireBullet()
      this.lastFireTime = now
    }

    this.bullets.forEach((bullet) => bullet.update())
    this.bullets = this.bullets.filter(
      (bullet) => bullet.y > 0 && !bullet.isOffscreen,
    )
  }

  fireBullet() {
    // Single shot
    this.bullets.push(
      new Bullet(
        this.x + this.width / 2 - BULLET_WIDTH / 2,
        this.y,
        -PLAYER_BULLET_SPEED,
        'player',
      ),
    )

    // Double shot if boost is active
    if (this.hasDoubleShot) {
      this.bullets.push(
        new Bullet(
          this.x + this.width / 2 - BULLET_WIDTH / 2 - DOUBLE_SHOT_BULLET_OFFSET, // Left bullet
          this.y,
          -PLAYER_BULLET_SPEED,
          'player',
        ),
      )
      this.bullets.push(
        new Bullet(
          this.x + this.width / 2 - BULLET_WIDTH / 2 + DOUBLE_SHOT_BULLET_OFFSET, // Right bullet
          this.y,
          -PLAYER_BULLET_SPEED,
          'player',
        ),
      )
    }
  }
}

export class Invader {
  x: number
  y: number
  width: number
  height: number
  speed: number
  fireRate: number
  direction: number // 1 for right, -1 for left
  bullets: Bullet[]
  isAlive: boolean
  health: number // New property for invader health
  maxHealth: number // To store original health for drawing
  shape: 'square' | 'circle' | 'triangle' // New property for invader shape

  constructor(x: number, y: number, speed: number, fireRate: number, health: number = INVADER_BASE_HEALTH, shape: 'square' | 'circle' | 'triangle' = 'square') {
    this.x = x
    this.y = y
    this.width = INVADER_WIDTH
    this.height = INVADER_HEIGHT
    this.speed = speed
    this.fireRate = fireRate
    this.direction = 1
    this.bullets = []
    this.isAlive = true
    this.maxHealth = health
    this.health = health
    this.shape = shape // Initialize shape
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return

    // Determine color based on health
    let color = 'red'
    if (this.health === 2) {
      color = 'darkred'
    } else if (this.health >= 3) {
      color = 'maroon'
    }

    ctx.fillStyle = color

    // Draw different shapes based on this.shape
    switch (this.shape) {
      case 'square':
        ctx.fillRect(this.x, this.y, this.width, this.height)
        break
      case 'circle':
        ctx.beginPath()
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(this.x + this.width / 2, this.y)
        ctx.lineTo(this.x + this.width, this.y + this.height)
        ctx.lineTo(this.x, this.y + this.height)
        ctx.closePath()
        ctx.fill()
        break
      default:
        ctx.fillRect(this.x, this.y, this.width, this.height) // Default to square
        break
    }

    // Optionally draw health bar or indicator for multi-hit invaders
    if (this.maxHealth > 1) {
      const healthBarWidth = this.width * (this.health / this.maxHealth)
      ctx.fillStyle = 'green'
      ctx.fillRect(this.x, this.y - 5, healthBarWidth, 3)
      ctx.strokeStyle = 'white'
      ctx.strokeRect(this.x, this.y - 5, this.width, 3)
    }
  }

  update() {
    if (!this.isAlive) return

    this.x += this.speed * this.direction

    this.bullets.forEach((bullet) => bullet.update())
    this.bullets = this.bullets.filter(
      (bullet) => bullet.y < CANVAS_HEIGHT && !bullet.isOffscreen,
    )
  }

  moveDown() {
    this.y += INVADER_MOVE_DOWN_AMOUNT
  }

  shoot() {
    this.bullets.push(
      new Bullet(
        this.x + this.width / 2 - BULLET_WIDTH / 2,
        this.y + this.height,
        INVADER_BULLET_SPEED,
        'invader',
      ),
    )
  }

  hit() {
    this.health--
    if (this.health <= 0) {
      this.isAlive = false
    }
  }
}

export class Bullet {
  x: number
  y: number
  width: number
  height: number
  speed: number
  type: 'player' | 'invader'
  isOffscreen: boolean

  constructor(x: number, y: number, speed: number, type: 'player' | 'invader') {
    this.x = x
    this.y = y
    this.width = BULLET_WIDTH
    this.height = BULLET_HEIGHT
    this.speed = speed
    this.type = type
    this.isOffscreen = false
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.type === 'player' ? 'yellow' : 'orange'
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  update() {
    this.y += this.speed
    if (this.y < 0 || this.y > CANVAS_HEIGHT) {
      this.isOffscreen = true
    }
  }
}

export class Shield {
  x: number
  y: number
  width: number
  height: number
  health: number
  maxHealth: number
  isDestroyed: boolean

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.width = SHIELD_WIDTH
    this.height = SHIELD_HEIGHT
    this.maxHealth = SHIELD_HEALTH
    this.health = this.maxHealth
    this.isDestroyed = false
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isDestroyed) return

    // Determine color based on health
    let color = ''
    if (this.health === 3) {
      color = '#00FF00' // Green
    } else if (this.health === 2) {
      color = '#FFFF00' // Yellow
    } else if (this.health === 1) {
      color = '#FFA500' // Orange
    } else {
      color = '#FF0000' // Red (shouldn't happen if destroyed is true)
    }

    ctx.fillStyle = color
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  hit() {
    this.health--
    if (this.health <= 0) {
      this.isDestroyed = true
    }
  }

  repair(amount: number = 1) {
    this.health = Math.min(this.maxHealth, this.health + amount)
    this.isDestroyed = false // If repaired, it's no longer destroyed
  }
}

export type BoostType = 'speed' | 'extraLife' | 'shieldRepair' | 'doubleShot' | 'scoreMultiplier' // Added 'scoreMultiplier'

export class Boost {
  x: number
  y: number
  width: number
  height: number
  speed: number
  type: BoostType
  isCollected: boolean
  isOffscreen: boolean

  constructor(x: number, y: number, type: BoostType) {
    this.x = x
    this.y = y
    this.width = BOOST_SIZE
    this.height = BOOST_SIZE
    this.speed = BOOST_SPEED
    this.type = type
    this.isCollected = false
    this.isOffscreen = false
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isCollected || this.isOffscreen) return

    let textColor = 'white'
    let text = ''

    switch (this.type) {
      case 'speed':
        text = 'Speed'
        textColor = 'cyan'
        break
      case 'extraLife':
        text = 'Life'
        textColor = 'pink'
        break
      case 'shieldRepair':
        text = 'Shield'
        textColor = 'blue'
        break
      case 'doubleShot':
        text = 'Double'
        textColor = 'purple'
        break
      case 'scoreMultiplier':
        text = 'x2 Score'
        textColor = 'gold'
        break
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)' // Semi-transparent background for readability
    ctx.fillRect(this.x, this.y, this.width, this.height)

    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = textColor
    ctx.fillText(text, this.x + this.width / 2, this.y + this.height / 2)
  }

  update() {
    this.y += this.speed
    if (this.y > CANVAS_HEIGHT) {
      this.isOffscreen = true
    }
  }
}

export class Explosion {
  x: number
  y: number
  size: number
  frame: number
  maxFrames: number
  isActive: boolean
  color: string

  constructor(x: number, y: number, initialSize: number, maxSize: number, maxFrames: number, color: string) {
    this.x = x
    this.y = y
    this.size = initialSize
    this.frame = 0
    this.maxFrames = maxFrames
    this.isActive = true
    this.color = color
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isActive) return

    const currentSize = this.size + (this.frame / this.maxFrames) * (EXPLOSION_MAX_SIZE - EXPLOSION_INITIAL_SIZE)
    const opacity = 1 - (this.frame / this.maxFrames)

    ctx.save()
    ctx.globalAlpha = opacity
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, currentSize / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  update() {
    if (!this.isActive) return

    this.frame++
    if (this.frame >= this.maxFrames) {
      this.isActive = false
    }
  }
}
