def test_complaint_status_lifecycle(client, seed_users):
    # 1. Anonymous user submits complaint
    sub_resp = client.post(
        "/api/v1/complaints/anonymous",
        json={
            "category": "Computer laboratory equipment",
            "location": "Electronics Lab",
            "severity": "High",
            "description": "Oscilloscope station #3 has blown fuse and won't display trace.",
            "is_anonymous": True,
        },
    )
    complaint_id = sub_resp.json()["complaint_id"]
    token = sub_resp.json()["tracking_token"]

    # 2. Admin logs in
    client.post(
        "/api/v1/auth/login",
        json={"email": "admintest@campusfix.local", "password": "AdminPass123!"},
    )

    # 3. Transition: Submitted -> Acknowledged
    ack_resp = client.patch(
        f"/api/v1/admin/complaints/{complaint_id}/status",
        json={
            "new_status": "Acknowledged",
            "public_remark": "Technician assigned to inspect lab equipment.",
            "internal_note": "Internal: Parts ordered from central stores.",
        },
    )
    assert ack_resp.status_code == 200
    assert ack_resp.json()["status"] == "Acknowledged"

    # 4. Transition: Acknowledged -> In Progress
    prog_resp = client.patch(
        f"/api/v1/admin/complaints/{complaint_id}/status",
        json={
            "new_status": "In Progress",
            "public_remark": "Technician currently replacing fuse in lab.",
            "internal_note": "Fuse replacement underway.",
        },
    )
    assert prog_resp.status_code == 200
    assert prog_resp.json()["status"] == "In Progress"

    # 5. Transition: In Progress -> Resolved
    res_resp = client.patch(
        f"/api/v1/admin/complaints/{complaint_id}/status",
        json={
            "new_status": "Resolved",
            "public_remark": "Fuse replaced; oscilloscope tested and calibrated.",
            "internal_note": "Signed off by Senior Tech.",
        },
    )
    assert res_resp.status_code == 200
    res_data = res_resp.json()
    assert res_data["status"] == "Resolved"
    assert res_data["resolved_at"] is not None

    # 6. Verify public tracking page view
    track_resp = client.post(
        "/api/v1/track",
        json={"complaint_id": complaint_id, "tracking_token": token},
    )
    track_data = track_resp.json()
    assert track_data["status"] == "Resolved"
    # Verify public remarks are visible
    remarks = [h["public_remark"] for h in track_data["status_history"]]
    assert any("Fuse replaced" in r for r in remarks if r)
    # Verify internal notes are strictly hidden from public response
    for h in track_data["status_history"]:
        assert "internal_note" not in h

    # 7. Transition: Resolved -> Reopened
    reopen_resp = client.patch(
        f"/api/v1/admin/complaints/{complaint_id}/status",
        json={
            "new_status": "Reopened",
            "public_remark": "Issue recurred during morning class; reopening case.",
            "internal_note": "Check transformer voltage.",
        },
    )
    assert reopen_resp.status_code == 200
    assert reopen_resp.json()["status"] == "Reopened"
    # resolved_at must be cleared
    assert reopen_resp.json()["resolved_at"] is None


def test_invalid_status_transition_rejected(client, seed_users):
    # Submit complaint (starts at Submitted)
    sub_resp = client.post(
        "/api/v1/complaints/anonymous",
        json={
            "category": "Furniture and infrastructure",
            "location": "Classroom Block B",
            "severity": "Low",
            "description": "Desk chair wobbly in row 4.",
            "is_anonymous": True,
        },
    )
    complaint_id = sub_resp.json()["complaint_id"]

    # Admin logs in
    client.post(
        "/api/v1/auth/login",
        json={"email": "admintest@campusfix.local", "password": "AdminPass123!"},
    )

    # Invalid: Submitted -> Reopened (not allowed from Submitted)
    bad_resp = client.patch(
        f"/api/v1/admin/complaints/{complaint_id}/status",
        json={"new_status": "Reopened"},
    )
    assert bad_resp.status_code == 400
    assert "Invalid status transition" in bad_resp.json()["detail"]

