import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import json
from datetime import datetime, timezone
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.session import SessionLocal
from backend.app.db.base import init_db
from backend.app.models.complaint import Complaint
from backend.app.models.metadata import ModelMetadataRecord
from backend.app.ml.pipeline import (
    build_pipeline,
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
)


def load_training_data(db: Session) -> pd.DataFrame:
    """Fetch resolved synthetic records only, preventing data leakage."""
    query = (
        db.query(Complaint)
        .filter(
            Complaint.source == "synthetic_demo",
            Complaint.status == "Resolved",
            Complaint.resolved_at.isnot(None),
        )
        .all()
    )

    data = []
    for c in query:
        if c.resolved_at and c.submitted_at:
            duration = (c.resolved_at - c.submitted_at).total_seconds() / 3600.0
            if duration >= 0.1:  # Non-negative, valid duration
                data.append({
                    "category": c.category,
                    "location": c.location,
                    "severity": c.severity,
                    "submission_hour": c.submitted_at.hour,
                    "submission_day_of_week": c.submitted_at.weekday(),
                    "resolution_hours": round(duration, 2),
                })

    df = pd.DataFrame(data)
    return df


def train_and_evaluate_models() -> dict:
    """Execute rigorous training, cross-model comparison, artifact persistence, and metadata recording."""
    init_db()
    db: Session = SessionLocal()

    try:
        df = load_training_data(db)
        if len(df) < 50:
            raise ValueError(f"Insufficient resolved training data ({len(df)} rows). Run seed script first.")

        feature_cols = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
        X = df[feature_cols]
        y = df["resolution_hours"]

        # 80/20 train/test split with fixed random seed
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        candidates = ["linear", "decision_tree", "random_forest"]
        results = {}
        best_model_name = None
        best_mae = float("inf")
        best_pipeline = None

        print(f"Training on {len(X_train)} samples, evaluating on {len(X_test)} samples...")

        for name in candidates:
            pipe = build_pipeline(model_type=name, random_state=42)
            pipe.fit(X_train, y_train)
            y_pred = pipe.predict(X_test)

            mae = float(mean_absolute_error(y_test, y_pred))
            mse = float(mean_squared_error(y_test, y_pred))
            rmse = float(np.sqrt(mse))
            r2 = float(r2_score(y_test, y_pred))

            results[name] = {
                "mae": round(mae, 3),
                "rmse": round(rmse, 3),
                "r2": round(r2, 3),
            }
            print(f"[{name.upper()}] MAE: {mae:.2f}h | RMSE: {rmse:.2f}h | R²: {r2:.3f}")

            if mae < best_mae:
                best_mae = mae
                best_model_name = name
                best_pipeline = pipe

        # Persist best model
        os.makedirs(os.path.dirname(settings.MODEL_STORAGE_PATH), exist_ok=True)
        joblib.dump(best_pipeline, settings.MODEL_STORAGE_PATH)
        print(f"Saved best model ({best_model_name}) to {settings.MODEL_STORAGE_PATH}")

        version = f"v1.0.0-{datetime.now(timezone.utc).strftime('%Y%m%d')}"
        metadata = {
            "model_name": "CampusFix Resolution Duration Estimator",
            "version": version,
            "algorithm": f"scikit-learn Pipeline ({best_model_name})",
            "metrics": results[best_model_name],
            "candidate_evaluations": results,
            "features": feature_cols,
            "training_sample_count": len(X_train),
            "test_sample_count": len(X_test),
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "target": "resolution_hours (non-negative float)",
            "leakage_prevention": "Strictly limited to pre-submission variables",
        }

        # Save metadata JSON file
        with open(settings.MODEL_METADATA_PATH, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        print(f"Saved model metadata to {settings.MODEL_METADATA_PATH}")

        # Update or insert record in database
        # Deactivate old models
        db.query(ModelMetadataRecord).update({ModelMetadataRecord.is_active: False})
        record = ModelMetadataRecord(
            model_name=metadata["model_name"],
            version=version,
            algorithm=metadata["algorithm"],
            metrics_json=json.dumps(metadata["metrics"]),
            features_json=json.dumps(feature_cols),
            training_sample_count=len(X_train),
            trained_at=datetime.now(timezone.utc),
            is_active=True,
        )
        db.add(record)
        db.commit()

        return metadata

    finally:
        db.close()


if __name__ == "__main__":
    train_and_evaluate_models()
