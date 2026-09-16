"""
Trains the anomaly detection model using Isolation Forest.

Features: workload, resource_utilization, performance, historical_incidents
Unsupervised — is_anomaly column in the CSV is used only to report an
approximate agreement rate, not as a training label.

Run from ml-service/: python training/train_anomaly.py
"""
import os
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.getenv("TRAINING_DATA_PATH", os.path.join(BASE_DIR, "data", "training_data.csv"))
MODEL_PATH = os.path.join(BASE_DIR, "models", "anomaly_model.pkl")


def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Training dataset not found at {DATA_PATH}. Upload/export a dataset and set TRAINING_DATA_PATH."
        )
    df = pd.read_csv(DATA_PATH)

    feature_cols = ["workload", "resource_utilization", "performance", "historical_incidents"]
    X = df[feature_cols]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(
        n_estimators=200,
        contamination=0.06,  # roughly matches the rate of flagged rows in the synthetic data
        random_state=42,
    )
    model.fit(X_scaled)

    preds = model.predict(X_scaled)  # -1 = anomaly, 1 = normal
    predicted_anomaly_rate = (preds == -1).mean()
    agreement = (df["is_anomaly"].values == (preds == -1).astype(int)).mean()
    print(f"[train_anomaly] Predicted anomaly rate: {predicted_anomaly_rate*100:.2f}%")
    print(f"[train_anomaly] Agreement with heuristic label: {agreement*100:.2f}%")

    joblib.dump({"model": model, "scaler": scaler, "feature_cols": feature_cols}, MODEL_PATH)
    print(f"[train_anomaly] Saved -> {MODEL_PATH}")


if __name__ == "__main__":
    main()
