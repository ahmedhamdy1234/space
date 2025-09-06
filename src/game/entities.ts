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
  BOSS_WIDTH, // Import for boss
  BOSS_HEIGHT, // Import for boss
  BOSS_HEALTH, // Import for boss
  BOSS_SPEED, // Import for boss
  BOSS_FIRE_RATE, // Import for boss
  BOSS_BULLET_SPEED, // Import for boss
  MISSILE_WIDTH, // Import for missile
  MISSILE_HEIGHT, // Import for missile
  MISSILE_SPEED, // Import for missile
  MISSILE_DAMAGE, // Import for missile
  MISSILE_FIRE_RATE_LIMIT, // Import for missile fire rate
  MISSILE_INITIAL_COUNT, // Import for initial missile count
  KAMIKAZE_INVADER_WIDTH, // Import for Kamikaze Invader
  KAMIKAZE_INVADER_HEIGHT, // Import for Kamikaze Invader
  KAMIKAZE_INVADER_SPEED, // Import for Kamikaze Invader
  KAMIKAZE_INVADER_HEALTH, // Import for Kamikaze Invader
  KAMIKAZE_INVADER_DAMAGE, // Import for Kamikaze Invader
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
  maxBullets: number // Maximum number of bullets
  currentBullets: number // Current number of bullets
  level: number // Add level property
  hasPiercingShot: boolean // New property for piercing shot boost
  missileCount: number // New property for missile count
  lastMissileFireTime: number // New property for missile cooldown

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
    this.maxBullets = 3 // Initial number of bullets
    this.currentBullets = this.maxBullets // Set current bullets to max
    this.level = 1 // Initialize level
    this.hasPiercingShot = false // Initialize piercing shot to false
    this.missileCount = MISSILE_INITIAL_COUNT // Initialize missile count
    this.lastMissileFireTime = 0 // Initialize missile cooldown
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isInvincible && Math.floor(Date.now() / PLAYER_FLASH_INTERVAL) % 2 === 0) {
      // Flash effect: skip drawing every other interval when invincible
      return
    }

    ctx.save()
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2) // Translate to center for easier drawing

    // Main body (triangular shape)
    ctx.fillStyle = 'lime'
    ctx.beginPath()
    ctx.moveTo(0, -this.height / 2) // Top point
    ctx.lineTo(this.width / 2, this.height / 2) // Bottom right
    ctx.lineTo(-this.width / 2, this.height / 2) // Bottom left
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1
    ctx.stroke()

    // Cockpit
    ctx.fillStyle = 'cyan'
    ctx.beginPath()
    ctx.arc(0, -this.height / 4, this.width / 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'darkblue'
    ctx.stroke()

    // Engines (simple rectangles at the back)
    ctx.fillStyle = 'orange'
    ctx.fillRect(-this.width / 4, this.height / 2 - 5, this.width / 8, 10)
    ctx.fillRect(this.width / 8, this.height / 2 - 5, this.width / 8, 10)

    // Simple thrust animation
    const flameHeight = 5 + Math.random() * 5; // Flickering effect
    ctx.fillStyle = `rgba(255, ${165 + Math.random() * 90}, 0, ${0.7 + Math.random() * 0.3})`; // Orange to yellow, flickering opacity
    ctx.beginPath();
    ctx.moveTo(-this.width / 4, this.height / 2 + 5);
    ctx.lineTo(-this.width / 8, this.height / 2 + 5 + flameHeight);
    ctx.lineTo(this.width / 8, this.height / 2 + 5 + flameHeight);
    ctx.lineTo(this.width / 4, this.height / 2 + 5);
    ctx.closePath();
    ctx.fill();


    ctx.restore()
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
    if (this.isFiringHeld && (now - this.lastFireTime > PLAYER_FIRE_RATE_LIMIT)) {
      this.fireBullet()
      this.lastFireTime = now
    }

    this.bullets.forEach((bullet) => bullet.update())
    this.bullets = this.bullets.filter(
      (bullet) => bullet.y > 0 && !bullet.isOffscreen,
    )
  }

  fireBullet() {
    let bulletsToFire = 1;
    if (this.level >= 5) {
      bulletsToFire = 3;
    }
    if (this.hasDoubleShot) {
      bulletsToFire = 5;
    }

    for (let i = 0; i < bulletsToFire; i++) {
      let offsetX = 0;
      if (bulletsToFire === 3) {
        offsetX = (i - 1) * DOUBLE_SHOT_BULLET_OFFSET;
      } else if (bulletsToFire === 5) {
        offsetX = (i - 2) * (DOUBLE_SHOT_BULLET_OFFSET);
      }
      this.bullets.push(
        new Bullet(
          this.x + this.width / 2 - BULLET_WIDTH / 2 + offsetX,
          this.y,
          -PLAYER_BULLET_SPEED,
          'player',
          this.hasPiercingShot, // Pass piercing shot status
          1, // Default damage for regular bullets
        ),
      );
    }
  }

  fireMissile() {
    const now = Date.now()
    if (this.missileCount > 0 && (now - this.lastMissileFireTime > MISSILE_FIRE_RATE_LIMIT)) {
      this.bullets.push(
        new Missile(
          this.x + this.width / 2 - MISSILE_WIDTH / 2,
          this.y,
          -MISSILE_SPEED,
          'player',
          false, // Missiles are not piercing by default, can be changed
          MISSILE_DAMAGE,
        ),
      )
      this.missileCount--
      this.lastMissileFireTime = now
      console.log(`Missile fired! Remaining: ${this.missileCount}`)
    } else if (this.missileCount === 0) {
      console.log('No missiles left!')
    } else {
      console.log('Missile on cooldown.')
    }
  }

  // Method to increase the number of bullets
  increaseBullets(amount: number) {
    this.maxBullets = Math.min(5, this.maxBullets + amount); // Cap at 5
    this.currentBullets = this.maxBullets; // Refill bullets
  }

  // Method to reset bullets at the start of a level
  resetBullets() {
    this.currentBullets = this.maxBullets;
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

    let baseColor = 'red'
    if (this.health === 2) {
      baseColor = 'darkred'
    } else if (this.health >= 3) {
      baseColor = 'maroon'
    }

    ctx.fillStyle = baseColor
    ctx.strokeStyle = 'white' // Outline for better definition
    ctx.lineWidth = 1

    ctx.save()
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2) // Translate to center

    switch (this.shape) {
      case 'square':
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height)
        // Eyes
        ctx.fillStyle = 'yellow'
        ctx.beginPath()
        ctx.arc(-this.width / 4, -this.height / 4, this.width / 8, 0, Math.PI * 2)
        ctx.arc(this.width / 4, -this.height / 4, this.width / 8, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'circle':
        ctx.beginPath()
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        // Central eye
        ctx.fillStyle = 'yellow'
        ctx.beginPath()
        ctx.arc(0, 0, this.width / 4, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(0, -this.height / 2)
        ctx.lineTo(this.width / 2, this.height / 2)
        ctx.lineTo(-this.width / 2, this.height / 2)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        // Small lights
        ctx.fillStyle = 'cyan'
        ctx.beginPath()
        ctx.arc(-this.width / 4, this.height / 4, this.width / 10, 0, Math.PI * 2)
        ctx.arc(this.width / 4, this.height / 4, this.width / 10, 0, Math.PI * 2)
        ctx.fill()
        break
      default:
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height) // Default to square
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height)
        break
    }

    ctx.restore()

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
        false,
        1, // Default damage for invader bullets
      ),
    )
  }

  hit(damage: number = 1) {
    this.health -= damage
    if (this.health <= 0) {
      this.isAlive = false
    }
  }
}

export class BossInvader extends Invader {
  constructor(x: number, y: number) {
    super(x, y, BOSS_SPEED, BOSS_FIRE_RATE, BOSS_HEALTH, 'square') // Boss is always 'square' for now
    this.width = BOSS_WIDTH
    this.height = BOSS_HEIGHT
    this.maxHealth = BOSS_HEALTH // Ensure maxHealth is set for drawing health bar
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return

    // Boss specific drawing
    ctx.save()
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2)

    // Main body
    ctx.fillStyle = 'purple'
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
    ctx.strokeStyle = 'magenta'
    ctx.lineWidth = 2
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height)

    // Core/Eye
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(0, 0, this.width / 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'yellow'
    ctx.stroke()

    // Cannons
    ctx.fillStyle = 'gray'
    ctx.fillRect(-this.width / 2 + 5, this.height / 2 - 10, 10, 10)
    ctx.fillRect(this.width / 2 - 15, this.height / 2 - 10, 10, 10)

    ctx.restore()

    // Health bar for boss
    const healthBarWidth = this.width * (this.health / this.maxHealth)
    ctx.fillStyle = 'red'
    ctx.fillRect(this.x, this.y - 10, healthBarWidth, 5)
    ctx.strokeStyle = 'white'
    ctx.strokeRect(this.x, this.y - 10, this.width, 5)
  }

  shoot() {
    // Boss can shoot multiple bullets or a wider shot
    this.bullets.push(
      new Bullet(
        this.x + this.width / 2 - BULLET_WIDTH / 2,
        this.y + this.height,
        BOSS_BULLET_SPEED,
        'invader',
        false,
        1, // Default damage for boss bullets
      ),
    )
    // Example: double shot for boss
    this.bullets.push(
      new Bullet(
        this.x + this.width / 4 - BULLET_WIDTH / 2,
        this.y + this.height,
        BOSS_BULLET_SPEED,
        'invader',
        false,
        1,
      ),
    )
    this.bullets.push(
      new Bullet(
        this.x + this.width * 3 / 4 - BULLET_WIDTH / 2,
        this.y + this.height,
        BOSS_BULLET_SPEED,
        'invader',
        false,
        1,
      ),
    )
  }
}

export class KamikazeInvader extends Invader {
  damage: number

  constructor(x: number, y: number) {
    super(x, y, KAMIKAZE_INVADER_SPEED, 0, KAMIKAZE_INVADER_HEALTH, 'triangle') // Kamikaze doesn't shoot
    this.width = KAMIKAZE_INVADER_WIDTH
    this.height = KAMIKAZE_INVADER_HEIGHT
    this.damage = KAMIKAZE_INVADER_DAMAGE
    this.maxHealth = KAMIKAZE_INVADER_HEALTH
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return

    ctx.save()
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2)

    // Kamikaze specific drawing (e.g., a red triangle with a warning sign)
    ctx.fillStyle = 'darkred'
    ctx.beginPath()
    ctx.moveTo(0, -this.height / 2)
    ctx.lineTo(this.width / 2, this.height / 2)
    ctx.lineTo(-this.width / 2, this.height / 2)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'yellow'
    ctx.lineWidth = 2
    ctx.stroke()

    // Warning sign
    ctx.fillStyle = 'yellow'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('!', 0, 0)

    ctx.restore()
  }

  update() {
    if (!this.isAlive) return
    // Kamikaze invaders move straight down
    this.y += this.speed
    if (this.y > CANVAS_HEIGHT) {
      this.isAlive = false // Remove if offscreen
    }
    // Kamikaze invaders do not shoot, so no bullet update
  }

  // Kamikaze invaders don't move horizontally with the wave
  moveDown() {
    // Do nothing, they already move down
  }

  shoot() {
    // Kamikaze invaders do not shoot
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
  isPiercing: boolean // New property for piercing bullets
  damage: number // New property for bullet damage

  constructor(x: number, y: number, speed: number, type: 'player' | 'invader', isPiercing: boolean = false, damage: number = 1) {
    this.x = x
    this.y = y
    this.width = BULLET_WIDTH
    this.height = BULLET_HEIGHT
    this.speed = speed
    this.type = type
    this.isOffscreen = false
    this.isPiercing = isPiercing // Initialize piercing status
    this.damage = damage // Initialize damage
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.type === 'player' ? (this.isPiercing ? 'lime' : 'yellow') : 'orange' // Green for piercing
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  update() {
    this.y += this.speed
    if (this.y < 0 || this.y > CANVAS_HEIGHT) {
      this.isOffscreen = true
    }
  }
}

export class Missile extends Bullet {
  constructor(x: number, y: number, speed: number, type: 'player' | 'invader', isPiercing: boolean = false, damage: number = MISSILE_DAMAGE) {
    super(x, y, speed, type, isPiercing, damage)
    this.width = MISSILE_WIDTH
    this.height = MISSILE_HEIGHT
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'red' // Missiles are red
    ctx.fillRect(this.x, this.y, this.width, this.height)

    // Add a small flame effect at the bottom
    ctx.fillStyle = 'orange'
    ctx.fillRect(this.x + this.width / 4, this.y + this.height, this.width / 2, 5)
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

export type BoostType = 'speed' | 'extraLife' | 'shieldRepair' | 'doubleShot' | 'scoreMultiplier' | 'piercingShot' // Added 'piercingShot'

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
      case 'piercingShot':
        text = 'Pierce'
        textColor = 'lime'
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
