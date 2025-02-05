document.addEventListener("DOMContentLoaded", function () {
    var socket = io.connect("ws://your-websocket-server-ip:your-port");

    socket.on("connect", function () {
        console.log("Connected to WebSocket server.");
    });

    socket.on("response", function (data) {
        console.log("Server response:", data);
    });

    document.getElementById("sendData").addEventListener("click", function () {
        let sampleData = { message: "Hello, WebSocket!" };
        socket.emit("json_data", sampleData);
    });
});
