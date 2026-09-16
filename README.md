# Predictive Management System

An AI-powered predictive management platform: **React frontend → Node.js/Express API gateway → MongoDB**, with a separate **Python FastAPI ML service** (5 trained scikit-learn models) providing demand, risk, resource, anomaly, and team-performance predictions.

## Status

| Layer | Status |
|---|---|
| `backend/` (Node.js/Express + MongoDB) | ✅ Complete |
| `ml-service/` (Python FastAPI + 5 trained models) | ✅ Complete — models trained and verified |
| `frontend/` (React/Vite) | ⏳ Not yet built — see `frontend/README_PENDING.md` |

## Architecture

```
React (frontend)
   |  Axios / REST
   v
Node.js + Express (backend)  ---- REST ---->  Python FastAPI (ml-service)
   |                                                |
   v                                                v
MongoDB                                    5 trained scikit-learn models
(users, operations, resources,             (demand, risk, resource,
 teams, predictions, alerts,                anomaly, team performance)
 forecasts, recommendations, reports)
```

The frontend never talks to MongoDB or the ML service directly — everything routes through the Node.js backend.

## Folder structure

```
predictive-management-system/
├── backend/          Node.js/Express API — see backend/ for models, routes, controllers, services
├── ml-service/        Python FastAPI ML service — 5 trained models + training scripts
├── frontend/           React/Vite dashboard (pending)
└── README.md            (this file)
```

## Running the backend

```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI, JWT_SECRET, ML_SERVICE_URL as needed
npm run seed               # populates MongoDB with realistic demo data
npm run dev                 # starts on http://localhost:5000
```

Demo credentials (created by the seed script):

| Email | Password | Role |
|---|---|---|
| admin@predictive.io | password123 | Admin |
| manager@predictive.io | password123 | Manager |
| analyst@predictive.io | password123 | Analyst |
| viewer@predictive.io | password123 | Viewer |

## Running the ML service

```bash
cd ml-service
python -m venv venv && source venv/bin/activate   # (or venv\Scripts\activate on Windows)
pip install -r requirements.txt

# Models are already trained and included in models/*.pkl.
# To regenerate data and retrain from scratch instead:
python generate_training_data.py
python training/train_demand.py
python training/train_risk.py
python training/train_resource.py
python training/train_anomaly.py
python training/train_team_performance.py

uvicorn main:app --reload --port 8000
```

Verify it's up: `curl http://localhost:8000/health`

Interactive API docs (FastAPI auto-generates these): `http://localhost:8000/docs`

## Environment variables (backend/.env)

```
MONGO_URI=mongodb://127.0.0.1:27017/predictive_management
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
ML_SERVICE_URL=http://127.0.0.1:8000
ML_SERVICE_TIMEOUT_MS=8000
CLIENT_ORIGIN=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4o-mini
```

The chat assistant is available from the lower-right chat button after signing in. Add the real `OPENAI_API_KEY` to `backend/.env` and restart the backend; the key is only used server-side and is never sent to the frontend.

## Trained model performance (on synthetic training data)

| Model | Metric | Result |
|---|---|---|
| Demand (GradientBoostingRegressor) | MAPE | 0.34% |
| Risk (RandomForestClassifier) | Accuracy | 98.5% |
| Resource requirement (RandomForest, multi-output) | MAE | 0.14 (resources), 0.11 (capacity gap) |
| Anomaly detection (IsolationForest) | Flag rate | 6.0% (contamination=0.06) |
| Team performance (GradientBoostingRegressor) | MAE | 0.18 performance points |

These numbers are high because the synthetic training data encodes clean, learnable relationships by design (for a believable demo). Real production data will have more noise — retrain periodically against actual `actualValue` outcomes recorded on the `Prediction` collection to track real-world accuracy over time.

## Troubleshooting

- **Backend can't reach MongoDB**: confirm `MONGO_URI` and that MongoDB is running (`mongod` locally, or an Atlas connection string).
- **Backend says ML service unreachable**: confirm `uvicorn` is running on the port in `ML_SERVICE_URL`, and that `/health` responds.
- **CORS errors from the frontend**: confirm `CLIENT_ORIGIN` in `backend/.env` matches the frontend's dev server URL.
- **Predictions look flat/repetitive**: reseed with `npm run seed` — it regenerates 2 years of correlated synthetic history.

## Next step

Phase 3: build the React/Vite frontend (Dashboard, Analytics, Predict, Alerts, Resources, Forecasts, Teams, Reports, Settings) wired to this backend's REST API.
