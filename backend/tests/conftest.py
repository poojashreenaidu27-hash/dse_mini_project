import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.core.config import settings
from backend.app.core.security import hash_password
from backend.app.db.session import Base, get_db
from backend.app.models.user import User
from backend.app.main import app

# Test SQLite in-memory or file database
TEST_DATABASE_URL = "sqlite:///./test_campusfix.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_campusfix.db"):
        try:
            os.remove("./test_campusfix.db")
        except Exception:
            pass


@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def seed_users(db_session):
    admin = User(
        display_name="Admin Test",
        email="admintest@campusfix.local",
        password_hash=hash_password("AdminPass123!"),
        role="admin",
        is_active=True,
    )
    analyst = User(
        display_name="Analyst Test",
        email="analysttest@campusfix.local",
        password_hash=hash_password("AnalystPass123!"),
        role="analyst",
        is_active=True,
    )
    student1 = User(
        display_name="Student One",
        email="student1@campusfix.local",
        password_hash=hash_password("StudentPass123!"),
        role="campus_user",
        is_active=True,
    )
    student2 = User(
        display_name="Student Two",
        email="student2@campusfix.local",
        password_hash=hash_password("StudentPass123!"),
        role="campus_user",
        is_active=True,
    )
    db_session.add_all([admin, analyst, student1, student2])
    db_session.commit()
    return {
        "admin": admin,
        "analyst": analyst,
        "student1": student1,
        "student2": student2,
    }

