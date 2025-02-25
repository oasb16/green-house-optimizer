document.addEventListener("DOMContentLoaded", function () {
    const maxDataPoints = 20;

    // Initialize datasets
    const tempChart = createChart("tempChart", "Temperature (°C)", "red");
    const humChart = createChart("humChart", "Humidity (%)", "blue");
    const lightChart = createChart("lightChart", "Light (lx)", "yellow");
    const moistureChart = createChart("moistureChart", "Soil Moisture", "green");

    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                console.log("🔄 Updating UI with new values:", data);
                document.getElementById("tempData").textContent = data.temperature + " °C";
                document.getElementById("humData").textContent = data.humidity + " %";
                document.getElementById("lightData").textContent = data.light + " lx";
                document.getElementById("moistureData").textContent = data.soil_moisture + " %";

                updateChart(tempChart, data.timestamp, data.temperature);
                updateChart(humChart, data.timestamp, data.humidity);
                updateChart(lightChart, data.timestamp, data.light);
                updateChart(moistureChart, data.timestamp, data.soil_moisture);
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    function sendCommand(button) {
        fetch("/send-command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ button: button })
        })
        .then(response => response.json())
        .then(data => {
            const state = data.message.state;
            const timestamp = new Date().toLocaleString();
            const logTable = document.getElementById("buttonLog");
            const row = logTable.insertRow();
            row.insertCell(0).textContent = button;
            row.insertCell(1).textContent = state;
            row.insertCell(2).textContent = timestamp;
        })
        .catch(error => console.error("Error:", error));
    }

    document.getElementById("autoMode").addEventListener("click", () => sendCommand("Auto Mode"));
    document.getElementById("manual").addEventListener("click", () => sendCommand("Manual"));
    document.getElementById("button1").addEventListener("click", () => sendCommand("Button 1"));
    document.getElementById("button2").addEventListener("click", () => sendCommand("Button 2"));
    document.getElementById("button3").addEventListener("click", () => sendCommand("Button 3"));

    setInterval(fetchData, 2000);
    fetchData();

    function createChart(canvasId, label, color) {
        const ctx = document.getElementById(canvasId).getContext("2d");
        return new Chart(ctx, {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label: label,
                    borderColor: color,
                    backgroundColor: color,
                    fill: false,
                    data: []
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { type: "time", time: { unit: "minute" } },
                    y: { beginAtZero: true }
                }
            }
        });
    }

    function updateChart(chart, timestamp, value) {
        chart.data.labels.push(timestamp);
        chart.data.datasets[0].data.push(value);

        if (chart.data.labels.length > maxDataPoints) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update();
    }
});
