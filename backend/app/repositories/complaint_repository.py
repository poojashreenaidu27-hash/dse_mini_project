from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc, asc

from backend.app.models.complaint import Complaint
from backend.app.models.history import ComplaintStatusHistory

ALLOWED_TRANSITIONS: Dict[str, List[str]] = {
    "Submitted": ["Acknowledged", "In Progress", "On Hold"],
    "Acknowledged": ["In Progress", "On Hold", "Resolved"],
    "In Progress": ["On Hold", "Resolved", "Acknowledged"],
    "On Hold": ["In Progress", "Acknowledged", "Resolved"],
    "Resolved": ["Reopened"],
    "Reopened": ["Acknowledged", "In Progress", "On Hold", "Resolved"],
}


class ComplaintRepository:
    @staticmethod
    def get_by_complaint_id(db: Session, complaint_id: str) -> Optional[Complaint]:
        return (
            db.query(Complaint)
            .options(
                joinedload(Complaint.status_history),
                joinedload(Complaint.user),
            )
            .filter(Complaint.complaint_id == complaint_id.strip().upper())
            .first()
        )

    @staticmethod
    def get_by_id(db: Session, id: int) -> Optional[Complaint]:
        return (
            db.query(Complaint)
            .options(
                joinedload(Complaint.status_history),
                joinedload(Complaint.user),
            )
            .filter(Complaint.id == id)
            .first()
        )

    @staticmethod
    def get_user_complaints(db: Session, user_id: int) -> List[Complaint]:
        return (
            db.query(Complaint)
            .options(joinedload(Complaint.status_history))
            .filter(Complaint.user_id == user_id)
            .order_by(desc(Complaint.submitted_at))
            .all()
        )

    @staticmethod
    def create_complaint(
        db: Session,
        complaint_id: str,
        category: str,
        location: str,
        severity: str,
        description: str,
        is_anonymous: bool,
        tracking_token_hash: Optional[str] = None,
        user_id: Optional[int] = None,
        source: str = "live_demo",
        predicted_resolution_hours: Optional[float] = None,
        prediction_model_version: Optional[str] = None,
        submitted_at: Optional[datetime] = None,
        status: str = "Submitted",
        resolved_at: Optional[datetime] = None,
    ) -> Complaint:
        """Create complaint and initial history entry in an atomic transaction."""
        now = submitted_at or datetime.now(timezone.utc)
        complaint = Complaint(
            complaint_id=complaint_id,
            category=category,
            location=location,
            severity=severity,
            description=description,
            is_anonymous=is_anonymous,
            tracking_token_hash=tracking_token_hash,
            user_id=user_id,
            source=source,
            status=status,
            submitted_at=now,
            predicted_resolution_hours=predicted_resolution_hours,
            prediction_model_version=prediction_model_version,
            resolved_at=resolved_at,
            priority_flag=False,
            created_at=now,
            updated_at=now,
        )
        db.add(complaint)
        db.flush()  # assign ID

        history = ComplaintStatusHistory(
            complaint_id=complaint.id,
            old_status=None,
            new_status=status,
            public_remark="Complaint received and registered into CampusFix.",
            internal_note="Initial complaint submission created via API.",
            updated_by_user_id=user_id,
            created_at=now,
        )
        db.add(history)
        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def update_status(
        db: Session,
        complaint: Complaint,
        new_status: str,
        public_remark: Optional[str] = None,
        internal_note: Optional[str] = None,
        updated_by_user_id: Optional[int] = None,
        priority_flag: Optional[bool] = None,
    ) -> Complaint:
        """Update complaint status and record audit history in an atomic transaction."""
        old_status = complaint.status

        # Validate transition
        if new_status != old_status:
            allowed = ALLOWED_TRANSITIONS.get(old_status, [])
            if new_status not in allowed:
                raise ValueError(
                    f"Invalid status transition from '{old_status}' to '{new_status}'. "
                    f"Allowed transitions: {', '.join(allowed) if allowed else 'None'}"
                )

        now = datetime.now(timezone.utc)
        complaint.status = new_status
        complaint.updated_at = now

        if priority_flag is not None:
            complaint.priority_flag = priority_flag

        # Handle resolution timestamp
        if new_status == "Resolved" and old_status != "Resolved":
            complaint.resolved_at = now
        elif new_status == "Reopened" and old_status == "Resolved":
            complaint.resolved_at = None

        # Add history entry
        history_entry = ComplaintStatusHistory(
            complaint_id=complaint.id,
            old_status=old_status,
            new_status=new_status,
            public_remark=public_remark.strip() if public_remark else f"Status updated to {new_status}.",
            internal_note=internal_note.strip() if internal_note else None,
            updated_by_user_id=updated_by_user_id,
            created_at=now,
        )
        db.add(history_entry)
        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def list_complaints(
        db: Session,
        category: Optional[str] = None,
        location: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        source: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Complaint], int]:
        """Filter and paginate complaints with total matching count."""
        query = db.query(Complaint).options(
            joinedload(Complaint.status_history),
            joinedload(Complaint.user),
        )

        if category:
            query = query.filter(Complaint.category == category)
        if location:
            query = query.filter(Complaint.location == location)
        if severity:
            query = query.filter(Complaint.severity == severity)
        if status:
            query = query.filter(Complaint.status == status)
        if source:
            query = query.filter(Complaint.source == source)
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Complaint.complaint_id.ilike(search_pattern),
                    Complaint.description.ilike(search_pattern),
                )
            )

        total_count = query.count()
        results = query.order_by(desc(Complaint.submitted_at)).offset(offset).limit(limit).all()
        return results, total_count

