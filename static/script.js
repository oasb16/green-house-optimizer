document.addEventListener("DOMContentLoaded", function () {
    let sensorLogs = []; // Store sensor data logs  

    function createGauge(containerId, value) {
        console.log("createGauge containerId, value:", containerId, value);
        if (value < 0 || value > 100) {
            console.error("Invalid value for gauge:", value);
            console.log(" value for gauge:", 1);
        }
        else {
            value = 1
            const container = document.getElementById(containerId);
            container.innerHTML = `
                <div style="position: relative; width: 100px; height: 50px;">
                    <svg viewBox="0 0 100 50" style="width: 100%; height: 100%;">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#ddd" stroke-width="10" />
                        <path d="M 10 50 A 40 40 0 0 1 ${10 + 80 * (value / 100)} 50" fill="none" stroke="#28a745" stroke-width="10" />
                    </svg>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 16px; font-weight: bold;">${value}</div>
                </div>
            `;
          }
    }

    function updateGauges(sensorData) {
        createGauge("tempGauge", sensorData.temperature);
        createGauge("humGauge", sensorData.humidity);
        createGauge("lightGauge", sensorData.light);
        createGauge("moistureGauge", sensorData.soil_moisture);
    }

    
    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                document.getElementById("tempData").textContent = data.sensor_data.temperature + " °C";
                document.getElementById("humData").textContent = data.sensor_data.humidity + " %";
                document.getElementById("lightData").textContent = data.sensor_data.light + " lx";
                document.getElementById("moistureData").textContent = data.sensor_data.soil_moisture + " %";

                // buttonStates = data.button_states || {}; // Store button states

                appendSensorLog(data.sensor_data);
                updateGauges(data.sensor_data); // Update gauges with sensor data
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    const buttonStates = {
        "Auto Mode": "OFF",
        "Manual": "OFF",
        "Water Pump": "OFF",
        "Vent": "OFF",
        "Light": "OFF"
    };
    
    function sendCommand(button) {
        // Reset logic for mutual exclusivity
        if (button === "Auto Mode") {
            setAllButtons("OFF");
            buttonStates["Auto Mode"] = "ON";
        } else if (button === "Manual") {
            setAllButtons("OFF");
            buttonStates["Manual"] = "ON";
        } else {
            // Toggle the clicked button (Water Pump, Vent, Light)
            const newState = buttonStates[button] === "ON" ? "OFF" : "ON";
            buttonStates[button] = newState;
    
            // If any of these buttons turn ON, Manual ON and Auto OFF
            if (newState === "ON") {
                buttonStates["Manual"] = "ON";
                buttonStates["Auto Mode"] = "OFF";
            }
    
            // If all control buttons are OFF, keep Manual as ON or allow OFF?
            // Optional: Add fallback logic if needed
        }
    
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
    
    function setAllButtons(state) {
        Object.keys(buttonStates).forEach(key => {
            buttonStates[key] = state;
        });
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
