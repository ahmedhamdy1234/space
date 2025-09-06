import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GAME_LIVES,
  INVADER_COLS,
  INVADER_FIRE_RATE,
  INVADER_MOVE_DOWN_AMOUNT,
  INVADER_ROWS,
  INVADER_SPACING_X,
  INVADER_SPACING_Y,
  INVADER_START_X,
  INVADER_START_Y,
  SCORE_PER_INVADER,
  NUMBER_OF_SHIELDS,
  SHIELD_WIDTH,
  SHIELD_Y_OFFSET,
  SHIELD_HEIGHT,
  BOOST_DROP_RATE,
  BOOST_DURATION,
  MAX_LEVELS,
  LEVEL_INVADER_SPEED_MULTIPLIER,
  LEVEL_INVADER_FIRE_RATE_MULTIPLIER,
  INVADER_SPEED,
  BOOST_SIZE,
  INVADER_WIDTH,
  INVADER_BASE_HEALTH,
  LEVEL_INVADER_HEALTH_INCREASE_INTERVAL,
  SCORE_MULTIPLIER_VALUE,
  KEY_PAUSE,
  EXPLOSION_INITIAL_SIZE,
  EXPLOSION_MAX_SIZE,
  EXPLOSION_MAX_FRAMES,
  EXPLOSION_COLOR,
  PLAYER_INVINCIBILITY_DURATION,
  BOSS_LEVEL_INTERVAL,
  BOSS_WIDTH,
  BOSS_HEIGHT,
  BOSS_HEALTH,
  BOSS_SPEED,
  BOSS_FIRE_RATE,
  BOSS_SCORE_VALUE,
  PIERCING_SHOT_DURATION,
  MISSILE_BOSS_REWARD,
  KAMIKAZE_INVADER_WIDTH,
  KAMIKAZE_INVADER_HEIGHT,
  KAMIKAZE_INVADER_SPEED,
  KAMIKAZE_INVADER_HEALTH,
  KAMIKAZE_INVADER_DAMAGE,
  KAMIKAZE_SPAWN_CHANCE,
} from './constants'

import {
  Boost,
  BoostType,
  Bullet,
  Invader,
  Player,
  Shield,
  Explosion,
  BossInvader,
  KamikazeInvader,
} from './entities'

export type GameState = 'start' | 'playing' | 'gameOver' | 'won' | 'paused' | 'instructions' | 'levelComplete'

interface GameCallbacks {
  onScoreUpdate: (score: number) => void
  onLivesUpdate: (lives: number) => void
  onGameStateChange: (state: GameState) => void
  onLevelUpdate: (level: number) => void
  onPlayerDeath?: (x: number, y: number) => void
}

export class Game {
  private ctx: CanvasRenderingContext2D
  public player: Player
  private invaders: Invader[]
  private shields: Shield[]
  private boosts: Boost[]
  private explosions: Explosion[]
  private score: number
  private lives: number
  public gameState: GameState
  private animationFrameId: number | null
  private callbacks: GameCallbacks
  private invaderDirection: number
  private currentLevel: number
  private playerSpeedBoostTimer: number | null
  private playerSpeedBoostEndTime: number | null
  private playerDoubleShotBoostTimer: number | null
  private playerScoreMultiplierTimer: number | null
  private playerScoreMultiplierEndTime: number | null
  private currentScoreMultiplier: number
  private playerInvincibilityActive: boolean
  private playerInvincibilityTimeoutId: number | null
  private playerPiercingShotBoostTimer: number | null
  private playerPiercingShotBoostEndTime: number | null
  private activeBoosts: { type: BoostType; endTime: number }[]
  private levelBoosts: { [level: number]: BoostType }
  private hasWon: boolean

  constructor(ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.ctx = ctx
    this.callbacks = callbacks
    this.player = new Player()
    this.invaders = []
    this.shields = []
    this.boosts = []
    this.explosions = []
    this.score = 0
    this.lives = GAME_LIVES
    this.gameState = 'start'
    this.animationFrameId = null
    this.invaderDirection = 1
    this.currentLevel = 1
    this.playerSpeedBoostTimer = null
    this.playerSpeedBoostEndTime = null
    this.playerDoubleShotBoostTimer = null
    this.playerScoreMultiplierTimer = null
    this.playerScoreMultiplierEndTime = null
    this.currentScoreMultiplier = 1
    this.playerInvincibilityActive = false
    this.playerInvincibilityTimeoutId = null
    this.playerPiercingShotBoostTimer = null
    this.playerPiercingShotBoostEndTime = null
    this.activeBoosts = []
    this.levelBoosts = {
      2: 'speed',
      3: 'doubleShot',
    }
    this.hasWon = false

    this.setupEventListeners()
    this.callbacks.onScoreUpdate(this.score)
    this.callbacks.onLivesUpdate(this.lives)
    this.callbacks.onGameStateChange(this.gameState)
    this.callbacks.onLevelUpdate(this.currentLevel)
  }

  private setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
    document.addEventListener('mousedown', this.handleMouseDown)
  }

  private removeEventListeners() {
    document.removeEventListeners?.('keydown', this.handleKeyDown)
    document.removeEventListeners?.('keyup', this.handleKeyUp)
    document.removeEventListeners?.('mousedown', this.handleMouseDown)
    // The above uses optional chaining in case removeEventListeners isn't polyfilled;
    // fallback to standard removal:
    try {
      document.removeEventListener('keydown', this.handleKeyDown)
      document.removeEventListener('keyup', this.handleKeyUp)
      document.removeEventListener('mousedown', this.handleMouseDown)
    } catch (e) {
      // ignore
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === KEY_PAUSE) {
      this.togglePause()
      return
    }

    if (this.gameState !== 'playing') return

    if (e.key === 'ArrowLeft') {
      this.player.isMovingLeft = true
    } else if (e.key === 'ArrowRight') {
      this.player.isMovingRight = true
    } else if (e.key === ' ') {
      e.preventDefault()
      this.player.isFiringHeld = true
    } else if (e.key.toLowerCase() === 'q') {
      this.player.fireMissile()
    }
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    if (this.gameState !== 'playing') return

    if (e.key === 'ArrowLeft') {
      this.player.isMovingLeft = false
    } else if (e.key === 'ArrowRight') {
      this.player.isMovingRight = false
    } else if (e.key === ' ') {
      this.player.isFiringHeld = false
    }
  }

  private handleMouseDown = () => {
    if (this.gameState === 'levelComplete') {
      this.goToNextLevel()
    }
  }

  public startGame() {
    this.resetGame()
    this.gameState = 'playing'
    this.callbacks.onGameStateChange(this.gameState)
    this.loop()
  }

  public togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused'
      this.callbacks.onGameStateChange(this.gameState)
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing'
      this.callbacks.onGameStateChange(this.gameState)
      this.loop()
    }
  }

  public resetGame() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.player = new Player()
    this.invaders = []
    this.shields = []
    this.boosts = []
    this.explosions = []
    this.score = 0
    this.lives = GAME_LIVES
    this.gameState = 'start'
    this.animationFrameId = null
    this.invaderDirection = 1
    this.currentLevel = 1
    this.playerSpeedBoostTimer = null
    this.playerSpeedBoostEndTime = null
    this.playerDoubleShotBoostTimer = null
    this.playerScoreMultiplierTimer = null
    this.playerScoreMultiplierEndTime = null
    this.currentScoreMultiplier = 1
    this.player.speed = this.player.baseSpeed
    this.player.hasDoubleShot = false
    this.player.isFiringHeld = false
    this.player.isInvincible = false
    this.playerInvincibilityActive = false
    if (this.playerInvincibilityTimeoutId) {
      clearTimeout(this.playerInvincibilityTimeoutId)
      this.playerInvincibilityTimeoutId = null
    }
    this.player.hasPiercingShot = false
    if (this.playerPiercingShotBoostTimer) {
      clearTimeout(this.playerPiercingShotBoostTimer)
      this.playerPiercingShotBoostTimer = null
      this.playerPiercingShotBoostEndTime = null
    }
    this.player.missileCount = 0
    this.player.lastMissileFireTime = 0
    this.activeBoosts = []
    this.hasWon = false
    this.spawnInvaders()
    this.spawnShields()
    this.score = 0
    this.lives = GAME_LIVES
    this.invaderDirection = 1
    this.callbacks.onScoreUpdate(this.score)
    this.callbacks.onLivesUpdate(this.lives)
    this.callbacks.onGameStateChange(this.gameState)
    this.callbacks.onLevelUpdate(this.currentLevel)
  }

  private spawnInvaders() {
    this.invaders = []

    if (this.currentLevel % BOSS_LEVEL_INTERVAL === 0) {
      this.invaders.push(new BossInvader(CANVAS_WIDTH / 2 - BOSS_WIDTH / 2, INVADER_START_Y))
    } else {
      // Reduce the level multipliers for speed and fire rate
      const levelInvaderSpeed = INVADER_SPEED * (1 + (this.currentLevel - 1) * (LEVEL_INVADER_SPEED_MULTIPLIER * 0.5));
      const levelInvaderFireRate = INVADER_FIRE_RATE + (this.currentLevel - 1) * (LEVEL_INVADER_FIRE_RATE_MULTIPLIER * 0.5);
      let invaderHealth = INVADER_BASE_HEALTH + Math.floor((this.currentLevel - 1) / LEVEL_INVADER_HEALTH_INCREASE_INTERVAL)

      let currentInvaderRows = INVADER_ROWS
      let currentInvaderCols = INVADER_COLS
      let currentInvaderStartY = INVADER_START_Y

      if (this.currentLevel % 3 === 0) {
        currentInvaderCols = Math.min(INVADER_COLS + 2, 12)
      } else if (this.currentLevel % 2 === 0) {
        currentInvaderRows = Math.min(INVADER_ROWS + 1, 7)
      } else {
        currentInvaderStartY = INVADER_START_Y + (this.currentLevel - 1) * 5
      }

      const actualInvaderSpacingX = CANVAS_WIDTH / currentInvaderCols - INVADER_WIDTH / 2
      const actualInvaderSpacingY = INVADER_SPACING_Y

      const invaderShapes: ('square' | 'circle' | 'triangle')[] = ['square', 'circle', 'triangle']

      for (let row = 0; row < currentInvaderRows; row++) {
        for (let col = 0; col < currentInvaderCols; col++) {
          const shape = invaderShapes[row % invaderShapes.length]
          this.invaders.push(
            new Invader(
              INVADER_START_X + col * actualInvaderSpacingX,
              currentInvaderStartY + row * actualInvaderSpacingY,
              levelInvaderSpeed,
              levelInvaderFireRate,
              invaderHealth,
              shape,
            ),
          )
        }
      }

      if (Math.random() < KAMIKAZE_SPAWN_CHANCE) {
        const kamikazeX = Math.random() * (CANVAS_WIDTH - KAMIKAZE_INVADER_WIDTH)
        this.invaders.push(new KamikazeInvader(kamikazeX, INVADER_START_Y - KAMIKAZE_INVADER_HEIGHT))
        console.log('Kamikaze Invader spawned!')
      }
    }
  }

  private spawnShields() {
    if (this.shields.length === 0 || this.shields.every((s) => s.isDestroyed)) {
      const shieldSpacing = (CANVAS_WIDTH - NUMBER_OF_SHIELDS * SHIELD_WIDTH) / (NUMBER_OF_SHIELDS + 1)
      for (let i = 0; i < NUMBER_OF_SHIELDS; i++) {
        this.shields.push(new Shield(shieldSpacing * (i + 1) + i * SHIELD_WIDTH, CANVAS_HEIGHT - SHIELD_Y_OFFSET - SHIELD_HEIGHT))
      }
    } else {
      this.shields.forEach((shield) => shield.repair(shield.maxHealth))
    }
  }

  private resetPlayerBoosts() {
    // Reset player's boosts to default values
    this.player.speed = this.player.baseSpeed
    this.player.hasDoubleShot = false
    this.player.hasPiercingShot = false
    this.player.isInvincible = false

    // Clear any active boost timers
    if (this.playerSpeedBoostTimer) {
      clearTimeout(this.playerSpeedBoostTimer)
      this.playerSpeedBoostTimer = null
      this.playerSpeedBoostEndTime = null
    }
    if (this.playerDoubleShotBoostTimer) {
      clearTimeout(this.playerDoubleShotBoostTimer)
      this.playerDoubleShotBoostTimer = null
    }
    if (this.playerScoreMultiplierTimer) {
      clearTimeout(this.playerScoreMultiplierTimer)
      this.playerScoreMultiplierTimer = null
      this.playerScoreMultiplierEndTime = null
      this.currentScoreMultiplier = 1
    }
    if (this.playerInvincibilityTimeoutId) {
      clearTimeout(this.playerInvincibilityTimeoutId)
      this.playerInvincibilityTimeoutId = null
      this.playerInvincibilityActive = false
      this.player.isInvincible = false
    }
    if (this.playerPiercingShotBoostTimer) {
      clearTimeout(this.playerPiercingShotBoostTimer)
      this.playerPiercingShotBoostTimer = null
      this.playerPiercingShotBoostEndTime = null
      this.player.hasPiercingShot = false
    }
    this.activeBoosts = []
  }

  goToNextLevel() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    this.currentLevel++
    this.callbacks.onLevelUpdate(this.currentLevel)

    // Clear entities, dropped boosts, and reset player boosts
    this.clearEntities()
    this.clearDroppedBoosts()
    this.resetPlayerBoosts()

    if (this.currentLevel <= MAX_LEVELS) {
      this.gameState = 'playing'
      this.callbacks.onGameStateChange(this.gameState)
      this.spawnInvaders()
      this.spawnShields()
      this.invaderDirection = 1
      this.loop()
    } else {
      this.endGame('won')
    }
  }

  clearEntities() {
    this.invaders = []
    this.player.bullets = []
    this.boosts = []
    this.explosions = []
  }

  // دالة لمسح أي boosts نازلة من أعداء قدام
  clearDroppedBoosts() {
    if (this.boosts && this.boosts.length > 0) {
      this.boosts.length = 0  // ← كده يتم مسح الـ boosts كلها
    }
  }

  private nextLevel() {
    this.gameState = 'levelComplete'
    this.callbacks.onGameStateChange(this.gameState)
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  private update() {
    if (this.gameState !== 'playing') return

    this.player.update()

    const now = Date.now()
    this.activeBoosts = this.activeBoosts.filter((boost) => boost.endTime > now)

    if (this.playerSpeedBoostTimer && this.playerSpeedBoostEndTime) {
      if (now >= this.playerSpeedBoostEndTime) {
        this.player.speed = this.player.baseSpeed
        this.playerSpeedBoostTimer = null
        this.playerSpeedBoostEndTime = null
        console.log('Player speed boost ended.')
      }
    }

    if (this.playerDoubleShotBoostTimer) {
      // setTimeout handles expiry for double shot
    }

    if (this.playerScoreMultiplierTimer && this.playerScoreMultiplierEndTime) {
      if (now >= this.playerScoreMultiplierEndTime) {
        this.currentScoreMultiplier = 1
        this.playerScoreMultiplierTimer = null
        this.playerScoreMultiplierEndTime = null
        console.log('Player score multiplier boost ended.')
      }
    }

    if (this.playerPiercingShotBoostTimer && this.playerPiercingShotBoostEndTime) {
      if (now >= this.playerPiercingShotBoostEndTime) {
        this.player.hasPiercingShot = false
        this.playerPiercingShotBoostTimer = null
        this.playerPiercingShotBoostEndTime = null
        console.log('Player piercing shot boost ended.')
      }
    }

    let hitEdge = false
    for (const invader of this.invaders) {
      if (!invader.isAlive) continue

      if (invader instanceof KamikazeInvader) {
        invader.update()
        continue
      }

      invader.direction = this.invaderDirection
      invader.update()

      if ((invader.x + invader.width >= CANVAS_WIDTH && this.invaderDirection === 1) || (invader.x <= 0 && this.invaderDirection === -1)) {
        hitEdge = true
      }

      if (Math.random() < invader.fireRate) {
        invader.shoot()
      }
    }

    if (hitEdge) {
      this.invaderDirection *= -1
      for (const invader of this.invaders) {
        if (invader.isAlive && !(invader instanceof KamikazeInvader)) {
          invader.moveDown()
        }
      }
    }

    this.boosts.forEach((boost) => boost.update())
    this.boosts = this.boosts.filter((boost) => !boost.isOffscreen && !boost.isCollected)

    this.explosions.forEach((explosion) => explosion.update())
    this.explosions = this.explosions.filter((explosion) => explosion.isActive)

    this.checkCollisions()

    this.invaders = this.invaders.filter((invader) => invader.isAlive)
    this.player.bullets = this.player.bullets.filter((bullet) => !bullet.isOffscreen)
    this.shields = this.shields.filter((shield) => !shield.isDestroyed)

    if (this.invaders.filter((inv) => !(inv instanceof KamikazeInvader)).length === 0) {
      if (this.currentLevel < MAX_LEVELS) {
        this.nextLevel()
      } else {
        this.endGame('won')
      }
    }
  }

  private checkCollision(obj1: { x: number; y: number; width: number; height: number }, obj2: { x: number; y: number; width: number; height: number }) {
    return obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x && obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y
  }

  private checkCollisions() {
    this.player.bullets.forEach((pBullet) => {
      this.invaders.forEach((invader) => {
        if (invader.isAlive && this.checkCollision(pBullet, invader)) {
          invader.hit(pBullet.damage)
          if (!pBullet.isPiercing) {
            pBullet.isOffscreen = true
          }

          if (!invader.isAlive) {
            this.score += (invader instanceof BossInvader ? BOSS_SCORE_VALUE : SCORE_PER_INVADER) * this.currentScoreMultiplier
            this.callbacks.onScoreUpdate(this.score)

            if (invader instanceof BossInvader) {
              this.player.missileCount += MISSILE_BOSS_REWARD
              console.log(`Boss destroyed! Player gained ${MISSILE_BOSS_REWARD} missiles. Total: ${this.player.missileCount}`)
            }

            this.explosions.push(
              new Explosion(invader.x + invader.width / 2, invader.y + invader.height / 2, EXPLOSION_INITIAL_SIZE, EXPLOSION_MAX_SIZE, EXPLOSION_MAX_FRAMES, EXPLOSION_COLOR),
            )

            if (Math.random() < BOOST_DROP_RATE) {
              const boostTypes: BoostType[] = ['speed', 'extraLife', 'shieldRepair', 'doubleShot', 'scoreMultiplier', 'piercingShot']
              const randomBoostType = boostTypes[Math.floor(Math.random() * boostTypes.length)]
              this.boosts.push(new Boost(invader.x + invader.width / 2 - BOOST_SIZE / 2, invader.y + invader.height, randomBoostType))
              console.log(`Invader dropped a ${randomBoostType}!`)
            }
          }
        }
      })
    })

    this.invaders.forEach((invader) => {
      if (invader instanceof KamikazeInvader && invader.isAlive && this.checkCollision(invader, this.player)) {
        invader.isAlive = false
        this.explosions.push(
          new Explosion(invader.x + invader.width / 2, invader.y + invader.height / 2, EXPLOSION_INITIAL_SIZE, EXPLOSION_MAX_SIZE, EXPLOSION_MAX_FRAMES, EXPLOSION_COLOR),
        )
        if (!this.playerInvincibilityActive) {
          this.lives -= invader.damage
          this.callbacks.onLivesUpdate(this.lives)
          if (this.lives <= 0) {
            this.endGame('gameOver')
            this.callbacks.onPlayerDeath?.(this.player.x, this.player.y)
          } else {
            this.activatePlayerInvincibility()
          }
        }
      }

      invader.bullets.forEach((iBullet) => {
        if (this.checkCollision(iBullet, this.player)) {
          iBullet.isOffscreen = true
          if (!this.playerInvincibilityActive) {
            this.lives--
            this.callbacks.onLivesUpdate(this.lives)
            if (this.lives <= 0) {
              this.endGame('gameOver')
              this.callbacks.onPlayerDeath?.(this.player.x, this.player.y)
            } else {
              this.activatePlayerInvincibility()
            }
          }
        }

        this.shields.forEach((shield) => {
          if (!shield.isDestroyed && this.checkCollision(iBullet, shield)) {
            shield.hit()
            iBullet.isOffscreen = true
          }
        })
      })
    })

    this.boosts.forEach((boost) => {
      if (!boost.isCollected && this.checkCollision(this.player, boost)) {
        boost.isCollected = true
        this.applyBoostEffect(boost.type)
      }
    })
  }

  private activatePlayerInvincibility() {
    this.playerInvincibilityActive = true
    this.player.isInvincible = true
    this.playerInvincibilityTimeoutId = setTimeout(() => {
      this.playerInvincibilityActive = false
      this.player.isInvincible = false
      this.playerInvincibilityTimeoutId = null
      console.log('Player invincibility ended.')
    }, PLAYER_INVINCIBILITY_DURATION)
    console.log('Player hit! Invincibility activated.')
  }

  private applyBoostEffect(type: BoostType) {
    console.log(`Applying boost: ${type}`)
    const now = Date.now()
    let endTime = now + BOOST_DURATION

    this.activeBoosts = this.activeBoosts.filter((b) => b.type !== type)

    switch (type) {
      case 'speed':
        if (this.playerSpeedBoostTimer) {
          clearTimeout(this.playerSpeedBoostTimer)
        }
        this.player.speed = this.player.baseSpeed * 3
        this.playerSpeedBoostTimer = setTimeout(() => {
          this.player.speed = this.player.baseSpeed
          this.playerSpeedBoostTimer = null
          this.playerSpeedBoostEndTime = null
          console.log('Player speed boost ended.')
        }, BOOST_DURATION) as unknown as number
        this.playerSpeedBoostEndTime = endTime
        this.activeBoosts.push({ type, endTime })
        console.log('Player speed boosted!')
        break
      case 'extraLife':
        this.lives++
        this.callbacks.onLivesUpdate(this.lives)
        console.log('Extra life gained!')
        break
      case 'shieldRepair':
        this.spawnShields()
        console.log('Shields rebuilt!')
        break
      case 'doubleShot':
        if (this.playerDoubleShotBoostTimer) {
          clearTimeout(this.playerDoubleShotBoostTimer)
        }
        this.player.hasDoubleShot = true
        this.playerDoubleShotBoostTimer = setTimeout(() => {
          this.player.hasDoubleShot = false
          this.playerDoubleShotBoostTimer = null
          console.log('Player double shot boost ended.')
        }, BOOST_DURATION) as unknown as number
        this.activeBoosts.push({ type, endTime })
        console.log('Player double shot activated!')
        break
      case 'scoreMultiplier':
        if (this.playerScoreMultiplierTimer) {
          clearTimeout(this.playerScoreMultiplierTimer)
        }
        this.currentScoreMultiplier = SCORE_MULTIPLIER_VALUE
        this.playerScoreMultiplierTimer = setTimeout(() => {
          this.currentScoreMultiplier = 1
          this.playerScoreMultiplierTimer = null
          this.playerScoreMultiplierEndTime = null
          console.log('Player score multiplier boost ended.')
        }, BOOST_DURATION) as unknown as number
        this.playerScoreMultiplierEndTime = endTime
        this.activeBoosts.push({ type, endTime })
        console.log(`Score multiplier activated! x${SCORE_MULTIPLIER_VALUE}`)
        break
      case 'piercingShot':
        if (this.playerPiercingShotBoostTimer) {
          clearTimeout(this.playerPiercingShotBoostTimer)
        }
        this.player.hasPiercingShot = true
        endTime = now + PIERCING_SHOT_DURATION
        this.playerPiercingShotBoostTimer = setTimeout(() => {
          this.player.hasPiercingShot = false
          this.playerPiercingShotBoostTimer = null
          this.playerPiercingShotBoostEndTime = null
          console.log('Player piercing shot boost ended.')
        }, PIERCING_SHOT_DURATION) as unknown as number
        this.playerPiercingShotBoostEndTime = endTime
        this.activeBoosts.push({ type, endTime })
        console.log('Player piercing shot activated!')
        break
    }
  }

  private drawBoostTimers() {
    const now = Date.now()
    let displayX = 10
    const displayY = CANVAS_HEIGHT - 30

    this.activeBoosts.forEach((boost) => {
      const timeLeft = Math.max(0, Math.ceil((boost.endTime - now) / 1000))
      if (timeLeft === 0) return

      let icon = ''
      let color = 'white'
      switch (boost.type) {
        case 'speed':
          icon = '⚡'
          color = 'cyan'
          break
        case 'doubleShot':
          icon = '💥'
          color = 'purple'
          break
        case 'scoreMultiplier':
          icon = '💰'
          color = 'gold'
          break
        case 'piercingShot':
          icon = '🌌'
          color = 'lime'
          break
        default:
          return
      }

      this.ctx.fillStyle = color
      this.ctx.font = '16px Arial'
      this.ctx.textAlign = 'left'
      this.ctx.fillText(`${icon} ${timeLeft}s`, displayX, displayY)
      displayX += this.ctx.measureText(`${icon} ${timeLeft}s`).width + 15
    })
  }

  private drawLevelCompleteScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    this.ctx.fillStyle = 'white'
    this.ctx.font = '48px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40)

    this.ctx.font = '24px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20)
  }

  private draw() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    this.player.draw(this.ctx)
    this.player.bullets.forEach((bullet) => bullet.draw(this.ctx))

    this.invaders.forEach((invader) => {
      invader.draw(this.ctx)
      invader.bullets.forEach((bullet) => bullet.draw(this.ctx))
    })

    this.shields.forEach((shield) => {
      shield.draw(this.ctx)
    })

    this.boosts.forEach((boost) => {
      boost.draw(this.ctx)
    })

    this.explosions.forEach((explosion) => explosion.draw(this.ctx))

    this.drawBoostTimers()

    if (this.gameState === 'levelComplete') {
      this.drawLevelCompleteScreen()
    }
  }

  private loop = () => {
    if (this.gameState === 'playing') {
      this.update()
      this.draw()
    } else if (this.gameState === 'paused') {
      this.draw()
    } else if (this.gameState === 'levelComplete') {
      this.draw()
    }

    if (this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'levelComplete') {
      this.animationFrameId = requestAnimationFrame(this.loop)
    }
  }

  private endGame(state: 'gameOver' | 'won') {
    this.gameState = state
    if (state === 'won' && !this.hasWon) {
      this.callbacks.onGameStateChange(this.gameState)
      this.hasWon = true
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    if (this.playerSpeedBoostTimer) {
      clearTimeout(this.playerSpeedBoostTimer)
      this.playerSpeedBoostTimer = null
      this.playerSpeedBoostEndTime = null
    }

    if (this.playerDoubleShotBoostTimer) {
      clearTimeout(this.playerDoubleShotBoostTimer)
      this.playerDoubleShotBoostTimer = null
    }

    if (this.playerScoreMultiplierTimer) {
      clearTimeout(this.playerScoreMultiplierTimer)
      this.playerScoreMultiplierTimer = null
      this.playerScoreMultiplierEndTime = null
      this.currentScoreMultiplier = 1
    }

    if (this.playerInvincibilityTimeoutId) {
      clearTimeout(this.playerInvincibilityTimeoutId)
      this.playerInvincibilityTimeoutId = null
      this.playerInvincibilityActive = false
      this.player.isInvincible = false
    }

    if (this.playerPiercingShotBoostTimer) {
      clearTimeout(this.playerPiercingShotBoostTimer)
      this.playerPiercingShotBoostTimer = null
      this.playerPiercingShotBoostEndTime = null
      this.player.hasPiercingShot = false
    }

    this.player.isFiringHeld = false
    this.activeBoosts = []
  }

  public destroy() {
    this.removeEventListeners()

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    if (this.playerSpeedBoostTimer) {
      clearTimeout(this.playerSpeedBoostTimer)
      this.playerSpeedBoostTimer = null
    }
    if (this.playerDoubleShotBoostTimer) {
      clearTimeout(this.playerDoubleShotBoostTimer)
      this.playerDoubleShotBoostTimer = null
    }
    if (this.playerScoreMultiplierTimer) {
      clearTimeout(this.playerScoreMultiplierTimer)
      this.playerScoreMultiplierTimer = null
    }
    if (this.playerInvincibilityTimeoutId) {
      clearTimeout(this.playerInvincibilityTimeoutId)
      this.playerInvincibilityTimeoutId = null
    }
    if (this.playerPiercingShotBoostTimer) {
      clearTimeout(this.playerPiercingShotBoostTimer)
      this.playerPiercingShotBoostTimer = null
      this.playerPiercingShotBoostEndTime = null
    }
  }
}
