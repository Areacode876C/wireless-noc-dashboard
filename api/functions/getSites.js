const { app } = require('@azure/functions');

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChance(percent) {
    return Math.random() * 100 < percent;
}

function generateSite(siteId, city, technology) {
    let signalStrength;
    let latency;
    let downloadMbps;
    let droppedCalls;
    let connectedDevices;
    let incident = null;

    switch (technology) {
        case 'LTE':
            signalStrength = randomBetween(-115, -75);
            latency = randomBetween(20, 120);
            downloadMbps = randomBetween(25, 250);
            connectedDevices = randomBetween(500, 2000);
            droppedCalls = randomBetween(0, 15);
            break;

        case '5G NSA':
            signalStrength = randomBetween(-105, -65);
            latency = randomBetween(15, 60);
            downloadMbps = randomBetween(150, 700);
            connectedDevices = randomBetween(700, 2500);
            droppedCalls = randomBetween(0, 8);
            break;

        case '5G SA':
            signalStrength = randomBetween(-95, -60);
            latency = randomBetween(8, 35);
            downloadMbps = randomBetween(300, 1200);
            connectedDevices = randomBetween(800, 3000);
            droppedCalls = randomBetween(0, 5);
            break;
    }

    // Incident simulation
    if (randomChance(15)) {
        const incidents = [
            {
                type: 'RAN',
                description: 'Sector degradation detected'
            },
            {
                type: 'Transport',
                description: 'Backhaul congestion detected'
            },
            {
                type: 'Core',
                description: 'Packet gateway latency elevated'
            },
            {
                type: 'Capacity',
                description: 'High utilization threshold exceeded'
            },
            {
                type: 'Reliability',
                description: 'Intermittent service impact observed'
            }
        ];

        incident = incidents[randomBetween(0, incidents.length - 1)];

        latency += randomBetween(25, 100);
        droppedCalls += randomBetween(3, 15);
        signalStrength -= randomBetween(5, 15);
    }

    let health = 100;

    if (signalStrength < -100) health -= 25;
    if (latency > 80) health -= 20;
    if (downloadMbps < 100) health -= 15;
    if (droppedCalls > 10) health -= 20;
    if (incident) health -= 20;

    health = Math.max(0, Math.min(100, health));

    let status = 'Healthy';

    if (health < 90) status = 'Warning';
    if (health < 70) status = 'Critical';

    return {
        siteId,
        city,
        technology,
        signalStrength,
        latency,
        downloadMbps,
        droppedCalls,
        connectedDevices,
        health,
        status,
        incident,
        lastUpdated: new Date().toISOString()
    };
}

app.http('getSites', {
    methods: ['GET'],
    authLevel: 'anonymous',

    handler: async () => {
        const sites = [
            generateSite('DAL-5G-001', 'Dallas', '5G SA'),
            generateSite('DAL-LTE-003', 'Irving', 'LTE'),
            generateSite('DAL-NSA-002', 'Plano', '5G NSA'),
            generateSite('DAL-LTE-004', 'Frisco', 'LTE'),
            generateSite('DAL-5G-005', 'Arlington', '5G SA'),
            generateSite('DAL-NSA-006', 'Fort Worth', '5G NSA')
        ];

        return {
            jsonBody: {
                dashboardTime: new Date().toISOString(),
                totalSites: sites.length,
                healthySites: sites.filter(s => s.status === 'Healthy').length,
                warningSites: sites.filter(s => s.status === 'Warning').length,
                criticalSites: sites.filter(s => s.status === 'Critical').length,
                sites
            }
        };
    }
});