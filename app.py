import os
import logging
import requests
from flask import Flask, render_template, jsonify, request

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

EXTERNAL_API = "http://10.0.0.72:80"  # External API

# Cached data to prevent crashes
cached_data = {"value": "No data yet"}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get-data", methods=["GET"])
def get_data():
    """Fetch data from external API but fallback if unavailable."""
    global cached_data
    try:
        response = requests.get(EXTERNAL_API, timeout=5)
        response.raise_for_status()
        data = response.json()
        cached_data = {"value": data.get("value", "No data received")}
        logger.info(f"✅ Data fetched: {cached_data}")
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error fetching data, returning cached: {e}")
    return jsonify(cached_data), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))


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
