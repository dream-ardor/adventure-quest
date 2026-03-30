/**
 * Background Element - Static decorative objects
 * 
 * DESIGN PATTERN: Static vs Dynamic Objects
 * - Background elements don't move or interact
 * - No collision detection needed
 * - Just visual decoration
 * 
 * TYPES: tree, cloud, grass, flower, rock
 */

class BackgroundElement {
    constructor(x, y, type, layer = 'background') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.layer = layer;  // 'background' or 'foreground'
        
        // Size varies by type
        this.width = this.getWidthForType();
        this.height = this.getHeightForType();
        
        // Some elements drift (clouds)
        this.driftSpeed = type === 'cloud' ? 0.1 : 0;
        
        // Visual properties
        this.color = this.getColorForType();
        this.opacity = this.getOpacityForType();
    }
    
    /**
     * Get width based on element type
     */
    getWidthForType() {
        const sizes = {
            'tree': 40,
            'cloud': 60,
            'grass': 30,
            'flower': 15,
            'rock': 25
        };
        return sizes[this.type] || 20;
    }
    
    /**
     * Get height based on element type
     */
    getHeightForType() {
        const sizes = {
            'tree': 60,
            'cloud': 30,
            'grass': 20,
            'flower': 15,
            'rock': 20
        };
        return sizes[this.type] || 20;
    }
    
    /**
     * Get color based on element type
     */
    getColorForType() {
        const colors = {
            'tree': '#2d5016',     // Dark green
            'cloud': '#e2e8f0',    // Light gray
            'grass': '#48bb78',    // Green
            'flower': '#f56565',   // Red
            'rock': '#718096'      // Gray
        };
        return colors[this.type] || '#a0aec0';
    }
    
    /**
     * Get opacity based on layer
     */
    getOpacityForType() {
        if (this.layer === 'background') return 0.3;  // Faded background
        if (this.type === 'cloud') return 0.5;        // Semi-transparent clouds
        return 0.6;  // Midground elements
    }
    
    /**
     * Update element (only clouds move)
     */
    update(canvasWidth) {
        if (this.driftSpeed > 0) {
            this.x += this.driftSpeed;
            
            // Wrap around when cloud goes off screen
            if (this.x > canvasWidth + this.width) {
                this.x = -this.width;
            }
        }
    }
    
    /**
     * Render element to canvas
     */
    render(ctx) {
        ctx.globalAlpha = this.opacity;
        
        switch(this.type) {
            case 'tree':
                this.renderTree(ctx);
                break;
            case 'cloud':
                this.renderCloud(ctx);
                break;
            case 'grass':
                this.renderGrass(ctx);
                break;
            case 'flower':
                this.renderFlower(ctx);
                break;
            case 'rock':
                this.renderRock(ctx);
                break;
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    /**
     * Render a simple tree (triangle + rectangle)
     */
    renderTree(ctx) {
        // Trunk
        ctx.fillStyle = '#8b4513';  // Brown
        ctx.fillRect(this.x + this.width / 2 - 5, this.y + 30, 10, 30);
        
        // Foliage (triangle)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);           // Top point
        ctx.lineTo(this.x, this.y + 40);                       // Bottom left
        ctx.lineTo(this.x + this.width, this.y + 40);          // Bottom right
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Render a simple cloud (overlapping circles)
     */
    renderCloud(ctx) {
        ctx.fillStyle = this.color;
        
        // Three overlapping circles
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 12, 0, Math.PI * 2);
        ctx.arc(this.x + 30, this.y + 12, 15, 0, Math.PI * 2);
        ctx.arc(this.x + 45, this.y + 15, 12, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Render grass patch (vertical lines)
     */
    renderGrass(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        
        // Draw several grass blades
        for (let i = 0; i < 5; i++) {
            const bladeX = this.x + (i * 6);
            ctx.beginPath();
            ctx.moveTo(bladeX, this.y + this.height);
            ctx.lineTo(bladeX + 2, this.y);
            ctx.stroke();
        }
    }
    
    /**
     * Render a simple flower (circle + stem)
     */
    renderFlower(ctx) {
        // Stem
        ctx.strokeStyle = '#48bb78';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + 5);
        ctx.stroke();
        
        // Petals (small circle)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 5, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Center (yellow dot)
        ctx.fillStyle = '#ecc94b';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Render a rock (rounded rectangle)
     */
    renderRock(ctx) {
        ctx.fillStyle = this.color;
        
        // Simple oval shape
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            this.height / 2,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2 - 5,
            this.y + this.height / 2 - 5,
            5, 4, 0, 0, Math.PI * 2
        );
        ctx.fill();
    }
}