document.addEventListener("DOMContentLoaded", function () {
    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                console.log("🔄 Updating UI with new values:", data);
                document.getElementById("tempData").textContent = data.temperature + " °C";
                document.getElementById("humData").textContent = data.humidity + " %";
                document.getElementById("lightData").textContent = data.light + " lx";
                document.getElementById("moistureData").textContent = data.soil_moisture + " %";
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

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
        })
        .catch(error => console.error("Error:", error));
    }

    document.getElementById("autoMode").addEventListener("click", () => sendCommand("Auto Mode"));
    document.getElementById("manual").addEventListener("click", () => sendCommand("Manual"));
    document.getElementById("button1").addEventListener("click", () => sendCommand("Button 1"));
    document.getElementById("button2").addEventListener("click", () => sendCommand("Button 2"));
    document.getElementById("button3").addEventListener("click", () => sendCommand("Button 3"));

    setInterval(fetchData, 2000);
    fetchData();
});
