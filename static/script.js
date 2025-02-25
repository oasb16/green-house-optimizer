document.addEventListener("DOMContentLoaded", function () {
    const buttonLog = document.getElementById("buttonLog");

    const ctxTemp = document.getElementById("chartTemp").getContext("2d");
    const ctxHum = document.getElementById("chartHum").getContext("2d");
    const ctxLight = document.getElementById("chartLight").getContext("2d");
    const ctxMoisture = document.getElementById("chartMoisture").getContext("2d");

    const chartOptions = {
        type: 'line',
        data: { labels: [], datasets: [{ label: '', data: [], borderColor: 'blue', fill: false }] },
        options: { scales: { x: { type: 'time', time: { unit: 'second' } } } }
    };

    const tempChart = new Chart(ctxTemp, { ...chartOptions, data: { labels: [], datasets: [{ label: "Temperature", data: [] }] }});
    const humChart = new Chart(ctxHum, { ...chartOptions, data: { labels: [], datasets: [{ label: "Humidity", data: [] }] }});
    const lightChart = new Chart(ctxLight, { ...chartOptions, data: { labels: [], datasets: [{ label: "Light", data: [] }] }});
    const moistureChart = new Chart(ctxMoisture, { ...chartOptions, data: { labels: [], datasets: [{ label: "Soil Moisture", data: [] }] }});

    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                document.getElementById("tempData").textContent = `${data.sensor_data.temperature} °C`;
                document.getElementById("humData").textContent = `${data.sensor_data.humidity} %`;
                document.getElementById("lightData").textContent = `${data.sensor_data.light} lx`;
                document.getElementById("moistureData").textContent = `${data.sensor_data.soil_moisture} %`;

                buttonLog.innerHTML = data.button_logs.map(log => `<tr><td>${log.command}</td><td>${log.timestamp}</td></tr>`).join("");

                let timestamp = new Date(data.sensor_data.timestamp);
                tempChart.data.labels.push(timestamp);
                tempChart.data.datasets[0].data.push(data.sensor_data.temperature);
                tempChart.update();

                humChart.data.labels.push(timestamp);
                humChart.data.datasets[0].data.push(data.sensor_data.humidity);
                humChart.update();

                lightChart.data.labels.push(timestamp);
                lightChart.data.datasets[0].data.push(data.sensor_data.light);
                lightChart.update();

                moistureChart.data.labels.push(timestamp);
                moistureChart.data.datasets[0].data.push(data.sensor_data.soil_moisture);
                moistureChart.update();
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    ["autoMode", "manual", "button1", "button2", "button3"].forEach(id => {
        document.getElementById(id).addEventListener("click", () => sendCommand(id));
    });

    function sendCommand(command) {
        fetch("/send-command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command }) });
    }

    setInterval(fetchData, 2000);
});
