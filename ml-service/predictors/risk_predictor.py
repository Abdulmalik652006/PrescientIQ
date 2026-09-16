"""
Wraps the trained risk classification model.
"""
import os
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "risk_model.pkl")

_bundle = None


def _load():
    global _bundle
    if _bundle is None:
        _bundle = joblib.load(MODEL_PATH)
    return _bundle


def predict_risk(
    resource_utilization=70,
    workload=65,
    performance=78,
    absenteeism=3,
    historical_incidents=0,
    demand_growth=0,
    team_capacity=100,
):
    bundle = _load()
    model = bundle["model"]
    label_encoder = bundle["label_encoder"]

    features = pd.DataFrame(
        [[resource_utilization, workload, performance, absenteeism, historical_incidents, demand_growth, team_capacity]],
        columns=bundle["feature_cols"],
    )

    pred_class = model.predict(features)[0]
    proba = model.predict_proba(features)[0]

    risk_level = label_encoder.inverse_transform([pred_class])[0]
    risk_probability = round(float(np.max(proba)) * 100, 1)

    # composite risk score (0-100) blending class index and confidence, for a continuous UI metric
    class_order = {"Low": 20, "Medium": 50, "High": 75, "Critical": 92}
    risk_score = round(class_order.get(risk_level, 50) + (risk_probability - 70) * 0.2, 1)
    risk_score = max(0.0, min(100.0, risk_score))

    return {
        "risk_level": risk_level,
        "risk_probability": risk_probability,
        "risk_score": risk_score,
        "confidence": risk_probability,
    }
