document.addEventListener("DOMContentLoaded", function () {
    let buttonStates = {}; // Store button states
    let sensorLogs = []; // Store sensor data logs

    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                document.getElementById("tempData").textContent = data.sensor_data.temperature + " °C";
                document.getElementById("humData").textContent = data.sensor_data.humidity + " %";
                document.getElementById("lightData").textContent = data.sensor_data.light + " lx";
                document.getElementById("moistureData").textContent = data.sensor_data.soil_moisture + " %";

                buttonStates = data.button_states || {}; // Store button states
                updateButtonColors();

                appendSensorLog(data.sensor_data);
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    function sendCommand(button) {
        // Sync logic for Auto and Manual
        if (button === "Auto Mode") {
            buttonStates["Auto Mode"] = "ON";
            buttonStates["Manual"] = "OFF";
        } else if (button === "Manual") {
            buttonStates["Manual"] = "ON";
            buttonStates["Auto Mode"] = "OFF";
        } else {
            const currentState = buttonStates[button];
            buttonStates[button] = currentState === "OFF" ? "ON" : "OFF";
        }
    
        updateButtonColors();
    
        // ✅ Send only the clicked button and its state
        fetch("/send-command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                button: button,
                state: buttonStates[button]
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log("✅ Sent to backend:", data);
        })
        .catch(err => console.error("❌ Send error:", err));
    }

    function appendSensorLog(sensorData) {
        const tableBody = document.getElementById("sensorDataTableBody");
        const timestamp = new Date().toLocaleString();

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${sensorData.temperature} °C</td>
            <td>${sensorData.humidity} %</td>
            <td>${sensorData.light} lx</td>
            <td>${sensorData.soil_moisture} %</td>
            <td>${timestamp}</td>
        `;
        tableBody.prepend(row); // Append new log to the top
    }

    function updateButtonColors() {
        Object.entries(buttonStates).forEach(([button, state]) => {
            const btn = document.getElementById(button.replace(/\s/g, ""));
            if (btn) {
                btn.classList.remove("active", "inactive");
                btn.classList.add(state === "ON" ? "active" : "inactive");
            }
        });
    }    

    document.getElementById("autoMode").addEventListener("click", () => sendCommand("Auto Mode"));
    document.getElementById("manual").addEventListener("click", () => sendCommand("Manual"));
    document.getElementById("button1").addEventListener("click", () => sendCommand("Button 1"));
    document.getElementById("button2").addEventListener("click", () => sendCommand("Button 2"));
    document.getElementById("button3").addEventListener("click", () => sendCommand("Button 3"));

    setInterval(fetchData, 2000);
    fetchData();
});
