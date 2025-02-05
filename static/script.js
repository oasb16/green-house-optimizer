document.addEventListener("DOMContentLoaded", function () {
    function fetchData() {
        fetch("/get-data")
            .then(response => response.json())
            .then(data => {
                console.log("🔄 Updating UI with new value:", data.value);
                document.getElementById("liveData").textContent = data.value;
            })
            .catch(error => console.error("❌ Fetch error:", error));
    }

    // Fetch new data every 2 seconds
    setInterval(fetchData, 2000);

    document.getElementById("sendData").addEventListener("click", function () {
        let sampleData = { value: "Hello, Flask REST API!" };

        fetch("/post-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sampleData)
        })
        .then(response => response.json())
        .then(data => console.log("📩 Data posted successfully:", data))
        .catch(error => console.error("❌ Error posting data:", error));
    });

    // Initial fetch
    fetchData();
});
