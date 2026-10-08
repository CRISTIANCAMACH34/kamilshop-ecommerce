import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_admin_headers():
    login_resp = client.post(
        "/api/v1/auth/admin/login",
        json={"username_or_email": "admin@kamilshop.store", "password": "admin2026"}
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_customer_social_login_google():
    payload = {
        "provider": "google",
        "email": "camila.moda@gmail.com",
        "name": "Camila Silva",
        "avatar_url": "https://lh3.googleusercontent.com/a/test-avatar",
    }
    response = client.post("/api/v1/auth/customer/social-login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "CLIENTE"
    assert data["provider"] == "google"
    assert len(data["access_token"]) > 20


def test_customer_social_login_apple_and_facebook():
    # Apple
    apple_resp = client.post(
        "/api/v1/auth/customer/social-login",
        json={"provider": "apple", "email": "esteban.apple@icloud.com", "name": "Esteban Apple"},
    )
    assert apple_resp.status_code == 200
    assert apple_resp.json()["role"] == "CLIENTE"

    # Facebook
    fb_resp = client.post(
        "/api/v1/auth/customer/social-login",
        json={"provider": "facebook", "email": "maria.fb@facebook.com", "name": "Maria FB"},
    )
    assert fb_resp.status_code == 200
    assert fb_resp.json()["role"] == "CLIENTE"


def test_admin_corporate_login_success():
    payload = {
        "username_or_email": "admin@titulo.store",
        "password": "admin2026",
    }
    response = client.post("/api/v1/auth/admin/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "ADMIN"
    assert data["email"] == "admin@titulo.store"
    assert len(data["access_token"]) > 20


def test_admin_corporate_login_failure():
    payload = {
        "username_or_email": "admin@titulo.store",
        "password": "wrongpassword",
    }
    response = client.post("/api/v1/auth/admin/login", json=payload)
    assert response.status_code == 401
    assert "Acceso restringido" in response.json()["detail"]


def test_zippi_dashboard_stats():
    headers = get_admin_headers()
    response = client.get("/api/v1/admin/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["store_status"] == "ONLINE_ACTIVE"
    assert data["revenue_today"] > 0
    assert "fulfillment_sla_target_minutes" in data


def test_live_orders_pipeline():
    headers = get_admin_headers()
    response = client.get("/api/v1/admin/orders", headers=headers)
    assert response.status_code == 200
    orders = response.json()
    assert len(orders) >= 3

    first_order_id = orders[0]["order_id"]
    update_resp = client.patch(
        f"/api/v1/admin/orders/{first_order_id}/status",
        json={"new_status": "EN_PICKING", "notes": "Alistamiento iniciado por Operador 1"},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "EN_PICKING"
