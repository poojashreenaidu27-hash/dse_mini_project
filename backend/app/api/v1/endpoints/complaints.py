from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.complaint import (
    ComplaintCreate,
    AnonymousComplaintConfirmation,
    IdentifiedComplaintConfirmation,
    ComplaintUserResponse,
)
from backend.app.services.auth_service import get_current_user
from backend.app.services.complaint_service import ComplaintService
from backend.app.repositories.complaint_repository import ComplaintRepository

router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.post(
    "/anonymous",
    response_model=AnonymousComplaintConfirmation,
    status_code=status.HTTP_201_CREATED,
)
def submit_anonymous(complaint_in: ComplaintCreate, db: Session = Depends(get_db)):
    """Submit a complaint anonymously without requiring an account.
    Returns the Complaint ID and a one-time secret tracking token.
    """
    complaint, plaintext_token = ComplaintService.submit_anonymous_complaint(
        db=db, data=complaint_in
    )
    return AnonymousComplaintConfirmation(
        complaint_id=complaint.complaint_id,
        tracking_token=plaintext_token,
        category=complaint.category,
        location=complaint.location,
        severity=complaint.severity,
        status=complaint.status,
        submitted_at=complaint.submitted_at,
        predicted_resolution_hours=complaint.predicted_resolution_hours,
    )


@router.post(
    "/identified",
    response_model=IdentifiedComplaintConfirmation,
    status_code=status.HTTP_201_CREATED,
)
def submit_identified(
    complaint_in: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit an identified complaint attached to the authenticated campus user."""
    complaint = ComplaintService.submit_identified_complaint(
        db=db, user=current_user, data=complaint_in
    )
    return IdentifiedComplaintConfirmation(
        complaint_id=complaint.complaint_id,
        category=complaint.category,
        location=complaint.location,
        severity=complaint.severity,
        status=complaint.status,
        submitted_at=complaint.submitted_at,
        predicted_resolution_hours=complaint.predicted_resolution_hours,
    )


@router.get("/my", response_model=List[ComplaintUserResponse])
def get_my_complaints(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all complaints submitted by the authenticated campus user."""
    complaints = ComplaintRepository.get_user_complaints(db, current_user.id)
    return [ComplaintUserResponse.model_validate(c) for c in complaints]


@router.get("/my/{complaint_id}", response_model=ComplaintUserResponse)
def get_my_complaint_detail(
    complaint_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve details for a specific complaint owned by the current user."""
    complaint = ComplaintRepository.get_by_complaint_id(db, complaint_id)
    if not complaint or complaint.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found in your account records.",
        )
    return ComplaintUserResponse.model_validate(complaint)

