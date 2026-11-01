from backend.app.db.session import Base, engine
from backend.app.models.user import User
from backend.app.models.complaint import Complaint
from backend.app.models.history import ComplaintStatusHistory
from backend.app.models.metadata import ModelMetadataRecord

__all__ = ["Base", "engine", "User", "Complaint", "ComplaintStatusHistory", "ModelMetadataRecord"]


def init_db():
    """Create database tables if they do not exist."""
    Base.metadata.create_all(bind=engine)

