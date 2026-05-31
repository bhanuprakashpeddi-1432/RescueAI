# RescueAI 🌪️ 🚁

> **An AI-Powered Emergency Response & Disaster Management Command Portal**

RescueAI is an advanced, full-stack disaster management system designed to assist emergency response coordinators. It leverages a multi-agent AI architecture and high-performance algorithms to instantly analyze crises, forecast secondary disasters, optimally allocate resources, and generate life-saving communications. 

The system features a state-of-the-art Command Center Dashboard that provides commanders with real-time operational telemetry, geospatial tracking, and strategic analytics.

---

## 🚀 Key Features

### 🧠 Multi-Agent AI Orchestration
When an emergency occurs, four specialized AI agents run in parallel to formulate a comprehensive response strategy:
- **Rescue Agent**: Formulates search & rescue parameters and extraction plans.
- **Medical Agent**: Handles triage categorization and hospital diversion routing.
- **Logistics Agent**: Calculates shelter deployment and supply convoy dispatches.
- **Communication Agent**: Generates public warnings and inter-agency notifications.

### 🔮 Disaster Risk Prediction Engine
A deterministic, algorithmic engine that forecasts secondary cascading disasters (e.g., floods causing building collapses) using a 48-hour half-life recency decay model, live weather data, and shelter pressure metrics. Returns predictions in **~13ms**.

### 🚑 Geospatial Resource Allocation
Instantly computes optimal assignments for medical teams, hospitals, and civilian shelters using Haversine distance calculations and operational load thresholding.

### 📡 AI Emergency Broadcast Generator
Dynamically adjusts tone based on disaster severity to generate strictly formatted **SMS Alerts** (max 160 characters), **Push Notifications**, and comprehensive **Public Advisories** for civilian dissemination.

### 📊 Authority Command Center Dashboard
A highly responsive, "cyber-aesthetic" React frontend featuring:
- **Live Threat Feed**: Real-time Socket.io streams of incoming intelligence.
- **Incident Matrix**: Tracking deployments, severity profiles, and stabilization progress.
- **Advanced Analytics**: Interactive, Recharts-powered tracking of disaster trends, capacity bottlenecks, and response latency benchmarks.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **AI & Processing**: OpenRouter (OpenAI API compatibility layer)
- **Map Integration**: Leaflet, React-Leaflet

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/RescueAI.git
cd RescueAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure your OpenRouter API key:
```env
OPENROUTER_API_KEY=your_api_key_here
```

### 4. Run the Application
RescueAI uses `concurrently` to run both the Vite frontend server and the Node.js backend API simultaneously.
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)

---

## 📂 Project Structure

```text
RescueAI/
├── server/                        # Node.js Express Backend
│   ├── agents/                    # Multi-Agent AI System
│   ├── controllers/               # API Route Handlers
│   ├── services/                  # Business Logic (Allocation, Prediction, SitRep)
│   ├── routes/                    # API Routing Definitions
│   └── server.js                  # Main Backend Entrypoint
├── src/                           # React Frontend
│   ├── components/
│   │   ├── dashboard/             # Command Center UI Components
│   │   │   └── charts/            # Recharts Analytics Components
│   │   ├── EmergencyChat.jsx      # AI Assistant Interface
│   │   └── RescueMap.jsx          # Live Geospatial Map
│   ├── pages/
│   │   └── CommandCenterDashboard.jsx  # Main Dashboard Orchestrator
│   ├── App.jsx                    # React Entrypoint
│   └── index.css                  # Tailwind Directives & Custom Tech CSS
├── .env                           # API Configuration
└── package.json                   # Dependencies & Scripts
```

---

## 🌐 API Documentation

The backend provides several high-performance endpoints for integration:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent-dispatch` | `POST` | Triggers the 4-agent parallel intelligence analysis. |
| `/api/risk-forecast` | `GET/POST` | Generates algorithmic cascading disaster predictions. |
| `/api/resource-allocation` | `POST` | Computes optimal hospital, shelter, and ambulance routing. |
| `/api/sitrep/generate` | `POST` | Assembles a FEMA-standard Markdown Situation Report. |
| `/api/broadcast/generate` | `POST` | Generates AI-tailored SMS and push notification alerts. |

---

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Built to empower emergency responders with data-driven clarity when seconds matter most.*
