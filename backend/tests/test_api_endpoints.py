import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "Hexagonal" in data["architecture"]


def test_list_products_api():
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 8

    first = products[0]
    assert "name" in first
    assert "brand" in first
    assert "variants" in first
    assert "base_price" in first


def test_filter_products_by_gender_and_style():
    response = client.get("/api/v1/products?gender=Hombre&style=Minimalist")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    for p in products:
        assert p["style"] == "Minimalist"
        assert p["gender"] in ("Hombre", "Unisex")


def test_get_categories_api():
    response = client.get("/api/v1/products/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 5
    cat_ids = [c["id"] for c in categories]
    assert "todos" in cat_ids
    assert "hoodies" in cat_ids
    assert "camisetas" in cat_ids
    assert "chaquetas" in cat_ids
    assert "pantalones" in cat_ids

    # Verificar que el conteo total en 'todos' coincide con la suma o total de productos
    todos = next(c for c in categories if c["id"] == "todos")
    assert todos["count"] >= 8


def test_filter_products_by_category():
    # Probar filtro por categoría 'hoodies'
    response = client.get("/api/v1/products?category=hoodies")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    for p in products:
        assert any(x in p["category"].lower() for x in ["hoodie", "sweater", "sudadera", "buzo", "crewneck"])

    # Probar filtro por categoría 'pantalones'
    response_pnt = client.get("/api/v1/products?category=pantalones")
    assert response_pnt.status_code == 200
    pnt_products = response_pnt.json()
    assert len(pnt_products) > 0
    for p in pnt_products:
        assert any(x in p["category"].lower() for x in ["pantal", "cargo", "trouser", "jean"])


def test_list_brands_api():
    response = client.get("/api/v1/brands")
    assert response.status_code == 200
    brands = response.json()
    assert len(brands) >= 4
    brand_names = [b["commercial_name"] for b in brands]
    assert "TITULO Atelier" in brand_names
    assert "Kuro Archive" in brand_names


def test_checkout_api_endpoint():
    # Obtener un producto y variante válida
    prod_resp = client.get("/api/v1/products")
    prod = prod_resp.json()[0]
    variant = prod["variants"][0]

    checkout_payload = {
        "idempotency_key": "API-IDEMP-CHECKOUT-00123",
        "customer_email": "alex.vargas@titulo.store",
        "customer_name": "Alex Vargas",
        "shipping_address": {
            "country_iso": "CO",
            "state_subdivision": "Cundinamarca",
            "city": "Bogota",
            "street_type": "Carrera",
            "street_name": "11",
            "exterior_number": "93-08",
            "postal_code": "110221",
        },
        "payment_method": "CARD",
        "coupon_code": "TITULO10",
        "items": [
            {
                "product_id": prod["product_id"],
                "variant_id": variant["variant_id"],
                "quantity": 1,
            }
        ],
    }

    response = client.post("/api/v1/checkout", json=checkout_payload)
    assert response.status_code == 201
    order = response.json()
    assert order["status"] == "PAGADA"
    assert order["order_code"].startswith("TTL-")
    assert order["total"] > 0
    assert order["idempotency_key"] == "API-IDEMP-CHECKOUT-00123"


def test_auth_providers_endpoint():
    response = client.get("/api/v1/auth/providers")
    assert response.status_code == 200
    data = response.json()
    assert "oauth" in data
    assert "google" in data["oauth"]
    assert "apple" in data["oauth"]
    assert "facebook" in data["oauth"]
    assert "wompi" in data
    assert "environment" in data["wompi"]


def test_wompi_webhook_endpoint():
    webhook_payload = {
        "event": "transaction.updated",
        "data": {
            "transaction": {
                "id": "wompi-txn-test-999",
                "status": "APPROVED",
                "amount_in_cents": 18000000,
                "reference": "TTL-TEST-ORD",
                "customer_email": "cliente@camilaytio.com",
            }
        },
        "sent_at": "2026-09-28T18:00:00.000Z",
    }
    response = client.post("/api/v1/checkout/wompi/webhook", json=webhook_payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["received"] is True
    assert res_data["status"] == "QUEUED"


def test_admin_login_camilaytio():
    login_payload = {
        "username_or_email": "admin@camilaytio.store",
        "password": "admin2026",
    }
    response = client.post("/api/v1/auth/admin/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "ADMIN"
    assert data["email"] == "admin@camilaytio.store"


def test_get_brands_summary_api():
    response = client.get("/api/v1/products/brands/summary")
    assert response.status_code == 200
    brands = response.json()
    assert len(brands) >= 4
    brand_codes = [b["code"] for b in brands]
    assert "TITULO_ATELIER" in brand_codes
    assert "KURO_ARCHIVE" in brand_codes
    for b in brands:
        assert b["count"] > 0


def test_filter_products_by_brand_and_price():
    # Filtrar por marca 'KURO_ARCHIVE'
    response_kuro = client.get("/api/v1/products?brand=kuro")
    assert response_kuro.status_code == 200
    kuro_prods = response_kuro.json()
    assert len(kuro_prods) > 0
    for p in kuro_prods:
        assert "KURO" in p["brand"]["code"].upper() or "KURO" in p["brand"]["commercial_name"].upper()

    # Filtrar por precio máximo
    response_price = client.get("/api/v1/products?max_price=200000")
    assert response_price.status_code == 200
    cheap_prods = response_price.json()
    assert len(cheap_prods) > 0
    for p in cheap_prods:
        assert p["base_price"] <= 200000

