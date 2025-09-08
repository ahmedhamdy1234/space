export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 600
export const PLAYER_WIDTH = 40
export const PLAYER_HEIGHT = 20
export const PLAYER_SPEED = 5
export const PLAYER_BULLET_SPEED = 7
export const INVADER_WIDTH = 36
export const INVADER_HEIGHT = 24
export const INVADER_ROWS = 5
export const INVADER_COLS = 10
export const INVADER_SPACING_X = 40
export const INVADER_SPACING_Y = 40
export const INVADER_START_X = 50
export const INVADER_START_Y = 50
export const INVADER_MOVE_DOWN_AMOUNT = 20
export const INVADER_SPEED = 0.3 // Reduced enemy speed
export const INVADER_FIRE_RATE = 0.0005 // Reduced enemy fire rate
export const INVADER_BULLET_SPEED = 5
export const BULLET_WIDTH = 4
export const BULLET_HEIGHT = 10
export const GAME_LIVES = 3
export const SCORE_PER_INVADER = 100
export const NUMBER_OF_SHIELDS = 3
export const SHIELD_WIDTH = 70
export const SHIELD_HEIGHT = 20
export const SHIELD_Y_OFFSET = 80
export const SHIELD_HEALTH = 3
export const BOOST_SIZE = 20
export const BOOST_SPEED = 2 // Increased boost speed to be faster than enemies and player bullets
export const BOOST_DROP_RATE = 0.2 // Increased to 5% chance
export const BOOST_DURATION = 5000 // 5 seconds
export const MAX_LEVELS = 25 // Increased max levels
export const LEVEL_INVADER_SPEED_MULTIPLIER = 0.1
export const LEVEL_INVADER_FIRE_RATE_MULTIPLIER = 0.001
export const PLAYER_FIRE_RATE_LIMIT = 250 // milliseconds
export const DOUBLE_SHOT_BULLET_OFFSET = 15
export const INVADER_BASE_HEALTH = 1 // Base health for regular invaders
export const LEVEL_INVADER_HEALTH_INCREASE_INTERVAL = 3 // Increase invader health every 3 levels
export const SCORE_MULTIPLIER_VALUE = 2 // Score multiplier value
export const KEY_PAUSE = 'p' // Pause key

// Player Invincibility
export const PLAYER_FLASH_INTERVAL = 100 // Milliseconds for flashing
export const PLAYER_INVINCIBILITY_DURATION = 3000 // Milliseconds

// Explosion
export const EXPLOSION_INITIAL_SIZE = 5
export const EXPLOSION_MAX_SIZE = 30
export const EXPLOSION_MAX_FRAMES = 20
export const EXPLOSION_COLOR = 'rgba(255, 0, 0, 0.7)' // Red with transparency

// Boss
export const BOSS_WIDTH = 80
export const BOSS_HEIGHT = 60
export const BOSS_HEALTH = 100 // Increased boss health significantly
export const BOSS_SPEED = 1.5 // Increased boss speed
export const BOSS_FIRE_RATE = 0.003 // Further decreased
export const BOSS_BULLET_SPEED = 2
export const BOSS_BULLET_DAMAGE = 2 // Boss bullets deal more damage
export const BOSS_SCORE_VALUE = 500 // Score for defeating the boss
export const BOSS_LEVEL_INTERVAL = 3 // Spawn boss every 3 levels

// Missile Properties
export const MISSILE_WIDTH = 8
export const MISSILE_HEIGHT = 20
export const MISSILE_SPEED = 4 // Slower than player bullets
export const MISSILE_DAMAGE = 5 // Higher damage
export const MISSILE_FIRE_RATE_LIMIT = 1000 // 1 second cooldown for missiles
export const MISSILE_INITIAL_COUNT = 2 // Initial missiles (changed for testing)
export const MISSILE_BOSS_REWARD = 5 // Missiles gained from boss kill

// Kamikaze Invader Properties
export const KAMIKAZE_INVADER_WIDTH = 30
export const KAMIKAZE_INVADER_HEIGHT = 30
export const KAMIKAZE_INVADER_SPEED = 3 // Faster than regular invaders
export const KAMIKAZE_INVADER_HEALTH = 1 // Low health, but dangerous on collision
export const KAMIKAZE_INVADER_DAMAGE = 1 // Deals 1 life damage on collision
export const KAMIKAZE_SPAWN_CHANCE = 0.02 // 2% chance per wave to spawn one
export const KAMIKAZE_SPAWN_CHANCE_HIGH_LEVEL = 0.05 // Increased chance for levels 10-25

// Diving Invader Properties (New Feature)
export const DIVING_INVADER_WIDTH = 25
export const DIVING_INVADER_HEIGHT = 25
export const DIVING_INVADER_SPEED = 4 // Fast
export const DIVING_INVADER_HEALTH = 1 // Low health
export const DIVING_INVADER_DAMAGE = 1 // Deals 1 life damage on collision
export const DIVING_INVADER_SPAWN_CHANCE = 0.001 // 0.1% chance per frame to spawn one (less frequent than Kamikaze)
export const DIVING_INVADER_SPAWN_CHANCE_HIGH_LEVEL = 0.002 // Increased chance for levels 10-25

// Split Invader Properties (New Feature)
export const SPLIT_INVADER_WIDTH = 30
export const SPLIT_INVADER_HEIGHT = 20
export const SPLIT_INVADER_HEALTH = 2 // Requires 2 hits to destroy
export const SPLIT_INVADER_SPEED = 0.5
export const SPLIT_INVADER_FIRE_RATE = 0.0008
export const SPLIT_INVADER_CHILD_COUNT = 2 // Splits into 2 smaller invaders
export const SPLIT_INVADER_CHILD_WIDTH = 15
export const SPLIT_INVADER_CHILD_HEIGHT = 10
export const SPLIT_INVADER_CHILD_HEALTH = 1
export const SPLIT_INVADER_CHILD_SPEED = 1
export const SPLIT_INVADER_CHILD_FIRE_RATE = 0.0002
export const SPLIT_INVADER_SPAWN_CHANCE = 0.05 // 5% chance per wave to spawn one
export const SPLIT_INVADER_SPAWN_CHANCE_HIGH_LEVEL = 0.08 // Increased chance for levels 10-25

// Mine-Laying Invader Properties (New Feature)
export const MINE_LAYING_INVADER_WIDTH = 40
export const MINE_LAYING_INVADER_HEIGHT = 30
export const MINE_LAYING_INVADER_HEALTH = 3 // More health
export const MINE_LAYING_INVADER_SPEED = 0.2 // Slower
export const MINE_LAYING_INVADER_FIRE_RATE = 0.0001 // Very low fire rate for bullets
export const MINE_LAYING_INVADER_MINE_DROP_RATE = 0.005 // Chance to drop a mine per frame
export const MINE_LAYING_INVADER_SPAWN_CHANCE = 0.03 // 3% chance per wave to spawn one
export const MINE_LAYING_INVADER_SPAWN_CHANCE_HIGH_LEVEL = 0.06 // Increased chance for levels 10-25

// Mine Properties
export const MINE_SIZE = 15
export const MINE_DAMAGE = 1 // Deals 1 life damage on collision
export const MINE_LIFETIME = 5000 // Mines last for 5 seconds
export const MINE_EXPLOSION_RADIUS = 50 // Radius for visual explosion
export const MINE_EXPLOSION_DAMAGE = 0 // Mines only damage on direct collision, not explosion area

// Boot Kill Boost
export const BOOT_KILL_DURATION = 5000 // 5 seconds

// Player Ship Skins
export const DEFAULT_SHIP_SKIN = 'default'

// Unpredictable Enemy Movement and Advantages (Levels 10-25)
export const UNPREDICTABLE_MOVE_CHANCE = 0.0005 // 0.05% chance per frame for wave direction to randomly flip
export const UNPREDICTABLE_MOVE_DOWN_CHANCE = 0.001 // 0.1% chance per frame for invaders to move down an extra amount
export const INVADER_UNPREDICTABLE_SPEED_MULTIPLIER = 0.7 // 30% speed DECREASE for regular invaders (making them weaker)
export const INVADER_UNPREDICTABLE_FIRE_RATE_MULTIPLIER = 1.5 // 50% fire rate increase for regular invaders
export const INVADER_UNPREDICTABLE_HEALTH_MULTIPLIER = 1.5 // 50% health increase for regular invaders
