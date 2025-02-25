document.addEventListener("DOMContentLoaded", function () {
    const buttonStateLog = document.getElementById("buttonStateLog");
    const sensorData = {
        temperature: [],
        humidity: [],
        light: [],
        soil_moisture: [],
        timestamps: []
    };

    // Initialize charts
    const ctxTemp = document.getElementById("chartTemp").getContext("2d");
    const ctxHum = document.getElementById("chartHum").getContext("2d");
    const ctxLight = document.getElementById("chartLight").getContext("2d");
    const ctxMoisture = document.getElementById("chartMoisture").getContext("2d");

    // Ensure Chart.js uses moment adapter for time formatting
    Chart.register(window.ChartjsAdapterMoment);

    const chartConfig = (ctx, label, color) => new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: color,
                borderWidth: 2,
                fill: false,
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

    const tempChart = chartConfig(ctxTemp, "Temperature (°C)", "red");
    const humChart = chartConfig(ctxHum, "Humidity (%)", "blue");
    const lightChart = chartConfig(ctxLight, "Light (lx)", "yellow");
    const moistureChart = chartConfig(ctxMoisture, "Soil Moisture", "green");

    function updateCharts() {
        tempChart.data.labels = sensorData.timestamps;
        tempChart.data.datasets[0].data = sensorData.temperature;
        tempChart.update();

        humChart.data.labels = sensorData.timestamps;
        humChart.data.datasets[0].data = sensorData.humidity;
        humChart.update();

        lightChart.data.labels = sensorData.timestamps;
        lightChart.data.datasets[0].data = sensorData.light;
        lightChart.update();

        moistureChart.data.labels = sensorData.timestamps;
        moistureChart.data.datasets[0].data = sensorData.soil_moisture;
        moistureChart.update();
    }

    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                console.log("🔄 Updating UI with new values:", data);
                
                const timestamp = new Date().toISOString();

                document.getElementById("tempData").textContent = data.temperature + " °C";
                document.getElementById("humData").textContent = data.humidity + " %";
                document.getElementById("lightData").textContent = data.light + " lx";
                document.getElementById("moistureData").textContent = data.soil_moisture + " %";

                sensorData.temperature.push({ x: timestamp, y: data.temperature });
                sensorData.humidity.push({ x: timestamp, y: data.humidity });
                sensorData.light.push({ x: timestamp, y: data.light });
                sensorData.soil_moisture.push({ x: timestamp, y: data.soil_moisture });
                sensorData.timestamps.push(timestamp);

                if (sensorData.temperature.length > 20) {
                    Object.keys(sensorData).forEach(key => sensorData[key].shift());
                }

                updateCharts();
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    function sendCommand(command) {
        fetch("/send-command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: command })
        })
        .then(response => response.json())
        .then(data => {
            const timestamp = new Date().toLocaleTimeString();
            buttonStateLog.innerHTML += `<tr><td>${command}</td><td>${timestamp}</td></tr>`;
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
});
