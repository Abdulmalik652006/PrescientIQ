"""
Trains the risk classification model.

Features: resource_utilization, workload, performance, absenteeism,
          historical_incidents, demand_growth, team_capacity
Target:   risk_level (Low/Medium/High/Critical)

Run from ml-service/: python training/train_risk.py
"""
import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.getenv("TRAINING_DATA_PATH", os.path.join(BASE_DIR, "data", "training_data.csv"))
MODEL_PATH = os.path.join(BASE_DIR, "models", "risk_model.pkl")


def main():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Training dataset not found at {DATA_PATH}. Upload/export a dataset and set TRAINING_DATA_PATH."
        )
    df = pd.read_csv(DATA_PATH)

    feature_cols = [
        "resource_utilization",
        "workload",
        "performance",
        "absenteeism",
        "historical_incidents",
        "demand_growth",
        "team_capacity",
    ]
    X = df[feature_cols]

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df["risk_level"])  # Low/Medium/High/Critical -> 0..3

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        min_samples_leaf=3,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"[train_risk] Accuracy: {acc*100:.2f}%")
    print(classification_report(y_test, preds, target_names=label_encoder.classes_))

    joblib.dump(
        {
            "model": model,
            "feature_cols": feature_cols,
            "label_encoder": label_encoder,
            "test_accuracy": acc,
        },
        MODEL_PATH,
    )
    print(f"[train_risk] Saved -> {MODEL_PATH}")


if __name__ == "__main__":
    main()
