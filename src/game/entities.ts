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
  BOSS_BULLET_DAMAGE, // Import for boss bullet damage
  MISSILE_WIDTH, // Import for missile
  MISSILE_HEIGHT, // Import for missile
  MISSILE_SPEED, // Import for missile
  MISSILE_DAMAGE, // Import for missile
  MISSILE_FIRE_RATE_LIMIT, // Import for missile fire rate
  MISSILE_INITIAL_COUNT, // Import MISSILE_INITIAL_COUNT
  KAMIKAZE_INVADER_WIDTH, // Import for Kamikaze Invader
  KAMIKAZE_INVADER_HEIGHT, // Import for Kamikaze Invader
  KAMIKAZE_INVADER_SPEED, // Import for Kamikaze Invader
  KAMIKAZE_INVADER_HEALTH, // Import for Kamikaze Invader
  KAMIKAZE_INVADER_DAMAGE, // Import for Kamikaze Invader
  DIVING_INVADER_WIDTH, // Import for Diving Invader
  DIVING_INVADER_HEIGHT, // Import for Diving Invader
  DIVING_INVADER_SPEED, // Import for Diving Invader
  DIVING_INVADER_HEALTH, // Import for Diving Invader
  DIVING_INVADER_DAMAGE, // Import for Diving Invader
  DEFAULT_SHIP_SKIN, // Import default ship skin
  SPLIT_INVADER_WIDTH, // Import for Split Invader
  SPLIT_INVADER_HEIGHT, // Import for Split Invader
  SPLIT_INVADER_HEALTH, // Import for Split Invader
  SPLIT_INVADER_SPEED, // Import for Split Invader
  SPLIT_INVADER_FIRE_RATE, // Import for Split Invader fire rate
  SPLIT_INVADER_CHILD_WIDTH, // Import for Split Invader child
  SPLIT_INVADER_CHILD_HEIGHT, // Import for Split Invader child
  SPLIT_INVADER_CHILD_HEALTH, // Import for Split Invader child
  SPLIT_INVADER_CHILD_SPEED, // Import for Split Invader child speed
  SPLIT_INVADER_CHILD_FIRE_RATE, // Import for Split Invader child fire rate
  SPLIT_INVADER_CHILD_COUNT, // Import for Split Invader child count
  MINE_LAYING_INVADER_WIDTH, // Import for Mine-Laying Invader
  MINE_LAYING_INVADER_HEIGHT, // Import for Mine-Laying Invader
  MINE_LAYING_INVADER_HEALTH, // Import for Mine-Laying Invader
  MINE_LAYING_INVADER_SPEED, // Import for Mine-Laying Invader
  MINE_LAYING_INVADER_FIRE_RATE, // Import for Mine-Laying Invader fire rate
  MINE_LAYING_INVADER_MINE_DROP_RATE, // Import for Mine-Laying Invader mine drop rate
  MINE_SIZE, // Import for Mine size
  MINE_DAMAGE, // Import for Mine damage
  MINE_LIFETIME, // Import for Mine lifetime
  UPGRADE_EFFECTS, // Import upgrade effects
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
  hasDoubleShot: boolean // New property for temporary double shot boost
  isFiringHeld: boolean // New property to track if fire button is held
  isInvincible: boolean // New property for invincibility
  baseShotCount: number // Base number of bullets (replaces maxBullets and isLevel4TripleShotActive)
  level: number // Add level property
  missileCount: number // New property for missile count
  lastMissileFireTime: number // New property for missile cooldown
  skin: string // New property for player ship skin
  canFireMissile: boolean // New property to control single missile fire per key press
  fireRateLimit: number // Actual fire rate limit, affected by permanent upgrades

  constructor(x?: number, y?: number, skin: string = DEFAULT_SHIP_SKIN, permanentFireRateLevel: number = 0) {
    this.width = PLAYER_WIDTH
    this.height = PLAYER_HEIGHT
    this.x = x !== undefined ? x : CANVAS_WIDTH / 2 - this.width / 2
    this.y = y !== undefined ? y : CANVAS_HEIGHT - this.height - 20
    this.baseSpeed = PLAYER_SPEED
    this.speed = this.baseSpeed
    this.isMovingLeft = false
    this.isMovingRight = false
    this.bullets = []
    this.lastFireTime = 0
    this.hasDoubleShot = false // Initialize temporary double shot to false
    this.isFiringHeld = false // Initialize isFiringHeld to false
    this.isInvincible = false // Initialize invincibility
    this.baseShotCount = 1 // Initial number of bullets is 1
    this.level = 1 // Initialize level
    this.missileCount = MISSILE_INITIAL_COUNT // Initialize missile count using constant
    this.lastMissileFireTime = 0 // Initialize missile cooldown
    this.skin = skin // Initialize skin
    this.canFireMissile = true // Initialize to true, allows firing on first press

    // Apply permanent fire rate upgrade
    this.fireRateLimit = PLAYER_FIRE_RATE_LIMIT;
    if (permanentFireRateLevel > 0) {
      const multiplier = UPGRADE_EFFECTS.fireRate[permanentFireRateLevel - 1];
      this.fireRateLimit = PLAYER_FIRE_RATE_LIMIT * multiplier;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isInvincible && Math.floor(Date.now() / PLAYER_FLASH_INTERVAL) % 2 === 0) {
      // Flash effect: skip drawing every other interval when invincible
      return
    }

    ctx.save()
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2) // Translate to center for easier drawing

    let mainColor = 'lime'
    let cockpitColor = 'cyan'
    let engineColor = 'orange'
    let outlineColor = 'white'

    switch (this.skin) {
      case 'red_baron':
        mainColor = 'red'
        cockpitColor = 'darkred'
        engineColor = 'orange'
        outlineColor = 'black'
        break
      case 'blue_streak':
        mainColor = 'blue'
        cockpitColor = 'lightblue'
        engineColor = 'cyan'
        outlineColor = 'white'
        break
      case 'gold_finger':
        mainColor = 'gold'
        cockpitColor = 'yellow'
        engineColor = 'orange'
        outlineColor = 'brown'
        break
      case 'dark_knight':
        mainColor = 'darkgray'
        cockpitColor = 'gray'
        engineColor = 'purple'
        outlineColor = 'black'
        break
      case 'space_ranger':
        mainColor = 'green'
        cockpitColor = 'lightgreen'
        engineColor = 'lime'
        outlineColor = 'darkgreen'
        break
      case 'purple_haze':
        mainColor = 'purple'
        cockpitColor = 'magenta'
        engineColor = 'pink'
        outlineColor = 'darkviolet'
        break
      case 'silver_surfer':
        mainColor = 'silver'
        cockpitColor = 'lightgray'
        engineColor = 'white'
        outlineColor = 'gray'
        break
      case 'toxic_avenger':
        mainColor = 'darkgreen'
        cockpitColor = 'lime'
        engineColor = 'yellow'
        outlineColor = 'black'
        break
      case 'phoenix':
        mainColor = 'orange'
        cockpitColor = 'red'
        engineColor = 'gold'
        outlineColor = 'darkorange'
        break
      case 'ice_queen':
        mainColor = 'lightblue'
        cockpitColor = 'white'
        engineColor = 'cyan'
        outlineColor = 'blue'
        break
      case 'lava_lord':
        mainColor = 'darkred'
        cockpitColor = 'orange'
        engineColor = 'red'
        outlineColor = 'black'
        break
      case 'emerald_dream':
        mainColor = 'emerald'
        cockpitColor = 'lightgreen'
        engineColor = 'cyan'
        outlineColor = 'darkgreen'
        break
      case 'ruby_star':
        mainColor = 'crimson'
        cockpitColor = 'red'
        engineColor = 'pink'
        outlineColor = 'darkred'
        break
      case 'sapphire_sky':
        mainColor = 'darkblue'
        cockpitColor = 'skyblue'
        engineColor = 'blue'
        outlineColor = 'navy'
        break
      case 'cosmic_comet':
        mainColor = 'darkviolet'
        cockpitColor = 'purple'
        engineColor = 'magenta'
        outlineColor = 'indigo'
        break
      case 'galaxy_guardian':
        mainColor = 'teal'
        cockpitColor = 'aquamarine'
        engineColor = 'lime'
        outlineColor = 'darkcyan'
        break
      case 'solar_flare':
        mainColor = 'yellow'
        cockpitColor = 'orange'
        engineColor = 'red'
        outlineColor = 'gold'
        break
      case 'nebula_navigator':
        mainColor = 'indigo'
        cockpitColor = 'violet'
        engineColor = 'blue'
        outlineColor = 'darkblue'
        break
      case 'quantum_quill':
        mainColor = 'gray'
        cockpitColor = 'silver'
        engineColor = 'white'
        outlineColor = 'darkgray'
        break
      case 'void_vanguard':
        mainColor = 'black'
        cockpitColor = 'darkgray'
        engineColor = 'red'
        outlineColor = 'white'
        break
      default: // Default skin
        mainColor = 'lime'
        cockpitColor = 'cyan'
        engineColor = 'orange'
        outlineColor = 'white'
        break
    }

    // Main body (triangular shape)
    ctx.fillStyle = mainColor
    ctx.beginPath()
    ctx.moveTo(0, -this.height / 2) // Top point
    ctx.lineTo(this.width / 2, this.height / 2) // Bottom right
    ctx.lineTo(-this.width / 2, this.height / 2) // Bottom left
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = outlineColor
    ctx.lineWidth = 1
    ctx.stroke()

    // Cockpit
    ctx.fillStyle = cockpitColor
    ctx.beginPath()
    ctx.arc(0, -this.height / 4, this.width / 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'darkblue'
    ctx.stroke()

    // Engines (simple rectangles at the back)
    ctx.fillStyle = engineColor
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
    if (this.isFiringHeld && (now - this.lastFireTime > this.fireRateLimit)) { // Use this.fireRateLimit
      this.fireBullet()
      this.lastFireTime = now
    }

    this.bullets.forEach((bullet) => bullet.update())
    this.bullets = this.bullets.filter(
      (bullet) => bullet.y > 0 && !bullet.isOffscreen,
    )
  }

  fireBullet() {
    let bulletsToFire = this.baseShotCount; // Use baseShotCount for initial bullets

    // Double Shot boost: adds 2 bullets on top of the current base
    if (this.hasDoubleShot) {
      bulletsToFire += 2;
    }

    // Determine if spread should be applied
    const applySpread = bulletsToFire > 1;

    // Calculate offsets for spread
    const totalWidth = (bulletsToFire - 1) * (applySpread ? DOUBLE_SHOT_BULLET_OFFSET : 0);
    const startXOffset = -totalWidth / 2;

    for (let i = 0; i < bulletsToFire; i++) {
      const offsetX = startXOffset + i * (applySpread ? DOUBLE_SHOT_BULLET_OFFSET : 0);
      this.bullets.push(
        new Bullet(
          this.x + this.width / 2 - BULLET_WIDTH / 2 + offsetX,
          this.y,
          -PLAYER_BULLET_SPEED,
          'player',
          false, // Regular player bullets are NOT piercing
          1,
        ),
      );
    }
  }

  fireMissile(onMissileCountUpdate: (count: number) => void) {
    const now = Date.now()
    const timeSinceLastMissile = now - this.lastMissileFireTime;

    console.log(`Player.ts: fireMissile called. Missile Count: ${this.missileCount}, canFireMissile: ${this.canFireMissile}, timeSinceLastMissile: ${timeSinceLastMissile}`);

    if (this.missileCount <= 0) {
      console.warn('Player.ts: Missile Fire Attempt: No missiles left!');
      return;
    }
    if (!this.canFireMissile) {
      console.warn('Player.ts: Missile Fire Attempt: Key still held down, waiting for release.');
      return;
    }
    if (timeSinceLastMissile < MISSILE_FIRE_RATE_LIMIT) {
      console.warn(`Player.ts: Missile Fire Attempt: On cooldown. Time left: ${((MISSILE_FIRE_RATE_LIMIT - timeSinceLastMissile) / 1000).toFixed(2)}s`);
      return;
    }

    // If all conditions pass, fire the missile
    this.bullets.push(
      new Missile(
        this.x + this.width / 2 - MISSILE_WIDTH / 2,
        this.y,
        -MISSILE_SPEED,
        'player',
        MISSILE_DAMAGE,
      ),
    )
    this.missileCount--
    this.lastMissileFireTime = now
    this.canFireMissile = false; // Set to false to prevent continuous firing until key is released
    onMissileCountUpdate(this.missileCount) // Update missile count via callback
    console.log(`Player.ts: Missile fired! Remaining: ${this.missileCount}`)
  }
}

export class BotPlayer extends Player {
  constructor(x: number, y: number) {
    super(x, y);
    // Bot specific properties, if any
    this.speed = PLAYER_SPEED * 0.8; // Slightly slower than player
    this.hasDoubleShot = true; // Bots always have double shot for effectiveness
    this.isInvincible = true; // Bots are invincible
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Bot specific drawing (e.g., a different color or simpler shape)
    ctx.fillStyle = 'gray'; // Bot color
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2); // Top point
    ctx.lineTo(this.width / 2, this.height / 2); // Bottom right
    ctx.lineTo(-this.width / 2, this.height / 2); // Bottom left
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bot "eye" or sensor
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(0, -this.height / 4, this.width / 10, 0, Math.PI * 2);
    ctx.fill();

    // Simple thrust animation
    const flameHeight = 3 + Math.random() * 3; // Flickering effect
    ctx.fillStyle = `rgba(255, 100, 0, ${0.5 + Math.random() * 0.2})`; // Orange, flickering opacity
    ctx.beginPath();
    ctx.moveTo(-this.width / 4, this.height / 2 + 5);
    ctx.lineTo(-this.width / 8, this.height / 2 + 5 + flameHeight);
    ctx.lineTo(this.width / 8, this.height / 2 + 5 + flameHeight);
    ctx.lineTo(this.width / 4, this.height / 2 + 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  update(invaders: Invader[]) {
    // Bot AI: Find the closest invader and move towards it
    let closestInvader: Invader | null = null;
    let minDistance = Infinity;

    for (const invader of invaders) {
      if (invader.isAlive) {
        const distance = Math.abs(this.x - invader.x);
        if (distance < minDistance) {
          minDistance = distance;
          closestInvader = invader;
        }
      }
    }

    if (closestInvader) {
      if (this.x < closestInvader.x - this.width / 4 && this.x < CANVAS_WIDTH - this.width) {
        this.x += this.speed;
      } else if (this.x > closestInvader.x + this.width / 4 && this.x > 0) {
        this.x -= this.speed;
      }

      // Fire at a regular interval
      const now = Date.now();
      if (now - this.lastFireTime > PLAYER_FIRE_RATE_LIMIT * 1.5) { // Slightly slower fire rate than player
        this.fireBullet();
        this.lastFireTime = now;
      }
    } else {
      // If no invaders, just move randomly or stay in place
      if (Math.random() < 0.01) { // Small chance to change direction
        this.isMovingLeft = Math.random() < 0.5;
        this.isMovingRight = !this.isMovingLeft;
      }
      if (this.isMovingLeft && this.x > 0) {
        this.x -= this.speed;
      } else if (this.isMovingRight && this.x < CANVAS_WIDTH - this.width) {
        this.x += this.speed;
      } else {
        this.isMovingLeft = false;
        this.isMovingRight = false;
      }
    }

    // Update bot's bullets
    this.bullets.forEach((bullet) => bullet.update());
    this.bullets = this.bullets.filter(
      (bullet) => bullet.y > 0 && !bullet.isOffscreen,
    );
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
  shape: 'square' | 'circle' | 'triangle' | 'diamond' | 'star' // New property for invader shape

  constructor(x: number, y: number, speed: number, fireRate: number, health: number = INVADER_BASE_HEALTH, shape: 'square' | 'circle' | 'triangle' | 'diamond' | 'star' = 'square') {
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
      case 'diamond': // New shape for Diving Invader
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(0, this.height / 2);
        ctx.lineTo(-this.width / 2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'star': // New shape for Split Invader
        ctx.beginPath();
        const outerRadius = this.width / 2;
        const innerRadius = outerRadius / 2;
        const numPoints = 5;
        for (let i = 0; i < numPoints * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / numPoints) * i;
          ctx.lineTo(radius * Math.sin(angle), -radius * Math.cos(angle));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
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
  constructor(x: number, y: number, speed: number, fireRate: number, health: number) {
    super(x, y, speed, fireRate, health, 'square') // Boss is always 'square' for now
    this.width = BOSS_WIDTH
    this.height = BOSS_HEIGHT
    this.maxHealth = health // Ensure maxHealth is set for drawing health bar
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return

    ctx.save()
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2)

    // Main body - large central structure
    ctx.fillStyle = 'darkblue'
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
    ctx.strokeStyle = 'cyan'
    ctx.lineWidth = 2
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height)

    // Top "cockpit" or command center
    ctx.fillStyle = 'gray'
    ctx.beginPath()
    ctx.moveTo(0, -this.height / 2)
    ctx.lineTo(this.width / 4, -this.height / 2 + 15)
    ctx.lineTo(-this.width / 4, -this.height / 2 + 15)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'white'
    ctx.stroke()

    // Glowing core
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(0, 0, this.width / 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'orange'
    ctx.lineWidth = 1
    ctx.stroke()

    // Side wings/cannons
    ctx.fillStyle = 'darkslategray'
    ctx.beginPath()
    ctx.moveTo(-this.width / 2, -this.height / 4)
    ctx.lineTo(-this.width / 2 - 15, -this.height / 4 + 10)
    ctx.lineTo(-this.width / 2 - 15, this.height / 4 - 10)
    ctx.lineTo(-this.width / 2, this.height / 4)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(this.width / 2, -this.height / 4)
    ctx.lineTo(this.width / 2 + 15, -this.height / 4 + 10)
    ctx.lineTo(this.width / 2 + 15, this.height / 4 - 10)
    ctx.lineTo(this.width / 2, this.height / 4)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Engine exhausts (bottom)
    ctx.fillStyle = 'orange'
    ctx.fillRect(-this.width / 3, this.height / 2 - 5, this.width / 6, 10)
    ctx.fillRect(this.width / 6, this.height / 2 - 5, this.width / 6, 10)

    ctx.restore()

    // Health bar for boss
    const healthBarWidth = this.width * (this.health / this.maxHealth)
    ctx.fillStyle = 'red'
    ctx.fillRect(this.x, this.y - 10, healthBarWidth, 5)
    ctx.strokeStyle = 'white'
    ctx.strokeRect(this.x, this.y - 10, this.width, 5)
  }

  shoot() {
    // Boss fires 5 bullets in a spread pattern
    const numBullets = 5;
    const spreadAngle = Math.PI / 6; // Total spread angle
    const startAngle = -spreadAngle / 2;

    for (let i = 0; i < numBullets; i++) {
      const angle = startAngle + (i / (numBullets - 1)) * spreadAngle;
      const bulletSpeedX = BOSS_BULLET_SPEED * Math.sin(angle);
      const bulletSpeedY = BOSS_BULLET_SPEED * Math.cos(angle);

      this.bullets.push(
        new BossBullet(
          this.x + this.width / 2 - BULLET_WIDTH / 2,
          this.y + this.height,
          { x: bulletSpeedX, y: bulletSpeedY }, // Pass as object for custom bullet
          'invader',
          false,
          BOSS_BULLET_DAMAGE,
        ),
      );
    }
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

// New Diving Invader Class
export class DivingInvader extends Invader {
  damage: number
  targetX: number

  constructor(x: number, y: number, targetX: number) {
    super(x, y, DIVING_INVADER_SPEED, 0, DIVING_INVADER_HEALTH, 'diamond') // Diving invader is a 'diamond'
    this.width = DIVING_INVADER_WIDTH
    this.height = DIVING_INVADER_HEIGHT
    this.damage = DIVING_INVADER_DAMAGE
    this.maxHealth = DIVING_INVADER_HEALTH
    this.targetX = targetX // The X coordinate to dive towards
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return

    ctx.save()
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2)

    // Diving Invader specific drawing (e.g., a fast, small, blue diamond)
    ctx.fillStyle = 'deepskyblue'
    ctx.beginPath()
    ctx.moveTo(0, -this.height / 2)
    ctx.lineTo(this.width / 2, 0)
    ctx.lineTo(0, this.height / 2)
    ctx.lineTo(-this.width / 2, 0)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1
    ctx.stroke()

    // Small eye/sensor
    ctx.fillStyle = 'yellow'
    ctx.beginPath()
    ctx.arc(0, 0, this.width / 8, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  update() {
    if (!this.isAlive) return

    // Move towards the targetX horizontally
    if (this.x < this.targetX - this.speed) {
      this.x += this.speed;
    } else if (this.x > this.targetX + this.speed) {
      this.x -= this.speed;
    }

    // Move straight down
    this.y += this.speed;

    if (this.y > CANVAS_HEIGHT) {
      this.isAlive = false; // Remove if offscreen
    }
  }

  // Diving invaders do not move horizontally with the wave or shoot
  moveDown() { /* Do nothing */ }
  shoot() { /* Do nothing */ }
}

// New Split Invader Class
export class SplitInvader extends Invader {
  constructor(x: number, y: number) {
    super(x, y, SPLIT_INVADER_SPEED, SPLIT_INVADER_FIRE_RATE, SPLIT_INVADER_HEALTH, 'star');
    this.width = SPLIT_INVADER_WIDTH;
    this.height = SPLIT_INVADER_HEIGHT;
    this.maxHealth = SPLIT_INVADER_HEALTH;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Split Invader specific drawing (e.g., a green star)
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'lightgreen';
    ctx.lineWidth = 1;

    const outerRadius = this.width / 2;
    const innerRadius = outerRadius / 2;
    const numPoints = 5;

    ctx.beginPath();
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / numPoints) * i;
      ctx.lineTo(radius * Math.sin(angle), -radius * Math.cos(angle));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Small core
    ctx.fillStyle = 'darkgreen';
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Health bar for multi-hit invaders
    if (this.maxHealth > 1) {
      const healthBarWidth = this.width * (this.health / this.maxHealth);
      ctx.fillStyle = 'lime';
      ctx.fillRect(this.x, this.y - 5, healthBarWidth, 3);
      ctx.strokeStyle = 'white';
      ctx.strokeRect(this.x, this.y - 5, this.width, 3);
    }
  }

  // Override hit to handle splitting logic
  hit(damage: number = 1) {
    this.health -= damage;
    if (this.health <= 0) {
      this.isAlive = false;
      // The splitting logic will be handled in Game.ts checkCollisions
    }
  }
}

// New Mine-Laying Invader Class
export class MineLayingInvader extends Invader {
  lastMineDropTime: number;
  mineDropRate: number;

  constructor(x: number, y: number) {
    super(x, y, MINE_LAYING_INVADER_SPEED, MINE_LAYING_INVADER_FIRE_RATE, MINE_LAYING_INVADER_HEALTH, 'square'); // Can be any shape
    this.width = MINE_LAYING_INVADER_WIDTH;
    this.height = MINE_LAYING_INVADER_HEIGHT;
    this.maxHealth = MINE_LAYING_INVADER_HEALTH;
    this.lastMineDropTime = 0;
    this.mineDropRate = MINE_LAYING_INVADER_MINE_DROP_RATE;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Mine-Laying Invader specific drawing (e.g., a bulky, dark invader)
    ctx.fillStyle = 'darkslategray';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Mine dispenser
    ctx.fillStyle = 'black';
    ctx.fillRect(-this.width / 4, this.height / 2 - 5, this.width / 2, 10);
    ctx.strokeStyle = 'darkgray';
    ctx.strokeRect(-this.width / 4, this.height / 2 - 5, this.width / 2, 10);

    // Warning light
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(0, -this.height / 4, this.width / 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Health bar
    if (this.maxHealth > 1) {
      const healthBarWidth = this.width * (this.health / this.maxHealth);
      ctx.fillStyle = 'lightgray';
      ctx.fillRect(this.x, this.y - 5, healthBarWidth, 3);
      ctx.strokeStyle = 'white';
      ctx.strokeRect(this.x, this.y - 5, this.width, 3);
    }
  }

  // Method to lay a mine (called by Game loop)
  layMine(): Mine | null {
    const now = Date.now();
    // Only drop a mine if enough time has passed since the last drop, or if it's the first drop
    if (now - this.lastMineDropTime > (1000 / this.mineDropRate)) { // Convert rate to interval
      this.lastMineDropTime = now;
      return new Mine(this.x + this.width / 2 - MINE_SIZE / 2, this.y + this.height);
    }
    return null;
  }
}

// New Mine Class
export class Mine {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  spawnTime: number;
  isExploded: boolean;
  isOffscreen: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.width = MINE_SIZE;
    this.height = MINE_SIZE;
    this.damage = MINE_DAMAGE;
    this.spawnTime = Date.now();
    this.isExploded = false;
    this.isOffscreen = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isExploded || this.isOffscreen) return;

    const age = Date.now() - this.spawnTime;
    const opacity = 1 - (age / MINE_LIFETIME);

    ctx.save();
    ctx.globalAlpha = opacity;

    // Mine body
    ctx.fillStyle = 'darkgray';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Spikes
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width / 2, this.y - 5);
    ctx.moveTo(this.x + this.width, this.y + this.height / 2);
    ctx.lineTo(this.x + this.width + 5, this.y + this.height / 2);
    ctx.moveTo(this.x + this.width / 2, this.y + this.height);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height + 5);
    ctx.moveTo(this.x, this.y + this.height / 2);
    ctx.lineTo(this.x - 5, this.y + this.height / 2);
    ctx.stroke();

    ctx.restore();
  }

  update() {
    if (Date.now() - this.spawnTime > MINE_LIFETIME) {
      this.isExploded = true; // Mine despawns after lifetime
    }
    if (this.y > CANVAS_HEIGHT) {
      this.isOffscreen = true;
    }
  }
}


export class Bullet {
  x: number
  y: number
  width: number
  height: number
  speed: number | { x: number; y: number } // Can be a number (vertical) or an object (directional)
  type: 'player' | 'invader' | 'bot' // Added 'bot' type
  isOffscreen: boolean
  isPiercing: boolean // New property for piercing bullets
  damage: number // New property for bullet damage

  constructor(x: number, y: number, speed: number | { x: number; y: number }, type: 'player' | 'invader' | 'bot', isPiercing: boolean = false, damage: number = 1) {
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
    ctx.fillStyle = this.type === 'player' ? (this.isPiercing ? 'lime' : 'yellow') : (this.type === 'bot' ? 'lightgray' : 'orange') // Green for piercing, lightgray for bot
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  update() {
    if (typeof this.speed === 'number') {
      this.y += this.speed
    } else {
      this.x += this.speed.x
      this.y += this.speed.y
    }

    if (this.y < 0 || this.y > CANVAS_HEIGHT || this.x < -this.width || this.x > CANVAS_WIDTH) {
      this.isOffscreen = true
    }
  }
}

export class BossBullet extends Bullet {
  constructor(x: number, y: number, speed: { x: number; y: number }, type: 'invader', isPiercing: boolean = false, damage: number = BOSS_BULLET_DAMAGE) {
    super(x, y, speed, type, isPiercing, damage);
    this.width = BULLET_WIDTH * 1.5; // Slightly larger
    this.height = BULLET_HEIGHT * 1.5; // Slightly larger
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'red'; // Boss bullets are distinct red
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'darkred';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export class Missile extends Bullet {
  constructor(x: number, y: number, speed: number, type: 'player' | 'invader' | 'bot', damage: number = MISSILE_DAMAGE) {
    super(x, y, speed, type, true, damage) // Missiles are always piercing
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

  constructor(x: number, y: number, permanentShieldHealthLevel: number = 0) {
    this.x = x
    this.y = y
    this.width = SHIELD_WIDTH
    this.height = SHIELD_HEIGHT
    this.maxHealth = SHIELD_HEALTH + (permanentShieldHealthLevel > 0 ? UPGRADE_EFFECTS.shieldHealth[permanentShieldHealthLevel - 1] : 0);
    this.health = this.maxHealth
    this.isDestroyed = false
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isDestroyed) return

    // Determine color based on health
    let color = ''
    if (this.health === this.maxHealth) {
      color = '#00FF00' // Green (full health)
    } else if (this.health >= this.maxHealth * 0.66) {
      color = '#ADFF2F' // GreenYellow
    } else if (this.health >= this.maxHealth * 0.33) {
      color = '#FFFF00' // Yellow
    } else {
      color = '#FFA500' // Orange (low health)
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

export type BoostType = 'speed' | 'extraLife' | 'shieldRepair' | 'doubleShot' | 'scoreMultiplier' | 'bootKill'

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
      case 'bootKill':
        text = 'Bot' // Changed text to 'Bot'
        textColor = 'yellow'
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
