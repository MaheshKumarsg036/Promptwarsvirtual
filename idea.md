
# 🚀 SmartVenue AI — Google Antigravity Demo

## 🧠 Overview

SmartVenue AI is a **web-based intelligent event assistant** designed to improve the physical experience of attendees at large-scale sporting venues.

This demo simulates:
- Crowd movement
- Queue wait times
- Real-time alerts
- Smart navigation

⚠️ Note: This is a **demo system using simulated (fake) data streams** to showcase real-time capabilities.

---

# 🎯 Core Features

## 1. 🧭 Smart Navigation
- Suggests least crowded routes
- Avoids congestion zones
- Dynamic rerouting

## 2. 📊 Crowd Heatmaps
- Real-time density visualization
- Zone-based congestion levels:
  - 🔴 High
  - 🟡 Medium
  - 🟢 Low

## 3. ⏳ Wait Time Prediction
- Food stalls
- Washrooms
- Entry/Exit gates

## 4. 🔔 Real-Time Alerts
- Congestion warnings
- Gate overload alerts
- Event-triggered notifications

## 5. 🎟️ Smart Queue Simulation
- Virtual queue assignment
- Reduced physical crowding

---

# 🏗️ Architecture (Demo-Oriented)

```

Frontend (Next.js PWA)
↓
API Gateway (Cloud Run)
↓
-

## | Crowd Service | Queue Service | Alerts |

↓
Event Bus (Pub/Sub)
↓
Data Simulation Engine
↓
Firestore (Real-time DB)

````

---

# ☁️ Google Cloud Services Used

## 🔹 Core Infrastructure

- Backend Hosting → :contentReference[oaicite:0]{index=0}  
- Database → :contentReference[oaicite:1]{index=1}  
- Messaging/Event Bus → :contentReference[oaicite:2]{index=2}  

---

## 🔹 AI & Data Processing

- ML / Predictions → :contentReference[oaicite:3]{index=3}  
- Stream Processing (optional) → :contentReference[oaicite:4]{index=4}  

---

## 🔹 Maps & Visualization

- Maps + Routing → :contentReference[oaicite:5]{index=5}  

---

## 🔹 Frontend Hosting (Optional)

- Static Hosting → :contentReference[oaicite:6]{index=6}  

---

# 🔄 Data Flow (Simulated)

## Step 1: Fake Data Generator
A simulation service generates:
- Crowd density per zone
- Queue lengths
- Movement patterns

Publishes events to:
→ Pub/Sub

---

## Step 2: Event Processing

Services subscribe to Pub/Sub:

### Crowd Service
- Updates zone density
- Generates heatmap data

### Queue Service
- Calculates wait times

### Alert Service
- Detects anomalies
- Triggers alerts

---

## Step 3: Storage

Processed data stored in:
→ Firestore (real-time updates)

---

## Step 4: Frontend

- Subscribes to Firestore
- Updates UI instantly:
  - Heatmaps
  - Alerts
  - Navigation suggestions

---

# 🧪 Demo Mode (Fake Data Simulation)

## 🎲 Simulation Logic

Run a background job:

```python
while True:
    publish_event({
        "zone": "Gate A",
        "crowd_density": random(0, 100),
        "queue_length": random(0, 50)
    })
````

---

## 📈 Simulated Scenarios

### Scenario 1: Entry Rush

* High density at gates
* Alerts triggered

### Scenario 2: Halftime Spike

* Food stalls crowded
* Wait times increase

### Scenario 3: Exit Chaos

* Exit congestion
* Rerouting suggestions

---

# 🧱 Services Breakdown

## 1. Crowd Service

* Input: Pub/Sub events
* Output: Heatmap data

## 2. Queue Service

* Input: Queue length
* Output: Wait time prediction

## 3. Alert Service

* Input: Threshold breaches
* Output: Notifications

## 4. Simulation Service

* Generates fake real-time data

---

# 🌐 Frontend (Web App)

## Stack

* Next.js (React)
* WebSockets / Firestore listeners
* Google Maps integration

---

## UI Components

### 🗺️ Live Map

* Crowd heat overlay

### 📊 Wait Time Cards

* “Food Stall A: 12 mins”

### 🔔 Alert Panel

* Real-time updates

### 🧭 Navigation Panel

* Smart route suggestions

---

# ⚡ Efficiency Design

* Event-driven architecture (Pub/Sub)
* Serverless compute (Cloud Run)
* Real-time DB (Firestore listeners)
* No polling

---

# 🔐 Security (Demo Scope)

* Public endpoints (no auth for demo)
* Input validation enabled
* Rate limiting optional

---

# 🧪 Testing Strategy

## Unit Tests

* Prediction logic
* Alert triggers

## Simulation Testing

* Inject synthetic spikes
* Validate system response

---

# ♿ Accessibility

* ARIA labels
* High contrast UI
* Simple navigation flows

---

# 🎯 Demo Flow (For Judges)

1. Open web app
2. Show live stadium map
3. Trigger “crowd spike” (simulate)
4. Show:

   * Heatmap change
   * Alert generation
   * Route suggestion update
5. Show wait-time increase at stalls






