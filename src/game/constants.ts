export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600

export const PLAYER_WIDTH = 50
export const PLAYER_HEIGHT = 20
export const PLAYER_SPEED = 5
export const PLAYER_BULLET_SPEED = 7
export const BULLET_WIDTH = 4
export const BULLET_HEIGHT = 10
export const PLAYER_FIRE_RATE_LIMIT = 200 // milliseconds between shots
export const PLAYER_INVINCIBILITY_DURATION = 2000 // milliseconds after being hit
export const PLAYER_FLASH_INTERVAL = 100 // milliseconds for player flashing effect

export const INVADER_WIDTH = 40
export const INVADER_HEIGHT = 30
export const INVADER_SPEED = 1 // Base speed
export const INVADER_BULLET_SPEED = 4
export const INVADER_FIRE_RATE = 0.001 // Probability per frame for an invader to shoot
export const INVADER_ROWS = 5 // Base rows
export const INVADER_COLS = 10 // Base cols
export const INVADER_SPACING_X = 60
export const INVADER_SPACING_Y = 40
export const INVADER_START_X = 50
export const INVADER_START_Y = 30
export const INVADER_MOVE_DOWN_AMOUNT = 20 // How much invaders move down when hitting edge
export const INVADER_BASE_HEALTH = 1 // Base health for invaders

export const GAME_LIVES = 3
export const SCORE_PER_INVADER = 10

export const SHIELD_HEALTH = 3 // Number of hits a shield can take
export const SHIELD_WIDTH = 70
export const SHIELD_HEIGHT = 50
export const SHIELD_Y_OFFSET = 100 // Distance from bottom of canvas
export const NUMBER_OF_SHIELDS = 4

export const BOOST_SIZE = 20
export const BOOST_SPEED = 2
export const BOOST_DROP_RATE = 0.15 // 15% chance for an invader to drop a boost
export const BOOST_DURATION = 5000 // 5 seconds for speed or double shot boost
export const DOUBLE_SHOT_BULLET_OFFSET = 10 // Horizontal offset for double shot bullets
export const SCORE_MULTIPLIER_VALUE = 2 // Multiplier for score boost

export const MAX_LEVELS = 15 // Increased to more than 10 levels
export const LEVEL_INVADER_SPEED_MULTIPLIER = 0.15 // Each level increases invader speed by 15% of base
export const LEVEL_INVADER_FIRE_RATE_MULTIPLIER = 0.0003 // Each level increases invader fire rate by this amount
export const LEVEL_INVADER_HEALTH_INCREASE_INTERVAL = 3 // Every X levels, invader health increases

export const EXPLOSION_MAX_FRAMES = 15 // How many frames the explosion lasts
export const EXPLOSION_INITIAL_SIZE = 5
export const EXPLOSION_MAX_SIZE = 40
export const EXPLOSION_COLOR = 'orange' // Color of the explosion

export const KEY_PAUSE = 'p' // Key for pausing/resuming the game

// Boss Invader Constants
export const BOSS_LEVEL_INTERVAL = 5 // Every 5 levels, a boss appears
export const BOSS_WIDTH = 120
export const BOSS_HEIGHT = 80
export const BOSS_HEALTH = 10 // Boss health
export const BOSS_SPEED = 0.5 // Boss moves slower
export const BOSS_FIRE_RATE = 0.005 // Boss fires more frequently
export const BOSS_SCORE_VALUE = 100 // Score for defeating a boss
export const BOSS_BULLET_SPEED = 5
