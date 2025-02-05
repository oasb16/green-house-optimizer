Flask
Flask-SocketIO
eventlet
#!/usr/bin/env python
"""
A minimal Flask app for Heroku that receives JSON data over a WebSocket
(using Flask-SocketIO) and displays the received data on a separate route.
"""

import os
import logging
from threading import Lock
from flask import Flask, request, render_template_string
from flask_socketio import SocketIO, emit

# Configure logging for detailed dynamic-step output.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app and configure secret key.
app = Flask(__name__)
app.config['SECRET_KEY'] = ''

# Initialize SocketIO with the Flask app.
socketio = SocketIO(app)

# Thread-safe in-memory data store for received JSON messages.
data_store = []
data_lock = Lock()

@app.route('/')
def index():
    app.logger.info("Serving index page")
    return "<h1>Green House Optimizer App</h1>"


@app.route('/data')
def display_data():
    """
    Displays the JSON data received via WebSocket in an HTML table.
    This route is separate from the index page.
    """
    with data_lock:
        data_list = list(enumerate(data_store))
    app.logger.info("Serving /data page with %d record(s)", len(data_list))
    # Inline HTML template using Jinja2 to render the data.
    template = """
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Received JSON Data</title>
        <style>
          table { border-collapse: collapse; width: 80%; margin: auto; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          pre { margin: 0; }
        </style>
      </head>
      <body>
        <h1 style="text-align: center;">Received JSON Data</h1>
        {% if data %}
          <table>
            <tr>
              <th>#</th>
              <th>JSON Data</th>
            </tr>
            {% for idx, item in data %}
              <tr>
                <td>{{ idx }}</td>
                <td><pre>{{ item | tojson(indent=2) }}</pre></td>
              </tr>
            {% endfor %}
          </table>
        {% else %}
          <p style="text-align: center;">No data received yet.</p>
        {% endif %}
      </body>
    </html>
    """
    return render_template_string(template, data=data_list)


@socketio.on('connect')
def handle_connect():
    app.logger.info("Client connected: %s", request.sid)
    emit('response', {'message': 'Connected to server'})


@socketio.on('disconnect')
def handle_disconnect():
    app.logger.info("Client disconnected: %s", request.sid)


@socketio.on('json_data')
def handle_json_data(json_payload):
    """
    Receives JSON data from a connected WebSocket client.
    The client should emit an event named 'json_data' with a JSON payload.
    """
    app.logger.info("Received JSON data from %s: %s", request.sid, json_payload)
    # Safely store the incoming JSON data.
    with data_lock:
        data_store.append(json_payload)
    # Acknowledge receipt to the client.
    emit('response', {'message': 'Data received'}, broadcast=False)


if __name__ == '__main__':
    # Heroku provides the port via the PORT environment variable.
    port = int(os.environ.get('PORT', 5000))
    app.logger.info("Starting app on port %d", port)
    # Use eventlet or gevent if available; here we let Flask-SocketIO choose.
    socketio.run(app, host='0.0.0.0', port=port)
