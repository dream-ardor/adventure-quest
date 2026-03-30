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

    //Background elements
    this.backgroundElements = [];
    this.generateBackground();
    
    console.log('Initial score:', this.score);
    
// Game State Machine
// Valid states: PLAYING, CELEBRATING, VICTORY_ANIMATION, VICTORY_SCREEN
this.STATES = {
    PLAYING: 'PLAYING',
    CELEBRATING: 'CELEBRATING',
    VICTORY_ANIMATION: 'VICTORY_ANIMATION',
    VICTORY_SCREEN: 'VICTORY_SCREEN'
};

this.gameState = this.STATES.PLAYING;

// State timers (used by multiple states)
this.stateTimer = 0;

// Milestone system
this.nextMilestone = 250;
this.milestones = [250, 500, 750, 1000, 1500, 2000];

// Configuration constants
this.CELEBRATION_DURATION = 30;  // frames (0.5 seconds at 60fps)
this.VICTORY_ANIMATION_DURATION = 120;  // 2 seconds

    this.generateFruits(105);
    
    console.log('Fruits generated:', this.fruits.length);
    console.log('First 3 fruit positions:', 
        this.fruits.slice(0, 3).map(f => `(${Math.floor(f.x)}, ${Math.floor(f.y)})`).join(', ')
    );
    
    // Input state
    this.keys = {};
    
    // Setup input listeners
    this.setupInput();
    this.setupMouseInput();
    
    // Start the game loop
    this.start();
    
    console.log('═══════════════════════════════════════');
}

/**
 * Transition to a new game state
 * 
 * STATE MACHINE CORE: Single method for all transitions
 * - Logs transitions for debugging
 * - Resets timers automatically
 * - Validates state transitions
 * 
 * @param {string} newState - State to transition to
 */
transitionToState(newState) {
    const oldState = this.gameState;
    
    // Validate state exists
    if (!Object.values(this.STATES).includes(newState)) {
        console.error(`Invalid state: ${newState}`);
        return;
    }
    
    // Log transition
    console.log(`🔄 State: ${oldState} → ${newState}`);
    
    // Execute exit logic for old state
    this.exitState(oldState);
    
    // Change state
    this.gameState = newState;
    
    // Execute entry logic for new state
    this.enterState(newState);
}

/**
 * Entry logic when entering a state
 * 
 * @param {string} state - State being entered
 */
enterState(state) {
    switch(state) {
        case this.STATES.PLAYING:
            // Nothing special on enter
            break;
            
        case this.STATES.CELEBRATING:
            this.stateTimer = this.CELEBRATION_DURATION;
            this.spawnCelebrationParticles();
            this.soundManager.playCelebration();
            console.log(`🎉 MILESTONE REACHED: ${this.nextMilestone} points!`);
            this.updateNextMilestone();
            break;
            
        case this.STATES.VICTORY_ANIMATION:
            this.stateTimer = this.VICTORY_ANIMATION_DURATION;
            this.spawnVictoryParticles();
            this.soundManager.playCelebration();
            console.log('🏆 VICTORY! All fruits collected!');
            break;
            
        case this.STATES.VICTORY_SCREEN:
            console.log('🎊 Showing victory screen');
            break;
    }
}

/**
 * Exit logic when leaving a state
 * 
 * @param {string} state - State being exited
 */
exitState(state) {
    switch(state) {
        case this.STATES.CELEBRATING:
            console.log('🎮 Celebration ended - gameplay resumed');
            break;
            
        case this.STATES.VICTORY_ANIMATION:
            // Animation complete, ready for screen
            break;
            
        case this.STATES.VICTORY_SCREEN:
            // Exiting victory screen (restart)
            break;
    }
}

/**
 * Update next milestone after reaching one
 * Handles both predefined and dynamic milestones
 */
updateNextMilestone() {
    let foundNext = false;
    
    for (let milestone of this.milestones) {
        if (milestone > this.score) {
            this.nextMilestone = milestone;
            foundNext = true;
            break;
        }
    }
    
    // Dynamic milestone generation after 2000
    if (!foundNext) {
        this.nextMilestone = Math.ceil((this.score + 1) / 500) * 500;
        console.log(`✨ Dynamic milestone generated: ${this.nextMilestone}`);
    }
}

/**
 * Spawn celebration particles (milestone reached)
 */
spawnCelebrationParticles() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    for (let i = 0; i < 50; i++) {
        const colors = ['#e53e3e', '#dd6b20', '#ecc94b', '#48bb78', '#4299e1', '#9f7aea', '#f56565'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const particle = new Particle(centerX, centerY, randomColor);
        particle.velocityX *= 2;
        particle.velocityY *= 2;
        particle.velocityY -= 3;
        particle.size *= 1.5;
        
        this.particles.push(particle);
    }
}

/**
 * Spawn victory particles (all fruits collected)
 */
spawnVictoryParticles() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    for (let i = 0; i < 100; i++) {
        const colors = ['#e53e3e', '#dd6b20', '#ecc94b', '#48bb78', '#4299e1', '#9f7aea', '#f56565', '#fbbf24'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const particle = new Particle(centerX, centerY, randomColor);
        particle.velocityX *= 3;
        particle.velocityY *= 3;
        particle.velocityY -= 4;
        particle.size *= 2;
        particle.fadeRate = 0.015;
        
        this.particles.push(particle);
    }
}
    /**
 * Draw text that automatically scales to fit within a maximum width
 * 
 * RESPONSIVE DESIGN: Prevents text overflow
 * - Measures text width at desired font size
 * - Scales down if too wide
 * - Has minimum font size to prevent illegibility
 * 
 * @param {string} text - Text to draw
 * @param {number} x - X position (center)
 * @param {number} y - Y position
 * @param {number} maxWidth - Maximum width allowed (pixels)
 * @param {number} desiredSize - Desired font size (will scale down if needed)
 * @param {string} weight - Font weight ('normal', 'bold')
 * @param {string} color - Fill color
 * @param {boolean} stroke - Whether to add outline
 */
drawResponsiveText(text, x, y, maxWidth, desiredSize, weight = 'bold', color = 'white', stroke = false) {
    // Start with desired font size
    let fontSize = desiredSize;
    this.ctx.font = `${weight} ${fontSize}px Arial`;
    
    // Measure how wide the text would be
    let textWidth = this.ctx.measureText(text).width;
    
    // If text is too wide, scale down the font size
    if (textWidth > maxWidth) {
        // Calculate scaling factor
        fontSize = Math.floor((maxWidth / textWidth) * fontSize);
        
        // Set minimum font size for readability
        const minFontSize = 20;
        fontSize = Math.max(fontSize, minFontSize);
        
        this.ctx.font = `${weight} ${fontSize}px Arial`;
    }
    
    // Draw the text
    if (stroke) {
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = Math.max(2, fontSize / 20);  // Scale stroke with font
        this.ctx.strokeText(text, x, y);
    }
    
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    
    // Return actual font size used (useful for positioning other elements)
    return fontSize;
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

            //Restart game on spacebar if victory screen is showing
            if (e.key === ' ' && this.gameState === this.STATES.VICTORY_SCREEN) {
                e.preventDefault();
                this.restartGame();
            }


            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    /**
 * Setup mouse input for UI interactions
 * 
 * INTERACTION: Click "Play Again" button
 */
setupMouseInput() {
    this.canvas.addEventListener('click', (e) => {
        // Only handle clicks when victory screen is showing
        if (this.gameState !== this.STATES.VICTORY_SCREEN) return;
        
        // Get mouse position relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate button position and size (same as in renderVictoryScreen)
        const buttonWidth = Math.min(300, this.canvas.width * 0.4);
        const buttonHeight = 60;
        const buttonX = this.canvas.width / 2 - buttonWidth / 2;
        const buttonY = this.canvas.height * 0.72;  // 72% down
        
        if (mouseX >= buttonX && 
            mouseX <= buttonX + buttonWidth &&
            mouseY >= buttonY && 
            mouseY <= buttonY + buttonHeight) {
            
            console.log('🖱️ Play Again button clicked');
            this.restartGame();
        }
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
 * Generate background decoration elements
 * 
 * DESIGN: Layered approach
 * - Background layer (faded, behind everything)
 * - Foreground layer (subtle, in front of fruits but behind player)
 * 
 * PLACEMENT: Random but not overlapping with spawn area
 */
generateBackground() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const spawnRadius = 100;  // Keep clear of player spawn
    
    // Background layer elements (trees, grass, rocks)
    const backgroundTypes = [
        { type: 'tree', count: 8 },
        { type: 'grass', count: 12 },
        { type: 'rock', count: 6 }
    ];
    
    backgroundTypes.forEach(({ type, count }) => {
        for (let i = 0; i < count; i++) {
            let x, y, tooClose;
            let attempts = 0;
            
            do {
                x = Math.random() * (this.canvas.width - 60);
                y = Math.random() * (this.canvas.height - 60);
                
                // Check distance from spawn point
                const dx = centerX - x;
                const dy = centerY - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                tooClose = distance < spawnRadius;
                attempts++;
            } while (tooClose && attempts < 20);
            
            if (attempts < 20) {
                this.backgroundElements.push(
                    new BackgroundElement(x, y, type, 'background')
                );
            }
        }
    });
    
    // Clouds (drift across sky)
    for (let i = 0; i < 4; i++) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * (this.canvas.height * 0.3);  // Top 30% of screen
        this.backgroundElements.push(
            new BackgroundElement(x, y, 'cloud', 'background')
        );
    }
    
    // Foreground flowers (few, scattered)
    for (let i = 0; i < 5; i++) {
        let x, y, tooClose;
        let attempts = 0;
        
        do {
            x = Math.random() * (this.canvas.width - 20);
            y = Math.random() * (this.canvas.height - 20);
            
            const dx = centerX - x;
            const dy = centerY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            tooClose = distance < spawnRadius;
            attempts++;
        } while (tooClose && attempts < 20);
        
        if (attempts < 20) {
            this.backgroundElements.push(
                new BackgroundElement(x, y, 'flower', 'foreground')
            );
        }
    }
    
    console.log(`🌳 Background generated: ${this.backgroundElements.length} elements`);
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
 * Render celebration overlay
 * Uses stateTimer for flash intensity
 */
renderCelebration() {
    // Calculate flash intensity based on timer
    const flashIntensity = this.stateTimer / this.CELEBRATION_DURATION;
    
    // White screen flash
    this.ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.4})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Milestone text
    this.ctx.textAlign = 'center';
    
    const maxWidth = this.canvas.width * 0.9;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.drawResponsiveText(
        'MILESTONE!',
        centerX,
        centerY - 30,
        maxWidth,
        48,
        'bold',
        'white',
        true
    );
    
    this.drawResponsiveText(
        `${this.score} POINTS`,
        centerX,
        centerY + 20,
        maxWidth,
        32,
        'bold',
        'white',
        true
    );
    
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
 * Render victory animation overlay
 * Initial 2-second celebration before showing screen
 */
renderVictoryAnimation() {
    // Gold screen flash
    const flashIntensity = this.stateTimer / this.VICTORY_ANIMATION_DURATION;
    this.ctx.fillStyle = `rgba(251, 191, 36, ${flashIntensity * 0.3})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Victory text
    this.ctx.textAlign = 'center';
    
    const maxWidth = this.canvas.width * 0.9;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.drawResponsiveText(
        'VICTORY!',
        centerX,
        centerY,
        maxWidth,
        64,
        'bold',
        'white',
        true
    );
    
    this.ctx.textAlign = 'left';
}

/**
 * Render full victory screen with restart option
 * 
 * RESPONSIVE DESIGN: All text scales based on canvas size
 */
renderVictoryScreen() {
    // Semi-transparent dark overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set text alignment for centered text
    this.ctx.textAlign = 'center';
    
    // Calculate maximum widths based on canvas size
    const maxWidth = this.canvas.width * 0.9;  // 90% of canvas width
    const centerX = this.canvas.width / 2;
    
    // Title - "ALL FRUITS COLLECTED!"
    // Desired size: 72px, but will scale down if needed
    this.drawResponsiveText(
        'ALL FRUITS COLLECTED!',
        centerX,
        this.canvas.height * 0.25,  // 25% down from top
        maxWidth,
        72,
        'bold',
        '#fbbf24',  // Gold
        false
    );
    
    // Final Score
    // Desired size: 48px
    this.drawResponsiveText(
        `Final Score: ${this.score}`,
        centerX,
        this.canvas.height * 0.42,  // 42% down from top
        maxWidth,
        48,
        'bold',
        'white',
        false
    );
    
    // Fruits Collected
    this.drawResponsiveText(
        `Fruits Collected: ${this.fruits.length}`,
        centerX,
        this.canvas.height * 0.53,  // 53% down
        maxWidth,
        24,
        'normal',
        'white',
        false
    );
    
    // Calculate rarity breakdown
    const rarityCount = {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0
    };
    
    this.fruits.forEach(fruit => {
        rarityCount[fruit.rarity]++;
    });
    
    // Rarity stats
    this.drawResponsiveText(
        `Common: ${rarityCount.common} | Rare: ${rarityCount.rare} | Epic: ${rarityCount.epic} | Legendary: ${rarityCount.legendary}`,
        centerX,
        this.canvas.height * 0.62,  // 62% down
        maxWidth,
        20,
        'normal',
        'white',
        false
    );
    
    // Play Again Button
    // Scale button size based on canvas
    const buttonWidth = Math.min(300, this.canvas.width * 0.4);
    const buttonHeight = 60;
    const buttonX = centerX - buttonWidth / 2;
    const buttonY = this.canvas.height * 0.72;  // 72% down
    
    // Draw button
    this.ctx.fillStyle = '#48bb78';  // Green
    this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Button text
    this.drawResponsiveText(
        'PLAY AGAIN',
        centerX,
        buttonY + buttonHeight / 2 + 12,  // Center vertically in button
        buttonWidth * 0.9,
        32,
        'bold',
        'white',
        false
    );
    
    // Instructions
    this.drawResponsiveText(
        'Click button or press SPACE to restart',
        centerX,
        this.canvas.height * 0.87,  // 87% down
        maxWidth,
        18,
        'normal',
        '#a0aec0',
        false
    );
    
    // Reset text alignment
    this.ctx.textAlign = 'left';
}

/**
 * Restart the game
 * Resets all state and regenerates fruits
 */
restartGame() {
    console.log('🔄 Restarting game...');
    
    // Reset game state
    this.score = 0;
    this.nextMilestone = 250;
    this.stateTimer = 0;
    
    // Clear dynamic objects
    this.particles = [];
    this.fruits = [];
    
    // Regenerate fruits
    this.generateFruits(105);
    
    // Reset player position
    this.player.x = this.canvas.width / 2 - 16;
    this.player.y = this.canvas.height / 2 - 16;
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    
    // Transition to PLAYING state
    this.transitionToState(this.STATES.PLAYING);
    
    console.log('✅ Game restarted!');
}

/**
 * Update game state
 * Called every frame
 * 
 * STATE MACHINE: Delegates to state-specific update methods
 */
update() {
    this.frameCount++;
    
    // Always process input (keeps key states fresh)
    this.processInput();
    
    // Always update particles (animations continue in all states)
    this.particles = this.particles.filter(particle => particle.update());
    
    // State-specific updates
    switch(this.gameState) {
        case this.STATES.PLAYING:
            this.updatePlaying();
            break;
            
        case this.STATES.CELEBRATING:
            this.updateCelebrating();
            break;
            
        case this.STATES.VICTORY_ANIMATION:
            this.updateVictoryAnimation();
            break;
            
        case this.STATES.VICTORY_SCREEN:
            this.updateVictoryScreen();
            break;
    }
}

/**
 * Update logic for PLAYING state
 */
updatePlaying() {
    // Update player physics
    this.player.update(this.canvas.width, this.canvas.height);
    
    // Check fruit collisions
    this.fruits.forEach(fruit => {
        if (!fruit.collected && fruit.checkCollision(this.player)) {
            fruit.collected = true;
            this.score += fruit.points;
            this.soundManager.playCollect(fruit.rarity);
            
            const centerX = fruit.x + fruit.width / 2;
            const centerY = fruit.y + fruit.height / 2;
            this.spawnParticles(centerX, centerY, fruit.color, fruit.particleCount);
            
            console.log(`🍎 Collected ${fruit.rarity} ${fruit.type}! +${fruit.points} points. Score: ${this.score}`);
        }
    });

    // Update background elements ()
    this.backgroundElements.forEach(element => element.update(this.canvas.width));  
    
    // Check for milestone
    if (this.score >= this.nextMilestone) {
        this.transitionToState(this.STATES.CELEBRATING);
        return;  // Stop processing this frame
    }
    
    // Check for victory
    const fruitsRemaining = this.fruits.filter(f => !f.collected).length;
    if (fruitsRemaining === 0) {
        this.transitionToState(this.STATES.VICTORY_ANIMATION);
        return;
    }
}

/**
 * Update logic for CELEBRATING state
 */
updateCelebrating() {
    // Freeze player during celebration
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    
    // Countdown timer
    this.stateTimer--;
    
    if (this.stateTimer <= 0) {
        this.transitionToState(this.STATES.PLAYING);
    }
}

/**
 * Update logic for VICTORY_ANIMATION state
 */
updateVictoryAnimation() {
    // Freeze player during victory animation
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    
    // Countdown timer
    this.stateTimer--;
    
    if (this.stateTimer <= 0) {
        this.transitionToState(this.STATES.VICTORY_SCREEN);
    }
}

/**
 * Update logic for VICTORY_SCREEN state
 */
updateVictoryScreen() {
    // Freeze player
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    
    // Waiting for user input (handled in setupInput and setupMouseInput)
}
    
   render() {
    // Clear canvas
    this.ctx.fillStyle = '#2d3748';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Layer 1: Background elements (trees, clouds, grass)
    this.backgroundElements
        .filter(el => el.layer === 'background')
        .forEach(element => element.render(this.ctx));
    
    // Layer 2: Game objects (fruits)
    this.fruits.forEach(fruit => fruit.render(this.ctx));
    
    // Layer 3: Foreground decoration (flowers)
    this.backgroundElements
        .filter(el => el.layer === 'foreground')
        .forEach(element => element.render(this.ctx));
    
    // Layer 4: Particles and player
    this.particles.forEach(particle => particle.render(this.ctx));
    this.player.render(this.ctx);
    
    // Layer 5: UI (always on top)
    this.renderUI();
    
    // Layer 6: State overlays (celebrations, victory)
    switch(this.gameState) {
        case this.STATES.PLAYING:
            break;
        case this.STATES.CELEBRATING:
            this.renderCelebration();
            break;
        case this.STATES.VICTORY_ANIMATION:
            this.renderVictoryAnimation();
            break;
        case this.STATES.VICTORY_SCREEN:
            this.renderVictoryScreen();
            break;
    }
}

/**
 * Render UI elements (score, milestone, fruits remaining)
 */
renderUI() {
    this.ctx.fillStyle = 'white';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 20, 40);
    
    this.ctx.font = '18px Arial';
    this.ctx.fillText(`Next Milestone: ${this.nextMilestone}`, 20, 70);
    this.ctx.fillText(`Fruits: ${this.fruits.filter(f => !f.collected).length}/${this.fruits.length}`, 20, 95);
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