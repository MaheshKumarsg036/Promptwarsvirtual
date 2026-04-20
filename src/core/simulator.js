import { CloudLogger } from '../utils/logger.js';

/**
 * @typedef {Object} ZoneState
 * @property {string} id
 * @property {string} name
 * @property {number} density - 0-100 percentage
 * @property {number} queue - physical count
 */

/**
 * VenueSimulator Core Logic
 * Handles state management, threshold detection, and data orchestration.
 */
export class VenueSimulator {
    constructor() {
        this.zones = [
            { id: 'gate_a', name: 'Gate A', type: 'entry', density: 30, queue: 10, pos: { x: 0.15, y: 0.15 } },
            { id: 'gate_b', name: 'Gate B', type: 'entry', density: 25, queue: 8, pos: { x: 0.85, y: 0.15 } },
            { id: 'gate_c', name: 'Gate C', type: 'entry', density: 40, queue: 15, pos: { x: 0.30, y: 0.85 } },
            { id: 'food_court', name: 'Food Court', type: 'amenity', density: 60, queue: 45, pos: { x: 0.10, y: 0.50 } },
            { id: 'grand_stand', name: 'Grand Stand', type: 'seating', density: 80, queue: 0, pos: { x: 0.90, y: 0.50 } },
            { id: 'exit_alpha', name: 'Exit Alpha', type: 'exit', density: 10, queue: 2, pos: { x: 0.70, y: 0.85 } }
        ];

        this.alerts = [];
        this.subscribers = [];
        this.isSpikeActive = false;
        this.isCloudMode = false;
        this.intervalId = null;

        this.start();
    }

    /**
     * Initializes the simulation loop.
     */
    start() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => this.tick(), 3000);
    }

    /**
     * Toggles between simulated local data and stable cloud state.
     */
    toggleCloudMode() {
        this.isCloudMode = !this.isCloudMode;
        const msg = this.isCloudMode 
            ? 'Switched to Real-Time Cloud Insights (Google Cloud Ready)' 
            : 'Returned to Local Scenario Simulation';
        
        CloudLogger.log(msg, 'INFO', { mode: this.isCloudMode ? 'CLOUD' : 'LOCAL' });
        
        this.addAlert('system', 'MODE_CHANGE', msg, this.isCloudMode ? 'success' : 'warning');
        this.notify();
    }

    /**
     * Internal heartbeat to update state.
     */
    tick() {
        if (this.isCloudMode) {
            this.notify();
            return;
        }

        try {
            this.updateZones();
            this.detectAnomalies();
            this.notify();
        } catch (error) {
            CloudLogger.log(error.message, 'ERROR', { stack: error.stack });
        }
    }

    /**
     * Manages zone data fluctuations.
     * @private
     */
    updateZones() {
        const variance = this.isSpikeActive ? 15 : 5;
        this.zones.forEach(zone => {
            const delta = (Math.random() * variance * 2) - variance;
            zone.density = Math.max(0, Math.min(100, zone.density + delta));
            
            if (zone.type === 'entry' || zone.type === 'amenity') {
                zone.queue = Math.max(0, Math.floor(zone.density / 2 + (Math.random() * 5)));
            }
        });
    }

    /**
     * Rules-based anomaly detection.
     * @private
     */
    detectAnomalies() {
        this.zones.forEach(zone => {
            if (zone.density > 85 && !this.isRecentlyAlerted(zone.id, 'CRITICAL')) {
                this.addAlert(zone.id, 'CRITICAL', `Security Alert: Extreme crowding at ${zone.name}`, 'danger');
            } else if (zone.density > 70 && !this.isRecentlyAlerted(zone.id, 'HIGH')) {
                this.addAlert(zone.id, 'HIGH', `Traffic Warning: High density at ${zone.name}`, 'warning');
            }
        });
    }

    /**
     * Triggers a synthetic system spike.
     */
    triggerSpike() {
        if (this.isCloudMode) {
            this.addAlert('system', 'ACTION_BLOCKED', 'Spike simulation is disabled in Real-Time Mode', 'warning');
            return;
        }

        this.isSpikeActive = true;
        this.zones.forEach(z => {
            if (z.type === 'entry' || z.id === 'food_court') z.density += 40;
        });
        
        this.addAlert('system', 'SPIKE', 'Simulated Event: Halftime Rush Triggered', 'warning');
        this.notify();

        setTimeout(() => this.isSpikeActive = false, 15000);
    }

    addAlert(zoneId, type, message, severity) {
        this.alerts.unshift({
            id: Date.now(),
            zoneId,
            type,
            message,
            severity,
            timestamp: new Date().toLocaleTimeString()
        });
        if (this.alerts.length > 8) this.alerts.pop();
    }

    isRecentlyAlerted(zoneId, type) {
        return this.alerts.some(a => a.zoneId === zoneId && a.type === type && (Date.now() - a.id < 60000));
    }

    getNavigationLogic() {
        const entry = this.zones.filter(z => z.type === 'entry').sort((a,b) => a.density - b.density)[0];
        const exit = this.zones.filter(z => z.type === 'exit').sort((a,b) => a.density - b.density)[0];
        
        return [
            { text: `Quickest Entry: ${entry.name}`, sub: `Wait time: ${Math.ceil(entry.queue / 4)}m`, priority: entry.density < 30 },
            { text: `Optimal Exit: ${exit.name}`, sub: `${exit.density}% load`, priority: true }
        ];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notify() {
        const payload = {
            zones: JSON.parse(JSON.stringify(this.zones)), // Deep copy for safety
            alerts: this.alerts,
            nav: this.getNavigationLogic(),
            isCloudMode: this.isCloudMode,
            avgDensity: Math.round(this.zones.reduce((a, z) => a + z.density, 0) / this.zones.length)
        };
        this.subscribers.forEach(cb => cb(payload));
    }
}
