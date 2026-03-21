/**
 * Main Game Controller
 * 
 * ARCHITECTURE PATTERN: Game Loop
 * This is the same pattern used in Unity, Unreal, and all game engines
 * 
 * The game loop consists of:
 * 1. Process Input
 * 2. Update State
 * 3. Render
 * 4. Repeat
 */

class Game {
constructor() {
    this.frameCount = 0; // For diagnostics
    console.clear(); // Clear previous logs
    console.log('═══════════════════════════════════════');
    console.log('🎮 NEW GAME INSTANCE CREATED');
    console.log('═══════════════════════════════════════');
    
    // Get canvas and context
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
    
    // Create player at center of screen
    this.player = new Player(
        this.canvas.width / 2 - 16,
        this.canvas.height / 2 - 16
    );
    
    console.log('Player created at:', this.player.x, this.player.y);
    
    // Create fruits
    this.fruits = [];
    this.soundManager = new SoundManager();
    this.particles = [];
    this.score = 0;
    
    console.log('Initial score:', this.score);
    
    // Celebration system
    this.isCelebrating = false;
    this.celebrationTimer = 0;
    this.celebrationDuration = 30;  // frames (0.5 seconds at 60fps)
    this.nextMilestone = 250;  // First milestone at 250 points
    this.milestones = [250, 500, 750, 1000, 1500, 2000];  // All milestones


    this.generateFruits(105);
    
    console.log('Fruits generated:', this.fruits.length);
    console.log('First 3 fruit positions:', 
        this.fruits.slice(0, 3).map(f => `(${Math.floor(f.x)}, ${Math.floor(f.y)})`).join(', ')
    );
    
    // Input state
    this.keys = {};
    
    // Setup input listeners
    this.setupInput();
    
    // Start the game loop
    this.start();
    
    console.log('═══════════════════════════════════════');
}
    
    /**
     * Setup keyboard input
     * 
     * DEFENSIVE PROGRAMMING: We use both keydown and keyup
     * to ensure state accuracy even if events are missed
     */
    setupInput() {
        window.addEventListener('keydown', (e) => {
            // Prevent arrow keys from scrolling the page
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            //initialize sound on first key press
            if (!this.soundManager.initialized) {
                this.soundManager.init();
                this.soundManager.playStart();
            }


            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
   /**
 * Generate random fruits on the map
 * 
 * @param {number} count - How many fruits to create
 * 
 * ALGORITHM: Random placement with spawn protection
 * - Ensures fruits don't spawn on top of player
 * - Uses minimum distance check (Pythagorean theorem)
 */
/**
 * Select a random rarity based on weighted probabilities
 * 
 * ALGORITHM: Weighted Random Selection
 * - Common: 70%
 * - Rare: 20%
 * - Epic: 8%
 * - Legendary: 2%
 * 
 * HOW IT WORKS:
 * - Generate random number 0-100
 * - Check which range it falls into
 * - Return corresponding rarity
 * 
 * This is the SAME algorithm used in:
 * - Loot boxes
 * - Gacha games
 * - Random drops in RPGs
 */
getRandomRarity() {
    const roll = Math.random() * 100;  // 0-100
    
    if (roll < 60) return 'common';      // 0-60 (60%)
    if (roll < 85) return 'rare';        // 60-85 (25%)
    if (roll < 95) return 'epic';        // 85-95 (10%)
    return 'legendary';                   // 95-100 (5%)
}

generateFruits(count) {
    const fruitTypes = ['apple', 'orange', 'banana', 'grape','watermelon','blueberry','strawberry','kiwi','pineapple','golden'];
    
    // Spawn protection radius around player
    const minDistanceFromPlayer = 80;  // Pixels - adjust this value
    
    for (let i = 0; i < count; i++) {
        let x, y, tooClose;
        let attempts = 0;
        const maxAttempts = 50;  // Prevent infinite loop
        
        // Keep trying until we find a valid position
        do {
            // Random position within canvas bounds
            x = Math.random() * (this.canvas.width - 24);
            y = Math.random() * (this.canvas.height - 24);
            
            // Calculate distance from player center to fruit center
            const playerCenterX = this.player.x + this.player.width / 2;
            const playerCenterY = this.player.y + this.player.height / 2;
            const fruitCenterX = x + 12;  // Fruit width is 24, so center is +12
            const fruitCenterY = y + 12;
            
            const dx = playerCenterX - fruitCenterX;
            const dy = playerCenterY - fruitCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            tooClose = distance < minDistanceFromPlayer;
            attempts++;
            
        } while (tooClose && attempts < maxAttempts);
        
        // If we couldn't find a spot after max attempts, spawn anyway
        // (This shouldn't happen with reasonable settings)
        if (attempts >= maxAttempts) {
            console.warn('Could not find valid spawn position for fruit', i);
        }
        
        // Random fruit type
        const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
        const rarity = this.getRandomRarity();
        this.fruits.push(new Fruit(x, y, type, rarity));
    }
}

/**
 * Spawn particles for visual feedback
 * 
 * @param {number} x - Center X position
 * @param {number} y - Center Y position
 * @param {string} color - Particle color
 * @param {number} count - How many particles to spawn
 * 
 * DESIGN PATTERN: Particle spawning
 * - Creates multiple particles at once
 * - Random velocities create explosion effect
 * - Color matches the source (fruit color)
 */
spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(x, y, color));
    }
}

/**
 * Trigger a milestone celebration
 * 
 * STATE MACHINE: PLAYING → CELEBRATING
 * - Pauses normal gameplay
 * - Spawns celebration effects
 * - Plays celebration sound
 */
triggerCelebration() {
    this.isCelebrating = true;
    this.celebrationTimer = this.celebrationDuration;
    
    console.log(`🎉 MILESTONE REACHED: ${this.nextMilestone} points!`);
    
    // Spawn firework particles from center of screen
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Create 50 colorful particles in random directions
    for (let i = 0; i < 50; i++) {
        // Random rainbow colors for fireworks
        const colors = ['#e53e3e', '#dd6b20', '#ecc94b', '#48bb78', '#4299e1', '#9f7aea', '#f56565'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Create particle with extra velocity for explosion effect
        const particle = new Particle(centerX, centerY, randomColor);
        particle.velocityX *= 2;  // Double the velocity for bigger explosion
        particle.velocityY *= 2;
        particle.velocityY -= 3;  // Extra upward bias
        particle.size *= 1.5;     // Bigger particles
        
        this.particles.push(particle);
    }
    
    // Play celebration sound
    this.soundManager.playCelebration();
    
    // Find next milestone
    for (let milestone of this.milestones) {
        if (milestone > this.score) {
            this.nextMilestone = milestone;
            break;
        }
    }
}

/**
 * Update celebration state
 * 
 * STATE MACHINE: CELEBRATING → PLAYING
 * - Counts down timer
 * - When timer reaches 0, resume gameplay
 */
updateCelebration() {
    if (!this.isCelebrating) return;
    
    this.celebrationTimer--;
    
    if (this.celebrationTimer <= 0) {
        this.isCelebrating = false;
        console.log('🎮 Celebration ended - gameplay resumed');
    }
}

/**
 * Render celebration overlay
 * 
 * VISUAL EFFECTS:
 * - Screen flash (white fade)
 * - Milestone text
 * - Particle explosion (already rendering)
 */
renderCelebration() {
    if (!this.isCelebrating) return;
    
    // Calculate flash intensity (fade from bright to invisible)
    const flashIntensity = this.celebrationTimer / this.celebrationDuration;
    
    // White screen flash
    this.ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.4})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Milestone text
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = '#2d3748';
    this.ctx.lineWidth = 4;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    
    const text = `MILESTONE!`;
    const scoreText = `${this.score} POINTS`;
    
    // Text with outline for visibility
    this.ctx.strokeText(text, this.canvas.width / 2, this.canvas.height / 2 - 30);
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2 - 30);
    
    this.ctx.font = 'bold 32px Arial';
    this.ctx.strokeText(scoreText, this.canvas.width / 2, this.canvas.height / 2 + 20);
    this.ctx.fillText(scoreText, this.canvas.width / 2, this.canvas.height / 2 + 20);
    
    // Reset text alignment
    this.ctx.textAlign = 'left';
}
    
    /**
     * Process input and update player velocity
     * 
     * KEY INSIGHT: We process input separately from the game loop
     * This makes the code easier to test and modify
     */
    processInput() {
        let vx = 0;
        let vy = 0;
        
        if (this.keys['ArrowLeft']) vx -= 1;
        if (this.keys['ArrowRight']) vx += 1;
        if (this.keys['ArrowUp']) vy -= 1;
        if (this.keys['ArrowDown']) vy += 1;
        
        // ENGINEERING DECISION: Normalize diagonal movement
        // Without this, moving diagonally would be 1.4x faster (Pythagorean theorem)
        if (vx !== 0 && vy !== 0) {
            const length = Math.sqrt(vx * vx + vy * vy);
            vx /= length;
            vy /= length;
        }
        
        this.player.setVelocity(vx, vy);
    }
    
    /**
     * Update game state
     * Called every frame
     */
   update() {
    this.frameCount++;
    
    // Log first 5 frames to see what's happening
    if (this.frameCount <= 5) {
        console.log(`Frame ${this.frameCount}: Score = ${this.score}, Player = (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`);
    }
    
    // Update celebration state
    this.updateCelebration();   

        // If celebrating, skip normal updates (pause gameplay)     
     if (this.isCelebrating) {
        // Still update particles so fireworks animate
        this.particles = this.particles.filter(particle => particle.update());
        return;  // Skip player movement and fruit collection
    }

    this.processInput();
    this.player.update(this.canvas.width, this.canvas.height);
    
    // Check fruit collisions
    this.fruits.forEach(fruit => {
        if (!fruit.collected && fruit.checkCollision(this.player)) {
    fruit.collected = true;
    this.score += fruit.points;  // ← Use fruit's points (10, 25, 50, or 100)
    this.soundManager.playCollect(fruit.rarity);  // ← Play sound based on rarity   
    
    const centerX = fruit.x + fruit.width / 2;
    const centerY = fruit.y + fruit.height / 2;
    this.spawnParticles(centerX, centerY, fruit.color, fruit.particleCount);  // ← Use fruit's particle count
    
    // Enhanced logging with rarity
    console.log(`🍎 Collected ${fruit.rarity} ${fruit.type}! +${fruit.points} points. Score: ${this.score}`);
}
    });

    // Check for milestone achievements
    if (this.score >= this.nextMilestone && !this.isCelebrating) {
      this.triggerCelebration();
    }

    //Update particles and remove dead ones
    //filter() keeps only particles that return true from update() (still alive)
    this.particles = this.particles.filter(particle => particle.update());
}
    
    /**
     * Render everything to canvas
     * 
     * PERFORMANCE PATTERN: Clear -> Draw
     * Always clear before redrawing to prevent ghosting
     */
render() {
    // Clear canvas
    this.ctx.fillStyle = '#2d3748';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render fruits
    this.fruits.forEach(fruit => fruit.render(this.ctx));
    
    // Render particles (on top of fruits but below player)
    this.particles.forEach(particle => particle.render(this.ctx));  

    // Render player (player on top of fruits)
    this.player.render(this.ctx);
    
    // Render score and diagnostics
    this.ctx.fillStyle = 'white';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 20, 40);
    
    // DEBUG INFO
    this.ctx.font = '14px Arial';
    this.ctx.fillText(`Player: ${Math.floor(this.player.x)}, ${Math.floor(this.player.y)}`, 20, 70);
    this.ctx.fillText(`Fruits remaining: ${this.fruits.filter(f => !f.collected).length}`, 20, 90);
    this.ctx.fillText(`Velocity: ${this.player.velocityX.toFixed(2)}, ${this.player.velocityY.toFixed(2)}`, 20, 110);

    // Render celebration effects on top of everything
    this.renderCelebration();
}
    /**
     * Main game loop
     * 
     * CRITICAL CONCEPT: requestAnimationFrame
     * - Runs at monitor refresh rate (usually 60fps)
     * - Pauses when tab is not visible (saves battery)
     * - Synchronized with browser repaints (smooth animation)
     * 
     * This is superior to setInterval for animation
     */
    gameLoop() {
        this.update();
        this.render();
        
        // Schedule next frame
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Start the game
     */
    start() {
        console.log('Game started! Use arrow keys to move.');
        this.gameLoop();
    }
}

// Initialize game when page loads
// WHY: We wait for DOMContentLoaded to ensure canvas exists
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded fired - creating game');
    new Game();
});