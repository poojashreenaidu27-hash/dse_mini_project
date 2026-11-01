from backend.app.models.complaint import Complaint


def test_anonymous_complaint_submission(client, db_session):
    payload = {
        "category": "Wi-Fi and network connectivity",
        "location": "Computer Lab",
        "severity": "High",
        "description": "Wi-Fi access point in Lab 2 drops connection every 5 minutes.",
        "is_anonymous": True,
    }
    response = client.post("/api/v1/complaints/anonymous", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "complaint_id" in data
    assert "tracking_token" in data
    assert data["complaint_id"].startswith("CFX-")
    assert data["tracking_token"].startswith("cfx_sec_")
    assert data["status"] == "Submitted"

    # Verify database persistence and integrity
    db_record = db_session.query(Complaint).filter(Complaint.complaint_id == data["complaint_id"]).first()
    assert db_record is not None
    assert db_record.is_anonymous is True
    assert db_record.user_id is None
    assert db_record.source == "live_demo"
    assert db_record.tracking_token_hash is not None
    # Crucial security check: Plaintext token MUST NOT be stored in DB!
    assert db_record.tracking_token_hash != data["tracking_token"]


def test_identified_complaint_submission(client, db_session, seed_users):
    # Log in as student1
    client.post(
        "/api/v1/auth/login",
        json={"email": "student1@campusfix.local", "password": "StudentPass123!"},
    )

    payload = {
        "category": "Electrical issues",
        "location": "Classroom Block A",
        "severity": "Medium",
        "description": "Ceiling tube light in Room 102 is flickering continuously.",
        "is_anonymous": False,
    }
    response = client.post("/api/v1/complaints/identified", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "complaint_id" in data

    # Verify record in DB
    db_record = db_session.query(Complaint).filter(Complaint.complaint_id == data["complaint_id"]).first()
    assert db_record is not None
    assert db_record.is_anonymous is False
    assert db_record.user_id == seed_users["student1"].id
    assert db_record.source == "live_demo"


def test_user_complaint_isolation(client, db_session, seed_users):
    # Student1 creates complaint
    client.post(
        "/api/v1/auth/login",
        json={"email": "student1@campusfix.local", "password": "StudentPass123!"},
    )
    resp = client.post(
        "/api/v1/complaints/identified",
        json={
            "category": "Plumbing and water supply",
            "location": "Cafeteria",
            "severity": "Low",
            "description": "Sink tap dripping slowly in cafeteria handwash area.",
            "is_anonymous": False,
        },
    )
    complaint_id = resp.json()["complaint_id"]

    # Student 1 can view it
    view_resp = client.get(f"/api/v1/complaints/my/{complaint_id}")
    assert view_resp.status_code == 200

    # Student 2 logs in
    client.post(
        "/api/v1/auth/login",
        json={"email": "student2@campusfix.local", "password": "StudentPass123!"},
    )

    # Student 2 tries to access Student 1's complaint
    view_forbidden = client.get(f"/api/v1/complaints/my/{complaint_id}")
    assert view_forbidden.status_code == 404

