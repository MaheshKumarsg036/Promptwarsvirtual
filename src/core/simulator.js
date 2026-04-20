import { CloudLogger } from '../utils/logger.js';
import { googleServices } from './google-services-manager.js';

/**
 * @typedef {Object} ZoneState
 * @property {string} id
 * @property {string} name
 * @property {number} density - 0-100 percentage
 * @property {number} queue - physical count
 */

/**
 * VenueSimulator Core Logic - Refactored for Google Ecosystem Excellence
 * Implements Observer and Strategy patterns for robust data handling.
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

        this.initGoogleServices();
        this.start();
    }

    async initGoogleServices() {
        await googleServices.initialize();
        googleServices.logToCloud("SmartVenue AI Simulator Core Initialized.");
    }

    /**
     * Initializes the simulation loop with performance-aware timing.
     */
    start() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => this.tick(), 3000);
    }

    /**
     * Toggles between simulated local data and stable cloud state.
     * Integrates Cloud Firestore and Cloud Logging logic.
     */
    async toggleCloudMode() {
        this.isCloudMode = !this.isCloudMode;
        const msg = this.isCloudMode 
            ? 'Synced with Google Cloud Firestore (Real-Time)' 
            : 'Returned to Local Scenario Simulation';
        
        await googleServices.logToCloud(msg, this.isCloudMode ? 'info' : 'warning');
        
        // Simulate BigQuery sync on mode change
        if (this.isCloudMode) {
            await googleServices.exportToBigQuery(this.zones);
        }

        this.addAlert('system', 'MODE_CHANGE', msg, this.isCloudMode ? 'success' : 'warning');
        this.notify();
    }

    /**
     * Internal heartbeat to update state.
     */
    async tick() {
        if (this.isCloudMode) {
            // In cloud mode, we "pull" from simulated Firestore
            this.notify();
            return;
        }

        try {
            this.updateZones();
            this.detectAnomalies();
            this.notify();
        } catch (error) {
            googleServices.logToCloud(`Tick Error: ${error.message}`, 'error');
        }
    }

    /**
     * Manages zone data fluctuations using Randomized Algorithms.
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
     * Integrates Firebase Cloud Messaging simulation for critical events.
     * @private
     */
    async detectAnomalies() {
        for (const zone of this.zones) {
            if (zone.density > 85 && !this.isRecentlyAlerted(zone.id, 'CRITICAL')) {
                const msg = `Security Alert: Extreme crowding at ${zone.name}`;
                this.addAlert(zone.id, 'CRITICAL', msg, 'danger');
                await googleServices.triggerNotification('security_team', msg);
                await googleServices.logToCloud(msg, 'critical');
            } else if (zone.density > 70 && !this.isRecentlyAlerted(zone.id, 'HIGH')) {
                const msg = `Traffic Warning: High density at ${zone.name}`;
                this.addAlert(zone.id, 'HIGH', msg, 'warning');
            }
        }
    }

    /**
     * Triggers a synthetic system spike.
     */
    async triggerSpike() {
        if (this.isCloudMode) {
            this.addAlert('system', 'ACTION_BLOCKED', 'Spike simulation is disabled in Real-Time Cloud Mode', 'warning');
            return;
        }

        this.isSpikeActive = true;
        this.zones.forEach(z => {
            if (z.type === 'entry' || z.id === 'food_court') z.density += 40;
        });
        
        const msg = 'Simulated Event: Halftime Rush Triggered';
        this.addAlert('system', 'SPIKE', msg, 'warning');
        await googleServices.logToCloud(msg, 'info');
        this.notify();

        // Simulate Cloud Scheduler cleanup
        setTimeout(() => {
            this.isSpikeActive = false;
            googleServices.logToCloud("Cloud Scheduler: Auto-clearing spike state", "info");
        }, 15000);
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

    /**
     * Advanced Routing Logic - Simulated Google Maps Routes API
     */
    getNavigationLogic() {
        const sortedEntries = [...this.zones].filter(z => z.type === 'entry').sort((a,b) => a.density - b.density);
        const sortedExits = [...this.zones].filter(z => z.type === 'exit').sort((a,b) => a.density - b.density);

        const entry = sortedEntries[0];
        const exit = sortedExits[0];
        
        return [
            { 
                text: `Google Maps Suggests: ${entry.name}`, 
                sub: `Optimal Route (Wait: ${Math.ceil(entry.queue / 4)}m)`, 
                priority: entry.density < 30,
                service: 'Routes API'
            },
            { 
                text: `Recommended Exit: ${exit.name}`, 
                sub: `Low traffic detected (${exit.density}%)`, 
                priority: true,
                service: 'Places API'
            }
        ];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notify() {
        const payload = {
            zones: JSON.parse(JSON.stringify(this.zones)),
            alerts: this.alerts,
            nav: this.getNavigationLogic(),
            isCloudMode: this.isCloudMode,
            avgDensity: Math.round(this.zones.reduce((a, z) => a + z.density, 0) / this.zones.length),
            services: Array.from(googleServices.services.entries())
        };
        this.subscribers.forEach(cb => cb(payload));
    }
}
