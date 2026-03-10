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
        
        this.fruits.push(new Fruit(x, y, type));
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
    
    this.processInput();
    this.player.update(this.canvas.width, this.canvas.height);
    
    // Check fruit collisions
    this.fruits.forEach(fruit => {
        if (!fruit.collected && fruit.checkCollision(this.player)) {
            fruit.collected = true;
            this.score += 10;
            this.soundManager.playCollect();

            // Spawn particles at fruit center
            const centerX = fruit.x + fruit.width / 2;
            const centerY = fruit.y + fruit.height / 2;
            this.spawnParticles(centerX, centerY, fruit.color, 12); 
            console.log(`🍎 Frame ${this.frameCount}: Collected ${fruit.type} at (${Math.floor(fruit.x)}, ${Math.floor(fruit.y)})! Score: ${this.score}`);
        }
    });

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