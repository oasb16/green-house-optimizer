# 🌿🚀 **GreenHouse Optimizer** – **Automate Your Smart Farm with IoT & MQTT!** 💡💨

![GitHub stars](https://img.shields.io/github/stars/your-repo?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-repo?style=social)
![Contributors](https://img.shields.io/github/contributors/your-repo)
![Issues](https://img.shields.io/github/issues/your-repo)
![MIT License](https://img.shields.io/github/license/your-repo)

> **Grow Smarter, Not Harder!** 🧠🌱  
> 🌿 GreenHouse Optimizer
> A cutting-edge **ESP32-based IoT** greenhouse automation project that **subscribes to sensor data** and **publishes control signals** over **AWS IoT MQTT**. 🛰️
> Smarten Your Farming with IoT + AWS + Real-Time Dashboards
> An advanced ESP32-powered smart greenhouse automation system that leverages AWS IoT Core, MQTT protocols, and a web dashboard built with Flask for live monitoring and environmental control of greenhouse conditions. Designed for remote precision farming, real-time feedback, and secure communication.

🎯 Overview
GreenHouse Optimizer provides:
🌡️ Real-time monitoring of temperature, humidity, light intensity, and soil moisture.
🔄 Dual control system: automatic or manual operation via dashboard.
🔐 TLS-encrypted communication using AWS IoT MQTT.
🌐 Web-based control interface with live data streaming.
🚀 Ready for deployment on Heroku, local servers, or Raspberry Pi.

> 🧩 System Architecture
> ESP32 Microcontroller
> Reads from DHT11 (Temperature & Humidity), Photoresistor (Light), and Soil Moisture sensors.
> Publishes sensor readings to AWS IoT MQTT topics.
> Subscribes to control commands.
> AWS IoT Core
> Secure MQTT broker handling TLS-authenticated communication between ESP32 and dashboard.
> Flask Web Dashboard
> Subscribes to AWS IoT topics for real-time data.
> Publishes commands for auto/manual control.
> Visualizes data and system state.

## 🌍 Live Demo 🎬  
🚀 Deployed on **Heroku** and connected to **ESP32** via **AWS IoT Core!**  
🌎 Click Here ➡ **[LIVE DEMO](https://your-demo-url.com/)**

---

## ⚡ **What This Does**
🔥 Real-time **sensor monitoring** from ESP32  
📡 Secure **AWS IoT MQTT Communication**  
🔘 Control your greenhouse with **Auto & Manual Modes**  
🖥️ **Fancy Web Dashboard** powered by **Flask & JS**  
🔒 **TLS Encryption** for ultra-secure data transmission  
🚀 **Works on Heroku, Raspberry Pi, or Any Cloud!**   

---

## 🛠️ **Features**
✅ **ESP32 IoT Support** 🌎  
✅ **Real-time MQTT Sensor Data** 📊  
✅ **Auto & Manual Mode Control** ⚙️  
✅ **Beautiful Web Interface** 🎨  
✅ **Secure TLS Encryption** 🔒  
✅ **Plug & Play Setup** 🛠️  

---

## 🎮 **MQTT Topics**
| **Topic**         | **Function**                         |
|------------------|---------------------------------|
| `esp32/sensorData` | Receive Sensor Data (Temp, Humidity, Light, Soil Moisture) |
| `esp32/commands`  | Send Control Commands (Button 1, 2, 3, Auto, Manual) |


## 🚀 **Web UI Preview**
![UI Screenshot](https://your-screenshot-url.com/image.png)

🎨 **Beautifully designed dashboard for live monitoring & control!**

---

## 🔗 **Tech Stack**
- **ESP32** 🛰️ (MQTT Client)
- **AWS IoT Core** ☁️ (MQTT Broker)
- **Flask** 🐍 (Web Server)
- **Paho-MQTT** 📡 (Python MQTT Library)
- **JavaScript (AJAX + Fetch API)** 🖥️ (Front-end)
- **Heroku / Ngrok** 🚀 (Deployment)

---



🛠️ Installation Guide
Requirements
ESP32 Development Board
AWS IoT Core account
Python 3.6+
Flask, AWS SDK, MQTT
Heroku CLI (for cloud deployment)

Setup Steps
Clone the Repository
git clone https://github.com/oasb16/green-house-optimizer.git
Install Dependencies
pip install -r requirements.txt
Configure AWS IoT Core
Register your ESP32 as a Thing.
Download and encode the private key, certificate, and root CA in Base64.
Replace contents of:
device-cert-base64.txt
device-private-base64.txt
AmazonRootCA1-base64.txt

Run Locally
python app.py

Deploy to Heroku
Add Procfile and requirements.txt.
Deploy using:
heroku create
git push heroku master

Flash ESP32
Use Arduino IDE or PlatformIO.
Set WiFi credentials and AWS MQTT endpoint in your firmware sketch.
Match topics with:
esp32/sensorData
esp32/commands

🌐 Dashboard Features
📊 Real-time sensor visualization.

🔘 Mode toggle: Auto or Manual.

🔦 Manual control: Lights, Fan, Water Pump.

✅ Status indicators for each component.

🔒 Secure TLS connection monitoring.

📁 Project Structure
GreenHouseOptimizer/
├── app.py                  # Flask app
├── config.py               # AWS IoT & MQTT setup
├── requirements.txt        # Python dependencies
├── Procfile                # Heroku startup
├── device-cert-base64.txt  # Encoded certificate
├── device-private-base64.txt # Encoded private key
├── AmazonRootCA1-base64.txt  # Encoded Root CA
├── templates/
│   └── index.html          # Dashboard HTML
├── static/
│   └── script.js           # Client-side JS

🔒 Security
TLS 1.2 encryption ensures safe MQTT messaging.
AWS IoT policies restrict unauthorized publish/subscribe.
Keys/certs are stored securely in Base64 format and decoded at runtime.

🧪 Testing & Validation
Manual testing with live sensor input.
MQTT topic monitoring with AWS logs.
Local and Heroku test deployments.

💡 Innovations
Base64 certificate handling for simplified deployment.
One-click switch between Auto and Manual control.
Real-time updates with minimal latency using MQTT and Flask sockets.

🤝 Contributing
Fork the repository.
Create a feature branch: git checkout -b feature-name
Commit your changes.
Open a pull request with clear explanations.

📜 License
This project is licensed under the MIT License — see the LICENSE file for details.

📬 Contact
Raise an issue or pull request on GitHub:
https://github.com/oasb16/green-house-optimizer

---

## 🔥 **Contribute & Support**
🤩 **Love the project? Give a ⭐ and fork it!**  
🐛 Found an issue? **Submit an issue report!**  
💡 Have an idea? **Contribute to the project!**

---

## 📜 **License**
MIT License © 2025 **Your Name**  

---

🌟 **Follow for More!** 🌟  
💙 **Twitter**: [@YourTwitter](https://twitter.com/YourTwitter)  
🖥️ **GitHub**: [YourProfile](https://github.com/YourProfile)  

---

🔥 **Time to make your Greenhouse smarter! Let’s GROW!** 🌱🚀
