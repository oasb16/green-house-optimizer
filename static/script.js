document.addEventListener("DOMContentLoaded", function () {
    let buttonStates = {}; // Store button states
    let buttonLogs = []; // Store button logs

    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                document.getElementById("tempData").textContent = data.sensor_data.temperature + " °C";
                document.getElementById("humData").textContent = data.sensor_data.humidity + " %";
                document.getElementById("lightData").textContent = data.sensor_data.light + " lx";
                document.getElementById("moistureData").textContent = data.sensor_data.soil_moisture + " %";

                buttonStates = data.button_states; // Store button states
                updateButtonColors();
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    function sendCommand(button) {
        const newState = buttonStates[button] === "ON" ? "OFF" : "ON";
        buttonStates[button] = newState; // Toggle button state

        fetch("/send-command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ button: button, state: newState })
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  appendLog(button, newState);
              }
              fetchData(); // Refresh UI after sending command
          })
          .catch(error => console.error("Error:", error));
    }

    function appendLog(button, state) {
        const tableBody = document.getElementById("sensorDataTableBody");
        const timestamp = new Date().toLocaleString();

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${button}</td>
            <td class="${state === 'ON' ? 'on-state' : 'off-state'}">${state}</td>
            <td>${timestamp}</td>
        `;
        tableBody.prepend(row); // Append new log to the top
    }

    function updateButtonColors() {
        Object.entries(buttonStates).forEach(([button, state]) => {
            const btn = document.getElementById(button);
            if (btn) {
                btn.classList.toggle("active", state === "ON");
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
