import os
import logging
import requests
from flask import Flask, render_template, jsonify
from bs4 import BeautifulSoup

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)

# ESP32 Sensor Server URL
ESP32_URL = "http://10.0.0.72"

def fetch_sensor_data():
    """Fetch sensor data from ESP32 and extract temperature, humidity, light, and soil moisture."""
    try:
        response = requests.get(ESP32_URL, timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        sensor_data = {
            "temperature": soup.find(text="Temperature:").find_next().text.split(" ")[0],
            "humidity": soup.find(text="Humidity:").find_next().text.split(" ")[0],
            "light": soup.find(text="Light:").find_next().text.split(" ")[0],
            "soil_moisture": soup.find(text="Soil Moisture:").find_next().text.split(" ")[0],
        }
        logger.info(f"✅ Fetched sensor data: {sensor_data}")
        return sensor_data

    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error fetching ESP32 data: {e}")
        return {"error": "Failed to retrieve data"}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get-data", methods=["GET"])
def get_data():
    return jsonify(fetch_sensor_data())

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
