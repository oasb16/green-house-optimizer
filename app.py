import os
import logging
import requests
import re
import subprocess
from flask import Flask, render_template, jsonify, request
from bs4 import BeautifulSoup

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)

# Store ESP32 local IP
ESP32_IP = ""
NGROK_URL = ""

def start_ngrok():
    """Starts Ngrok and retrieves the public URL."""
    global NGROK_URL
    logger.info("Starting Ngrok...")

    # Kill any existing Ngrok processes
    os.system("pkill -f ngrok")

    # Start Ngrok and capture the public URL
    process = subprocess.Popen(["ngrok", "http", "5000"], stdout=subprocess.PIPE)
    
    try:
        response = requests.get("http://127.0.0.1:4040/api/tunnels")
        if response.status_code == 200:
            NGROK_URL = response.json()["tunnels"][0]["public_url"]
            logger.info(f"✅ Ngrok started at: {NGROK_URL}")
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error starting Ngrok: {e}")

@app.route("/register-ip", methods=["POST"])
def register_esp32():
    """Registers ESP32's local IP and starts Ngrok."""
    global ESP32_IP
    data = request.json
    ESP32_IP = data.get("esp32_ip")

    if ESP32_IP:
        start_ngrok()
        return jsonify({"status": "success", "ngrok_url": NGROK_URL})
    else:
        return jsonify({"status": "error", "message": "Invalid ESP32 IP"}), 400

def fetch_sensor_data():
    """Fetch sensor data from ESP32 using Ngrok URL and extract values."""
    try:
        response = requests.get(NGROK_URL, timeout=5) if NGROK_URL else None
        if response is None or response.status_code != 200:
            raise requests.exceptions.RequestException("Ngrok URL unavailable or not responding")

        soup = BeautifulSoup(response.text, "html.parser")
        data_text = soup.get_text()

        sensor_data = {
            "temperature": re.search(r"Temperature:\s*([\d.]+)", data_text).group(1) if re.search(r"Temperature:\s*([\d.]+)", data_text) else "N/A",
            "humidity": re.search(r"Humidity:\s*([\d.]+)", data_text).group(1) if re.search(r"Humidity:\s*([\d.]+)", data_text) else "N/A",
            "light": re.search(r"Light:\s*([\d.]+)", data_text).group(1) if re.search(r"Light:\s*([\d.]+)", data_text) else "N/A",
            "soil_moisture": re.search(r"Soil Moisture:\s*([\d.]+)", data_text).group(1) if re.search(r"Soil Moisture:\s*([\d.]+)", data_text) else "N/A",
        }
        
        logger.info(f"✅ Fetched sensor data: {sensor_data}")
        return sensor_data

    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error fetching ESP32 data: {e}")
        return {"error": "Failed to retrieve data"}
    except Exception as e:
        logger.error(f"❌ Parsing error: {e}")
        return {"error": "Failed to parse data"}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get-data", methods=["GET"])
def get_data():
    """Fetch sensor data from ESP32 and return it as JSON."""
    return jsonify(fetch_sensor_data())

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
