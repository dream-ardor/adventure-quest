/**
 * Fruit Entity - Collectible Items
 * 
 * DESIGN PATTERN: Same structure as Player
 * - Has position, size, appearance
 * - Can update itself
 * - Can render itself
 * - But NO movement (fruits are stationary)
 */

class Fruit {
    constructor(x, y, type = 'apple') {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.type = type;
        this.collected = false;  // Track if already collected
        
        // Different colors for different fruits
        // KEY INSIGHT: Using an object as a lookup table
        
        this.colors = {
            'apple': '#f56565', // Red
            'golden': '#f6e05e',   // Golden
            'banana': '#ecc94b',   // Yellow
            'grape': '#9f7aea',    // Purple
            'orange': '#ed8936',    // Orange
            'watermelon': '#48bb78', // Green
            'blueberry': '#4299e1', // Blue
            'strawberry': '#ed64a6', // Pink
            'kiwi': '#68d391', // Light Green
            'pineapple': '#d69e2e' // Brownish Yellow
        }

        this.color = this.colors[type] || '#48bb78'; // Default green if unknown type    


    }

/**
     * Check if this fruit collides with player
     * 
     * @param {Player} player - The player object
     * @returns {boolean} - True if colliding
     * 
     * ENGINEERING PRINCIPLE: Collision logic lives in the entity being checked
     * This makes it reusable (we can check collision with enemies, projectiles, etc.)
     */
    checkCollision(player) {
        return this.x < player.x + player.width &&
               this.x + this.width > player.x &&
               this.y < player.y + player.height &&
               this.y + this.height > player.y;
    }
    
    /**
     * Render the fruit
     * Uses simple shapes for now - we'll add sprites later
     */
    render(ctx) {
        if (this.collected) return;  // Don't draw if collected
        
        // Draw fruit as a circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,  // Center X
            this.y + this.height / 2,  // Center Y
            this.width / 2,            // Radius
            0,                         // Start angle
            Math.PI * 2                // End angle (full circle)
        );
        ctx.fill();
        
        // Add a little shine to make it look juicy
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2 - 4,
            this.y + this.height / 2 - 4,
            6,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}
