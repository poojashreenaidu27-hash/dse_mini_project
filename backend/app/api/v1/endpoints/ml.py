import os
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.metadata import ModelMetadataRecord
from backend.app.schemas.analytics import ModelMetricsResponse
from backend.app.services.auth_service import require_roles
from backend.app.ml.train import train_and_evaluate_models

router = APIRouter(prefix="/ml", tags=["Machine Learning Pipeline"])


@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics(
    current_user: User = Depends(require_roles(["admin", "analyst"])),
    db: Session = Depends(get_db),
):
    """Inspect active regression model performance metrics and training metadata."""
    record = (
        db.query(ModelMetadataRecord)
        .filter(ModelMetadataRecord.is_active == True)
        .order_by(ModelMetadataRecord.trained_at.desc())
        .first()
    )

    if record:
        return ModelMetricsResponse(
            model_name=record.model_name,
            version=record.version,
            algorithm=record.algorithm,
            metrics=json.loads(record.metrics_json),
            features=json.loads(record.features_json),
            training_sample_count=record.training_sample_count,
            trained_at=record.trained_at,
            is_active=record.is_active,
        )

    # Fallback to metadata JSON file if DB record not yet inserted
    if os.path.exists(settings.MODEL_METADATA_PATH):
        try:
            with open(settings.MODEL_METADATA_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return ModelMetricsResponse(
                    model_name=data["model_name"],
                    version=data["version"],
                    algorithm=data["algorithm"],
                    metrics=data["metrics"],
                    features=data["features"],
                    training_sample_count=data["training_sample_count"],
                    trained_at=data["trained_at"],
                    is_active=True,
                )
        except Exception:
            pass

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Model has not been trained yet. Please execute training script or invoke POST /api/v1/ml/train.",
    )


@router.post("/train", response_model=ModelMetricsResponse)
def trigger_training(
    current_user: User = Depends(require_roles(["admin"])),
):
    """Trigger model training pipeline on resolved historical data (Administrator only)."""
    try:
        metadata = train_and_evaluate_models()
        return ModelMetricsResponse(
            model_name=metadata["model_name"],
            version=metadata["version"],
            algorithm=metadata["algorithm"],
            metrics=metadata["metrics"],
            features=metadata["features"],
            training_sample_count=metadata["training_sample_count"],
            trained_at=metadata["trained_at"],
            is_active=True,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training failed: {str(e)}",
        )

