/**
 * Specialized Renderer for the Venue Heatmap
 */
export class MapRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    /**
     * Renders a single frame of the heatmap.
     * @param {Array} zones - Current state of all zones.
     */
    render(zones) {
        if (!this.ctx) return;
        
        // Efficiency: Use clearRect instead of fillRect for background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw static stadium boundary
        this.drawBoundary();

        zones.forEach(zone => {
            const x = zone.pos.x * this.canvas.width;
            const y = zone.pos.y * this.canvas.height;
            const radius = 35 + (zone.density / 1.5);
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            const color = this.getColor(zone.density);
            
            gradient.addColorStop(0, `rgba(${color}, 0.5)`);
            gradient.addColorStop(0.5, `rgba(${color}, 0.2)`);
            gradient.addColorStop(1, `rgba(${color}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawBoundary() {
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.ellipse(this.canvas.width/2, this.canvas.height/2, this.canvas.width * 0.45, this.canvas.height * 0.45, 0, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    getColor(density) {
        if (density < 40) return '0, 242, 255';   // Cyan (Cool)
        if (density < 75) return '255, 204, 0';   // Yellow (Busy)
        return '255, 51, 102';                   // Red (Critical)
    }
}
