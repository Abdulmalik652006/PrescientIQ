# 🚀 PrescientIQ – AI-Powered Predictive Management System

**PrescientIQ** is an AI-powered predictive management platform designed to help organizations make data-driven decisions using **machine learning, predictive analytics, real-time dashboards, risk analysis, forecasting, anomaly detection, and intelligent recommendations**.

The system combines a modern React dashboard with a Node.js/Express backend, MongoDB database, and a dedicated Python FastAPI machine-learning service.

---

## ✨ Features

### 📊 Intelligent Dashboard

* Real-time management KPIs
* Performance monitoring
* Operational insights
* Interactive charts and visualizations
* 3D neural visualization
* Business performance overview

### 🤖 AI & Machine Learning

PrescientIQ includes multiple trained ML models for:

* 📈 Demand Prediction
* ⚠️ Risk Prediction
* 👥 Resource Requirement Prediction
* 🔍 Anomaly Detection
* 🏆 Team Performance Prediction
* 🔮 Future Forecasting

### 📉 Analytics

* Operational analytics
* Performance analysis
* Resource utilization
* Workload analysis
* Historical trend analysis
* Data-driven insights

### 🚨 Alerts & Risk Monitoring

* Automated risk identification
* Operational anomaly detection
* Performance alerts
* Risk-based recommendations

### 👥 Team Management

* Team performance tracking
* Team analytics
* Resource monitoring
* Performance predictions

### 📑 Reports

* Generate management reports
* View analytical results
* Predictive insights
* Operational summaries

### 💬 AI Assistant

An integrated AI chat assistant allows users to interact with the platform and obtain intelligent insights from the management system.

### 🔐 Authentication

* Secure user authentication
* JWT-based authorization
* Role-based access
* Protected API endpoints

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │   Vite + Tailwind    │
                    └──────────┬───────────┘
                               │
                         REST / Axios
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Node.js + Express    │
                    │    API Gateway       │
                    └───────┬───────┬──────┘
                            │       │
                     MongoDB       │
                            │       │
                            ▼       ▼
                    ┌──────────┐  ┌──────────────────┐
                    │ MongoDB  │  │ Python FastAPI   │
                    │ Database │  │   ML Service     │
                    └──────────┘  └────────┬─────────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │ Machine Learning Models │
                              │                        │
                              │ • Demand               │
                              │ • Risk                 │
                              │ • Resources             │
                              │ • Anomaly              │
                              │ • Team Performance     │
                              └────────────────────────┘
```

The **React frontend communicates with the Node.js backend**, while the backend communicates with MongoDB and the Python ML service.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts
* Three.js
* Lucide React
* React Hot Toast

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs
* Axios
* Multer
* Helmet
* CORS

### Machine Learning

* Python
* FastAPI
* Scikit-learn
* Pandas
* NumPy
* Joblib
* Pydantic
* Uvicorn

### Machine Learning Algorithms

* Gradient Boosting Regressor
* Random Forest Classifier
* Random Forest Multi-Output Regression
* Isolation Forest

---

## 📂 Project Structure

```text
PrescientIQ/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── alertController.js
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── dashboardController.js
│   │   ├── forecastController.js
│   │   ├── predictionController.js
│   │   ├── reportController.js
│   │   ├── resourceController.js
│   │   ├── teamController.js
│   │   └── uploadController.js
│   │
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── seed/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── ml-service/
│   ├── models/
│   │   ├── anomaly_model.pkl
│   │   ├── demand_model.pkl
│   │   ├── resource_model.pkl
│   │   ├── risk_model.pkl
│   │   └── team_performance_model.pkl
│   │
│   ├── predictors/
│   ├── training/
│   ├── generate_training_data.py
│   ├── main.py
│   └── requirements.txt
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/PrescientIQ.git
cd PrescientIQ
```

---

## 2. Backend Setup

Open a terminal:

```bash
cd backend
npm install
```

Create your environment file:

```bash
copy .env.example .env
```

For Linux/macOS:

```bash
cp .env.example .env
```

Configure your `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/prescientiq

JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development

ML_SERVICE_URL=http://127.0.0.1:8000
ML_SERVICE_TIMEOUT_MS=8000

CLIENT_ORIGIN=http://localhost:5173

GROQ_API_KEY=your_groq_api_key
GROQ_CHAT_MODEL=your_chat_model
```

---

## 3. Start MongoDB

Make sure MongoDB is running locally or use **MongoDB Atlas**.

For MongoDB Atlas, replace:

```env
MONGO_URI=your_mongodb_atlas_connection_string
```

---

## 4. Seed Demo Data

From the `backend` directory:

```bash
npm run seed
```

This creates sample users and operational data for testing the application.

---

## 5. Start Backend

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# 🧠 ML Service Setup

Open a new terminal:

```bash
cd ml-service
```

Create a Python virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the ML service:

```bash
uvicorn main:app --reload --port 8000
```

ML service:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🔌 ML API Endpoints

| Method | Endpoint                    | Purpose             |
| ------ | --------------------------- | ------------------- |
| GET    | `/health`                   | ML service health   |
| POST   | `/predict/demand`           | Demand prediction   |
| POST   | `/predict/risk`             | Risk prediction     |
| POST   | `/predict/resources`        | Resource prediction |
| POST   | `/predict/team-performance` | Team performance    |
| POST   | `/detect/anomaly`           | Anomaly detection   |
| POST   | `/forecast`                 | Future forecasting  |

---

# 📊 Machine Learning Models

| Prediction       | Model                       |
| ---------------- | --------------------------- |
| Demand           | Gradient Boosting Regressor |
| Risk             | Random Forest Classifier    |
| Resources        | Random Forest Multi-Output  |
| Anomaly          | Isolation Forest            |
| Team Performance | Gradient Boosting Regressor |

The included models are trained using generated/synthetic operational data for demonstration and development purposes.

> **Note:** Model performance on synthetic data should not be interpreted as production performance. Real-world deployment requires training and validation using representative organizational data.

---

# 🔐 Security

PrescientIQ uses several security mechanisms:

* JWT authentication
* Password hashing with bcrypt
* Protected API routes
* Helmet security middleware
* CORS configuration
* Environment variables for secrets
* Backend-only AI API key handling
* Request validation

### ⚠️ Important

Never commit your `.env` file or API keys to GitHub.

Make sure `.gitignore` contains:

```gitignore
.env
node_modules/
__pycache__/
*.pyc
venv/
dist/
```

---

# 🖥️ Main Application Modules

```text
Dashboard
    │
    ├── Analytics
    ├── Predictions
    ├── Forecasts
    ├── Alerts
    ├── Resources
    ├── Teams
    ├── Reports
    └── Settings
```

---

# 🔄 Application Workflow

```text
User
 │
 ▼
React Dashboard
 │
 ▼
Node.js / Express API
 │
 ├──────────────► MongoDB
 │
 ▼
Python FastAPI ML Service
 │
 ▼
Machine Learning Models
 │
 ▼
Prediction / Forecast / Risk Result
 │
 ▼
Node.js API
 │
 ▼
React Dashboard
```

---

# 🎯 Use Cases

PrescientIQ can be used for:

* Operational planning
* Demand forecasting
* Workforce planning
* Resource allocation
* Risk monitoring
* Team performance analysis
* Anomaly detection
* Business intelligence
* Predictive decision support

---

# 🚀 Future Enhancements

* Real-time streaming analytics
* Advanced deep-learning models
* Automated model retraining
* Cloud-based ML deployment
* Role-based enterprise permissions
* Advanced notification system
* More forecasting algorithms
* Data warehouse integration
* Mobile application
* Explainable AI dashboards

---

# 👨‍💻 Developer

**Abdul Malik**

B.Tech Artificial Intelligence & Data Science

Interested in:

* Machine Learning
* Data Science
* Full-Stack Development
* AI Applications
* Cloud & DevOps


