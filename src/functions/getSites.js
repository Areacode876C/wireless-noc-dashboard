const { app } = require('@azure/functions');

app.http('getSites', {
    methods: ['GET'],
    authLevel: 'anonymous',

    handler: async () => {

        return {
            jsonBody: [
                {
                    siteId: "DAL-5G-001",
                    city: "Dallas",
                    technology: "5G SA",
                    signalStrength: -68,
                    latency: 22,
                    downloadMbps: 760,
                    droppedCalls: 1,
                    connectedDevices: 842
                },
                {
                    siteId: "DAL-LTE-003",
                    city: "Irving",
                    technology: "LTE",
                    signalStrength: -108,
                    latency: 165,
                    downloadMbps: 42,
                    droppedCalls: 14,
                    connectedDevices: 1395
                }
            ]
        };
    }
});
``