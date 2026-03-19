/**
 * Particle - Single particle in a particle system
 * 
 * PHYSICS SIMULATION:
 * - Velocity (speed and direction)
 * - Gravity (downward acceleration)
 * - Life (fades from 1.0 to 0.0)
 * 
 * USAGE: Visual feedback for game events (collecting, explosions, trails)
 */

class Particle {
    /**
     * Create a particle
     * 
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * @param {string} color - Particle color (CSS color)
     */
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        
        // Random velocity in all directions
        // Math.random() - 0.5 gives range [-0.5, 0.5]
        // Multiply by 6 for range [-3, 3]
        this.velocityX = (Math.random() - 0.5) * 12;
        this.velocityY = (Math.random() - 0.5) * 6 - 2;  // Bias upward (subtract 2)
        
        // Particle properties
        this.life = 1.0;  // Full life (will fade to 0)
        this.fadeRate = 0.01;  // How fast it fades (higher = faster)
        this.size = Math.random() * 4 + 2;  // Random size between 2-6 pixels
        this.color = color;
        
        // Physics
        this.gravity = 0.15;  // Downward acceleration per frame
    }
    
    /**
     * Update particle state
     * Called every frame
     * 
     * @returns {boolean} - True if particle is still alive
     */
    update() {
        // Apply velocity to position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Apply gravity (increases downward velocity)
        this.velocityY += this.gravity;
        
        // Fade out
        this.life -= this.fadeRate;
        
        // Return true if still alive
        return this.life > 0;
    }
    
    /**
     * Render particle to canvas
     * 
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * 
     * TECHNIQUE: Uses globalAlpha for transparency
     * - Save previous alpha
     * - Set alpha based on life
     * - Draw particle
     * - Restore alpha
     */
    render(ctx) {
        // Use life as alpha (0.0 = invisible, 1.0 = opaque)
        ctx.globalAlpha = this.life;
        
        // Draw particle as a small square
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Reset alpha for other rendering
        ctx.globalAlpha = 1.0;
    }
}