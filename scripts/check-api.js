// scripts/check-api.js
/**
 * API Health Check Script
 * Verifies that all endpoints are accessible
 */

const STRAPI_URL = "http://localhost:1337/api";

async function checkEndpoint(endpoint) {
    try {
        const response = await fetch(`${STRAPI_URL}/${endpoint}`);
        const status = response.status;
        const data = await response.json();

        if (response.ok) {
            console.log(`✓ ${endpoint.padEnd(30)} [${status}] OK`);
            return true;
        } else {
            console.log(`✗ ${endpoint.padEnd(30)} [${status}] Error: ${data.error?.message || "Unknown error"}`);
            return false;
        }
    } catch (error) {
        console.log(`✗ ${endpoint.padEnd(30)} Connection failed: ${error.message}`);
        return false;
    }
}

async function runHealthCheck() {
    console.log("🔍 Strapi API Health Check\n");
    console.log(`Testing: ${STRAPI_URL}\n`);

    const endpoints = [
        "news",
        "categories",
        "sources",
    ];

    const results = {};

    for (const endpoint of endpoints) {
        results[endpoint] = await checkEndpoint(endpoint);
    }

    console.log("\n📊 Summary:");
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    console.log(`${passed}/${total} endpoints accessible\n`);

    if (passed === total) {
        console.log("✅ All systems operational!");
    } else {
        console.log("❌ Some endpoints are down. Check Strapi server status.");
    }
}

runHealthCheck().catch(console.error);
