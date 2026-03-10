/**
 * Player Entity
 * 
 * ENGINEERING PRINCIPLES DEMONSTRATED:
 * 1. Encapsulation - All player logic contained in one class
 * 2. Single Responsibility - This class ONLY handles player state and behavior
 * 3. Separation of Concerns - Rendering separated from logic
 */

class Player {
    constructor(x, y) {
        // Position
        this.x = x;
        this.y = y;
        
        // Dimensions
        this.width = 32;
        this.height = 32;
        
        // Movement
        this.speed = 3;
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Appearance
        this.color = '#4299e1'; // Blue
    }
    
    /**
     * Update player state
     * Called every frame by the game loop
     * 
     * KEY CONCEPT: Separation of update logic from rendering
     * This allows us to update at different rates than we render if needed
     */
    update(canvasWidth, canvasHeight) {
        // Apply velocity to position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // ENGINEERING DECISION: Simple boundary checking to keep player on screen
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
        if (this.y + this.height > canvasHeight) this.y = canvasHeight - this.height;
    }
    
    /**
     * Render player to canvas
     * 
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * 
     * KEY CONCEPT: We pass the context as a parameter rather than
     * storing it in the class. This makes the class more flexible
     * and testable (dependency injection principle)
     */
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw a simple face so your daughter knows it's a character
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 8, this.y + 10, 6, 6);   // Left eye
        ctx.fillRect(this.x + 18, this.y + 10, 6, 6);  // Right eye
    }
    
    /**
     * Set player velocity based on input
     * 
     * @param {number} vx - Velocity X
     * @param {number} vy - Velocity Y
     * 
     * KEY CONCEPT: Input is separate from movement
     * This allows for future additions like:
     * - Gamepad support
     * - Touch controls
     * - AI control
     * - Network multiplayer
     */
    setVelocity(vx, vy) {
        this.velocityX = vx * this.speed;
        this.velocityY = vy * this.speed;
    }
}