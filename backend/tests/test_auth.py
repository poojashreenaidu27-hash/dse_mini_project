from backend.app.core.security import verify_password
from backend.app.models.user import User


def test_registration_success(client, db_session):
    payload = {
        "display_name": "New Student",
        "email": "newstudent@campusfix.local",
        "password": "SecurePassword123!",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "newstudent@campusfix.local"
    assert data["user"]["role"] == "campus_user"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]

    # Verify password was hashed in database
    user = db_session.query(User).filter(User.email == "newstudent@campusfix.local").first()
    assert user is not None
    assert user.password_hash != "SecurePassword123!"
    assert verify_password("SecurePassword123!", user.password_hash)


def test_registration_duplicate_email(client, seed_users):
    payload = {
        "display_name": "Duplicate Student",
        "email": "student1@campusfix.local",
        "password": "Password123!",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_invalid_password(client, seed_users):
    payload = {
        "email": "student1@campusfix.local",
        "password": "WrongPassword999!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_success_and_cookie(client, seed_users):
    payload = {
        "email": "student1@campusfix.local",
        "password": "StudentPass123!",
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "student1@campusfix.local"
    assert "campusfix_session" in response.cookies


def test_role_authorization_campus_user_blocked_from_admin(client, seed_users):
    # Log in as campus user
    client.post(
        "/api/v1/auth/login",
        json={"email": "student1@campusfix.local", "password": "StudentPass123!"},
    )
    # Attempt admin endpoint
    response = client.get("/api/v1/admin/complaints")
    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]


def test_analyst_cannot_update_complaint_status(client, seed_users):
    # Log in as analyst
    client.post(
        "/api/v1/auth/login",
        json={"email": "analysttest@campusfix.local", "password": "AnalystPass123!"},
    )
    # Attempt status patch on complaints
    response = client.patch(
        "/api/v1/admin/complaints/CFX-2026-FAKE/status",
        json={"new_status": "Resolved"},
    )
    assert response.status_code == 403


def test_unauthenticated_cannot_access_my_complaints(client):
    response = client.get("/api/v1/complaints/my")
    assert response.status_code == 401


def test_logout_clears_session(client, seed_users):
    client.post(
        "/api/v1/auth/login",
        json={"email": "student1@campusfix.local", "password": "StudentPass123!"},
    )
    # Me endpoint should succeed
    me_resp = client.get("/api/v1/auth/me")
    assert me_resp.status_code == 200

    # Logout
    logout_resp = client.post("/api/v1/auth/logout")
    assert logout_resp.status_code == 200

    # Me endpoint should now fail
    me_after = client.get("/api/v1/auth/me")
    assert me_after.status_code == 401

