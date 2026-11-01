def test_tracking_valid_credentials(client):
    # 1. Submit anonymous complaint
    sub_resp = client.post(
        "/api/v1/complaints/anonymous",
        json={
            "category": "Projectors and classroom equipment",
            "location": "Auditorium",
            "severity": "High",
            "description": "Main stage projector fails to power on before seminar.",
            "is_anonymous": True,
        },
    )
    assert sub_resp.status_code == 201
    sub_data = sub_resp.json()
    complaint_id = sub_data["complaint_id"]
    token = sub_data["tracking_token"]

    # 2. Track with correct credentials
    track_resp = client.post(
        "/api/v1/track",
        json={"complaint_id": complaint_id, "tracking_token": token},
    )
    assert track_resp.status_code == 200
    track_data = track_resp.json()

    assert track_data["complaint_id"] == complaint_id
    assert track_data["category"] == "Projectors and classroom equipment"
    assert track_data["location"] == "Auditorium"
    assert track_data["status"] == "Submitted"
    assert len(track_data["status_history"]) >= 1

    # Security verification: Ensure sensitive attributes are NEVER leaked!
    assert "user_id" not in track_data
    assert "tracking_token" not in track_data
    assert "tracking_token_hash" not in track_data
    for h in track_data["status_history"]:
        assert "internal_note" not in h


def test_tracking_invalid_token(client):
    sub_resp = client.post(
        "/api/v1/complaints/anonymous",
        json={
            "category": "Cleanliness and sanitation",
            "location": "Library",
            "severity": "Low",
            "description": "Spill on floor near section C book stacks.",
            "is_anonymous": True,
        },
    )
    complaint_id = sub_resp.json()["complaint_id"]

    # Incorrect token
    track_resp = client.post(
        "/api/v1/track",
        json={"complaint_id": complaint_id, "tracking_token": "cfx_sec_wrong_token_12345"},
    )
    assert track_resp.status_code == 404
    assert "couldn't verify those tracking details" in track_resp.json()["detail"]


def test_tracking_nonexistent_complaint_id(client):
    track_resp = client.post(
        "/api/v1/track",
        json={"complaint_id": "CFX-2026-NONEXISTENT", "tracking_token": "cfx_sec_any"},
    )
    assert track_resp.status_code == 404
    # Must return same generic error to prevent account/ID enumeration
    assert "couldn't verify those tracking details" in track_resp.json()["detail"]

