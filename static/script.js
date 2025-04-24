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
        const toggle = (btn) => {
            buttonStates[btn] = (buttonStates[btn] === "ON") ? "OFF" : "ON";
        };
    
        const turnOffAllDevices = () => {
            buttonStates["Water Pump"] = "OFF";
            buttonStates["Vent"] = "OFF";
            buttonStates["Light"] = "OFF";
        };
    
        if (button === "Auto Mode") {
            // Rule 5: Auto mode resets everything else
            buttonStates["Auto Mode"] = "ON";
            buttonStates["Manual"] = "OFF";
            turnOffAllDevices();
        }
    
        else if (button === "Manual") {
            // Rule 6: Manual mode resets everything else
            buttonStates["Manual"] = "ON";
            buttonStates["Auto Mode"] = "OFF";
            turnOffAllDevices();
        }
    
        else if (["Water Pump", "Vent", "Light"].includes(button)) {
            // Rule 4: Toggle button individually
            toggle(button);
    
            // Rule 3: Activating any device flips to Manual mode
            if (buttonStates[button] === "ON") {
                buttonStates["Manual"] = "ON";
                buttonStates["Auto Mode"] = "OFF";
            }
    
            // Rule 1: If all 3 are OFF, don't switch back to Auto implicitly
            // No-op
        }
    
        console.log(JSON.stringify(buttonStates, null, 2));

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


    document.getElementById("AutoMode").addEventListener("click", () => sendCommand("Auto Mode"));
    document.getElementById("Manual").addEventListener("click", () => sendCommand("Manual"));
    document.getElementById("WaterPump").addEventListener("click", () => sendCommand("Water Pump"));
    document.getElementById("Vent").addEventListener("click", () => sendCommand("Vent"));
    document.getElementById("Light").addEventListener("click", () => sendCommand("Light"));

    setInterval(fetchData, 2000);
    fetchData();
});
