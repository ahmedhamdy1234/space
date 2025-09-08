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
  BOSS_BULLET_SPEED,
  BOSS_SCORE_VALUE,
  MISSILE_BOSS_REWARD,
  KAMIKAZE_INVADER_WIDTH,
  KAMIKAZE_INVADER_HEIGHT,
  KAMIKAZE_INVADER_SPEED,
  KAMIKAZE_INVADER_HEALTH,
  KAMIKAZE_INVADER_DAMAGE,
  KAMIKAZE_SPAWN_CHANCE,
  DIVING_INVADER_WIDTH, // Import for Diving Invader
  DIVING_INVADER_HEIGHT, // Import for Diving InvADER
  DIVING_INVADER_SPEED, // Import for Diving Invader
  DIVING_INVADER_HEALTH, // Import for Diving Invader
  DIVING_INVADER_DAMAGE, // Import for Diving Invader
  DIVING_INVADER_SPAWN_CHANCE, // Import for Diving Invader spawn chance
  BOOT_KILL_DURATION, // Import for Boot Kill Boost
  PLAYER_HEIGHT, // Import player height for bot spawn position
  MISSILE_INITIAL_COUNT, // Import MISSILE_INITIAL_COUNT
  DEFAULT_SHIP_SKIN, // Import default ship skin
  SPLIT_INVADER_SPAWN_CHANCE, // Import for Split Invader spawn chance
  SPLIT_INVADER_WIDTH, // Import for Split Invader width
  SPLIT_INVADER_HEIGHT, // Import for Split Invader height
  SPLIT_INVADER_HEALTH, // Import for Split Invader health
  SPLIT_INVADER_SPEED, // Import for Split Invader speed
  SPLIT_INVADER_FIRE_RATE, // Import for Split Invader fire rate
  SPLIT_INVADER_CHILD_COUNT, // Import for Split Invader child count
  SPLIT_INVADER_CHILD_WIDTH, // Import for Split Invader child width
  SPLIT_INVADER_CHILD_HEIGHT, // Import for Split Invader child height
  SPLIT_INVADER_CHILD_HEALTH, // Import for Split Invader child health
  SPLIT_INVADER_CHILD_SPEED, // Import for Split Invader child speed
  SPLIT_INVADER_CHILD_FIRE_RATE, // Import for Split Invader child fire rate
  MINE_LAYING_INVADER_SPAWN_CHANCE, // Import for Mine-Laying Invader spawn chance
  MINE_LAYING_INVADER_WIDTH, // Import for Mine-Laying Invader width
  MINE_LAYING_INVADER_HEIGHT, // Import for Mine-Laying Invader height
  MINE_DAMAGE, // Import for Mine damage
  UNPREDICTABLE_MOVE_CHANCE, // Import for unpredictable move chance
  UNPREDICTABLE_MOVE_DOWN_CHANCE, // Import for unpredictable move down chance
  INVADER_UNPREDICTABLE_SPEED_MULTIPLIER, // Import for invader unpredictable speed multiplier
  INVADER_UNPREDICTABLE_FIRE_RATE_MULTIPLIER, // Import for invader unpredictable fire rate multiplier
  INVADER_UNPREDICTABLE_HEALTH_MULTIPLIER, // Import for invader unpredictable health multiplier
  KAMIKAZE_SPAWN_CHANCE_HIGH_LEVEL, // Import for high level Kamikaze spawn chance
  DIVING_INVADER_SPAWN_CHANCE_HIGH_LEVEL, // Import for high level Diving Invader spawn chance
  SPLIT_INVADER_SPAWN_CHANCE_HIGH_LEVEL, // Import for high level Split Invader spawn chance
  MINE_LAYING_INVADER_SPAWN_CHANCE_HIGH_LEVEL, // Import for high level Mine-Laying Invader spawn chance
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
  Missile,
  DivingInvader, // Import DivingInvader
  BotPlayer, // Import BotPlayer
  SplitInvader, // Import SplitInvader
  MineLayingInvader, // Import MineLayingInvader
  Mine, // Import Mine
} from './entities'

export type GameState = 'start' | 'playing' | 'gameOver' | 'won' | 'paused' | 'instructions' | 'levelComplete' | 'about' | 'shipSkinSelection' | 'bossRush' | 'levelSelection' // Added 'bossRush' and 'levelSelection'

interface GameCallbacks {
  onScoreUpdate: (score: number) => void
  onLivesUpdate: (lives: number) => void
  onGameStateChange: (state: GameState) => void
  onLevelUpdate: (level: number) => void
  onPlayerDeath?: (x: number, y: number) => void
  onMissileCountUpdate: (count: number) => void // Added missile count update callback
}

export class Game {
  private ctx: CanvasRenderingContext2D
  public player: Player
  public botPlayer: BotPlayer | null // New property for bot player
  private invaders: Invader[]
  private shields: Shield[]
  private boosts: Boost[]
  private explosions: Explosion[]
  private mines: Mine[] // New property for mines
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
  private botPlayerActiveTimer: number | null // Timer for bot player duration
  private botPlayerActiveEndTime: number | null // End time for bot player duration
  private activeBoosts: { type: BoostType; endTime: number }[]
  private levelBoosts: { [level: number]: BoostType }
  private hasWon: boolean
  private selectedSkin: string // New property for selected skin
  private isBossRushMode: boolean // New property for Boss Rush mode

  constructor(ctx: CanvasRenderingContext2D, callbacks: GameCallbacks, selectedSkin: string = DEFAULT_SHIP_SKIN) {
    this.ctx = ctx
    this.callbacks = callbacks
    this.selectedSkin = selectedSkin // Initialize selected skin
    this.player = new Player(undefined, undefined, this.selectedSkin) // Pass selected skin to Player
    this.botPlayer = null // Initialize bot player
    this.invaders = []
    this.shields = []
    this.boosts = []
    this.explosions = []
    this.mines = [] // Initialize mines
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
    this.botPlayerActiveTimer = null // Initialize bot player timer
    this.botPlayerActiveEndTime = null // Initialize bot player end time
    this.activeBoosts = []
    this.levelBoosts = {
      2: 'speed',
      3: 'doubleShot',
    }
    this.hasWon = false
    this.isBossRushMode = false // Initialize Boss Rush mode to false

    this.setupEventListeners()
    this.callbacks.onScoreUpdate(this.score)
    this.callbacks.onLivesUpdate(this.lives)
    this.callbacks.onGameStateChange(this.gameState)
    this.callbacks.onLevelUpdate(this.currentLevel)
    this.callbacks.onMissileCountUpdate(this.player.missileCount) // Initial missile count update
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
      e.preventDefault(); // Prevent default browser action for 'q' if any
      console.log("Game.ts: Q key pressed. Attempting to fire missile."); // Added log
      this.player.fireMissile(this.callbacks.onMissileCountUpdate) // Pass callback to update missile count
    }
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    // Always reset movement and firing flags, regardless of game state
    // This prevents the player from getting stuck if a key is released while the game is paused or in another state.
    if (e.key === 'ArrowLeft') {
      this.player.isMovingLeft = false
    } else if (e.key === 'ArrowRight') {
      this.player.isMovingRight = false
    } else if (e.key === ' ') {
      this.player.isFiringHeld = false
    } else if (e.key.toLowerCase() === 'q') { // Reset canFireMissile flag when 'Q' is released
      this.player.canFireMissile = true;
      console.log("Game.ts: Q key released. Missile can now be fired again."); // Added log
    }

    // Only handle level complete click if in that state
    if (this.gameState !== 'playing') return
  }

  private handleMouseDown = () => {
    if (this.gameState === 'levelComplete') {
      this.goToNextLevel()
    }
  }

  public startGame(startLevel: number = 1) { // Modified to accept startLevel
    this.resetGame()
    this.isBossRushMode = false // Ensure boss rush is off for regular game
    this.currentLevel = startLevel; // Set the current level
    this.callbacks.onLevelUpdate(this.currentLevel); // Update UI with new level
    this.player.level = this.currentLevel; // Update player's level for level-based upgrades

    // Set player's base shot count based on the starting level
    if (this.currentLevel >= 4 && this.currentLevel <= 25) {
      this.player.baseShotCount = 3; // 3 shots for levels 4-25
    } else {
      this.player.baseShotCount = 1; // Default 1 shot
    }

    this.gameState = 'playing'
    this.callbacks.onGameStateChange(this.gameState)
    this.spawnInvaders()
    this.spawnShields()
    this.loop()
  }

  public startBossRush() {
    this.resetGame()
    this.isBossRushMode = true
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
    // Create a new Player instance to reset all player properties, including level upgrades
    this.player = new Player(undefined, undefined, this.selectedSkin)
    this.botPlayer = null // Reset bot player
    this.invaders = []
    this.shields = []
    this.boosts = []
    this.explosions = []
    this.mines = [] // Reset mines
    this.score = 0
    this.lives = GAME_LIVES
    this.gameState = 'start'
    this.animationFrameId = null
    this.invaderDirection = 1
    this.currentLevel = 1 // Reset to 1, will be overridden by startGame(startLevel) if called
    this.player.isFiringHeld = false
    this.player.missileCount = MISSILE_INITIAL_COUNT // Reset missile count on game reset
    this.player.lastMissileFireTime = 0
    this.player.canFireMissile = true; // Reset canFireMissile on game reset
    this.hasWon = false
    this.isBossRushMode = false // Reset boss rush mode

    this.resetPlayerBoosts() // Centralized boost reset (only temporary boosts)

    // Do not spawn invaders/shields here, let startGame handle it based on selected level
    this.score = 0
    this.lives = GAME_LIVES
    this.invaderDirection = 1
    this.callbacks.onScoreUpdate(this.score)
    this.callbacks.onLivesUpdate(this.lives)
    this.callbacks.onGameStateChange(this.gameState)
    this.callbacks.onLevelUpdate(this.currentLevel)
    this.callbacks.onMissileCountUpdate(this.player.missileCount) // Reset missile count on game reset
  }

  public revivePlayer() {
    // Stop any ongoing animation frame to prevent multiple loops
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Reset player's position and state (new Player instance)
    // This will also reset level-based upgrades, which might not be desired on revive.
    // For now, we'll keep it simple and fully reset the player.
    this.player = new Player(undefined, undefined, this.selectedSkin); // Pass selected skin on revive
    this.player.missileCount = MISSILE_INITIAL_COUNT; // Ensure missiles are reset/given on revive
    this.player.canFireMissile = true; // Reset canFireMissile on revive

    // Re-apply level-based shot count
    if (this.currentLevel >= 4 && this.currentLevel <= 25) {
      this.player.baseShotCount = 3;
    } else {
      this.player.baseShotCount = 1;
    }

    // Clear all active boosts and their timers (temporary ones)
    this.resetPlayerBoosts();

    // Restore lives (e.g., to 1 for a revive)
    this.lives = 1; // Assuming a revive gives 1 life back
    this.callbacks.onLivesUpdate(this.lives);

    // Activate temporary invincibility to prevent immediate re-death
    this.activatePlayerInvincibility();

    // Set game state back to playing
    this.gameState = 'playing';
    this.callbacks.onGameStateChange(this.gameState);

    // Restart the game loop
    this.loop();
  }

  private spawnInvaders() {
    this.invaders = []

    if (this.isBossRushMode || this.currentLevel % BOSS_LEVEL_INTERVAL === 0) {
      // In Boss Rush mode, always spawn a boss.
      // In regular mode, spawn a boss every BOSS_LEVEL_INTERVAL.
      const bossHealthMultiplier = this.isBossRushMode ? (1 + (this.currentLevel - 1) * 0.5) : 1; // Bosses get tougher in Boss Rush
      const bossSpeedMultiplier = this.isBossRushMode ? (1 + (this.currentLevel - 1) * 0.2) : 1;
      const bossFireRateMultiplier = this.isBossRushMode ? (1 + (this.currentLevel - 1) * 0.1) : 1;

      this.invaders.push(
        new BossInvader(
          CANVAS_WIDTH / 2 - BOSS_WIDTH / 2,
          INVADER_START_Y,
          BOSS_SPEED * bossSpeedMultiplier,
          BOSS_FIRE_RATE * bossFireRateMultiplier,
          BOSS_HEALTH * bossHealthMultiplier
        )
      );
    } else {
      // Regular invader spawning logic
      let levelInvaderSpeed = INVADER_SPEED * (1 + (this.currentLevel - 1) * (LEVEL_INVADER_SPEED_MULTIPLIER * 0.5));
      let levelInvaderFireRate = INVADER_FIRE_RATE + (this.currentLevel - 1) * (LEVEL_INVADER_FIRE_RATE_MULTIPLIER * 0.5);
      let invaderHealth = INVADER_BASE_HEALTH + Math.floor((this.currentLevel - 1) / LEVEL_INVADER_HEALTH_INCREASE_INTERVAL)

      // Apply advantages for levels 10-25
      if (this.currentLevel >= 10 && this.currentLevel <= 25) {
        levelInvaderSpeed *= INVADER_UNPREDICTABLE_SPEED_MULTIPLIER;
        levelInvaderFireRate *= INVADER_UNPREDICTABLE_FIRE_RATE_MULTIPLIER;
        invaderHealth = Math.ceil(invaderHealth * INVADER_UNPREDICTABLE_HEALTH_MULTIPLIER); // Ensure health is at least 1
      }

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

      const invaderShapes: ('square' | 'circle' | 'triangle' | 'diamond' | 'star')[] = ['square', 'circle', 'triangle']

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

      // Adjust spawn chances for special invaders in levels 10-25
      const currentKamikazeSpawnChance = (this.currentLevel >= 10 && this.currentLevel <= 25) ? KAMIKAZE_SPAWN_CHANCE_HIGH_LEVEL : KAMIKAZE_SPAWN_CHANCE;
      const currentDivingInvaderSpawnChance = (this.currentLevel >= 10 && this.currentLevel <= 25) ? DIVING_INVADER_SPAWN_CHANCE_HIGH_LEVEL : DIVING_INVADER_SPAWN_CHANCE;
      const currentSplitInvaderSpawnChance = (this.currentLevel >= 10 && this.currentLevel <= 25) ? SPLIT_INVADER_SPAWN_CHANCE_HIGH_LEVEL : SPLIT_INVADER_SPAWN_CHANCE;
      const currentMineLayingInvaderSpawnChance = (this.currentLevel >= 10 && this.currentLevel <= 25) ? MINE_LAYING_INVADER_SPAWN_CHANCE_HIGH_LEVEL : MINE_LAYING_INVADER_SPAWN_CHANCE;


      // Spawn Kamikaze Invader randomly
      if (Math.random() < currentKamikazeSpawnChance) {
        const kamikazeX = Math.random() * (CANVAS_WIDTH - KAMIKAZE_INVADER_WIDTH)
        this.invaders.push(new KamikazeInvader(kamikazeX, INVADER_START_Y - KAMIKAZE_INVADER_HEIGHT))
        console.log('Kamikaze Invader spawned!')
      }

      // Spawn Diving Invader randomly
      if (Math.random() < currentDivingInvaderSpawnChance) {
        const spawnX = Math.random() * (CANVAS_WIDTH - DIVING_INVADER_WIDTH);
        this.invaders.push(new DivingInvader(spawnX, -DIVING_INVADER_HEIGHT, this.player.x));
        console.log('Diving Invader spawned!');
      }

      // Spawn Split Invader for levels 10-25
      if (this.currentLevel >= 10 && this.currentLevel <= 25 && Math.random() < currentSplitInvaderSpawnChance) {
        const splitX = Math.random() * (CANVAS_WIDTH - SPLIT_INVADER_WIDTH);
        this.invaders.push(new SplitInvader(splitX, INVADER_START_Y - SPLIT_INVADER_HEIGHT));
        console.log('Split Invader spawned!');
      }

      // Spawn Mine-Laying Invader for levels 10-25
      if (this.currentLevel >= 10 && this.currentLevel <= 25 && Math.random() < currentMineLayingInvaderSpawnChance) {
        const mineLayingX = Math.random() * (CANVAS_WIDTH - MINE_LAYING_INVADER_WIDTH);
        this.invaders.push(new MineLayingInvader(mineLayingX, INVADER_START_Y - MINE_LAYING_INVADER_HEIGHT));
        console.log('Mine-Laying Invader spawned!');
      }
    }
  }

  private spawnShields() {
    // Shields are not spawned in Boss Rush mode for increased difficulty
    if (this.isBossRushMode) {
      this.shields = []; // Ensure no shields are present
      return;
    }

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
    // Reset player's TEMPORARY boosts to default values
    this.player.speed = this.player.baseSpeed
    this.player.hasDoubleShot = false // This is for the temporary boost
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
    if (this.botPlayerActiveTimer) { // Clear bot player timer
      clearTimeout(this.botPlayerActiveTimer)
      this.botPlayerActiveTimer = null
      this.botPlayerActiveEndTime = null
      this.botPlayer = null // Remove bot player
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
    this.player.level = this.currentLevel; // Update player's level

    // Set player's base shot count based on the new level
    if (this.currentLevel >= 4 && this.currentLevel <= 25) {
      this.player.baseShotCount = 3;
    } else {
      this.player.baseShotCount = 1;
    }

    // Clear entities, dropped boosts, and reset player temporary boosts
    this.clearEntities()
    this.clearDroppedBoosts()
    this.resetPlayerBoosts() // Only resets temporary boosts, not level upgrades

    // In Boss Rush mode, MAX_LEVELS can be effectively infinite or a very high number
    // For now, we'll use MAX_LEVELS for both modes.
    if (this.currentLevel <= MAX_LEVELS) {
      this.gameState = 'playing'
      this.callbacks.onGameStateChange(this.gameState)
      this.spawnInvaders()
      this.spawnShields() // Shields will only spawn if not in Boss Rush mode
      this.invaderDirection = 1
      this.loop()
    } else {
      this.endGame('won')
    }
  }

  clearEntities() {
    this.invaders = []
    this.player.bullets = []
    if (this.botPlayer) {
      this.botPlayer.bullets = []
    }
    this.boosts = []
    this.explosions = []
    this.mines = [] // Clear mines
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
    if (this.botPlayer) {
      this.botPlayer.update(this.invaders) // Pass invaders for bot AI
    }

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

    if (this.botPlayerActiveTimer && this.botPlayerActiveEndTime) {
      if (now >= this.botPlayerActiveEndTime) {
        this.botPlayer = null
        this.botPlayerActiveTimer = null
        this.botPlayerActiveEndTime = null;
        console.log('Bot player boost ended.')
      }
    }

    // Spawn Diving Invader randomly (only in regular game mode)
    // This is a per-frame chance, so it's very low.
    if (!this.isBossRushMode && Math.random() < DIVING_INVADER_SPAWN_CHANCE) {
      const spawnX = Math.random() * (CANVAS_WIDTH - DIVING_INVADER_WIDTH);
      this.invaders.push(new DivingInvader(spawnX, -DIVING_INVADER_HEIGHT, this.player.x));
      console.log('Diving Invader spawned!');
    }

    let hitEdge = false
    for (const invader of this.invaders) {
      if (!invader.isAlive) continue

      if (invader instanceof KamikazeInvader || invader instanceof DivingInvader) {
        invader.update()
        continue
      }

      if (invader instanceof MineLayingInvader) {
        invader.update();
        const mine = invader.layMine();
        if (mine) {
          this.mines.push(mine);
          console.log('Mine laid by Mine-Laying Invader!');
        }
        continue;
      }

      // Unpredictable movement for regular invaders in levels 10-25
      if (this.currentLevel >= 10 && this.currentLevel <= 25) {
        // Randomly flip direction
        if (Math.random() < UNPREDICTABLE_MOVE_CHANCE) {
          this.invaderDirection *= -1;
        }
        // Randomly move down an extra amount
        if (Math.random() < UNPREDICTABLE_MOVE_DOWN_CHANCE) {
          invader.y += INVADER_MOVE_DOWN_AMOUNT / 2; // Move down half the usual amount
        }
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
        // Only regular invaders, SplitInvaders, and MineLayingInvaders move down with the wave
        if (invader.isAlive && !(invader instanceof KamikazeInvader) && !(invader instanceof DivingInvader)) {
          invader.moveDown()
        }
      }
    }

    this.boosts.forEach((boost) => boost.update())
    this.boosts = this.boosts.filter((boost) => !boost.isOffscreen && !boost.isCollected)

    this.explosions.forEach((explosion) => explosion.update())
    this.explosions = this.explosions.filter((explosion) => explosion.isActive)

    this.mines.forEach((mine) => mine.update());
    this.mines = this.mines.filter((mine) => !mine.isExploded && !mine.isOffscreen);

    this.checkCollisions()

    this.invaders = this.invaders.filter((invader) => invader.isAlive)
    this.player.bullets = this.player.bullets.filter((bullet) => !bullet.isOffscreen)
    if (this.botPlayer) {
      this.botPlayer.bullets = this.botPlayer.bullets.filter((bullet) => !bullet.isOffscreen)
    }
    this.shields = this.shields.filter((shield) => !shield.isDestroyed)

    // Level completion check: only count regular invaders and BossInvaders
    if (this.invaders.filter((inv) => inv instanceof Invader && !(inv instanceof KamikazeInvader) && !(inv instanceof DivingInvader) && !(inv instanceof SplitInvader) && !(inv instanceof MineLayingInvader)).length === 0) {
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
    const allPlayerBullets: Bullet[] = [...this.player.bullets];
    if (this.botPlayer) {
      allPlayerBullets.push(...this.botPlayer.bullets);
    }

    const regularBullets: Bullet[] = [];
    const missiles: Missile[] = [];

    allPlayerBullets.forEach(bullet => {
      if (bullet instanceof Missile) {
        missiles.push(bullet);
      } else {
        regularBullets.push(bullet);
      }
    });

    // --- Handle Regular Player/Bot Bullets ---
    regularBullets.forEach((pBullet) => {
      if (pBullet.isOffscreen) return;

      this.invaders.forEach((invader) => {
        if (invader.isAlive && this.checkCollision(pBullet, invader)) {
          invader.hit(pBullet.damage);
          if (!pBullet.isPiercing) { // Regular bullets are not piercing, so they are removed
            pBullet.isOffscreen = true;
          }

          if (!invader.isAlive) {
            this.score += (invader instanceof BossInvader ? BOSS_SCORE_VALUE : SCORE_PER_INVADER) * this.currentScoreMultiplier;
            this.callbacks.onScoreUpdate(this.score);

            if (invader instanceof BossInvader) {
              this.player.missileCount += MISSILE_BOSS_REWARD;
              this.callbacks.onMissileCountUpdate(this.player.missileCount);
            } else if (invader instanceof SplitInvader) {
              // Spawn child invaders when SplitInvader is destroyed
              console.log('Split Invader destroyed! Spawning children...');
              for (let i = 0; i < SPLIT_INVADER_CHILD_COUNT; i++) {
                const childX = invader.x + (i * SPLIT_INVADER_CHILD_WIDTH * 1.5) - (SPLIT_INVADER_CHILD_COUNT * SPLIT_INVADER_CHILD_WIDTH * 0.75);
                const childY = invader.y + invader.height + 5;
                this.invaders.push(new Invader(
                  childX,
                  childY,
                  SPLIT_INVADER_CHILD_SPEED,
                  SPLIT_INVADER_CHILD_FIRE_RATE,
                  SPLIT_INVADER_CHILD_HEALTH,
                  'circle' // Child invaders are circles
                ));
              }
            }

            this.explosions.push(
              new Explosion(invader.x + invader.width / 2, invader.y + invader.height / 2, EXPLOSION_INITIAL_SIZE, EXPLOSION_MAX_SIZE, EXPLOSION_MAX_FRAMES, EXPLOSION_COLOR)
            );

            // Boosts can drop from any invader
            if (Math.random() < BOOST_DROP_RATE) {
              const boostTypes: BoostType[] = ['speed', 'extraLife', 'shieldRepair', 'doubleShot', 'scoreMultiplier', 'bootKill'];
              const randomBoostType = boostTypes[Math.floor(Math.random() * boostTypes.length)];
              this.boosts.push(new Boost(invader.x + invader.width / 2 - BOOST_SIZE / 2, invader.y + invader.height, randomBoostType));
            }
          }
        }
      });
    });

    // --- Handle Player Missiles (now always piercing) ---
    missiles.forEach((missile) => {
      if (missile.isOffscreen) return;

      let hitBossThisMissile = false; // Flag to ensure a missile only damages a specific boss once

      // Iterate through invaders to check for collisions
      for (const invader of this.invaders) {
        if (!invader.isAlive || !this.checkCollision(missile, invader)) {
          continue; // Skip if invader is dead or no collision
        }

        if (invader instanceof BossInvader) {
          if (!hitBossThisMissile) { // Only hit this boss once per missile
            const damageAmount = invader.maxHealth * 0.02; // 2% of max health
            invader.hit(damageAmount);
            hitBossThisMissile = true; // Mark boss as hit by this missile
            console.log(`Missile hit Boss! Boss health: ${invader.health}`);

            if (!invader.isAlive) {
              this.score += BOSS_SCORE_VALUE * this.currentScoreMultiplier;
              this.callbacks.onScoreUpdate(this.score);
              this.player.missileCount += MISSILE_BOSS_REWARD;
              this.callbacks.onMissileCountUpdate(this.player.missileCount);
              this.explosions.push(
                new Explosion(invader.x + invader.width / 2, invader.y + invader.height / 2, EXPLOSION_INITIAL_SIZE, EXPLOSION_MAX_SIZE, EXPLOSION_MAX_FRAMES, EXPLOSION_COLOR)
              );
            }
          }
        } else { // Regular invader, Kamikaze, Diving, Split, Mine-Laying
          invader.hit(missile.damage); // Missiles deal MISSILE_DAMAGE to regular invaders
          // Missiles are piercing, so they don't get set to isOffscreen=true here for regular hits
          if (!invader.isAlive) {
            this.score += SCORE_PER_INVADER * this.currentScoreMultiplier;
            this.callbacks.onScoreUpdate(this.score);
            this.explosions.push(
              new Explosion(invader.x + invader.width / 2, invader.y + invader.height / 2, EXPLOSION_INITIAL_SIZE, EXPLOSION_MAX_SIZE, EXPLOSION_MAX_FRAMES, EXPLOSION_COLOR)
            );
            if (invader instanceof SplitInvader) {
              console.log('Split Invader destroyed by missile! Spawning children...');
              for (let i = 0; i < SPLIT_INVADER_CHILD_COUNT; i++) {
                const childX = invader.x + (i * SPLIT_INVADER_CHILD_WIDTH * 1.5) - (SPLIT_INVADER_CHILD_COUNT * SPLIT_INVADER_CHILD_WIDTH * 0.75);
                const childY = invader.y + invader.height + 5;
                this.invaders.push(new Invader(
                  childX,
                  childY,
                  SPLIT_INVADER_CHILD_SPEED,
                  SPLIT_INVADER_CHILD_FIRE_RATE,
                  SPLIT_INVADER_CHILD_HEALTH,
                  'circle'
                ));
              }
            }
            if (Math.random() < BOOST_DROP_RATE) {
              const boostTypes: BoostType[] = ['speed', 'extraLife', 'shieldRepair', 'doubleShot', 'scoreMultiplier', 'bootKill'];
              const randomBoostType = boostTypes[Math.floor(Math.random() * boostTypes.length)];
              this.boosts.push(new Boost(invader.x + invader.width / 2 - BOOST_SIZE / 2, invader.y + invader.height, randomBoostType));
            }
          }
        }
      }
      // Missiles are only removed when they go off-screen, not based on hits.
    });

    // Reconstruct player.bullets and botPlayer.bullets arrays with updated states
    this.player.bullets = allPlayerBullets.filter(b => b.type === 'player' && !b.isOffscreen);
    if (this.botPlayer) {
      this.botPlayer.bullets = allPlayerBullets.filter(b => b.type === 'bot' && !b.isOffscreen);
    }


    // --- Handle Invader Bullets and Kamikaze/Diving Invaders ---
    this.invaders.forEach((invader) => {
      // Player-Invader collision with Bot Player (if active)
      if (this.botPlayer && invader.isAlive && this.checkCollision(invader, this.player)) {
        // If bot player is active, the main player is effectively "boot-killed" and doesn't take damage from collision
        // The invader is destroyed by the bot's presence (conceptual "boot kill")
        invader.hit(invader.health); // Instantly destroy invader
        if (!invader.isAlive) {
          this.score += (invader instanceof BossInvader ? BOSS_SCORE_VALUE : SCORE_PER_INVADER) * this.currentScoreMultiplier;
          this.callbacks.onScoreUpdate(this.score);
          this.explosions.push(
            new Explosion(invader.x + invader.width / 2, invader.y + invader.height / 2, EXPLOSION_INITIAL_SIZE, EXPLOSION_MAX_SIZE, EXPLOSION_MAX_FRAMES, EXPLOSION_COLOR)
          );
        }
        return; // Invader is destroyed, no further collision checks for this invader
      }


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

      // Handle DivingInvader collision with player
      if (invader instanceof DivingInvader && invader.isAlive && this.checkCollision(invader, this.player)) {
        invader.isAlive = false; // Destroy diving invader on impact
        this.explosions.push(
          new Explosion(invader.x + invader.width / 2, invader.y + invader.height / 2, EXPLOSION_INITIAL_SIZE, EXPLOSION_MAX_SIZE, EXPLOSION_MAX_FRAMES, EXPLOSION_COLOR),
        );
        if (!this.playerInvincibilityActive) {
          this.lives -= invader.damage; // Diving invader deals damage
          this.callbacks.onLivesUpdate(this.lives);
          if (this.lives <= 0) {
            this.endGame('gameOver');
            this.callbacks.onPlayerDeath?.(this.player.x, this.player.y);
          } else {
            this.activatePlayerInvincibility();
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

    // --- Handle Boost Collisions ---
    this.boosts.forEach((boost) => {
      if (!boost.isCollected && this.checkCollision(this.player, boost)) {
        boost.isCollected = true
        this.applyBoostEffect(boost.type)
      }
    })

    // --- Handle Mine Collisions ---
    this.mines.forEach((mine) => {
      if (!mine.isExploded && this.checkCollision(this.player, mine)) {
        mine.isExploded = true;
        this.explosions.push(
          new Explosion(mine.x + mine.width / 2, mine.y + mine.height / 2, EXPLOSION_INITIAL_SIZE, EXPLOSION_MAX_SIZE, EXPLOSION_MAX_FRAMES, EXPLOSION_COLOR)
        );
        if (!this.playerInvincibilityActive) {
          this.lives -= MINE_DAMAGE;
          this.callbacks.onLivesUpdate(this.lives);
          if (this.lives <= 0) {
            this.endGame('gameOver');
            this.callbacks.onPlayerDeath?.(this.player.x, this.player.y);
          } else {
            this.activatePlayerInvincibility();
          }
        }
      }
      // Optional: Invader bullets can destroy mines
      this.invaders.forEach(invader => {
        invader.bullets.forEach(iBullet => {
          if (!mine.isExploded && !iBullet.isOffscreen && this.checkCollision(iBullet, mine)) {
            mine.isExploded = true;
            iBullet.isOffscreen = true;
            this.explosions.push(
              new Explosion(mine.x + mine.width / 2, mine.y + mine.height / 2, EXPLOSION_INITIAL_SIZE, EXPLOSION_MAX_SIZE, EXPLOSION_MAX_FRAMES, EXPLOSION_COLOR)
            );
          }
        });
      });
    });
  }

  private activatePlayerInvincibility() {
    this.playerInvincibilityActive = true
    this.player.isInvincible = true
    this.playerInvincibilityTimeoutId = setTimeout(() => {
      this.playerInvincibilityActive = false
      this.player.isInvincible = false
      this.playerInvincibilityTimeoutId = null
      console.log('Player invincibility ended.')
    }, PLAYER_INVINCIBILITY_DURATION) as unknown as number // Cast to number
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
        // Only repair shields if not in Boss Rush mode
        if (!this.isBossRushMode) {
          this.spawnShields()
          console.log('Shields rebuilt!')
        } else {
          console.log('Shield repair boost ignored in Boss Rush mode.')
        }
        break
      case 'doubleShot':
        if (this.playerDoubleShotBoostTimer) {
          clearTimeout(this.playerDoubleShotBoostTimer)
        }
        this.player.hasDoubleShot = true // This is for the temporary boost
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
      case 'bootKill':
        if (this.botPlayerActiveTimer) {
          clearTimeout(this.botPlayerActiveTimer)
        }
        // Spawn bot player slightly above the main player
        this.botPlayer = new BotPlayer(this.player.x, this.player.y - PLAYER_HEIGHT);
        endTime = now + BOOT_KILL_DURATION;
        this.botPlayerActiveTimer = setTimeout(() => {
          this.botPlayer = null;
          this.botPlayerActiveTimer = null;
          this.botPlayerActiveEndTime = null;
          console.log('Bot player boost ended.');
        }, BOOT_KILL_DURATION) as unknown as number;
        this.botPlayerActiveEndTime = endTime;
        this.activeBoosts.push({ type, endTime });
        console.log('Bot player activated!');
        break
    }
  }

  private drawBoostTimers() {
    const now = Date.now()
    let displayX = 10
    const displayY = CANVAS_HEIGHT - 30

    this.ctx.fillStyle = 'white'
    this.ctx.font = '16px Arial'
    this.ctx.textAlign = 'left'
   // this.ctx.fillText(`Missiles: ${this.player.missileCount}`, displayX, displayY - 20); // Display missile count
    displayX += this.ctx.measureText(`Missiles: ${this.player.missileCount}`).width + 15;


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
        case 'bootKill':
          icon = '🤖' // Bot emoji
          color = 'yellow'
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
    this.ctx.fillText(`Level ${this.currentLevel} Complete!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40)

    this.ctx.font = '24px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('Click to continue to the next level', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20)
  }

  private draw() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    this.player.draw(this.ctx)
    this.player.bullets.forEach((bullet) => bullet.draw(this.ctx))

    if (this.botPlayer) {
      this.botPlayer.draw(this.ctx)
      this.botPlayer.bullets.forEach((bullet) => bullet.draw(this.ctx))
    }

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

    this.mines.forEach((mine) => { // Draw mines
      mine.draw(this.ctx);
    });

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
    } else if (state === 'gameOver') {
      this.callbacks.onGameStateChange(this.gameState)
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    this.resetPlayerBoosts() // Centralized boost reset (only temporary boosts)

    this.player.isFiringHeld = false
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
    if (this.botPlayerActiveTimer) { // Clear bot player timer
      clearTimeout(this.botPlayerActiveTimer)
      this.botPlayerActiveTimer = null
      this.botPlayerActiveEndTime = null
    }
  }
}
