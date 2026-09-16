"""
Wraps the trained resource requirement model.
"""
import os
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "resource_model.pkl")

_bundle = None


def _load():
    global _bundle
    if _bundle is None:
        _bundle = joblib.load(MODEL_PATH)
    return _bundle


def predict_resources(workload=65, resource_utilization=70, team_capacity=100, demand_growth=0, horizon=30, **kwargs):
    bundle = _load()
    model = bundle["model"]

    features = pd.DataFrame([[workload, resource_utilization, team_capacity, demand_growth]], columns=bundle["feature_cols"])
    preds = model.predict(features)[0]
    required_resources = max(0, round(float(preds[0])))
    capacity_gap = round(float(preds[1]), 1)

    expected_utilization = round(min(100.0, resource_utilization + max(0, capacity_gap) * 2), 1)

    return {
        "required_resources": required_resources,
        "capacity_gap": capacity_gap,
        "expected_utilization": expected_utilization,
        "confidence": 88.0,
    }
