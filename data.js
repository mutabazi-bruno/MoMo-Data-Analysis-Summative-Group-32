let smsData = [];


let typeDistribution = {
    labels: [],
    datasets: [{
        data: [],
        backgroundColor: ['#1e3a8a', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6']
    }]
};

let monthlyData = {
    labels: [],
    datasets: [{
        label: 'Monthly Volume',
        data: [],
        backgroundColor: '#1e3a8a'
    }]
};

let dailyTrends = {
    labels: [],
    datasets: [{
        label: 'Daily Volume',
        data: [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
    }]
};

let agentPerformance = {
    labels: [],
    datasets: [{
        label: 'Agent Performance',
        data: [],
        backgroundColor: '#10b981'
    }]
};

async function loadDataAndStartApp() {
    try {
        console.log("🔄 Loading data from API...");
        
    
        const testResponse = await fetch("http://127.0.0.1:5000/api/test");
        const testData = await testResponse.json();
        console.log("📊 Database status:", testData);
        
        if (!testData.database_exists || testData.transaction_count === 0) {
            console.warn("⚠️ No data in database or database doesn't exist");
            showNoDataMessage();
            return;
        }
        
        // Load actual transaction data

        const response = await fetch("http://127.0.0.1:5000/api/transactions");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        smsData = await response.json();
        console.log("✅ Data loaded successfully:", smsData.length, "transactions");
        
        if (smsData.length === 0) {
            showNoDataMessage();
            return;
        }

    
        computeAndRenderCharts(smsData);
        

        dashboard = new SMSDashboard(smsData);
        
        console.log("🎉 Dashboard initialized successfully!");

    } catch (err) {
        console.error("❌ Failed to load API data:", err);
        showErrorMessage(err.message);
    }
}

function showNoDataMessage() {
    const container = document.querySelector('.container');
    const noDataDiv = document.createElement('div');
    noDataDiv.className = 'no-data-message';
    noDataDiv.innerHTML = `
        <div style="text-align: center; padding: 50px; background: #f8fafc; border-radius: 10px; margin: 20px;">
            <h2>📭 No Data Available</h2>
            <p>No transactions found in the database.</p>
            <p>Please make sure:</p>
            <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                <li>Your SMS XML file has been processed</li>
                <li>The Python script (momo.py) has been run</li>
                <li>The database contains transaction data</li>
            </ul>
        </div>
    `;
    container.appendChild(noDataDiv);
}

function showErrorMessage(error) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div style="text-align: center; padding: 50px; background: #fef2f2; border: 2px solid #fecaca; border-radius: 10px; margin: 20px;">
            <h2>❌ Error Loading Data</h2>
            <p><strong>Error:</strong> ${error}</p>
            <p>Please check:</p>
            <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
                <li>Flask API server is running (python api.py)</li>
                <li>Server is accessible at http://127.0.0.1:5000</li>
                <li>Database file exists and is accessible</li>
                <li>CORS issues (try running from a local server)</li>
            </ul>
        </div>
    `;
    container.appendChild(errorDiv);
}

function computeAndRenderCharts(data) {
    console.log("📈 Computing chart data...");
    
 
    const typeMap = {};
    const monthlyMap = {};
    const dailyMap = {};
    const agentMap = {};

    data.forEach(tx => {
        try {
            const date = new Date(tx.date);
            const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
            const day = date.toISOString().split("T")[0];

            const type = tx.transaction_type || 'Unknown';

            typeMap[type] = (typeMap[type] || 0) + 1;

    
            monthlyMap[month] = (monthlyMap[month] || 0) + (tx.amount || 0);

            dailyMap[day] = (dailyMap[day] || 0) + (tx.amount || 0);

            if (type.toLowerCase().includes("agent") || type.toLowerCase().includes("withdrawal")) {
                const agentName = tx.party || "Unknown Agent";
                agentMap[agentName] = (agentMap[agentName] || 0) + (tx.amount || 0);
            }
        } catch (error) {
            console.warn("Error processing transaction:", tx, error);
        }
    });

    typeDistribution.labels = Object.keys(typeMap);

    typeDistribution.datasets[0].data = Object.values(typeMap);

    monthlyData.labels = Object.keys(monthlyMap).sort();

    monthlyData.datasets[0].data = monthlyData.labels.map(month => monthlyMap[month]);

    const sortedDays = Object.keys(dailyMap).sort().slice(-30);

    dailyTrends.labels = sortedDays;

    dailyTrends.datasets[0].data = sortedDays.map(day => dailyMap[day]);


    const sortedAgents = Object.entries(agentMap)

        .sort(([,a], [,b]) => b - a)

        .slice(0, 10);
    
    agentPerformance.labels = sortedAgents.map(([name]) => name);
    agentPerformance.datasets[0].data = sortedAgents.map(([,amount]) => amount);

    console.log("✅ Chart data computed successfully");
    console.log("Types:", typeDistribution.labels);
    console.log("Months:", monthlyData.labels);
    console.log("Agents:", agentPerformance.labels);
}

document.addEventListener("DOMContentLoaded", function() {

    console.log("🚀 DOM loaded, starting application...");

    loadDataAndStartApp();
});


window.addEventListener("load", function() {
    if (!dashboard) {
        console.log("🔄 Retrying from window load...");
        loadDataAndStartApp();
    }
});