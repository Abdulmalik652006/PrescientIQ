"""
Trains the resource requirement model.

Features: workload, resource_utilization, team_capacity, demand_growth
Targets:  required_resources, capacity_gap  (multi-output regression)

Run from ml-service/: python training/train_resource.py
"""
import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.getenv("TRAINING_DATA_PATH", os.path.join(BASE_DIR, "data", "training_data.csv"))
MODEL_PATH = os.path.join(BASE_DIR, "models", "resource_model.pkl")


def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Training dataset not found at {DATA_PATH}. Upload/export a dataset and set TRAINING_DATA_PATH."
        )
    df = pd.read_csv(DATA_PATH)

    feature_cols = ["workload", "resource_utilization", "team_capacity", "demand_growth"]
    target_cols = ["required_resources", "capacity_gap"]

    X = df[feature_cols]
    y = df[target_cols]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    base = RandomForestRegressor(n_estimators=200, max_depth=8, random_state=42)
    model = MultiOutputRegressor(base)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae_required = mean_absolute_error(y_test["required_resources"], preds[:, 0])
    mae_gap = mean_absolute_error(y_test["capacity_gap"], preds[:, 1])
    print(f"[train_resource] MAE required_resources: {mae_required:.2f}  |  MAE capacity_gap: {mae_gap:.2f}")

    joblib.dump({"model": model, "feature_cols": feature_cols, "target_cols": target_cols}, MODEL_PATH)
    print(f"[train_resource] Saved -> {MODEL_PATH}")


if __name__ == "__main__":
    main()
