"""
Trains the demand prediction model.

Features: previous_demand, weekly_average, monthly_average, seasonality,
          resource_utilization, workload, department (encoded), region (encoded)
Target:   demand

Run from ml-service/: python training/train_demand.py
"""
import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_percentage_error, r2_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.getenv("TRAINING_DATA_PATH", os.path.join(BASE_DIR, "data", "training_data.csv"))
MODEL_PATH = os.path.join(BASE_DIR, "models", "demand_model.pkl")


def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Training dataset not found at {DATA_PATH}. Upload/export a dataset and set TRAINING_DATA_PATH."
        )
    df = pd.read_csv(DATA_PATH)

    dept_encoder = LabelEncoder()
    region_encoder = LabelEncoder()
    df["department_enc"] = dept_encoder.fit_transform(df["department"])
    df["region_enc"] = region_encoder.fit_transform(df["region"])

    feature_cols = [
        "previous_demand",
        "weekly_average",
        "monthly_average",
        "seasonality",
        "resource_utilization",
        "workload",
        "department_enc",
        "region_enc",
    ]
    X = df[feature_cols]
    y = df["demand"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(
        n_estimators=250,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.9,
        random_state=42,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mape = mean_absolute_percentage_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"[train_demand] MAPE: {mape*100:.2f}%  |  R2: {r2:.3f}")

    joblib.dump(
        {
            "model": model,
            "feature_cols": feature_cols,
            "dept_encoder": dept_encoder,
            "region_encoder": region_encoder,
            "test_mape": mape,
        },
        MODEL_PATH,
    )
    print(f"[train_demand] Saved -> {MODEL_PATH}")


if __name__ == "__main__":
    main()
