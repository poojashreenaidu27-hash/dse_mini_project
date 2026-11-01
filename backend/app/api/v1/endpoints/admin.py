from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.complaint import ComplaintAdminResponse
from backend.app.schemas.tracking import StatusUpdateRequest, AdminStatusHistoryResponse
from backend.app.services.auth_service import require_roles
from backend.app.services.complaint_service import ComplaintService
from backend.app.repositories.complaint_repository import ComplaintRepository

router = APIRouter(prefix="/admin", tags=["Administrator Management"])


class PaginatedComplaintsResponse(BaseModel):
    items: List[ComplaintAdminResponse]
    total: int
    page: int
    limit: int
    pages: int


def _to_admin_response(c) -> ComplaintAdminResponse:
    history = [
        AdminStatusHistoryResponse(
            id=h.id,
            old_status=h.old_status,
            new_status=h.new_status,
            public_remark=h.public_remark,
            internal_note=h.internal_note,
            updated_by_user_id=h.updated_by_user_id,
            created_at=h.created_at,
        )
        for h in c.status_history
    ]
    user_name = c.user.display_name if c.user else None
    return ComplaintAdminResponse(
        id=c.id,
        complaint_id=c.complaint_id,
        user_id=c.user_id,
        user_display_name=user_name,
        is_anonymous=c.is_anonymous,
        category=c.category,
        location=c.location,
        severity=c.severity,
        description=c.description,
        status=c.status,
        source=c.source,
        submitted_at=c.submitted_at,
        resolved_at=c.resolved_at,
        predicted_resolution_hours=c.predicted_resolution_hours,
        prediction_model_version=c.prediction_model_version,
        priority_flag=c.priority_flag,
        created_at=c.created_at,
        updated_at=c.updated_at,
        status_history=history,
    )


@router.get("/complaints", response_model=PaginatedComplaintsResponse)
def list_admin_complaints(
    category: Optional[str] = None,
    location: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db),
):
    """List and filter complaints across synthetic and live datasets with full pagination."""
    offset = (page - 1) * limit
    complaints, total = ComplaintRepository.list_complaints(
        db=db,
        category=category,
        location=location,
        severity=severity,
        status=status,
        source=source,
        search=search,
        limit=limit,
        offset=offset,
    )
    pages = (total + limit - 1) // limit if total > 0 else 1
    items = [_to_admin_response(c) for c in complaints]

    return PaginatedComplaintsResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.get("/complaints/{complaint_id}", response_model=ComplaintAdminResponse)
def get_admin_complaint_detail(
    complaint_id: str,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db),
):
    """Retrieve full complaint record including confidential internal notes and audit history."""
    complaint = ComplaintRepository.get_by_complaint_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' was not found.",
        )
    return _to_admin_response(complaint)


@router.patch("/complaints/{complaint_id}/status", response_model=ComplaintAdminResponse)
def update_complaint_status(
    complaint_id: str,
    update_data: StatusUpdateRequest,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db),
):
    """Update complaint status, add public remark and/or private internal note."""
    updated = ComplaintService.update_status(
        db=db,
        complaint_id=complaint_id,
        new_status=update_data.new_status,
        public_remark=update_data.public_remark,
        internal_note=update_data.internal_note,
        current_user=current_user,
        priority_flag=update_data.priority_flag,
    )
    return _to_admin_response(updated)

