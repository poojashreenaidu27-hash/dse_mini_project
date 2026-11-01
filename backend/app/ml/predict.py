import os
import json
from datetime import datetime, timezone
from typing import Optional, Tuple
import pandas as pd
import joblib

from backend.app.core.config import settings

_cached_model = None
_cached_version = None


def load_model():
    """Load and cache the trained ML pipeline and its version."""
    global _cached_model, _cached_version

    if _cached_model is not None:
        return _cached_model, _cached_version

    if not os.path.exists(settings.MODEL_STORAGE_PATH):
        return None, None

    try:
        _cached_model = joblib.load(settings.MODEL_STORAGE_PATH)

        version = "v1.0.0"
        if os.path.exists(settings.MODEL_METADATA_PATH):
            try:
                with open(settings.MODEL_METADATA_PATH, "r", encoding="utf-8") as f:
                    meta = json.load(f)
                    version = meta.get("version", version)
            except Exception:
                pass
        _cached_version = version
        return _cached_model, _cached_version
    except Exception as e:
        print(f"Warning: Failed to load ML model from {settings.MODEL_STORAGE_PATH}: {e}")
        return None, None


def predict_resolution_time(
    category: str,
    location: str,
    severity: str,
    submitted_at: Optional[datetime] = None,
) -> Tuple[Optional[float], Optional[str]]:
    """Predict estimated resolution duration in hours given submission attributes.
    Returns:
        (predicted_hours, model_version) or (None, None) if model unavailable.
    """
    model, version = load_model()
    if model is None:
        return None, None

    now = submitted_at or datetime.now(timezone.utc)
    features_df = pd.DataFrame([
        {
            "category": category,
            "location": location,
            "severity": severity,
            "submission_hour": now.hour,
            "submission_day_of_week": now.weekday(),
        }
    ])

    try:
        raw_pred = float(model.predict(features_df)[0])
        # Ensure prediction is positive and realistic (at least 0.5 hours)
        predicted_hours = round(max(0.5, raw_pred), 1)
        return predicted_hours, version
    except Exception as e:
        print(f"Prediction inference error: {e}")
        return None, None

