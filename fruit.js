/**
 * Fruit Entity - Collectible Items with Rarity System
 * 
 * DESIGN PATTERN: Composition over Inheritance
 * - Single class handles all fruit types and rarities
 * - Rarity affects points, visuals, and particle effects
 * 
 * RARITY TIERS:
 * - Common (70%): 10 points, normal appearance
 * - Rare (20%): 25 points, glowing effect
 * - Epic (8%): 50 points, sparkle effect  
 * - Legendary (2%): 100 points, rainbow sparkle
 */

class Fruit {
    constructor(x, y, type, rarity = 'common') {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.type = type;
        this.rarity = rarity;
        this.collected = false;
        
        // Base colors for different fruits
        this.baseColors = {
            'apple': '#e53e3e',
            'orange': '#dd6b20',
            'banana': '#ecc94b',
            'grape': '#9f7aea',
            'watermelon': '#48bb78',
            'blueberry': '#4299e1',
            'strawberry': '#f56565',
            'kiwi': '#68d391',
            'pineapple': '#f6ad55',
            'golden': '#fbbf24'
        };
        
        this.baseColor = this.baseColors[type] || '#48bb78';
        
        // Rarity affects color and properties
        this.color = this.getColorForRarity();
        this.points = this.getPointsForRarity();
        this.particleCount = this.getParticleCountForRarity();
        
        // Animation for special fruits
        this.glowPhase = Math.random() * Math.PI * 2;  // Random starting phase
    }
    
    /**
     * Get points based on rarity
     */
    getPointsForRarity() {
        const pointsMap = {
            'common': 10,
            'rare': 25,
            'epic': 50,
            'legendary': 100
        };
        return pointsMap[this.rarity] || 10;
    }
    
    /**
     * Get particle count based on rarity
     */
    getParticleCountForRarity() {
        const particleMap = {
            'common': 12,
            'rare': 20,
            'epic': 30,
            'legendary': 50
        };
        return particleMap[this.rarity] || 12;
    }
    
    /**
     * Get color based on rarity
     * Higher rarities get enhanced colors
     */
    getColorForRarity() {
        switch(this.rarity) {
            case 'common':
                return this.baseColor;
            case 'rare':
                // Brighter version (shift toward white)
                return this.brightenColor(this.baseColor, 0.3);
            case 'epic':
                // Much brighter with purple tint
                return '#a855f7';  // Purple for epic
            case 'legendary':
                // Gold color
                return '#fbbf24';
            default:
                return this.baseColor;
        }
    }
    
    /**
     * Brighten a hex color
     * This is a simplified version - production would use HSL
     */
    brightenColor(hex, percent) {
        // For now, return brighter preset colors
        // Later we can implement proper color math
        return hex;  // Placeholder
    }
    
    /**
     * Check if this fruit collides with player
     */
    checkCollision(player) {
        return this.x < player.x + player.width &&
               this.x + this.width > player.x &&
               this.y < player.y + player.height &&
               this.y + this.height > player.y;
    }
    
    /**
     * Render the fruit with rarity effects
     */
    render(ctx) {
        if (this.collected) return;
        
        // Animate glow for rare+ fruits
        if (this.rarity !== 'common') {
            this.glowPhase += 0.05;
        }
        
        // Draw glow effect for rare+ fruits
        if (this.rarity === 'rare') {
            this.renderGlow(ctx, 1);
        } else if (this.rarity === 'epic') {
            this.renderGlow(ctx, 2);
        } else if (this.rarity === 'legendary') {
            this.renderGlow(ctx, 3);
            this.renderSparkles(ctx);
        }
        
        // Draw main fruit circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Add shine to make it look juicy
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
    
    /**
     * Render glow effect around fruit
     * Intensity: 1 (rare), 2 (epic), 3 (legendary)
     */
    renderGlow(ctx, intensity) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Pulsing glow size
        const glowSize = this.width / 2 + 4 + Math.sin(this.glowPhase) * 3;
        
        // Create radial gradient for glow
        const gradient = ctx.createRadialGradient(
            centerX, centerY, this.width / 2,
            centerX, centerY, glowSize
        );
        
        // Color based on rarity
        let glowColor;
        if (intensity === 1) glowColor = 'rgba(255, 255, 255, 0.3)';      // White glow
        else if (intensity === 2) glowColor = 'rgba(168, 85, 247, 0.4)';  // Purple glow
        else glowColor = 'rgba(251, 191, 36, 0.5)';                       // Gold glow
        
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Render sparkles around legendary fruits
     */
    renderSparkles(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Draw 4 sparkles rotating around fruit
        for (let i = 0; i < 4; i++) {
            const angle = this.glowPhase + (i * Math.PI / 2);
            const distance = 18;
            const sparkleX = centerX + Math.cos(angle) * distance;
            const sparkleY = centerY + Math.sin(angle) * distance;
            
            // Draw sparkle as small plus sign
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            
            // Vertical line
            ctx.beginPath();
            ctx.moveTo(sparkleX, sparkleY - 3);
            ctx.lineTo(sparkleX, sparkleY + 3);
            ctx.stroke();
            
            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(sparkleX - 3, sparkleY);
            ctx.lineTo(sparkleX + 3, sparkleY);
            ctx.stroke();
        }
    }
}