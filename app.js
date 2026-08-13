let networkData = [];

const API_URL =
    "https://wireless-noc-dashboard-epgfguawfddyb7am.centralus-01.azurewebsites.net/api/getSites";

function calculateHealth(site) {
    let score = 100;

    if (site.signalStrength < -85) score -= 15;
    if (site.signalStrength < -100) score -= 20;

    if (site.latency > 60) score -= 15;
    if (site.latency > 120) score -= 20;

    if (site.droppedCalls > 4) score -= 15;
    if (site.droppedCalls > 10) score -= 20;

    if (site.downloadMbps < 100) score -= 10;

    return Math.max(0, score);
}

function determineStatus(score) {
    if (score >= 85) return "Healthy";
    if (score >= 60) return "Degraded";
    return "Critical";
}

function identifyIssueDomain(site) {
    const poorSignal = site.signalStrength < -100;
    const highLatency = site.latency > 120;
    const lowThroughput = site.downloadMbps < 100;
    const highDrops = site.droppedCalls > 10;

    if (poorSignal && highDrops) {
        return {
            domain: "Radio Access Network",
            issue: "Poor coverage or radio-performance condition",
            recommendation:
                "Review radio KPIs, coverage conditions, interference indicators, and antenna configuration."
        };
    }

    if (highLatency && !poorSignal) {
        return {
            domain: "Transport or Core",
            issue: "Elevated end-to-end latency",
            recommendation:
                "Review transport utilization, packet delay, routing, and upstream processing metrics."
        };
    }

    if (lowThroughput && site.connectedDevices > 1200) {
        return {
            domain: "Capacity",
            issue: "Possible congestion during elevated utilization",
            recommendation:
                "Review traffic demand, resource utilization, scheduling, and capacity trends."
        };
    }

    if (highDrops) {
        return {
            domain: "Service Reliability",
            issue: "Elevated simulated dropped-call count",
            recommendation:
                "Correlate call failures with coverage, mobility, interference, and transport KPIs."
        };
    }

    return {
        domain: "No Major Issue Identified",
        issue: "Site KPIs are within this demo's expected range",
        recommendation:
            "Continue monitoring KPI trends and compare against established baselines."
    };
}

function formatSignal(signalStrength) {
    if (signalStrength >= -75) return "Strong";
    if (signalStrength >= -95) return "Moderate";
    return "Weak";
}

function createSiteCard(site) {
    const score = calculateHealth(site);
    const status = determineStatus(score);
    const analysis = identifyIssueDomain(site);

    return `
        <article class="site-card ${status.toLowerCase()}">
            <div class="site-heading">
                <div>
                    <p class="site-location">${site.city}</p>
                    <h3>${site.siteId}</h3>
                </div>

                <span class="status ${status.toLowerCase()}">
                    ${status}
                </span>
            </div>

            <div class="technology-row">
                <span class="technology-badge">
                    ${site.technology}
                </span>

                <span class="health-score">
                    Health Score: ${score}
                </span>
            </div>

            <div class="kpi-grid">
                <div>
                    <span>Signal</span>
                    <strong>${site.signalStrength} dBm</strong>
                    <small>${formatSignal(site.signalStrength)}</small>
                </div>

                <div>
                    <span>Latency</span>
                    <strong>${site.latency} ms</strong>
                </div>

                <div>
                    <span>Download</span>
                    <strong>${site.downloadMbps} Mbps</strong>
                </div>

                <div>
                    <span>Dropped Calls</span>
                    <strong>${site.droppedCalls}</strong>
                </div>

                <div>
                    <span>Connected Devices</span>
                    <strong>${site.connectedDevices}</strong>
                </div>
            </div>

            <div class="analysis-panel">
                <p>
                    <strong>Likely Domain:</strong>
                    ${analysis.domain}
                </p>

                <p>
                    <strong>Observation:</strong>
                    ${analysis.issue}
                </p>

                <p>
                    <strong>Recommended Action:</strong>
                    ${analysis.recommendation}
                </p>
            </div>
        </article>
    `;
}

function updateSummary(data) {
    const analyzedSites = data.map(site => {
        const healthScore = calculateHealth(site);

        return {
            ...site,
            healthScore,
            status: determineStatus(healthScore)
        };
    });

    const healthy =
        analyzedSites.filter(site => site.status === "Healthy").length;

    const degraded =
        analyzedSites.filter(site => site.status === "Degraded").length;

    const critical =
        analyzedSites.filter(site => site.status === "Critical").length;

    const averageLatency = Math.round(
        analyzedSites.reduce(
            (total, site) => total + site.latency,
            0
        ) / analyzedSites.length
    );

    document.getElementById("total-sites").textContent =
        analyzedSites.length;

    document.getElementById("healthy-sites").textContent =
        healthy;

    document.getElementById("degraded-sites").textContent =
        degraded;

    document.getElementById("critical-sites").textContent =
        critical;

    document.getElementById("average-latency").textContent =
        averageLatency;
}

function displaySites(filter = "All") {
    const filteredData = networkData.filter(site => {
        const status =
            determineStatus(
                calculateHealth(site)
            );

        return (
            filter === "All" ||
            status === filter
        );
    });

    document.getElementById("site-grid").innerHTML =
        filteredData.map(createSiteCard).join("");
}

async function loadSites() {
    try {
        const response = await fetch(API_URL);

        const data = await response.json();

        networkData = Array.isArray(data)
            ? data
            : data.sites;

        updateSummary(networkData);

        const currentFilter =
            document.getElementById("status-filter").value;

        displaySites(currentFilter);

        console.log(
            `Dashboard refreshed: ${new Date().toLocaleTimeString()}`
        );
    } catch (error) {
        console.error(
            "Failed to load site data:",
            error
        );
    }
}

document
    .getElementById("status-filter")
    .addEventListener("change", event => {
        displaySites(event.target.value);
    });

loadSites();

setInterval(loadSites, 30000);