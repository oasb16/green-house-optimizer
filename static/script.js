// Mode-based background
const hour = new Date().getHours();
document.body.classList.add(hour > 18 || hour < 6 ? 'night' : 'day');

window.onload = () => {
    document.getElementById("AutoMode")?.addEventListener("click", () => {
        console.log("Auto Mode clicked");
        document.getElementById("AutoMode")?.classList.add("active-auto");
        document.getElementById("Manual")?.classList.remove("active-manual");
    });

    document.getElementById("Manual")?.addEventListener("click", () => {
        console.log("Manual clicked");
        document.getElementById("Manual")?.classList.add("active-manual");
        document.getElementById("AutoMode")?.classList.remove("active-auto");
    });

    document.getElementById("WaterPump")?.addEventListener("click", () => {
        console.log("Water Pump triggered");
    });

    document.getElementById("Vent")?.addEventListener("click", () => {
        console.log("Vent triggered");
        document.getElementById("Vent")?.classList.toggle("blinking");
    });

    document.getElementById("Light")?.addEventListener("click", () => {
        console.log("Light triggered");
    });

    const container = document.querySelector('.floating-leaves');
    for (let i = 0; i < 8; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        leaf.style.left = `${Math.random() * 100}vw`;
        leaf.style.animationDuration = `${8 + Math.random() * 5}s`;
        leaf.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(leaf);
    }

    const pollenContainer = document.querySelector('.pollen-layer');
    for (let i = 0; i < 15; i++) {
        const dot = document.createElement('div');
        dot.className = 'pollen';
        dot.style.left = `${Math.random() * 100}vw`;
        dot.style.top = `${Math.random() * 100}vh`;
        dot.style.animationDuration = `${8 + Math.random() * 6}s`;
        pollenContainer.appendChild(dot);
    }
};

// Pollen
document.addEventListener("DOMContentLoaded", function () {
    let sensorLogs = []; // Store sensor data logs  

    function createGauge(containerId, value) {
        const container = document.getElementById(containerId);

        // Check if the container exists
        if (!container) {
            console.error(`Gauge container with ID '${containerId}' not found.`);
            return;
        }

        // Validate the value
        if (isNaN(value) || value === null || value === undefined) {
            console.error(`Invalid value for gauge: ${value}`);
        }

        value = 1;
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

    // Added logging for user interactions and gauge updates
    function logButtonClick(button) {
        console.log(`Button clicked: ${button}`);
    }

    function logGaugeUpdate(sensorType, value) {
        console.log(`Gauge updated: ${sensorType} -> ${value}`);
    }

    function updateGauges(sensorData) {
        createGauge("tempGauge", sensorData.temperature);
        logGaugeUpdate("Temperature", sensorData.temperature);

        createGauge("humGauge", sensorData.humidity);
        logGaugeUpdate("Humidity", sensorData.humidity);

        createGauge("lightGauge", sensorData.light);
        logGaugeUpdate("Light", sensorData.light);

        createGauge("moistureGauge", sensorData.soil_moisture);
        logGaugeUpdate("Soil Moisture", sensorData.soil_moisture);

        // Wind logic (based on humidity)
        updateLeafSpeed(sensorData.humidity);
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

    // Update existing event listeners to include logging
    document.getElementById("AutoMode").addEventListener("click", () => {
        logButtonClick("Auto Mode");
        sendCommand("Auto Mode");
    });

    document.getElementById("Manual").addEventListener("click", () => {
        logButtonClick("Manual");
        sendCommand("Manual");
    });

    document.getElementById("WaterPump").addEventListener("click", () => {
        logButtonClick("Water Pump");
        sendCommand("Water Pump");
    });

    document.getElementById("Vent").addEventListener("click", () => {
        logButtonClick("Vent");
        sendCommand("Vent");
    });

    document.getElementById("Light").addEventListener("click", () => {
        logButtonClick("Light");
        sendCommand("Light");
    });

    setInterval(fetchData, 2000);
    fetchData();
});

// Wind logic (based on humidity)
function updateLeafSpeed(humidity) {
    const speed = humidity > 80 ? 3 : humidity > 50 ? 2 : 1;
    document.querySelectorAll('.leaf').forEach(leaf => {
        leaf.style.animationDuration = `${8 / speed}s`;
    });
}
