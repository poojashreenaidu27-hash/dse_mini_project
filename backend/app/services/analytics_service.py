from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc

from backend.app.models.complaint import Complaint
from backend.app.models.metadata import ModelMetadataRecord
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


class AnalyticsService:
    @staticmethod
    def get_kpis(
        db: Session,
        source: Optional[str] = None,
        category: Optional[str] = None,
        location: Optional[str] = None,
        severity: Optional[str] = None,
    ) -> AnalyticsKPIs:
        query = db.query(Complaint)
        if source:
            query = query.filter(Complaint.source == source)
        if category:
            query = query.filter(Complaint.category == category)
        if location:
            query = query.filter(Complaint.location == location)
        if severity:
            query = query.filter(Complaint.severity == severity)

        total = query.count()
        open_c = query.filter(Complaint.status.in_(["Submitted", "Acknowledged"])).count()
        in_prog = query.filter(Complaint.status == "In Progress").count()
        resolved_c = query.filter(Complaint.status == "Resolved").count()
        high_open = query.filter(
            Complaint.severity.in_(["High", "Critical"]),
            Complaint.status != "Resolved",
        ).count()

        live_count = query.filter(Complaint.source == "live_demo").count()
        synthetic_count = query.filter(Complaint.source == "synthetic_demo").count()

        # Calculate average actual resolution hours for resolved complaints
        resolved_records = query.filter(
            Complaint.status == "Resolved",
            Complaint.resolved_at.isnot(None),
            Complaint.submitted_at.isnot(None),
        ).all()

        total_hours = 0.0
        valid_resolved_count = 0
        for r in resolved_records:
            hrs = (r.resolved_at - r.submitted_at).total_seconds() / 3600.0
            if hrs >= 0:
                total_hours += hrs
                valid_resolved_count += 1

        avg_hours = round(total_hours / valid_resolved_count, 1) if valid_resolved_count > 0 else 0.0

        return AnalyticsKPIs(
            total_complaints=total,
            open_complaints=open_c,
            in_progress_complaints=in_prog,
            resolved_complaints=resolved_c,
            high_severity_open=high_open,
            avg_resolution_hours=avg_hours,
            live_demo_count=live_count,
            synthetic_demo_count=synthetic_count,
        )

    @staticmethod
    def get_category_breakdown(db: Session, source: Optional[str] = None) -> List[CategoryCount]:
        query = db.query(Complaint)
        if source:
            query = query.filter(Complaint.source == source)

        complaints = query.all()
        cat_stats: Dict[str, Dict[str, Any]] = {}

        for c in complaints:
            if c.category not in cat_stats:
                cat_stats[c.category] = {"count": 0, "total_hrs": 0.0, "resolved_count": 0}
            cat_stats[c.category]["count"] += 1
            if c.status == "Resolved" and c.resolved_at and c.submitted_at:
                hrs = (c.resolved_at - c.submitted_at).total_seconds() / 3600.0
                if hrs >= 0:
                    cat_stats[c.category]["total_hrs"] += hrs
                    cat_stats[c.category]["resolved_count"] += 1

        result = []
        for cat, stat in cat_stats.items():
            avg = round(stat["total_hrs"] / stat["resolved_count"], 1) if stat["resolved_count"] > 0 else 0.0
            result.append(CategoryCount(category=cat, count=stat["count"], avg_hours=avg))

        return sorted(result, key=lambda x: x.count, reverse=True)

    @staticmethod
    def get_location_breakdown(db: Session, source: Optional[str] = None) -> List[LocationCount]:
        query = db.query(Complaint.location, func.count(Complaint.id).label("count"))
        if source:
            query = query.filter(Complaint.source == source)
        records = query.group_by(Complaint.location).order_by(desc("count")).all()
        return [LocationCount(location=r[0], count=r[1]) for r in records]

    @staticmethod
    def get_severity_breakdown(db: Session, source: Optional[str] = None) -> List[SeverityCount]:
        query = db.query(Complaint.severity, func.count(Complaint.id).label("count"))
        if source:
            query = query.filter(Complaint.source == source)
        records = query.group_by(Complaint.severity).all()
        # Order logically by severity
        order = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
        sorted_records = sorted(records, key=lambda r: order.get(r[0], 99))
        return [SeverityCount(severity=r[0], count=r[1]) for r in sorted_records]

    @staticmethod
    def get_status_breakdown(db: Session, source: Optional[str] = None) -> List[StatusCount]:
        query = db.query(Complaint.status, func.count(Complaint.id).label("count"))
        if source:
            query = query.filter(Complaint.source == source)
        records = query.group_by(Complaint.status).all()
        order = {"Submitted": 1, "Acknowledged": 2, "In Progress": 3, "On Hold": 4, "Resolved": 5, "Reopened": 6}
        sorted_records = sorted(records, key=lambda r: order.get(r[0], 99))
        return [StatusCount(status=r[0], count=r[1]) for r in sorted_records]

    @staticmethod
    def get_timeline(db: Session, source: Optional[str] = None, days: int = 30) -> List[TimelinePoint]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        query = db.query(Complaint).filter(Complaint.submitted_at >= cutoff)
        if source:
            query = query.filter(Complaint.source == source)
        complaints = query.all()

        daily_data: Dict[str, Dict[str, int]] = {}
        # Prepopulate days
        for i in range(days + 1):
            day_str = (cutoff + timedelta(days=i)).strftime("%Y-%m-%d")
            daily_data[day_str] = {"submitted": 0, "resolved": 0}

        for c in complaints:
            sub_day = c.submitted_at.strftime("%Y-%m-%d")
            if sub_day in daily_data:
                daily_data[sub_day]["submitted"] += 1
            if c.resolved_at:
                res_day = c.resolved_at.strftime("%Y-%m-%d")
                if res_day in daily_data:
                    daily_data[res_day]["resolved"] += 1

        result = [
            TimelinePoint(date=k, submitted=v["submitted"], resolved=v["resolved"])
            for k, v in sorted(daily_data.items())
        ]
        return result

    @staticmethod
    def get_actual_vs_predicted(db: Session, limit: int = 50) -> List[ActualVsPredictedItem]:
        """Comparison for resolved records that have both actual duration and predicted duration."""
        records = (
            db.query(Complaint)
            .filter(
                Complaint.status == "Resolved",
                Complaint.resolved_at.isnot(None),
                Complaint.predicted_resolution_hours.isnot(None),
            )
            .order_by(desc(Complaint.resolved_at))
            .limit(limit)
            .all()
        )

        items = []
        for r in records:
            actual = round((r.resolved_at - r.submitted_at).total_seconds() / 3600.0, 1)
            pred = round(r.predicted_resolution_hours, 1)
            error = round(abs(actual - pred), 1)
            items.append(
                ActualVsPredictedItem(
                    complaint_id=r.complaint_id,
                    category=r.category,
                    location=r.location,
                    severity=r.severity,
                    actual_hours=actual,
                    predicted_hours=pred,
                    error_hours=error,
                )
            )
        return items

    @staticmethod
    def detect_recurring_issues(
        db: Session,
        window_days: int = 7,
        threshold: int = 3,
    ) -> List[RecurringIssueCluster]:
        """Detect clusters of complaints in the same location and category within rolling time window."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=window_days)
        complaints = (
            db.query(Complaint)
            .filter(Complaint.submitted_at >= cutoff)
            .order_by(desc(Complaint.submitted_at))
            .all()
        )

        clusters: Dict[tuple, Dict[str, Any]] = {}
        for c in complaints:
            key = (c.category, c.location)
            if key not in clusters:
                clusters[key] = {
                    "count": 0,
                    "most_recent": c.submitted_at,
                }
            clusters[key]["count"] += 1
            if c.submitted_at > clusters[key]["most_recent"]:
                clusters[key]["most_recent"] = c.submitted_at

        results = []
        for (cat, loc), data in clusters.items():
            if data["count"] >= threshold:
                action = (
                    f"Schedule proactive inspection for {loc}. Multiple incidents ({data['count']}) "
                    f"of '{cat}' reported in the last {window_days} days indicate possible systemic failure."
                )
                results.append(
                    RecurringIssueCluster(
                        category=cat,
                        location=loc,
                        report_count=data["count"],
                        time_window_days=window_days,
                        most_recent_report=data["most_recent"],
                        suggested_action=action,
                    )
                )

        return sorted(results, key=lambda x: x.report_count, reverse=True)

