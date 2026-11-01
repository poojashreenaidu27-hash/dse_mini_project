def test_analytics_kpis_endpoint(client, seed_users):
    # Log in as analyst
    client.post(
        "/api/v1/auth/login",
        json={"email": "analysttest@campusfix.local", "password": "AnalystPass123!"},
    )

    resp = client.get("/api/v1/analytics/kpis")
    assert resp.status_code == 200
    data = resp.json()

    assert "total_complaints" in data
    assert "open_complaints" in data
    assert "in_progress_complaints" in data
    assert "resolved_complaints" in data
    assert "high_severity_open" in data
    assert "avg_resolution_hours" in data
    assert "live_demo_count" in data
    assert "synthetic_demo_count" in data


def test_analytics_breakdown_endpoints(client, seed_users):
    client.post(
        "/api/v1/auth/login",
        json={"email": "analysttest@campusfix.local", "password": "AnalystPass123!"},
    )

    cat_resp = client.get("/api/v1/analytics/breakdown/category")
    assert cat_resp.status_code == 200
    assert isinstance(cat_resp.json(), list)

    loc_resp = client.get("/api/v1/analytics/breakdown/location")
    assert loc_resp.status_code == 200
    assert isinstance(loc_resp.json(), list)

    sev_resp = client.get("/api/v1/analytics/breakdown/severity")
    assert sev_resp.status_code == 200
    assert isinstance(sev_resp.json(), list)

    stat_resp = client.get("/api/v1/analytics/breakdown/status")
    assert stat_resp.status_code == 200
    assert isinstance(stat_resp.json(), list)

    timeline_resp = client.get("/api/v1/analytics/timeline?days=14")
    assert timeline_resp.status_code == 200
    assert isinstance(timeline_resp.json(), list)


def test_recurring_issues_endpoint(client, seed_users):
    client.post(
        "/api/v1/auth/login",
        json={"email": "analysttest@campusfix.local", "password": "AnalystPass123!"},
    )

    resp = client.get("/api/v1/analytics/recurring-issues?window_days=30&threshold=2")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_unauthenticated_blocked_from_analytics(client):
    resp = client.get("/api/v1/analytics/kpis")
    assert resp.status_code == 401

