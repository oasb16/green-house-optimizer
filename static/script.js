document.addEventListener("DOMContentLoaded", function () {
    // let buttonStates = {}; // Store button states
    let sensorLogs = []; // Store sensor data logs

    // function updateButtonColors() {
    //     Object.entries(buttonStates).forEach(([button, state]) => {
    //         const btn = document.getElementById(button.replace(/\s/g, ""));
    //         if (btn) {
    //             btn.classList.remove("active", "inactive");
    //             btn.classList.add(state === "ON" ? "active" : "inactive");
    //         }
    //     });
    // }    

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
