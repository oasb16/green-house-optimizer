document.addEventListener("DOMContentLoaded", function () {
    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                document.getElementById("tempData").textContent = data.sensor_data.temperature + " °C";
                document.getElementById("humData").textContent = data.sensor_data.humidity + " %";
                document.getElementById("lightData").textContent = data.sensor_data.light + " lx";
                document.getElementById("moistureData").textContent = data.sensor_data.soil_moisture + " %";

                updateButtonStateTable(data.button_states);
                updateButtonColors(data.button_states);
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    function sendCommand(button) {
        fetch("/send-command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ button: button })
        }).then(response => response.json())
          .then(data => fetchData()) // Refresh UI after command
          .catch(error => console.error("Error:", error));
    }

    function updateButtonStateTable(buttonStates) {
        const tableBody = document.getElementById("buttonStateTableBody");
        tableBody.innerHTML = ""; // Clear previous entries

        Object.entries(buttonStates).forEach(([button, state]) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${button}</td>
                <td class="${state === 'ON' ? 'on-state' : 'off-state'}">${state}</td>
                <td>${new Date().toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function updateButtonColors(buttonStates) {
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
