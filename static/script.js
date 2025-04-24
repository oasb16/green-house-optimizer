document.addEventListener("DOMContentLoaded", function () {
    let buttonStates = {}; // Store button states
    let sensorLogs = []; // Store sensor data logs

    function updateButtonColors() {
        Object.entries(buttonStates).forEach(([button, state]) => {
            const btn = document.getElementById(button.replace(/\s/g, ""));
            if (btn) {
                btn.classList.remove("active", "inactive");
                btn.classList.add(state === "ON" ? "active" : "inactive");
            }
        });
    }    

    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                document.getElementById("tempData").textContent = data.sensor_data.temperature + " °C";
                document.getElementById("humData").textContent = data.sensor_data.humidity + " %";
                document.getElementById("lightData").textContent = data.sensor_data.light + " lx";
                document.getElementById("moistureData").textContent = data.sensor_data.soil_moisture + " %";

                buttonStates = data.button_states || {}; // Store button states

                appendSensorLog(data.sensor_data);
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    function sendCommand(button) {
        // Create a deep copy of buttonStates to avoid unintended mutations
        const newButtonStates = { ...buttonStates };

        if (button === "Auto Mode") {
            if (newButtonStates["Auto Mode"] === "OFF") {
                newButtonStates["Auto Mode"] = "ON";
                newButtonStates["Manual"] = "DISABLED";
                newButtonStates["Water Pump"] = "DISABLED";
                newButtonStates["Vent"] = "DISABLED";
                newButtonStates["Light"] = "DISABLED";
            } else {
                newButtonStates["Auto Mode"] = "OFF";
                newButtonStates["Manual"] = "ON";
                newButtonStates["Water Pump"] = "AVAILABLE";
                newButtonStates["Vent"] = "AVAILABLE";
                newButtonStates["Light"] = "AVAILABLE";
            }
        } else if (button === "Manual") {
            if (newButtonStates["Manual"] === "OFF") {
                newButtonStates["Auto Mode"] = "DISABLED";
                newButtonStates["Manual"] = "ON";
                newButtonStates["Water Pump"] = "AVAILABLE";
                newButtonStates["Vent"] = "AVAILABLE";
                newButtonStates["Light"] = "AVAILABLE";
            } else {
                newButtonStates["Auto Mode"] = "ON";
                newButtonStates["Manual"] = "OFF";
                newButtonStates["Water Pump"] = "DISABLED";
                newButtonStates["Vent"] = "DISABLED";
                newButtonStates["Light"] = "DISABLED";
            }
        } else if (["Water Pump", "Vent", "Light"].includes(button)) {
            if (newButtonStates[button] === "OFF") {
                newButtonStates[button] = "ON";
                newButtonStates["Manual"] = "ON";
            } else {
                newButtonStates[button] = "OFF";
            }
        }

        // Update the global buttonStates only after all changes are made
        buttonStates = newButtonStates;

        updateButtonColors();

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


    document.getElementById("AutoMode").addEventListener("click", () => sendCommand("Auto Mode"));
    document.getElementById("Manual").addEventListener("click", () => sendCommand("Manual"));
    document.getElementById("WaterPump").addEventListener("click", () => sendCommand("Water Pump"));
    document.getElementById("Vent").addEventListener("click", () => sendCommand("Vent"));
    document.getElementById("Light").addEventListener("click", () => sendCommand("Light"));

    setInterval(fetchData, 2000);
    fetchData();
});
