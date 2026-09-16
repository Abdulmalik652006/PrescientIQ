"""
Wraps the trained demand model for use by the FastAPI endpoints.
"""
import os
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "demand_model.pkl")

_bundle = None


def _load():
    global _bundle
    if _bundle is None:
        _bundle = joblib.load(MODEL_PATH)
    return _bundle


def predict_demand(historical_demand, resource_utilization=70, workload=65, department="Operations", region="Central", horizon=30):
    """
    historical_demand: list[float] — recent demand history (most recent last)
    Returns: dict(prediction, growth_percentage, confidence)
    """
    bundle = _load()
    model = bundle["model"]
    dept_encoder = bundle["dept_encoder"]
    region_encoder = bundle["region_encoder"]

    if not historical_demand:
        historical_demand = [500.0]

    previous_demand = historical_demand[-1]
    weekly_average = float(np.mean(historical_demand[-7:])) if len(historical_demand) >= 1 else previous_demand
    monthly_average = float(np.mean(historical_demand[-30:])) if len(historical_demand) >= 1 else previous_demand
    seasonality = 0.0  # neutral seasonality assumption for forward horizon

    try:
        dept_enc = dept_encoder.transform([department])[0]
    except ValueError:
        dept_enc = 0
    try:
        region_enc = region_encoder.transform([region])[0]
    except ValueError:
        region_enc = 0

    features = pd.DataFrame(
        [[previous_demand, weekly_average, monthly_average, seasonality, resource_utilization, workload, dept_enc, region_enc]],
        columns=bundle["feature_cols"],
    )

    base_prediction = model.predict(features)[0]

    # scale prediction to the requested horizon relative to the model's implicit daily basis
    horizon_factor = max(0.5, min(3.0, horizon / 30))
    prediction = float(base_prediction * horizon_factor)

    growth_percentage = round(((prediction - previous_demand) / max(1, previous_demand)) * 100, 1)

    test_mape = bundle.get("test_mape", 0.05)
    confidence = round(max(60.0, min(99.0, (1 - test_mape) * 100 - abs(growth_percentage) * 0.05)), 1)

    return {
        "prediction": round(prediction, 1),
        "growth_percentage": growth_percentage,
        "confidence": confidence,
    }
