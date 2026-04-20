/**
 * SmartVenue AI - Backend Simulation Engine
 * Simulates real-time crowd data and events.
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
        this.spikeMode = false;
        this.cloudMode = false;
        this.cloudRunUrl = 'https://smart-venue-api-x72j.a.run.app/api/v1'; // Simulated Cloud Run Endpoint
        
        // Start simulation loop
        this.start();
    }

    start() {
        this.interval = setInterval(() => {
            this.updateData();
        }, 3000);
    }

    toggleCloudMode() {
        this.cloudMode = !this.cloudMode;
        if (this.cloudMode) {
            this.addAlert('system', 'CLOUD_CONNECTED', 'Connected to Google Cloud Run & Firestore', 'success');
        } else {
            this.addAlert('system', 'LOCAL_MODE', 'Switched to Local Simulation Engine', 'warning');
        }
        this.notify(); // Immediate update when mode changes
    }

    async updateData() {
        // If in Cloud Mode, we STOP all random fluctuations (simulations) as per user request.
        if (this.cloudMode) {
            // We just notify the UI that we are in static Real Time mode.
            this.notify();
            return;
        }

        // Normal Simulation Drift Logic
        this.zones.forEach(zone => {
            const variance = this.spikeMode ? 15 : 5;
            const change = (Math.random() * variance * 2) - variance;
            
            zone.density = Math.max(0, Math.min(100, zone.density + change));
            
            if (zone.type === 'entry' || zone.type === 'amenity') {
                zone.queue = Math.max(0, Math.floor(zone.density / 2 + (Math.random() * 5)));
            }

            // Check for alerts
            if (zone.density > 85 && !this.hasRecentAlert(zone.id, 'CROWD_CRITICAL')) {
                this.addAlert(zone.id, 'CROWD_CRITICAL', `Critical crowding at ${zone.name}`, 'danger');
            } else if (zone.density > 70 && !this.hasRecentAlert(zone.id, 'CROWD_HIGH')) {
                this.addAlert(zone.id, 'CROWD_HIGH', `High traffic detected at ${zone.name}`, 'warning');
            }
        });

        this.notify();
    }

    triggerSpike() {
        // Spikes are a simulation feature, so we disable them in Real Time mode.
        if (this.cloudMode) {
            this.addAlert('system', 'SHIELD_ACTIVE', 'Manual Simulation Spike blocked in Real Time Mode', 'warning');
            this.notify();
            return;
        }
        
        this.spikeMode = true;
        this.zones.forEach(z => {
            if (z.type === 'entry') z.density += 30;
            if (z.id === 'food_court') z.density += 40;
        });
        
        this.addAlert('system', 'SPIKE_SIMULATED', 'Halftime Rush Simulation Triggered', 'warning');
        this.updateData();

        setTimeout(() => {
            this.spikeMode = false;
        }, 15000);
    }

    addAlert(zoneId, type, message, severity) {
        const alert = {
            id: Date.now(),
            zoneId,
            type,
            message,
            severity,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        this.alerts.unshift(alert);
        if (this.alerts.length > 10) this.alerts.pop();
    }

    hasRecentAlert(zoneId, type) {
        return this.alerts.some(a => a.zoneId === zoneId && a.type === type && (Date.now() - a.id < 30000));
    }

    getWaitTime(zoneId) {
        const zone = this.zones.find(z => z.id === zoneId);
        if (!zone) return 0;
        return Math.ceil(zone.queue / 4);
    }

    getNavSuggestions() {
        const entries = this.zones.filter(z => z.type === 'entry').sort((a, b) => a.density - b.density);
        const exits = this.zones.filter(z => z.type === 'exit').sort((a, b) => a.density - b.density);
        
        return [
            { 
                text: `Use ${entries[0].name} for entry`, 
                sub: `Wait time: ${this.getWaitTime(entries[0].id)} mins`, 
                recommended: entries[0].density < 30 
            },
            { 
                text: `Redirected Exit: ${exits[0].name}`, 
                sub: `${exits[0].density}% congestion`, 
                recommended: true 
            }
        ];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notify() {
        const data = {
            zones: this.zones,
            alerts: this.alerts,
            nav: this.getNavSuggestions(),
            avgDensity: Math.round(this.zones.reduce((acc, z) => acc + z.density, 0) / this.zones.length),
            cloudMode: this.cloudMode
        };
        this.subscribers.forEach(cb => cb(data));
    }
}
