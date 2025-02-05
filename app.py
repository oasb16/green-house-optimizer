import os
import logging
from threading import Lock
from flask import Flask, render_template
from flask_socketio import SocketIO, emit

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)
app.config.from_pyfile('config.py')

socketio = SocketIO(app, cors_allowed_origins="*")  # Allow cross-origin WebSocket connections

data_store = []
data_lock = Lock()

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/data')
def display_data():
    """Displays the received JSON data in an HTML table."""
    with data_lock:
        data_list = list(enumerate(data_store))
    return render_template("/templates/data.html", data=data_list)

@socketio.on('connect')
def handle_connect():
    logger.info("Client connected: %s", request.sid)
    emit('response', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info("Client disconnected: %s", request.sid)

@socketio.on('json_data')
def handle_json_data(json_payload):
    """Handles incoming JSON data from WebSocket."""
    logger.info("Received JSON data: %s", json_payload)
    with data_lock:
        data_store.append(json_payload)
    emit('response', {'message': 'Data received'}, broadcast=False)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info("Starting Flask WebSocket app on port %d", port)
    socketio.run(app, host='0.0.0.0', port=port)
