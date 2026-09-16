"""
Trains the team performance prediction model.

Features: performance (current), workload, resource_utilization, efficiency,
          task_completion, resource_count
Target:   performance shifted forward (proxy for "future performance") is approximated
          here by regressing performance against workload/utilization pressure, since
          the synthetic dataset is cross-sectional. A companion classifier estimates
          risk_probability for the team continuing on its current trajectory.

Run from ml-service/: python training/train_team_performance.py
"""
import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.getenv("TRAINING_DATA_PATH", os.path.join(BASE_DIR, "data", "training_data.csv"))
MODEL_PATH = os.path.join(BASE_DIR, "models", "team_performance_model.pkl")


def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Training dataset not found at {DATA_PATH}. Upload/export a dataset and set TRAINING_DATA_PATH."
        )
    df = pd.read_csv(DATA_PATH)

    # Construct a synthetic "future performance" target: current performance decayed
    # by workload/utilization pressure over time (grounded relationship, not random).
    pressure = (df["workload"] + df["resource_utilization"]) / 2
    df["future_performance"] = np.clip(
        df["performance"] - (pressure - 70).clip(lower=0) * 0.35 + (70 - pressure).clip(lower=0) * 0.05,
        10,
        100,
    )

    feature_cols = ["performance", "workload", "resource_utilization", "efficiency", "task_completion", "resource_count"]
    X = df[feature_cols]
    y = df["future_performance"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(n_estimators=200, max_depth=4, learning_rate=0.05, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    print(f"[train_team_performance] MAE: {mae:.2f} performance points")

    joblib.dump({"model": model, "feature_cols": feature_cols}, MODEL_PATH)
    print(f"[train_team_performance] Saved -> {MODEL_PATH}")


if __name__ == "__main__":
    main()
