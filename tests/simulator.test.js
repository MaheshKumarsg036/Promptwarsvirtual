/**
 * Simple Unit Tests for SmartVenue AI Core Logic
 * Run this to validate prediction algorithms.
 */

async function runTests() {
    console.log('🧪 Starting SmartVenue AI Core Tests...');

    // Mock Module Import simulation
    const { VenueSimulator } = await import('../src/core/simulator.js');
    const simulator = new VenueSimulator();

    let passed = 0;
    let failed = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ [PASS] ${message}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${message}`);
            failed++;
        }
    };

    // Test 1: Navigation Logic
    const nav = simulator.getNavigationLogic();
    assert(nav.length === 2, 'Navigation returns 2 paths');
    assert(nav[0].text.includes('Quickest Entry'), 'First path is Quickest Entry');

    // Test 2: Cloud Mode Suppression
    simulator.toggleCloudMode();
    assert(simulator.isCloudMode === true, 'Cloud Mode toggles correctly');
    
    // Test 3: Spike Blocking in Cloud Mode
    simulator.triggerSpike();
    assert(simulator.isSpikeActive === false, 'Spike cannot be triggered in Cloud Mode');

    // Test 4: Density Calculation
    const zones = simulator.zones;
    zones[0].density = 90;
    const avg = Math.round(zones.reduce((a,z) => a + z.density, 0) / zones.length);
    assert(avg >= 0 && avg <= 100, 'Average density is within bounds');

    console.log(`\n🏁 Test Results: ${passed} Passed, ${failed} Failed`);
}

runTests();
