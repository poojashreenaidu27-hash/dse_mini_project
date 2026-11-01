from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class AnalyticsKPIs(BaseModel):
    total_complaints: int
    open_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    high_severity_open: int
    avg_resolution_hours: float
    live_demo_count: int
    synthetic_demo_count: int


class CategoryCount(BaseModel):
    category: str
    count: int
    avg_hours: float


class LocationCount(BaseModel):
    location: str
    count: int


class SeverityCount(BaseModel):
    severity: str
    count: int


class StatusCount(BaseModel):
    status: str
    count: int


class TimelinePoint(BaseModel):
    date: str
    submitted: int
    resolved: int


class ActualVsPredictedItem(BaseModel):
    complaint_id: str
    category: str
    location: str
    severity: str
    actual_hours: float
    predicted_hours: float
    error_hours: float


class RecurringIssueCluster(BaseModel):
    category: str
    location: str
    report_count: int
    time_window_days: int
    most_recent_report: datetime
    suggested_action: str


class ModelMetricsResponse(BaseModel):
    model_name: str
    version: str
    algorithm: str
    metrics: Dict[str, Any]
    features: List[str]
    training_sample_count: int
    trained_at: datetime
    is_active: bool

