import os
import logging
import ssl
import base64
import threading
import json
import time
import paho.mqtt.client as mqtt
from flask import Flask, render_template, jsonify, request
from whitenoise import WhiteNoise

# Logging setup
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)
app.wsgi_app = WhiteNoise(app.wsgi_app, root="static/")

# AWS IoT Configuration
AWS_IOT_ENDPOINT = "a2e8a4czugwpbb-ats.iot.us-west-1.amazonaws.com"
AWS_IOT_SUBSCRIBE_TOPIC = "esp32/sensorData"
AWS_IOT_PUBLISH_TOPIC = "esp32/commands"
MQTT_PORT = 8883

# Store latest sensor data & button states
latest_sensor_data = {"temperature": "N/A", "humidity": "N/A", "light": "N/A", "soil_moisture": "N/A", "timestamp": "N/A"}
button_states = {}

# Decode AWS IoT certificates from environment variables
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

# MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("✅ Connected to AWS IoT successfully")
        client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC)
        logger.info(f"📡 Subscribed to topic: {AWS_IOT_SUBSCRIBE_TOPIC}")
    else:
        logger.error(f"❌ MQTT Connection failed with error code: {rc}")

def on_message(client, userdata, msg):
    """Handle incoming MQTT messages."""
    global latest_sensor_data
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)
        logger.info(f"📩 Raw payload received: {payload}")
        data["timestamp"] = time.strftime("%Y-%m-%d %H:%M:%S")
        latest_sensor_data.update(data)
        logger.info(f"📩 MQTT Message received: {data}")
    except json.JSONDecodeError as e:
        logger.error(f"❌ Failed to parse MQTT message: {e}")

def on_disconnect(client, userdata, rc):
    if rc != 0:
        logger.warning("⚠️ Unexpected disconnection from AWS IoT!")
    else:
        logger.info("🔌 Disconnected from AWS IoT")

# Configure MQTT Callbacks
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.on_disconnect = on_disconnect

# MQTT Worker
def mqtt_worker():
    while True:
        try:
            logger.info("🔄 Connecting to AWS IoT...")
            mqtt_client.connect(AWS_IOT_ENDPOINT, MQTT_PORT, 60)
            mqtt_client.loop_forever()
        except Exception as e:
            logger.error(f"❌ MQTT Connection error: {e}")
            logger.info("🔄 Retrying in 5 seconds...")
            time.sleep(5)

threading.Thread(target=mqtt_worker, daemon=True).start()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get-data", methods=["GET"])
def get_data():
    logger.info("📤 Sending latest sensor data and button states")
    response = {
        "sensor_data": {
            "temperature": latest_sensor_data.get("temperature", "Awaiting Data..."),
            "humidity": latest_sensor_data.get("humidity", "Awaiting Data..."),
            "light": latest_sensor_data.get("light", "Awaiting Data..."),
            "soil_moisture": latest_sensor_data.get("soil_moisture", "Awaiting Data...")
        },
        "button_states": button_states
    }
    for key, value in response["sensor_data"].items():
        if value == "Awaiting Data...":
            logger.warning(f"⚠️ Missing or malformed sensor value for {key}")
    return jsonify(response)

@app.route("/send-command", methods=["POST"])
def send_command():
    """Publish button commands to MQTT topic."""
    data = request.json
    if not data or "button" not in data:
        logger.error("❌ Invalid request: Missing 'button' in payload")
        return jsonify({"error": "Invalid request"}), 400

    button = data["button"]
    state = data["state"]

    # ✅ Store state
    button_states[button] = state
    logger.info(f"🔘 Button state updated: {button} -> {state}")

    message = {"button": button, "state": state}
    try:
        result = mqtt_client.publish(AWS_IOT_PUBLISH_TOPIC, json.dumps(message))
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            logger.info(f"📤 Sent MQTT command: {message}")
            return jsonify({"success": True, "message": message})
        else:
            logger.error("❌ Failed to publish MQTT message")
            return jsonify({"error": "Failed to publish"}), 500
    except Exception as e:
        logger.error(f"❌ Error publishing MQTT message: {e}")
        return jsonify({"error": "MQTT publishing error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
