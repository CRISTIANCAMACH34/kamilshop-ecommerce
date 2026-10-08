import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.infrastructure.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    mask_email,
    mask_phone,
    sanitize_order_for_public,
)

client = TestClient(app)


def test_password_hashing_and_verification():
    raw_pass = "SuperSecretPassword123!"
    hashed = hash_password(raw_pass)
    
    assert hashed.startswith("pbkdf2:sha256:")
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_generation_and_decoding():
    token_data = {"sub": "usr-123", "email": "test@kamilshop.store", "role": "ADMIN"}
    token = create_access_token(token_data)
    
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "usr-123"
    assert decoded["role"] == "ADMIN"
    assert decoded["iss"] == "kamilshop-auth-service"


def test_pii_masking_helpers():
    assert mask_email("camila.silva@kamilshop.store") == "c**********a@kamilshop.store"
    assert mask_email("ab@domain.com") == "a*@domain.com"
    
    masked_p = mask_phone("+57 300 123 4567")
    assert "***" in masked_p
    assert masked_p.endswith("67")


def test_sanitize_order_for_public():
    raw_order = {
        "order_id": "ord-001",
        "code": "TTL-98765",
        "email": "juan.perez@gmail.com",
        "phone": "3109876543",
        "address": "Calle 100 # 15-20, Apto 501",
        "city": "Bogotá",
        "notes": "Internal admin note: VIP customer",
        "total": 150000.0,
    }
    sanitized = sanitize_order_for_public(raw_order)
    
    assert "email" not in sanitized
    assert "customer_email_masked" in sanitized
    assert "address" not in sanitized
    assert "shipping_city" in sanitized
    assert "notes" not in sanitized
    assert sanitized["total"] == 150000.0


def test_unauthenticated_admin_routes_blocked():
    # Intentar acceder a rutas administrativas sin token debe retornar 401
    resp_stats = client.get("/api/v1/admin/dashboard/stats")
    assert resp_stats.status_code == 401

    resp_orders = client.get("/api/v1/admin/orders")
    assert resp_orders.status_code == 401

    resp_customers = client.get("/api/v1/admin/customers")
    assert resp_customers.status_code == 401

    resp_returns = client.get("/api/v1/admin/returns")
    assert resp_returns.status_code == 401


def test_authenticated_admin_route_success():
    # Iniciar sesión como admin para obtener JWT
    login_resp = client.post(
        "/api/v1/auth/admin/login",
        json={"username_or_email": "admin@kamilshop.store", "password": "admin2026"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Acceder a dashboard stats con token válido
    resp_stats = client.get("/api/v1/admin/dashboard/stats", headers=headers)
    assert resp_stats.status_code == 200
    assert resp_stats.json()["store_status"] == "ONLINE_ACTIVE"


def test_public_order_tracking_masks_pii():
    prod_resp = client.get("/api/v1/products")
    prod = prod_resp.json()[0]
    variant = prod["variants"][0]

    checkout_payload = {
        "idempotency_key": "TRACK-TEST-IDEMP-001",
        "customer_email": "privacidad@kamilshop.store",
        "customer_name": "Usuario Privado",
        "shipping_address": {
            "country_iso": "CO",
            "state_subdivision": "Cundinamarca",
            "city": "Bogota",
            "street_type": "Carrera",
            "street_name": "7",
            "exterior_number": "71-21",
            "postal_code": "110221",
        },
        "payment_method": "CARD",
        "items": [
            {
                "product_id": prod["product_id"],
                "variant_id": variant["variant_id"],
                "quantity": 1,
            }
        ],
    }
    co_resp = client.post("/api/v1/checkout", json=checkout_payload)
    assert co_resp.status_code == 201
    order_code = co_resp.json()["order_code"]
    
    # Rastreo público
    track_resp = client.get(f"/api/v1/orders/track/{order_code}")
    assert track_resp.status_code == 200
    data = track_resp.json()
    
    # Verificar que datos sensibles de PII no se exponen al público
    assert "email" not in data
    assert "customer_email_masked" in data or "privacidad@kamilshop.store" not in str(data)
    assert "address" not in data


def test_security_headers_present():
    resp = client.get("/health")
    assert resp.status_code == 200
    
    assert "Strict-Transport-Security" in resp.headers
    assert "X-Content-Type-Options" in resp.headers
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert "X-Frame-Options" in resp.headers
    assert resp.headers["X-Frame-Options"] == "DENY"
    assert "Content-Security-Policy" in resp.headers
