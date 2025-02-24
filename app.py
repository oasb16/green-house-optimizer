import os
import logging
import ssl
import base64
import threading
import json, time
import paho.mqtt.client as mqtt
from flask import Flask, render_template, jsonify

# Logging setup
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)

# AWS IoT Configuration
AWS_IOT_ENDPOINT = "wss://a2e8a4czugwpbb-ats.iot.us-west-1.amazonaws.com/mqtt"
MQTT_PORT = 8883
AWS_IOT_TOPIC = "esp32/sensorData"
# MQTT_PORT = 8883


# Store latest sensor data
latest_sensor_data = {
    "temperature": "N/A",
    "humidity": "N/A",
    "light": "N/A",
    "soil_moisture": "N/A"
}

# Decode AWS IoT certificates from environment variables and store temporarily
CERT_PATH = "/tmp/device-cert.pem.crt"
KEY_PATH = "/tmp/device-private.pem.key"
CA_PATH = "/tmp/AmazonRootCA1.pem"

def save_certificates():
    """Save AWS IoT certificates from environment variables."""
    for path, env_var in [(CERT_PATH, "AWS_CERT"), (KEY_PATH, "AWS_KEY"), (CA_PATH, "AWS_CA")]:
        encoded_cert = os.getenv(env_var)
        if encoded_cert:
            try:
                with open(path, "wb") as f:
                    f.write(base64.b64decode(encoded_cert))
                logger.info(f"✅ Successfully saved {path}")
            except Exception as e:
                logger.error(f"❌ Failed to save {path}: {e}")

save_certificates()

# Initialize MQTT Client
mqtt_client = mqtt.Client()

# Enable TLS for secure connection
try:
    mqtt_client.tls_set(
        ca_certs=CA_PATH,
        certfile=CERT_PATH,
        keyfile=KEY_PATH,
        tls_version=ssl.PROTOCOL_TLSv1_2
    )
    logger.info("✅ TLS Configuration set for MQTT client")
except Exception as e:
    logger.error(f"❌ TLS Configuration failed: {e}")

def on_connect(client, userdata, flags, rc):
    """Callback when connected to AWS IoT."""
    if rc == 0:
        logger.info("✅ Connected to AWS IoT successfully")
        client.subscribe(AWS_IOT_TOPIC)
        logger.info(f"📡 Subscribed to topic: {AWS_IOT_TOPIC}")
    else:
        logger.error(f"❌ MQTT Connection failed with error code: {rc}")

def on_message(client, userdata, msg):
    """Callback when a message is received from AWS IoT."""
    global latest_sensor_data
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)
        print("❌❌❌❌"+str(data)+"❌❌❌❌")
        logger.error("❌❌❌❌"+str(data)+"❌❌❌❌")
        latest_sensor_data.update(data)  # Update sensor values
        logger.info(f"📩 MQTT Message received on topic `{msg.topic}`: {data}")
    except json.JSONDecodeError as e:
        logger.error(f"❌ Failed to parse MQTT message: {e}")

def on_disconnect(client, userdata, rc):
    """Callback when the client disconnects from MQTT broker."""
    if rc != 0:
        logger.warning("⚠️ Unexpected disconnection from AWS IoT!")
    else:
        logger.info("🔌 Disconnected from AWS IoT")

# Configure MQTT Callbacks
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.on_disconnect = on_disconnect

# Connect to AWS IoT in a separate thread
def mqtt_worker():
    """Start MQTT client loop."""
    while True:
        try:
            logger.info("🔄 Attempting to connect to AWS IoT...")
            mqtt_client.connect(AWS_IOT_ENDPOINT, MQTT_PORT, 60)
            mqtt_client.loop_forever()
        except Exception as e:
            logger.error(f"❌ MQTT Connection error: {e}")
            logger.info("🔄 Retrying in 5 seconds...")
            time.sleep(5)

mqtt_thread = threading.Thread(target=mqtt_worker, daemon=True)
mqtt_thread.start()

@app.route("/")
def index():
    """Render the index page."""
    logger.info("📄 Served index.html")
    return render_template("index.html")

@app.route("/get-data", methods=["GET"])
def get_data():
    """Return the latest sensor data received via MQTT."""
    logger.info("📡 API Request: GET /get-data")
    print("❌❌❌❌"+str(latest_sensor_data)+"❌❌❌❌")
    logger.error("❌❌❌❌"+str(latest_sensor_data)+"❌❌❌❌")
    return jsonify(latest_sensor_data)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"🚀 Starting Flask server on port {port}...")
    app.run(host="0.0.0.0", port=port)
