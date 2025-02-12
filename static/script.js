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

    // Fetch new data every 2 seconds
    setInterval(fetchData, 2000);

    // Initial fetch
    fetchData();
});