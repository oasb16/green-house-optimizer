document.addEventListener("DOMContentLoaded", function () {
    let userSSID = prompt("Enter your Wi-Fi SSID:");
    if (userSSID) {
        sendSSID(userSSID);
    }


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

    function sendSSID(ssid) {
        fetch("/send-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ssid: ssid })
        })
        .then(response => response.json())
        .then(data => console.log("✅ SSID sent:", data))
        .catch(error => console.error("❌ Error sending SSID:", error));
    }

    document.getElementById("sendPassword").addEventListener("click", function () {
        let userPassword = prompt("Enter your Wi-Fi Password:");
        if (userPassword) {
            fetch("/send-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: userPassword })
            })
            .then(response => response.json())
            .then(data => console.log("✅ Password sent:", data))
            .catch(error => console.error("❌ Error sending Password:", error));
        }
    });

    setInterval(fetchData, 2000);
    fetchData();
});

