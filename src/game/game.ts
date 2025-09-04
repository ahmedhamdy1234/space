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
  INVADER_BASE_HEALTH, // Import INVADER_BASE_HEALTH
  LEVEL_INVADER_HEALTH_INCREASE_INTERVAL, // Import health increase interval
  SCORE_MULTIPLIER_VALUE, // Import score multiplier value
  KEY_PAUSE, // Import KEY_PAUSE
  EXPLOSION_INITIAL_SIZE, // Import for explosion
  EXPLOSION_MAX_SIZE, // Import for explosion
  EXPLOSION_MAX_FRAMES, // Import for explosion
  EXPLOSION_COLOR, // Import for explosion
  PLAYER_INVINCIBILITY_DURATION, // Import for player invincibility
} from './constants'
import { Boost, BoostType, Bullet, Invader, Player, Shield, Explosion } from './entities' // Import Explosion

export type GameState = 'start' | 'playing' | 'gameOver' | 'won' | 'paused' // Added 'paused' state

interface GameCallbacks {
  onScoreUpdate: (score: number) => void
  onLivesUpdate: (lives: number) => void
  onGameStateChange: (state: GameState) => void
  onLevelUpdate: (level: number) => void
}

export class Game {
  private ctx: CanvasRenderingContext2D
  private player: Player
  private invaders: Invader[]
  private shields: Shield[]
  private boosts: Boost[]
  private explosions: Explosion[] // New array for explosions
  private score: number
  private lives: number
  private gameState: GameState
  private animationFrameId: number | null
  private callbacks: GameCallbacks
  private invaderDirection: number // 1 for right, -1 for left
  private currentLevel: number
  private playerSpeedBoostTimer: number | null
  private playerSpeedBoostEndTime: number | null
  private playerDoubleShotBoostTimer: number | null // New timer for double shot
  private playerScoreMultiplierTimer: number | null // New timer for score multiplier
  private playerScoreMultiplierEndTime: number | null // New end time for score multiplier
  private currentScoreMultiplier: number // Current score multiplier
  private playerInvincibilityActive: boolean // New flag for player invincibility
  private playerInvincibilityTimeoutId: number | null // Timeout ID for invincibility

  constructor(ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.ctx = ctx
    this.callbacks = callbacks
    this.player = new Player()
    this.invaders = []
    this.shields = []
    this.boosts = []
    this.explosions = [] // Initialize explosions array
    this.score = 0
    this.lives = GAME_LIVES
    this.gameState = 'start'
    this.animationFrameId = null
    this.invaderDirection = 1
    this.currentLevel = 1
    this.playerSpeedBoostTimer = null
    this.playerSpeedBoostEndTime = null
    this.playerDoubleShotBoostTimer = null
    this.playerScoreMultiplierTimer = null // Initialize new timer
    this.playerScoreMultiplierEndTime = null // Initialize new end time
    this.currentScoreMultiplier = 1 // Default multiplier
    this.playerInvincibilityActive = false // Initialize invincibility
    this.playerInvincibilityTimeoutId = null // Initialize invincibility timeout

    this.setupEventListeners()
    this.callbacks.onScoreUpdate(this.score)
    this.callbacks.onLivesUpdate(this.lives)
    this.callbacks.onGameStateChange(this.gameState)
    this.callbacks.onLevelUpdate(this.currentLevel)
  }

  private setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  private removeEventListeners() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
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
      e.preventDefault() // Prevent spacebar from scrolling
      this.player.isFiringHeld = true // Set firing held flag
    }
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    if (this.gameState !== 'playing') return

    if (e.key === 'ArrowLeft') {
      this.player.isMovingLeft = false
    } else if (e.key === 'ArrowRight') {
      this.player.isMovingRight = false
    } else if (e.key === ' ') {
      this.player.isFiringHeld = false // Clear firing held flag
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
      this.loop() // Resume the game loop
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
    this.explosions = [] // Reset explosions
    this.currentLevel = 1
    this.playerSpeedBoostTimer = null
    this.playerSpeedBoostEndTime = null
    this.playerDoubleShotBoostTimer = null
    this.playerScoreMultiplierTimer = null // Reset score multiplier timer
    this.playerScoreMultiplierEndTime = null // Reset score multiplier end time
    this.currentScoreMultiplier = 1 // Reset multiplier
    this.player.speed = this.player.baseSpeed
    this.player.hasDoubleShot = false
    this.player.isFiringHeld = false // Reset firing held flag
    this.player.isInvincible = false // Reset player invincibility
    this.playerInvincibilityActive = false
    if (this.playerInvincibilityTimeoutId) {
      clearTimeout(this.playerInvincibilityTimeoutId)
      this.playerInvincibilityTimeoutId = null
    }
    this.spawnInvaders()
    this.spawnShields()
    this.score = 0
    this.lives = GAME_LIVES
    this.invaderDirection = 1
    this.callbacks.onScoreUpdate(this.score)
    this.callbacks.onLivesUpdate(this.lives)
    this.callbacks.onLevelUpdate(this.currentLevel)
  }

  private spawnInvaders() {
    const levelInvaderSpeed = INVADER_SPEED * (1 + (this.currentLevel - 1) * LEVEL_INVADER_SPEED_MULTIPLIER)
    const levelInvaderFireRate = INVADER_FIRE_RATE + (this.currentLevel - 1) * LEVEL_INVADER_FIRE_RATE_MULTIPLIER
    let invaderHealth = INVADER_BASE_HEALTH + Math.floor((this.currentLevel - 1) / LEVEL_INVADER_HEALTH_INCREASE_INTERVAL)

    // Dynamic invader layout based on level
    let currentInvaderRows = INVADER_ROWS
    let currentInvaderCols = INVADER_COLS
    let currentInvaderStartY = INVADER_START_Y

    if (this.currentLevel % 3 === 0) { // Every 3rd level, more columns
      currentInvaderCols = Math.min(INVADER_COLS + 2, 12)
    } else if (this.currentLevel % 2 === 0) { // Every 2nd level, more rows
      currentInvaderRows = Math.min(INVADER_ROWS + 1, 7)
    } else { // Other levels, slightly lower start position
      currentInvaderStartY = INVADER_START_Y + (this.currentLevel - 1) * 5
    }

    // Ensure invaders don't go off screen or overlap too much
    const actualInvaderSpacingX = CANVAS_WIDTH / currentInvaderCols - INVADER_WIDTH / 2;
    const actualInvaderSpacingY = INVADER_SPACING_Y;

    const invaderShapes: ('square' | 'circle' | 'triangle')[] = ['square', 'circle', 'triangle']

    for (let row = 0; row < currentInvaderRows; row++) {
      for (let col = 0; col < currentInvaderCols; col++) {
        const shape = invaderShapes[row % invaderShapes.length] // Assign shape based on row
        this.invaders.push(
          new Invader(
            INVADER_START_X + col * actualInvaderSpacingX,
            currentInvaderStartY + row * actualInvaderSpacingY,
            levelInvaderSpeed,
            levelInvaderFireRate,
            invaderHealth, // Pass calculated health
            shape, // Pass the assigned shape
          ),
        )
      }
    }
  }

  private spawnShields() {
    // Only spawn shields if they are not destroyed from previous level
    // Or if it's a new game/level, re-spawn them
    if (this.shields.length === 0 || this.shields.every(s => s.isDestroyed)) {
      const shieldSpacing =
        (CANVAS_WIDTH - NUMBER_OF_SHIELDS * SHIELD_WIDTH) /
        (NUMBER_OF_SHIELDS + 1)
      for (let i = 0; i < NUMBER_OF_SHIELDS; i++) {
        this.shields.push(
          new Shield(
            shieldSpacing * (i + 1) + i * SHIELD_WIDTH,
            CANVAS_HEIGHT - SHIELD_Y_OFFSET - SHIELD_HEIGHT,
          ),
        )
      }
    } else {
      // Repair existing shields if they are not destroyed
      this.shields.forEach(shield => shield.repair(shield.maxHealth));
    }
  }

  private nextLevel() {
    this.currentLevel++
    this.callbacks.onLevelUpdate(this.currentLevel)
    this.player = new Player() // Reset player position and speed
    this.playerSpeedBoostTimer = null
    this.playerSpeedBoostEndTime = null
    this.playerDoubleShotBoostTimer = null
    this.player.hasDoubleShot = false
    this.playerScoreMultiplierTimer = null // Reset score multiplier timer
    this.playerScoreMultiplierEndTime = null // Reset score multiplier end time
    this.currentScoreMultiplier = 1 // Reset multiplier
    this.player.isFiringHeld = false // Reset firing held flag
    this.player.isInvincible = false // Reset player invincibility
    this.playerInvincibilityActive = false
    if (this.playerInvincibilityTimeoutId) {
      clearTimeout(this.playerInvincibilityTimeoutId)
      this.playerInvincibilityTimeoutId = null
    }
    this.invaders = []
    this.boosts = []
    this.explosions = [] // Reset explosions
    this.spawnInvaders()
    this.spawnShields() // Re-spawn or repair shields for new level
    this.invaderDirection = 1
  }

  private update() {
    if (this.gameState !== 'playing') return // Only update if game is playing

    this.player.update()

    // Update player speed boost timer
    if (this.playerSpeedBoostTimer && this.playerSpeedBoostEndTime) {
      if (Date.now() >= this.playerSpeedBoostEndTime) {
        this.player.speed = this.player.baseSpeed // Reset speed
        this.playerSpeedBoostTimer = null
        this.playerSpeedBoostEndTime = null
        console.log('Player speed boost ended.')
      }
    }

    // Update player double shot boost timer
    if (this.playerDoubleShotBoostTimer) {
      // No need for end time, setTimeout handles it
    }

    // Update player score multiplier boost timer
    if (this.playerScoreMultiplierTimer && this.playerScoreMultiplierEndTime) {
      if (Date.now() >= this.playerScoreMultiplierEndTime) {
        this.currentScoreMultiplier = 1 // Reset multiplier
        this.playerScoreMultiplierTimer = null
        this.playerScoreMultiplierEndTime = null
        console.log('Player score multiplier boost ended.')
      }
    }


    let hitEdge = false
    for (const invader of this.invaders) {
      if (!invader.isAlive) continue

      // Update invader's direction based on global game direction
      invader.direction = this.invaderDirection
      invader.update() // Invader updates its x position

      // Check if invader hits canvas edge
      if (
        (invader.x + invader.width >= CANVAS_WIDTH && this.invaderDirection === 1) ||
        (invader.x <= 0 && this.invaderDirection === -1)
      ) {
        hitEdge = true
      }

      // Invader shooting
      if (Math.random() < invader.fireRate) {
        invader.shoot()
      }
    }

    if (hitEdge) {
      this.invaderDirection *= -1 // Reverse global invader direction
      for (const invader of this.invaders) {
        if (invader.isAlive) {
          invader.moveDown() // Move all invaders down
        }
      }
    }

    for (const invader of this.invaders) {
      if (!invader.isAlive) continue
      // Check if invaders reached player's level or shields
      if (invader.y + invader.height >= this.player.y) {
        this.endGame('gameOver')
        return
      }
      // Check collision with shields (invaders destroy shields by touching them)
      for (const shield of this.shields) {
        if (!shield.isDestroyed && this.checkCollision(invader, shield)) {
          shield.isDestroyed = true // Invader destroys shield on contact
        }
      }
    }

    // Update boosts
    this.boosts.forEach((boost) => boost.update())
    this.boosts = this.boosts.filter(
      (boost) => !boost.isOffscreen && !boost.isCollected,
    )

    // Update explosions
    this.explosions.forEach(explosion => explosion.update())
    this.explosions = this.explosions.filter(explosion => explosion.isActive)

    // Collision detection
    this.checkCollisions()

    // Remove dead invaders and player bullets
    this.invaders = this.invaders.filter((invader) => invader.isAlive)
    this.player.bullets = this.player.bullets.filter(
      (bullet) => !bullet.isOffscreen,
    )
    this.shields = this.shields.filter((shield) => !shield.isDestroyed)


    // Check for win condition
    if (this.invaders.length === 0) {
      if (this.currentLevel < MAX_LEVELS) {
        this.nextLevel()
      } else {
        this.endGame('won')
      }
    }
  }

  private checkCollision(obj1: { x: number; y: number; width: number; height: number }, obj2: { x: number; y: number; width: number; height: number }) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    )
  }

  private checkCollisions() {
    // Player bullets vs Invaders
    this.player.bullets.forEach((pBullet) => {
      this.invaders.forEach((invader) => {
        if (invader.isAlive && this.checkCollision(pBullet, invader)) {
          invader.hit() // Invader takes a hit
          pBullet.isOffscreen = true // Mark player bullet for removal

          if (!invader.isAlive) { // Only award score if invader is destroyed
            this.score += SCORE_PER_INVADER * this.currentScoreMultiplier
            this.callbacks.onScoreUpdate(this.score)

            // Create explosion when invader is destroyed
            this.explosions.push(new Explosion(
              invader.x + invader.width / 2,
              invader.y + invader.height / 2,
              EXPLOSION_INITIAL_SIZE,
              EXPLOSION_MAX_SIZE,
              EXPLOSION_MAX_FRAMES,
              EXPLOSION_COLOR
            ))

            // Randomly drop a boost
            if (Math.random() < BOOST_DROP_RATE) {
              const boostTypes: BoostType[] = ['speed', 'extraLife', 'shieldRepair', 'doubleShot', 'scoreMultiplier'] // Added 'scoreMultiplier'
              const randomBoostType = boostTypes[Math.floor(Math.random() * boostTypes.length)]
              this.boosts.push(new Boost(invader.x + invader.width / 2 - BOOST_SIZE / 2, invader.y + invader.height, randomBoostType))
              console.log(`Invader dropped a ${randomBoostType} boost!`)
            }
          }
        }
      })

      // Player bullets vs Shields
      this.shields.forEach((shield) => {
        if (!shield.isDestroyed && this.checkCollision(pBullet, shield)) {
          shield.hit()
          pBullet.isOffscreen = true // Mark player bullet for removal
        }
      })
    })

    // Invader bullets vs Player
    this.invaders.forEach((invader) => {
      invader.bullets.forEach((iBullet) => {
        if (this.checkCollision(iBullet, this.player)) {
          iBullet.isOffscreen = true // Mark invader bullet for removal
          if (!this.playerInvincibilityActive) { // Only take damage if not invincible
            this.lives--
            this.callbacks.onLivesUpdate(this.lives)
            if (this.lives <= 0) {
              this.endGame('gameOver')
            } else {
              // Activate invincibility
              this.playerInvincibilityActive = true
              this.player.isInvincible = true // Inform player entity to flash
              this.playerInvincibilityTimeoutId = setTimeout(() => {
                this.playerInvincibilityActive = false
                this.player.isInvincible = false
                this.playerInvincibilityTimeoutId = null
                console.log('Player invincibility ended.')
              }, PLAYER_INVINCIBILITY_DURATION)
              console.log('Player hit! Invincibility activated.')
            }
          }
        }

        // Invader bullets vs Shields
        this.shields.forEach((shield) => {
          if (!shield.isDestroyed && this.checkCollision(iBullet, shield)) {
            shield.hit()
            iBullet.isOffscreen = true // Mark invader bullet for removal
          }
        })
      })
    })

    // Player vs Boosts
    this.boosts.forEach((boost) => {
      if (!boost.isCollected && this.checkCollision(this.player, boost)) {
        boost.isCollected = true
        this.applyBoostEffect(boost.type)
      }
    })
  }

  private applyBoostEffect(type: BoostType) {
    console.log(`Applying boost: ${type}`);
    switch (type) {
      case 'speed':
        // Clear any existing speed boost timer to prevent conflicts
        if (this.playerSpeedBoostTimer) {
          clearTimeout(this.playerSpeedBoostTimer);
        }
        this.player.speed = this.player.baseSpeed * 1.5 // 50% speed increase
        this.playerSpeedBoostTimer = setTimeout(() => {
          this.player.speed = this.player.baseSpeed
          this.playerSpeedBoostTimer = null
          this.playerSpeedBoostEndTime = null
          console.log('Player speed boost ended.')
        }, BOOST_DURATION)
        this.playerSpeedBoostEndTime = Date.now() + BOOST_DURATION
        console.log('Player speed boosted!');
        break
      case 'extraLife':
        this.lives++
        this.callbacks.onLivesUpdate(this.lives)
        console.log('Extra life gained!');
        break
      case 'shieldRepair':
        this.shields.forEach(shield => {
          if (shield.isDestroyed || shield.health < shield.maxHealth) {
            shield.repair(shield.maxHealth); // Fully repair all shields
          }
        });
        console.log('Shields repaired!');
        break
      case 'doubleShot':
        if (this.playerDoubleShotBoostTimer) {
          clearTimeout(this.playerDoubleShotBoostTimer);
        }
        this.player.hasDoubleShot = true;
        this.playerDoubleShotBoostTimer = setTimeout(() => {
          this.player.hasDoubleShot = false;
          this.playerDoubleShotBoostTimer = null;
          console.log('Player double shot boost ended.');
        }, BOOST_DURATION);
        console.log('Player double shot activated!');
        break;
      case 'scoreMultiplier': // New case for score multiplier boost
        if (this.playerScoreMultiplierTimer) {
          clearTimeout(this.playerScoreMultiplierTimer);
        }
        this.currentScoreMultiplier = SCORE_MULTIPLIER_VALUE;
        this.playerScoreMultiplierTimer = setTimeout(() => {
          this.currentScoreMultiplier = 1;
          this.playerScoreMultiplierTimer = null;
          this.playerScoreMultiplierEndTime = null;
          console.log('Player score multiplier boost ended.');
        }, BOOST_DURATION);
        this.playerScoreMultiplierEndTime = Date.now() + BOOST_DURATION;
        console.log(`Score multiplier activated! x${SCORE_MULTIPLIER_VALUE}`);
        break;
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT) // Clear canvas

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

    this.explosions.forEach(explosion => explosion.draw(this.ctx)) // Draw explosions
  }

  private loop = () => {
    if (this.gameState === 'playing') { // Only update and draw if game is playing
      this.update()
      this.draw()
    } else if (this.gameState === 'paused') {
      this.draw() // Still draw the current state when paused
    }


    if (this.gameState === 'playing' || this.gameState === 'paused') { // Continue loop if playing or paused
      this.animationFrameId = requestAnimationFrame(this.loop)
    }
  }

  private endGame(state: 'gameOver' | 'won') {
    this.gameState = state
    this.callbacks.onGameStateChange(this.gameState)
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    // Clear any active speed boost timer when game ends
    if (this.playerSpeedBoostTimer) {
      clearTimeout(this.playerSpeedBoostTimer);
      this.playerSpeedBoostTimer = null;
      this.playerSpeedBoostEndTime = null;
    }
    // Clear any active double shot boost timer when game ends
    if (this.playerDoubleShotBoostTimer) {
      clearTimeout(this.playerDoubleShotBoostTimer);
      this.playerDoubleShotBoostTimer = null;
    }
    // Clear any active score multiplier boost timer when game ends
    if (this.playerScoreMultiplierTimer) {
      clearTimeout(this.playerScoreMultiplierTimer);
      this.playerScoreMultiplierTimer = null;
      this.playerScoreMultiplierEndTime = null;
      this.currentScoreMultiplier = 1; // Reset multiplier
    }
    // Clear any active invincibility timer when game ends
    if (this.playerInvincibilityTimeoutId) {
      clearTimeout(this.playerInvincibilityTimeoutId);
      this.playerInvincibilityTimeoutId = null;
      this.playerInvincibilityActive = false;
      this.player.isInvincible = false;
    }
    this.player.isFiringHeld = false; // Ensure firing is stopped on game over/win
  }

  public destroy() {
    this.removeEventListeners()
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    if (this.playerSpeedBoostTimer) {
      clearTimeout(this.playerSpeedBoostTimer)
    }
    if (this.playerDoubleShotBoostTimer) {
      clearTimeout(this.playerDoubleShotBoostTimer)
    }
    if (this.playerScoreMultiplierTimer) {
      clearTimeout(this.playerScoreMultiplierTimer)
    }
    if (this.playerInvincibilityTimeoutId) {
      clearTimeout(this.playerInvincibilityTimeoutId)
    }
  }
}
