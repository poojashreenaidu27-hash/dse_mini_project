from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Index
from sqlalchemy.orm import relationship

from backend.app.db.session import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    is_anonymous = Column(Boolean, default=True, nullable=False)
    tracking_token_hash = Column(String(128), nullable=True, index=True)

    category = Column(String(100), nullable=False, index=True)
    location = Column(String(100), nullable=False, index=True)
    severity = Column(String(50), nullable=False, index=True)  # Low, Medium, High, Critical
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Submitted", nullable=False, index=True)
    source = Column(String(50), default="live_demo", nullable=False, index=True)  # synthetic_demo, live_demo

    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    predicted_resolution_hours = Column(Float, nullable=True)
    prediction_model_version = Column(String(50), nullable=True)
    resolved_at = Column(DateTime, nullable=True, index=True)
    priority_flag = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="complaints")
    status_history = relationship(
        "ComplaintStatusHistory",
        back_populates="complaint",
        cascade="all, delete-orphan",
        order_by="ComplaintStatusHistory.created_at.asc()",
    )

    # Composite indexes for frequent queries
    __table_args__ = (
        Index("ix_complaints_category_location", "category", "location"),
        Index("ix_complaints_status_source", "status", "source"),
    )

    def __repr__(self):
        return f"<Complaint id={self.id} complaint_id='{self.complaint_id}' status='{self.status}'>"

