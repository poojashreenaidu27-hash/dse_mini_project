from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text

from backend.app.db.session import Base


class ModelMetadataRecord(Base):
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False, unique=True, index=True)
    algorithm = Column(String(100), nullable=False)
    metrics_json = Column(Text, nullable=False)  # JSON formatted MAE, RMSE, R2
    features_json = Column(Text, nullable=False)  # JSON formatted list of features
    training_sample_count = Column(Integer, nullable=False)
    trained_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    def __repr__(self):
        return f"<ModelMetadataRecord version='{self.version}' algorithm='{self.algorithm}' active={self.is_active}>"

