from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship

from backend.app.db.session import Base


class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    public_remark = Column(Text, nullable=True)
    internal_note = Column(Text, nullable=True)  # STRICTLY RESTRICTED TO ADMINISTRATORS
    updated_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    complaint = relationship("Complaint", back_populates="status_history")
    updated_by_user = relationship("User", back_populates="status_updates")

    def __repr__(self):
        return f"<ComplaintStatusHistory id={self.id} complaint_id={self.complaint_id} {self.old_status}->{self.new_status}>"

