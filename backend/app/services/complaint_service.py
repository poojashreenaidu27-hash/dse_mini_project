from datetime import datetime, timezone
from typing import Optional, Tuple, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.security import (
    generate_complaint_id,
    generate_tracking_token,
    hash_tracking_token,
    verify_tracking_token,
)
from backend.app.models.complaint import Complaint
from backend.app.models.user import User
from backend.app.repositories.complaint_repository import ComplaintRepository
from backend.app.schemas.complaint import ComplaintCreate, VALID_CATEGORIES, VALID_LOCATIONS, VALID_SEVERITIES
from backend.app.ml.predict import predict_resolution_time


class ComplaintService:
    @staticmethod
    def _validate_attributes(category: str, location: str, severity: str):
        if category not in VALID_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category '{category}'. Must be one of: {', '.join(VALID_CATEGORIES)}",
            )
        if location not in VALID_LOCATIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid location '{location}'. Must be one of: {', '.join(VALID_LOCATIONS)}",
            )
        if severity not in VALID_SEVERITIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid severity '{severity}'. Must be one of: {', '.join(VALID_SEVERITIES)}",
            )

    @classmethod
    def submit_anonymous_complaint(
        cls, db: Session, data: ComplaintCreate
    ) -> Tuple[Complaint, str]:
        """Submit an anonymous complaint. Returns (Complaint, plaintext_token).
        The plaintext token is returned only once to the client and never saved to disk in plaintext.
        """
        cls._validate_attributes(data.category, data.location, data.severity)

        complaint_id = generate_complaint_id()
        # Ensure uniqueness
        while ComplaintRepository.get_by_complaint_id(db, complaint_id) is not None:
            complaint_id = generate_complaint_id()

        plaintext_token = generate_tracking_token()
        token_hash = hash_tracking_token(plaintext_token)

        now = datetime.now(timezone.utc)
        pred_hours, model_ver = predict_resolution_time(
            data.category, data.location, data.severity, now
        )

        complaint = ComplaintRepository.create_complaint(
            db=db,
            complaint_id=complaint_id,
            category=data.category,
            location=data.location,
            severity=data.severity,
            description=data.description.strip(),
            is_anonymous=True,
            tracking_token_hash=token_hash,
            user_id=None,
            source="live_demo",
            predicted_resolution_hours=pred_hours,
            prediction_model_version=model_ver,
            submitted_at=now,
        )

        return complaint, plaintext_token

    @classmethod
    def submit_identified_complaint(
        cls, db: Session, user: User, data: ComplaintCreate
    ) -> Complaint:
        """Submit an identified complaint tied to an authenticated campus user."""
        cls._validate_attributes(data.category, data.location, data.severity)

        complaint_id = generate_complaint_id()
        while ComplaintRepository.get_by_complaint_id(db, complaint_id) is not None:
            complaint_id = generate_complaint_id()

        now = datetime.now(timezone.utc)
        pred_hours, model_ver = predict_resolution_time(
            data.category, data.location, data.severity, now
        )

        complaint = ComplaintRepository.create_complaint(
            db=db,
            complaint_id=complaint_id,
            category=data.category,
            location=data.location,
            severity=data.severity,
            description=data.description.strip(),
            is_anonymous=False,
            tracking_token_hash=None,
            user_id=user.id,
            source="live_demo",
            predicted_resolution_hours=pred_hours,
            prediction_model_version=model_ver,
            submitted_at=now,
        )

        return complaint

    @staticmethod
    def track_anonymous_complaint(db: Session, complaint_id: str, tracking_token: str) -> Complaint:
        """Track complaint using complaint_id + secret token.
        Fails safely with a generic message if either credential is wrong.
        """
        complaint = ComplaintRepository.get_by_complaint_id(db, complaint_id)
        if not complaint or not complaint.tracking_token_hash:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="We couldn't verify those tracking details. Please check the Complaint ID and Tracking Token.",
            )

        if not verify_tracking_token(tracking_token, complaint.tracking_token_hash):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="We couldn't verify those tracking details. Please check the Complaint ID and Tracking Token.",
            )

        return complaint

    @staticmethod
    def update_status(
        db: Session,
        complaint_id: str,
        new_status: str,
        public_remark: Optional[str],
        internal_note: Optional[str],
        current_user: User,
        priority_flag: Optional[bool] = None,
    ) -> Complaint:
        """Update complaint status with administrative authorization."""
        complaint = ComplaintRepository.get_by_complaint_id(db, complaint_id)
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Complaint with ID '{complaint_id}' was not found.",
            )

        try:
            updated = ComplaintRepository.update_status(
                db=db,
                complaint=complaint,
                new_status=new_status,
                public_remark=public_remark,
                internal_note=internal_note,
                updated_by_user_id=current_user.id,
                priority_flag=priority_flag,
            )
            return updated
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )

