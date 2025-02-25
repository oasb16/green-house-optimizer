document.addEventListener("DOMContentLoaded", function () {
    const buttonLog = document.getElementById("buttonLog");

    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                console.log("🔄 Updating UI with new values:", data);

                // Update sensor values
                document.getElementById("tempData").textContent = data.temperature + " °C";
                document.getElementById("humData").textContent = data.humidity + " %";
                document.getElementById("lightData").textContent = data.light + " lx";
                document.getElementById("moistureData").textContent = data.soil_moisture + " %";

                // Update charts with timestamped data
                updateChart(temperatureChart, data.timestamp, data.temperature);
                updateChart(humidityChart, data.timestamp, data.humidity);
                updateChart(lightChart, data.timestamp, data.light);
                updateChart(moistureChart, data.timestamp, data.soil_moisture);
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    function sendCommand(command) {
        const timestamp = new Date().toLocaleString();
        fetch("/send-command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: command })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                logButtonPress(command, timestamp);
                console.log(`📤 Sent: ${command} at ${timestamp}`);
            } else {
                console.error("⚠️ Error sending command:", data.error);
            }
        })
        .catch(error => console.error("❌ Error:", error));
    }

    function logButtonPress(button, timestamp) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${button}</td><td>${timestamp}</td>`;
        buttonLog.appendChild(row);
    }

    // Attach event listeners to buttons
    document.getElementById("autoMode").addEventListener("click", () => sendCommand("Auto Mode"));
    document.getElementById("manual").addEventListener("click", () => sendCommand("Manual"));
    document.getElementById("button1").addEventListener("click", () => sendCommand("Button 1"));
    document.getElementById("button2").addEventListener("click", () => sendCommand("Button 2"));
    document.getElementById("button3").addEventListener("click", () => sendCommand("Button 3"));

    // Initialize Charts
    const ctxTemp = document.getElementById("chartTemp").getContext("2d");
    const ctxHum = document.getElementById("chartHum").getContext("2d");
    const ctxLight = document.getElementById("chartLight").getContext("2d");
    const ctxMoisture = document.getElementById("chartMoisture").getContext("2d");

    const temperatureChart = createChart(ctxTemp, "Temperature (°C)", "rgba(231, 76, 60, 0.6)");
    const humidityChart = createChart(ctxHum, "Humidity (%)", "rgba(52, 152, 219, 0.6)");
    const lightChart = createChart(ctxLight, "Light (lx)", "rgba(241, 196, 15, 0.6)");
    const moistureChart = createChart(ctxMoisture, "Soil Moisture (%)", "rgba(46, 204, 113, 0.6)");

    function createChart(ctx, label, color) {
        return new Chart(ctx, {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label: label,
                    backgroundColor: color,
                    borderColor: color,
                    data: [],
                    fill: false
                }]
            },
            options: {
                responsive: true,
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
        chart.update();
    }

    setInterval(fetchData, 2000);
    fetchData();
});
