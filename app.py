import os
import logging
import requests
from flask import Flask, render_template, request, jsonify

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "supersecretkey")

# External API IP address to fetch data
EXTERNAL_API = "http://10.0.0.0:72:80"  # Replace with the actual API address

@app.route("/")
def index():
    """Render the main HTML page."""
    return render_template("index.html")

@app.route("/get-data", methods=["GET"])
def get_data():
    """Fetches data from the external IP address and returns it."""
    try:
        response = requests.get(EXTERNAL_API, timeout=5)  # Fetch data from external API
        response.raise_for_status()  # Raise an error for bad responses (4xx, 5xx)
        data = response.json()
        logger.info(f"✅ Data fetched: {data}")
        return jsonify({"value": data.get("value", "No data received")}), 200
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error fetching data: {e}")
        return jsonify({"status": "error", "message": "Failed to fetch data"}), 500

@app.route("/post-data", methods=["POST"])
def post_data():
    """Handles sending data to an external API for future use."""
    try:
        payload = request.json
        response = requests.post(EXTERNAL_API, json=payload, timeout=5)
        response.raise_for_status()
        return jsonify({"status": "success", "response": response.text}), 200
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error posting data: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"🚀 Starting Flask app on port {port}")
    app.run(host="0.0.0.0", port=port)
