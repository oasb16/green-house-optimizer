import os
import logging
import requests
import re
from flask import Flask, render_template, jsonify
from bs4 import BeautifulSoup

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)

# Use the Ngrok URL instead of the local IP
ESP32_URL = "https://63e8-2601-645-4500-9d0-59ca-7ccc-9141-75fc.ngrok-free.app/"

def fetch_sensor_data():
    """Fetch sensor data from ESP32 and extract values robustly using regex."""
    try:
        response = requests.get(ESP32_URL, timeout=5)
        response.raise_for_status()

        # Parse the HTML response
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract sensor values using regex
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
