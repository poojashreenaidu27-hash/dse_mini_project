from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TrackingRequest(BaseModel):
    complaint_id: str = Field(..., description="Public complaint identifier, e.g. CFX-2026-X8N4K")
    tracking_token: str = Field(..., description="Secret tracking token provided upon submission")


class PublicStatusHistoryResponse(BaseModel):
    old_status: Optional[str] = None
    new_status: str
    public_remark: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminStatusHistoryResponse(BaseModel):
    id: int
    old_status: Optional[str] = None
    new_status: str
    public_remark: Optional[str] = None
    internal_note: Optional[str] = None  # STRICTLY FOR ADMINISTRATORS
    updated_by_user_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StatusUpdateRequest(BaseModel):
    new_status: Optional[str] = Field(None, description="Target status (Submitted, Acknowledged, In Progress, On Hold, Resolved, Reopened)")
    status: Optional[str] = Field(None, description="Alternative field for target status")
    public_remark: Optional[str] = Field(None, description="Public remark visible to complainant")
    internal_note: Optional[str] = Field(None, description="Confidential administrative note")
    priority_flag: Optional[bool] = Field(None, description="Optional priority escalation flag")
