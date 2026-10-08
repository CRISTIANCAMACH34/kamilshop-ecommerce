import pytest
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from app.domain.value_objects.money import Money
from app.domain.value_objects.sku import SKU
from app.domain.value_objects.email import Email
from app.domain.value_objects.address_vo import AddressVO
from app.domain.entities.brand import Brand
from app.domain.entities.product import ProductBase, ProductVariant
from app.domain.entities.coupon import Coupon
from app.domain.entities.order import Order, OrderLine
from app.domain.exceptions import DomainException, InsufficientStockException, InvalidCouponException


def test_money_value_object():
    m1 = Money(100000, "COP")
    m2 = Money(50000, "COP")

    sum_result = m1.add(m2)
    assert sum_result.amount == Decimal("150000.00")
    assert sum_result.currency == "COP"

    sub_result = m1.subtract(m2)
    assert sub_result.amount == Decimal("50000.00")

    pct_result = m1.apply_percentage(19)
    assert pct_result.amount == Decimal("19000.00")

    # Inmutabilidad
    with pytest.raises(AttributeError):
        m1.amount = Decimal("200000.00")


def test_sku_value_object():
    sku = SKU("TTL-HOODIE-M")
    assert sku.value == "TTL-HOODIE-M"

    with pytest.raises(DomainException):
        SKU("!?invalid-sku*&")


def test_email_value_object():
    email = Email("CLIENTE@TITULO.STORE")
    assert email.value == "cliente@titulo.store"

    with pytest.raises(DomainException):
        Email("invalid-email-address")


def test_address_vo():
    addr = AddressVO(
        country_iso="CO",
        state_subdivision="Antioquia",
        city="Medellin",
        street_type="Carrera",
        street_name="43A",
        exterior_number="1-50",
        postal_code="050021",
    )
    assert "Carrera 43A #1-50" in addr.format_single_line()
    assert "Medellin" in addr.format_single_line()


def test_brand_entity():
    brand = Brand(
        brand_id=1,
        code="TITULO_ATELIER",
        commercial_name="TITULO Atelier",
        country_origin="Colombia",
        is_own_brand=True,
    )
    assert brand.commercial_name == "TITULO Atelier"
    assert brand.is_active is True

    brand.deactivate()
    assert brand.is_active is False


def test_product_aggregate_and_stock_deduction():
    brand = Brand(1, "TITULO", "TITULO", "CO")
    product = ProductBase(
        product_id="p-1",
        sku_root=SKU("TTL-P1"),
        brand=brand,
        name="Heavyweight Tee",
        slug="heavyweight-tee",
        description="Camiseta pesada de alta gama",
        category="Tees",
        gender="Hombre",
        style="Streetwear",
        base_price=Money(180000, "COP"),
    )

    variant = ProductVariant(
        variant_id="v-m",
        sku=SKU("TTL-P1-M"),
        color_name="Pitch Black",
        color_hex="#0A0A0A",
        size_label="M",
        price_adjustment=Money(0, "COP"),
        stock_available=5,
        image_url="https://images.unsplash.com/photo-1",
    )
    product.add_variant(variant)

    assert product.total_stock() == 5
    assert variant.has_stock(3) is True

    # Descontar stock
    variant.deduct_stock(2)
    assert variant.stock_available == 3
    assert product.total_stock() == 3

    # Error si supera el disponible
    with pytest.raises(InsufficientStockException):
        variant.deduct_stock(4)


def test_coupon_entity_and_validation():
    coupon = Coupon(
        coupon_id=1,
        code="TITULO10",
        description="10% OFF",
        discount_percent=Decimal("10.00"),
        start_date=datetime.now(timezone.utc) - timedelta(days=1),
        end_date=datetime.now(timezone.utc) + timedelta(days=10),
    )

    subtotal = Money(200000, "COP")
    discount = coupon.calculate_discount(subtotal)
    assert discount.amount == Decimal("20000.00")
