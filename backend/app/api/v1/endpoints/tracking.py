from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.tracking import TrackingRequest, PublicStatusHistoryResponse
from backend.app.schemas.complaint import ComplaintPublicResponse
from backend.app.services.complaint_service import ComplaintService

router = APIRouter(prefix="/track", tags=["Public Tracking"])


@router.post("", response_model=ComplaintPublicResponse)
def track_complaint(req: TrackingRequest, db: Session = Depends(get_db)):
    """Securely track an anonymous complaint using Complaint ID and Secret Tracking Token.
    Returns only verified public status information and public remarks.
    """
    complaint = ComplaintService.track_anonymous_complaint(
        db=db,
        complaint_id=req.complaint_id.strip(),
        tracking_token=req.tracking_token.strip(),
    )

    public_history = [
        PublicStatusHistoryResponse(
            old_status=h.old_status,
            new_status=h.new_status,
            public_remark=h.public_remark,
            created_at=h.created_at,
        )
        for h in complaint.status_history
    ]

    return ComplaintPublicResponse(
        complaint_id=complaint.complaint_id,
        category=complaint.category,
        location=complaint.location,
        severity=complaint.severity,
        description=complaint.description,
        status=complaint.status,
        submitted_at=complaint.submitted_at,
        resolved_at=complaint.resolved_at,
        predicted_resolution_hours=complaint.predicted_resolution_hours,
        priority_flag=complaint.priority_flag,
        status_history=public_history,
    )

