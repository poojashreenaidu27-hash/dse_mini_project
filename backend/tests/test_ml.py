import os
from datetime import datetime, timezone
from backend.app.ml.predict import predict_resolution_time, load_model


def test_predict_resolution_time_returns_valid_estimate():
    now = datetime.now(timezone.utc)
    pred_hours, version = predict_resolution_time(
        category="Wi-Fi and network connectivity",
        location="Computer Lab",
        severity="High",
        submitted_at=now,
    )
    assert pred_hours is not None
    assert isinstance(pred_hours, float)
    assert pred_hours > 0.0
    assert version is not None
    assert version.startswith("v")


def test_predict_different_severities_reflect_expected_direction():
    # Critical should typically resolve faster or differently than Low due to operational prioritization
    pred_crit, _ = predict_resolution_time(
        category="Electrical issues",
        location="Computer Lab",
        severity="Critical",
    )
    pred_low, _ = predict_resolution_time(
        category="Electrical issues",
        location="Computer Lab",
        severity="Low",
    )
    assert pred_crit is not None
    assert pred_low is not None
    assert pred_crit < pred_low


def test_predict_safe_fallback_on_unsupported_input():
    pred_hours, ver = predict_resolution_time(
        category="Unknown Category 999",
        location="Unknown Room 999",
        severity="Medium",
    )
    # The pipeline OneHotEncoder has handle_unknown='ignore', so it predicts safely without throwing
    assert pred_hours is not None
    assert pred_hours > 0.0

