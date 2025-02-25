document.addEventListener("DOMContentLoaded", function () {
    // Arrays to store chart data and labels (timestamps)
    let tempData = [], humData = [], lightData = [], moistureData = [];
    let timeLabels = [];

    // Initialize Chart.js charts
    const tempChartCtx = document.getElementById("tempChart").getContext("2d");
    const humChartCtx = document.getElementById("humChart").getContext("2d");
    const lightChartCtx = document.getElementById("lightChart").getContext("2d");
    const moistureChartCtx = document.getElementById("moistureChart").getContext("2d");

    const chartOptions = {
        type: "line",
        data: {
            labels: timeLabels,
            datasets: [{
                label: "",
                data: [],
                fill: false,
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    type: "time",
                    time: {
                        tooltipFormat: 'YYYY-MM-DD HH:mm:ss',
                        displayFormats: {
                            millisecond: 'HH:mm:ss',
                            second: 'HH:mm:ss',
                            minute: 'HH:mm'
                        }
                    }
                }
            }
        }
    };

    // Create charts
    const tempChart = new Chart(tempChartCtx, Object.assign({}, chartOptions, { data: { labels: timeLabels, datasets: [{ label: "Temperature (°C)", data: tempData, borderColor: "red", fill: false }] } }));
    const humChart = new Chart(humChartCtx, Object.assign({}, chartOptions, { data: { labels: timeLabels, datasets: [{ label: "Humidity (%)", data: humData, borderColor: "blue", fill: false }] } }));
    const lightChart = new Chart(lightChartCtx, Object.assign({}, chartOptions, { data: { labels: timeLabels, datasets: [{ label: "Light (lx)", data: lightData, borderColor: "orange", fill: false }] } }));
    const moistureChart = new Chart(moistureChartCtx, Object.assign({}, chartOptions, { data: { labels: timeLabels, datasets: [{ label: "Soil Moisture", data: moistureData, borderColor: "green", fill: false }] } }));

    // Fetch sensor data and update UI and charts
    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                console.log("🔄 Updating UI with new values:", data);
                // Update textual UI
                document.getElementById("tempData").textContent = data.temperature + " °C";
                document.getElementById("humData").textContent = data.humidity + " %";
                document.getElementById("lightData").textContent = data.light + " lx";
                document.getElementById("moistureData").textContent = data.soil_moisture + " %";

                // Use the timestamp from the sensor data if available, else current time
                const timestamp = data.timestamp || new Date().toISOString();

                // Append data points to arrays
                timeLabels.push(timestamp);
                tempData.push(data.temperature);
                humData.push(data.humidity);
                lightData.push(data.light);
                moistureData.push(data.soil_moisture);

                // Keep only the last 20 data points for performance
                if (timeLabels.length > 20) {
                    timeLabels.shift();
                    tempData.shift();
                    humData.shift();
                    lightData.shift();
                    moistureData.shift();
                }

                // Update charts
                tempChart.update();
                humChart.update();
                lightChart.update();
                moistureChart.update();
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    // Button command sending function and log update
    function sendCommand(command) {
        fetch("/send-command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: command })
        })
        .then(response => response.json())
        .then(data => {
            alert("Sent: " + command);
            console.log(data);
            // Log the button press with timestamp in the button log table
            const logTable = document.getElementById("buttonLog").getElementsByTagName("tbody")[0];
            const newRow = logTable.insertRow();
            const commandCell = newRow.insertCell(0);
            const timestampCell = newRow.insertCell(1);
            commandCell.textContent = command;
            timestampCell.textContent = new Date().toLocaleString();
        })
        .catch(error => console.error("Error:", error));
    }

    // Attach event listeners for buttons
    document.getElementById("autoMode").addEventListener("click", () => sendCommand("Auto Mode"));
    document.getElementById("manual").addEventListener("click", () => sendCommand("Manual"));
    document.getElementById("button1").addEventListener("click", () => sendCommand("Button 1"));
    document.getElementById("button2").addEventListener("click", () => sendCommand("Button 2"));
    document.getElementById("button3").addEventListener("click", () => sendCommand("Button 3"));

    // Fetch new data every 2 seconds
    setInterval(fetchData, 2000);
    fetchData();
});
