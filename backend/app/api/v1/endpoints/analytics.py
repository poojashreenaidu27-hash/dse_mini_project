from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.analytics import (
    AnalyticsKPIs,
    CategoryCount,
    LocationCount,
    SeverityCount,
    StatusCount,
    TimelinePoint,
    ActualVsPredictedItem,
    RecurringIssueCluster,
)
from backend.app.services.auth_service import require_roles
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics & Predictive Insights"])


@router.get("/kpis", response_model=AnalyticsKPIs)
def get_kpis(
    source: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    severity: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "analyst"])),
    db: Session = Depends(get_db),
):
    """Retrieve aggregate key performance indicators from the database."""
    return AnalyticsService.get_kpis(
        db=db, source=source, category=category, location=location, severity=severity
    )


@router.get("/breakdown/category", response_model=List[CategoryCount])
def get_category_breakdown(
    source: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "analyst"])),
    db: Session = Depends(get_db),
):
    """Retrieve complaint volume and average resolution duration by category."""
    return AnalyticsService.get_category_breakdown(db=db, source=source)


@router.get("/breakdown/location", response_model=List[LocationCount])
def get_location_breakdown(
    source: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "analyst"])),
    db: Session = Depends(get_db),
):
    """Retrieve complaint distribution by campus facility/location."""
    return AnalyticsService.get_location_breakdown(db=db, source=source)


@router.get("/breakdown/severity", response_model=List[SeverityCount])
def get_severity_breakdown(
    source: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "analyst"])),
    db: Session = Depends(get_db),
):
    """Retrieve complaint distribution across severity levels."""
    return AnalyticsService.get_severity_breakdown(db=db, source=source)


@router.get("/breakdown/status", response_model=List[StatusCount])
def get_status_breakdown(
    source: Optional[str] = None,
    current_user: User = Depends(require_roles(["admin", "analyst"])),
    db: Session = Depends(get_db),
):
    """Retrieve complaint distribution across lifecycle states."""
    return AnalyticsService.get_status_breakdown(db=db, source=source)


@router.get("/timeline", response_model=List[TimelinePoint])
def get_timeline(
    source: Optional[str] = None,
    days: int = 30,
    current_user: User = Depends(require_roles(["admin", "analyst"])),
    db: Session = Depends(get_db),
):
    """Retrieve daily volume of submitted and resolved complaints."""
    return AnalyticsService.get_timeline(db=db, source=source, days=days)


@router.get("/actual-vs-predicted", response_model=List[ActualVsPredictedItem])
def get_actual_vs_predicted(
    limit: int = 50,
    current_user: User = Depends(require_roles(["admin", "analyst"])),
    db: Session = Depends(get_db),
):
    """Compare actual duration versus ML estimated duration for resolved complaints."""
    return AnalyticsService.get_actual_vs_predicted(db=db, limit=limit)


@router.get("/recurring-issues", response_model=List[RecurringIssueCluster])
def get_recurring_issues(
    window_days: int = 7,
    threshold: int = 3,
    current_user: User = Depends(require_roles(["admin", "analyst"])),
    db: Session = Depends(get_db),
):
    """Detect recurring campus maintenance issues using rule-based clustering."""
    return AnalyticsService.detect_recurring_issues(
        db=db, window_days=window_days, threshold=threshold
    )

