import { MapRenderer } from './map-renderer.js';
import { safeSetText, sanitize } from '../utils/helpers.js';

/**
 * SmartVenue Dashboard Orchestrator
 */
export class Dashboard {
    constructor(simulator) {
        this.simulator = simulator;
        this.renderer = new MapRenderer('heatmap-canvas');
        this.googleMapEl = document.getElementById('google-map');
        
        this.init();
    }

    init() {
        // Event Listeners
        document.getElementById('trigger-spike').addEventListener('click', () => {
            this.simulator.triggerSpike();
        });

        document.getElementById('toggle-realtime').addEventListener('click', () => {
            this.simulator.toggleCloudMode();
        });

        // Bootstrap Simulator Subscription
        this.simulator.subscribe((data) => this.update(data));
    }

    /**
     * Batch update for the entire UI
     */
    update(data) {
        this.updateStats(data);
        this.updateAlerts(data.alerts);
        this.updateNavigation(data.nav);
        this.updateCloudState(data.isCloudMode);
        this.renderer.render(data.zones);
    }

    updateStats(data) {
        safeSetText('avg-density', `${data.avgDensity}%`);
        
        const list = document.getElementById('wait-times-list');
        // Efficiency: Only reconstruct if necessary or use a more surgical update approach
        list.innerHTML = data.zones
            .filter(z => z.type === 'entry' || z.type === 'amenity')
            .map(z => `
                <div class="stat-item" aria-label="${z.name} wait time ${Math.ceil(z.queue / 4)} minutes">
                    <span>${sanitize(z.name)}</span>
                    <span class="val">${Math.ceil(z.queue / 4)} min</span>
                </div>
            `).join('');
    }

    updateAlerts(alerts) {
        const container = document.getElementById('alerts-list');
        const count = document.getElementById('alert-count');
        
        count.textContent = alerts.length;
        
        if (alerts.length === 0) {
            container.innerHTML = '<div class="empty-state">System secure. No active alerts.</div>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.severity}" role="alert">
                <span class="title">${sanitize(alert.message)}</span>
                <span class="time">${alert.timestamp}</span>
            </div>
        `).join('');
    }

    updateNavigation(nav) {
        const container = document.getElementById('nav-list');
        container.innerHTML = nav.map(item => `
            <div class="nav-item ${item.priority ? 'recommended' : ''}" tabindex="0" role="button">
                <strong>${sanitize(item.text)}</strong>
                <div class="subtitle">${sanitize(item.sub)}</div>
            </div>
        `).join('');
    }

    updateCloudState(isCloudMode) {
        const btn = document.getElementById('toggle-realtime');
        if (isCloudMode) {
            btn.classList.add('active');
            btn.innerHTML = '<span class="btn-icon">☁️</span> Google Cloud Active';
            this.googleMapEl.classList.remove('obscured');
            this.loadMapMock();
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<span class="btn-icon">🌐</span> Real Time Value';
            this.googleMapEl.classList.add('obscured');
        }
    }

    loadMapMock() {
        if (this.googleMapEl.dataset.loaded) return;
        const fakeMapUrl = 'https://maps.googleapis.com/maps/api/staticmap?center=18.9389,72.8258&zoom=17&size=600x600&maptype=satellite&key=AIzaSy_DEMO';
        this.googleMapEl.style.backgroundImage = `url('${fakeMapUrl}')`;
        this.googleMapEl.style.backgroundSize = 'cover';
        this.googleMapEl.style.backgroundPosition = 'center';
        this.googleMapEl.dataset.loaded = "true";
    }
}
