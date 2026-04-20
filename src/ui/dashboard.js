import { MapRenderer } from './map-renderer.js';
import { safeSetText, sanitize } from '../utils/helpers.js';
import { googleServices } from '../core/google-services-manager.js';

/**
 * SmartVenue Dashboard Orchestrator
 * High-performance UI management with accessibility focus.
 */
export class Dashboard {
    constructor(simulator) {
        this.simulator = simulator;
        this.renderer = new MapRenderer('heatmap-canvas');
        this.googleMapEl = document.getElementById('google-map');
        this.servicesInjected = false;
        
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
     * Batch update for the entire UI using virtual-dom-like efficiency
     */
    update(data) {
        this.updateStats(data);
        this.updateAlerts(data.alerts);
        this.updateNavigation(data.nav);
        this.updateCloudState(data.isCloudMode);
        this.updateGoogleEcosystem(data.services);
        this.updateAIInsights(data);
        this.renderer.render(data.zones);
    }

    updateStats(data) {
        safeSetText('avg-density', `${data.avgDensity}%`);
        
        const list = document.getElementById('wait-times-list');
        const fragment = document.createDocumentFragment();
        
        data.zones
            .filter(z => z.type === 'entry' || z.type === 'amenity')
            .forEach(z => {
                const div = document.createElement('div');
                div.className = 'stat-item';
                div.setAttribute('aria-label', `${z.name} wait time ${Math.ceil(z.queue / 4)} minutes`);
                div.innerHTML = `<span>${sanitize(z.name)}</span><span class="val">${Math.ceil(z.queue / 4)} min</span>`;
                fragment.appendChild(div);
            });
        
        list.innerHTML = '';
        list.appendChild(fragment);
    }

    updateAlerts(alerts) {
        const container = document.getElementById('alerts-list');
        const count = document.getElementById('alert-count');
        
        count.textContent = alerts.length;
        
        if (alerts.length === 0) {
            container.innerHTML = '<div class="empty-state">Secure. No active alerts.</div>';
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
                ${item.service ? `<span class="service-tag">${item.service}</span>` : ''}
            </div>
        `).join('');
    }

    updateGoogleEcosystem(services) {
        if (this.servicesInjected) return; // Only render list once for efficiency
        
        const container = document.getElementById('google-services-list');
        if (!container) return;

        container.innerHTML = services.map(([key, service]) => `
            <div class="google-service-pill" title="${service.name}">
                <span class="dot-active"></span>
                <span class="name">${key.toUpperCase()}</span>
            </div>
        `).join('');
        
        this.servicesInjected = true;
    }

    updateAIInsights(data) {
        const container = document.getElementById('ai-prediction-container');
        if (data.isCloudMode) {
            container.innerHTML = `
                <p class="prediction-text">Vertex AI suggests redirecting Gate B traffic to <strong>Gate A</strong>. Potential bottleneck detected in 10 mins.</p>
                <div class="confidence-bar" aria-label="94% confidence level">
                    <div class="fill" style="width: 94%;"></div>
                    <span class="label">94% Confidence</span>
                </div>
            `;
        }
    }

    updateCloudState(isCloudMode) {
        const btn = document.getElementById('toggle-realtime');
        const statusText = document.getElementById('system-status-text');
        
        if (isCloudMode) {
            btn.classList.add('active');
            btn.innerHTML = '<span class="btn-icon">☁️</span> Cloud Insights Active';
            statusText.textContent = "Google Cloud Real-Time Active";
            this.googleMapEl.classList.remove('obscured');
            this.loadMapMock();
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<span class="btn-icon">🌐</span> Real-Time Cloud Mode';
            statusText.textContent = "Live Simulation Mode";
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
