"""
Wraps the trained team performance model.
"""
import os
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "team_performance_model.pkl")

_bundle = None


def _load():
    global _bundle
    if _bundle is None:
        _bundle = joblib.load(MODEL_PATH)
    return _bundle


def predict_team_performance(
    historical_performance=78,
    workload=65,
    utilization=70,
    task_completion=80,
    resource_count=8,
    efficiency=78,
    horizon=30,
    **kwargs,
):
    bundle = _load()
    model = bundle["model"]

    features = pd.DataFrame(
        [[historical_performance, workload, utilization, efficiency, task_completion, resource_count]],
        columns=bundle["feature_cols"],
    )
    predicted_performance = float(model.predict(features)[0])
    predicted_performance = round(max(10.0, min(100.0, predicted_performance)), 1)

    # risk probability grows as predicted performance falls further below current performance
    decline = max(0.0, historical_performance - predicted_performance)
    risk_probability = round(min(97.0, 15 + decline * 4.5 + max(0, workload - 75) * 0.8), 1)

    recommended_resources = 0
    if risk_probability >= 70:
        recommended_resources = 2
    elif risk_probability >= 50:
        recommended_resources = 1

    return {
        "predicted_performance": predicted_performance,
        "risk_probability": risk_probability,
        "recommended_resources": recommended_resources,
        "confidence": 85.0,
    }
