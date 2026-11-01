from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

from backend.app.schemas.tracking import PublicStatusHistoryResponse, AdminStatusHistoryResponse

VALID_CATEGORIES = [
    "Wi-Fi and network connectivity",
    "Computer laboratory equipment",
    "Electrical issues",
    "Plumbing and water supply",
    "Projectors and classroom equipment",
    "Furniture and infrastructure",
    "Cleanliness and sanitation",
    "Other maintenance issues",
]

VALID_LOCATIONS = [
    "Computer Lab",
    "Electronics Lab",
    "Library",
    "Classroom Block A",
    "Classroom Block B",
    "Auditorium",
    "Administrative Block",
    "Cafeteria",
    "Campus Common Area",
]

VALID_SEVERITIES = ["Low", "Medium", "High", "Critical"]
VALID_STATUSES = ["Submitted", "Acknowledged", "In Progress", "On Hold", "Resolved", "Reopened"]
VALID_SOURCES = ["synthetic_demo", "live_demo", "authorized_real_data"]


class ComplaintBase(BaseModel):
    category: str = Field(..., description="Maintenance category")
    location: str = Field(..., description="Campus facility/room")
    severity: str = Field(..., description="Low, Medium, High, Critical")
    description: str = Field(..., min_length=10, max_length=2000, description="Detailed problem description")


class ComplaintCreate(ComplaintBase):
    is_anonymous: bool = Field(True, description="True for anonymous submission, False for identified user submission")


class AnonymousComplaintConfirmation(BaseModel):
    complaint_id: str
    tracking_token: str
    category: str
    location: str
    severity: str
    status: str
    submitted_at: datetime
    predicted_resolution_hours: Optional[float] = None
    message: str = (
        "Complaint registered successfully. SAVE YOUR TRACKING TOKEN IMMEDIATELY! "
        "It will NEVER be displayed again."
    )


class IdentifiedComplaintConfirmation(BaseModel):
    complaint_id: str
    category: str
    location: str
    severity: str
    status: str
    submitted_at: datetime
    predicted_resolution_hours: Optional[float] = None
    message: str = "Complaint registered and attached to your campus account."


class ComplaintPublicResponse(BaseModel):
    complaint_id: str
    category: str
    location: str
    severity: str
    description: str
    status: str
    submitted_at: datetime
    resolved_at: Optional[datetime] = None
    predicted_resolution_hours: Optional[float] = None
    priority_flag: bool = False
    status_history: List[PublicStatusHistoryResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ComplaintUserResponse(BaseModel):
    complaint_id: str
    category: str
    location: str
    severity: str
    description: str
    status: str
    submitted_at: datetime
    resolved_at: Optional[datetime] = None
    predicted_resolution_hours: Optional[float] = None
    priority_flag: bool = False
    status_history: List[PublicStatusHistoryResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ComplaintAdminResponse(BaseModel):
    id: int
    complaint_id: str
    user_id: Optional[int] = None
    user_display_name: Optional[str] = None
    is_anonymous: bool
    category: str
    location: str
    severity: str
    description: str
    status: str
    source: str
    submitted_at: datetime
    resolved_at: Optional[datetime] = None
    predicted_resolution_hours: Optional[float] = None
    prediction_model_version: Optional[str] = None
    priority_flag: bool
    created_at: datetime
    updated_at: datetime
    status_history: List[AdminStatusHistoryResponse] = []

    model_config = ConfigDict(from_attributes=True)
