import { VenueSimulator } from './src/core/simulator.js';
import { Dashboard } from './src/ui/dashboard.js';

/**
 * Application Bootstrapper
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('SmartVenue AI - Initializing Core Services...');
        
        // 1. Initialize State Core
        const simulator = new VenueSimulator();

        // 2. Initialize UI Orchestration
        const dashboard = new Dashboard(simulator);

        // 3. Initial Push
        simulator.notify();

    } catch (e) {
        console.error('Core Initialization Failure:', e);
        // Fallback or Error UI could be triggered here
    }
});
