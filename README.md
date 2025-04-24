# 🌿 GreenHouse Optimizer

**Smarten Your Farming with IoT, AWS, and Real-Time Dashboards**

GreenHouse Optimizer is an advanced ESP32-powered smart greenhouse automation system that leverages AWS IoT Core, MQTT protocols, and a web dashboard built with Flask. It enables real-time monitoring and control of greenhouse conditions, facilitating remote precision farming with secure communication.

---

## 🚀 Live Demo

Experience the application in action:

👉 [Live Demo](https://your-demo-url.com)

---

## 🎯 Features

- 🌡️ Real-Time Monitoring: Temperature, Humidity, Light, and Soil Moisture
- 🔁 Dual Modes: Automatic and Manual
- 🔐 Secure MQTT over TLS via AWS IoT Core
- 🌐 Interactive Flask-based Web Dashboard
- 🖥️ Live Control for Lights, Fan, and Water Pump
- 📡 Fully integrated with AWS IoT Core
- ⚙️ Ready for deployment on Heroku or local servers

---

## 🧩 System Architecture

1. **ESP32 Microcontroller**
   - Publishes sensor data to MQTT topics
   - Subscribes to control commands

2. **AWS IoT Core**
   - Secure communication broker (TLS, MQTT)
   - Manages Things and security policies

3. **Flask Dashboard**
   - Receives sensor data
   - Sends control commands
   - Displays system metrics and control interface

---

## 📁 Project Structure

```
green-house-optimizer/
├── app.py                      # Flask application
├── config.py                   # AWS IoT configuration
├── requirements.txt            # Python dependencies
├── Procfile                    # Heroku startup
├── device-cert-base64.txt      # AWS IoT certificate
├── device-private-base64.txt   # Private key
├── AmazonRootCA1-base64.txt    # AWS Root CA
├── templates/
│   └── index.html              # HTML for dashboard
├── static/
│   └── script.js               # JavaScript for live updates
```

---

## 🛠️ Installation

### Prerequisites

- ESP32 Board
- AWS IoT Core Account
- Python 3.x
- Flask, Boto3, Paho-MQTT
- Heroku CLI (optional)

### Setup Steps

1. Clone the repo

   ```
   git clone https://github.com/oasb16/green-house-optimizer.git
   cd green-house-optimizer
   ```

2. Install dependencies

   ```
   pip install -r requirements.txt
   ```

3. Setup AWS IoT

   - Register Thing
   - Download and Base64 encode certs
   - Fill: `device-cert-base64.txt`, `device-private-base64.txt`, `AmazonRootCA1-base64.txt`

4. Run locally

   ```
   python app.py
   ```

5. Deploy on Heroku

   ```
   heroku login
   heroku create
   git push heroku master
   ```

6. Upload firmware to ESP32 using Arduino or PlatformIO
   - Configure MQTT topics and AWS endpoint in firmware

---

## 🌐 Web Dashboard

- 📊 Sensor data visualization
- 🔘 Mode switch (Auto/Manual)
- 🌱 Manual control (Fan, Light, Water)
- 🛡️ Secure status indicators

---

## 🔒 Security

- TLS Encryption for all MQTT traffic
- AWS IoT Policy restrictions
- Base64-encoded credentials for ease and safety

---

## 🧪 Testing

- Unit tests for Flask routes and MQTT logic
- MQTT logs from AWS IoT Core
- Manual validation with live ESP32 data

---

## 💡 Innovations

- Certificate injection using Base64 text files
- Real-time sync via Flask + JS + MQTT
- Modular design for easy extension

---

## 🤝 Contribution

1. Fork this repo
2. Create a feature branch
3. Commit your changes
4. Push to your fork
5. Submit a pull request

---

## 📄 License

MIT License - See `LICENSE`

---

## 📬 Contact

For issues, discussions, or support, [open an issue](https://github.com/oasb16/green-house-optimizer/issues)

---

By following this README, you can deploy, develop, and extend your own smart greenhouse controller quickly and securely.