import pytest
from app.infrastructure.adapters.driving.dependencies import Container


@pytest.fixture
def container():
    # Retorna un nuevo contenedor con datos sembrados limpios
    return Container()


def test_list_products_use_case(container):
    uc = container.list_products_uc
    all_products = uc.execute()
    assert len(all_products) >= 8

    # Filtro por Género Hombre
    men_products = uc.execute(gender="Hombre")
    assert all(p.gender in ("Hombre", "Unisex") for p in men_products)

    # Filtro por Género Mujer
    women_products = uc.execute(gender="Mujer")
    assert all(p.gender in ("Mujer", "Unisex") for p in women_products)

    # Filtro por Estilo Techwear
    tech_products = uc.execute(style="Techwear")
    assert all(p.style == "Techwear" for p in tech_products)


import uuid


def test_process_checkout_use_case_and_idempotency(container):
    checkout_uc = container.process_checkout_uc
    product = container.product_repo.find_all()[0]
    variant = product.variants[0]
    initial_stock = variant.stock_available

    idemp_key = f"IDEMP-KEY-TEST-{uuid.uuid4().hex[:8]}"
    payload = {
        "idempotency_key": idemp_key,
        "customer_email": "comprador@titulo.store",
        "customer_name": "Valeria Restrepo",
        "shipping_address": {
            "country_iso": "CO",
            "state_subdivision": "Bogota D.C.",
            "city": "Bogota",
            "street_type": "Calle",
            "street_name": "85",
            "exterior_number": "12-40",
            "postal_code": "110221",
        },
        "payment_method": "CARD",
        "coupon_code": "TITULO10",
        "items": [
            {
                "product_id": product.product_id,
                "variant_id": variant.variant_id,
                "quantity": 2,
            }
        ],
    }

    # 1. Primera ejecución: Orden creada con éxito y stock descontado
    order = checkout_uc.execute(payload)
    assert order.status == "PAGADA"
    assert order.idempotency_key == idemp_key
    assert variant.stock_available == initial_stock - 2

    # 2. Segunda ejecución idéntica: Devuelve la misma orden sin descontar doble stock (IDEMPOTENCIA)
    second_order = checkout_uc.execute(payload)
    assert second_order.order_id == order.order_id
    assert variant.stock_available == initial_stock - 2  # No se redujo de nuevo
