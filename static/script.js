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

    function fetchNgrokUrl() {
        fetch("/register-ip")
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    document.getElementById("ngrokURL").textContent = "Ngrok URL: " + data.ngrok_url;
                }
            })
            .catch(error => console.error("❌ Error fetching Ngrok URL:", error));
    }

    document.getElementById("sendSSID").addEventListener("click", function () {
        let ssid = prompt("Enter Wi-Fi SSID:");
        let password = prompt("Enter Wi-Fi Password:");
        fetch("/register-ip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ssid: ssid, password: password })
        })
        .then(response => response.json())
        .then(data => {
            alert("SSID Sent! " + data.message);
        })
        .catch(error => alert("❌ Error sending SSID"));
    });

    setInterval(fetchData, 2000);
    fetchData();
    fetchNgrokUrl();
});
