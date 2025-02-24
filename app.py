import os
import logging
import ssl
import base64
import threading
import json
import paho.mqtt.client as mqtt
from flask import Flask, render_template, jsonify

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)

# AWS IoT Configuration
AWS_IOT_ENDPOINT = "wss://a2e8a4czugwpbb-ats.iot.us-west-1.amazonaws.com/mqtt"
AWS_IOT_TOPIC = "esp32/sensorData"
PORT = 8883

# Store latest sensor data
latest_sensor_data = {"temperature": "N/A", "humidity": "N/A", "light": "N/A", "soil_moisture": "N/A"}

# Decode AWS IoT certificates from environment variables and store temporarily
CERT_PATH = "/tmp/device-cert.pem.crt"
KEY_PATH = "/tmp/device-private.pem.key"
CA_PATH = "/tmp/AmazonRootCA1.pem"

for path, env_var in [(CERT_PATH, "AWS_CERT"), (KEY_PATH, "AWS_KEY"), (CA_PATH, "AWS_CA")]:
    if os.getenv(env_var):
        with open(path, "wb") as f:
            f.write(base64.b64decode(os.getenv(env_var)))

# Initialize MQTT Client
mqtt_client = mqtt.Client()

# Enable TLS for secure connection
mqtt_client.tls_set(
    ca_certs=CA_PATH,
    certfile=CERT_PATH,
    keyfile=KEY_PATH,
    tls_version=ssl.PROTOCOL_TLSv1_2
)

def on_connect(client, userdata, flags, rc):
    """Callback when connected to AWS IoT."""
    if rc == 0:
        logger.info("✅ Connected to AWS IoT")
        client.subscribe(AWS_IOT_TOPIC)
    else:
        logger.error(f"❌ Connection failed with code {rc}")

def on_message(client, userdata, msg):
    """Callback when a message is received from AWS IoT."""
    global latest_sensor_data
    try:
        payload = json.loads(msg.payload.decode())
        latest_sensor_data.update(payload)  # Update sensor values
        logger.info(f"📩 Received MQTT message: {payload}")
    except json.JSONDecodeError:
        logger.error("❌ Failed to parse MQTT message")

# Configure MQTT Callbacks
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# Connect to AWS IoT in a separate thread
def mqtt_worker():
    """Start MQTT client loop."""
    mqtt_client.connect(AWS_IOT_ENDPOINT, PORT, 60)
    mqtt_client.loop_forever()

mqtt_thread = threading.Thread(target=mqtt_worker, daemon=True)
mqtt_thread.start()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get-data", methods=["GET"])
def get_data():
    """Return the latest sensor data received via MQTT."""
    return jsonify(latest_sensor_data)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
