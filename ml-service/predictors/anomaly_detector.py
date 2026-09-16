"""
Wraps the trained Isolation Forest anomaly detection model.
"""
import os
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "anomaly_model.pkl")

_bundle = None


def _load():
    global _bundle
    if _bundle is None:
        _bundle = joblib.load(MODEL_PATH)
    return _bundle


def detect_anomaly(values=None, department="Unknown", metric="workload", performance=78, historical_incidents=0):
    """
    values: list[float] — a recent window of the metric being monitored (e.g. workload).
    Uses the mean/latest of `values` alongside performance/incidents as feature proxies,
    since the trained model expects the same 4 features it was trained on.
    """
    bundle = _load()
    model = bundle["model"]
    scaler = bundle["scaler"]

    if not values:
        values = [70.0]

    latest = values[-1]
    avg = float(np.mean(values))
    resource_utilization_proxy = avg  # best available proxy from a single-metric window

    features = pd.DataFrame([[latest, resource_utilization_proxy, performance, historical_incidents]], columns=bundle["feature_cols"])
    features_scaled = scaler.transform(features)

    raw_score = model.decision_function(features_scaled)[0]  # higher = more normal
    prediction = model.predict(features_scaled)[0]  # -1 anomaly, 1 normal
    is_anomaly = bool(prediction == -1)

    # normalize anomaly_score to 0-100 (100 = most anomalous)
    anomaly_score = round(float(max(0.0, min(100.0, (0.5 - raw_score) * 100))), 1)

    pct_above_avg = round(((latest - avg) / avg) * 100, 1) if avg else 0.0
    explanation = (
        f"{department} {metric} is {pct_above_avg}% above its recent average."
        if is_anomaly
        else f"{department} {metric} is within its normal operating range."
    )

    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": anomaly_score,
        "explanation": explanation,
    }
