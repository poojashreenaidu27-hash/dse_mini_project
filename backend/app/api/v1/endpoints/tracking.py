from fastapi import APIRouter, Depends, Query
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


@router.get("/{complaint_id}")
def get_track_complaint(
    complaint_id: str,
    token: str = Query(..., description="Secret tracking token"),
    db: Session = Depends(get_db),
):
    """Query complaint status using GET parameters as expected by frontend tracker."""
    complaint = ComplaintService.track_anonymous_complaint(
        db=db,
        complaint_id=complaint_id.strip(),
        tracking_token=token.strip(),
    )

    public_notes = [
        h.public_remark for h in complaint.status_history if h.public_remark
    ]
    status_history = [
        {
            "status": h.new_status,
            "timestamp": h.created_at.isoformat() if h.created_at else None,
            "note": h.public_remark,
        }
        for h in complaint.status_history
    ]

    return {
        "complaint": {
            "id": complaint.id,
            "title": complaint.description[:60] if complaint.description else complaint.category,
            "description": complaint.description,
            "category": complaint.category,
            "location": complaint.location,
            "severity": complaint.severity,
            "status": complaint.status,
            "submitted_at": complaint.submitted_at.isoformat() if complaint.submitted_at else "",
            "resolution_estimate": (
                round(complaint.predicted_resolution_hours / 24.0, 1)
                if complaint.predicted_resolution_hours
                else None
            ),
            "tracking_token": token,
        },
        "public_notes": public_notes,
        "status_history": status_history,
    }


