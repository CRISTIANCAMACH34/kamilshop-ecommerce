from decimal import Decimal
from datetime import datetime, timezone, timedelta
from .....domain.entities.brand import Brand
from .....domain.entities.product import ProductBase, ProductVariant
from .....domain.entities.coupon import Coupon
from .....domain.value_objects.money import Money
from .....domain.value_objects.sku import SKU
from ..persistence.in_memory_product_repository import InMemoryProductRepository
from ..persistence.in_memory_brand_repository import InMemoryBrandRepository


def populate_catalog(
    product_repo: InMemoryProductRepository,
    brand_repo: InMemoryBrandRepository,
) -> dict:
    """Siembra inicial de marcas de moda, prendas para hombre y mujer, variantes SKU y cupones."""

    # 1. MARCAS (BRANDS)
    brand_titulo = Brand(
        brand_id=1,
        code="TITULO_ATELIER",
        commercial_name="TITULO Atelier",
        country_origin="Colombia",
        website_url="https://titulo.store/atelier",
        biography="Línea principal de alta sastrería contemporánea y siluetas brutales.",
        is_own_brand=True,
    )
    brand_kuro = Brand(
        brand_id=2,
        code="KURO_ARCHIVE",
        commercial_name="Kuro Archive",
        country_origin="Japón",
        website_url="https://kuroarchive.jp",
        biography="Estética minimalista japonesa de vanguardia y tintes oscuros botánicos.",
        is_own_brand=False,
    )
    brand_acro = Brand(
        brand_id=3,
        code="ACRO_STUDIOS",
        commercial_name="Acro Studios",
        country_origin="Francia",
        website_url="https://acrostudio.fr",
        biography="Streetwear de lujo parisino confeccionado en algodones peinados de 450 GSM.",
        is_own_brand=False,
    )
    brand_aura = Brand(
        brand_id=4,
        code="AURA_MINIMAL",
        commercial_name="Aura Minimal",
        country_origin="Estados Unidos",
        website_url="https://auraminimal.com",
        biography="Sastrería femenina fluida y cortes arquitectónicos atemporales.",
        is_own_brand=False,
    )

    for b in [brand_titulo, brand_kuro, brand_acro, brand_aura]:
        brand_repo.save(b)

    # 2. PRODUCTOS CON VARIANTES SKU (HOMBRE, MUJER, UNISEX)
    products_data = [
        {
            "id": "prod-001",
            "sku": "TTL-HD-001",
            "brand": brand_titulo,
            "name": "TITULO Heavyweight Boxy Hoodie",
            "slug": "titulo-heavyweight-boxy-hoodie",
            "desc": "Hoodie estructural de corte boxy confeccionado en algodón francés de 480 GSM con hombros caídos y capucha anatómica de doble capa sin cordones.",
            "cat": "Hoodies & Sweaters",
            "gender": "Unisex",
            "style": "Streetwear",
            "price": 320000,
            "img": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
        },
        {
            "id": "prod-002",
            "sku": "KURO-TEE-002",
            "brand": brand_kuro,
            "name": "Kuro Minimalist Arch Tee",
            "slug": "kuro-minimalist-arch-tee",
            "desc": "Camiseta de corte arquitectónico recto en algodón pima peruano mercerizado de 280 GSM. Cuello acanalado fino de alta densidad.",
            "cat": "Camisetas Heavyweight",
            "gender": "Hombre",
            "style": "Minimalist",
            "price": 180000,
            "img": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
        },
        {
            "id": "prod-003",
            "sku": "AURA-TOP-003",
            "brand": brand_aura,
            "name": "Aura Sculpted Asymmetric Top",
            "slug": "aura-sculpted-asymmetric-top",
            "desc": "Top femenino esculpido con drapeado diagonal asimétrico en tejido de viscosa elástica de alta compresión y acabado mate sedoso.",
            "cat": "Camisetas & Tops",
            "gender": "Mujer",
            "style": "Avant-Garde",
            "price": 210000,
            "img": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80",
        },
        {
            "id": "prod-004",
            "sku": "ACRO-CRG-004",
            "brand": brand_acro,
            "name": "Acro Modular Tech Cargo Pants",
            "slug": "acro-modular-tech-cargo-pants",
            "desc": "Pantalón técnico utilitario en Nylon Cordura 3L repelente al agua (DWR), 8 bolsillos ergonómicos con fuelle y cierres termosellados YKK.",
            "cat": "Pantalones & Cargo",
            "gender": "Unisex",
            "style": "Techwear",
            "price": 390000,
            "img": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
        },
        {
            "id": "prod-005",
            "sku": "AURA-BLZ-005",
            "brand": brand_aura,
            "name": "Aura Brutalist Oversized Blazer",
            "slug": "aura-brutalist-oversized-blazer",
            "desc": "Blazer estructurado de sastrería femenina con solapas de lanza pronunciadas, hombreras internas esculpidas y forro en jacquard monocromático.",
            "cat": "Blazers & Outerwear",
            "gender": "Mujer",
            "style": "Tailoring",
            "price": 520000,
            "img": "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80",
        },
        {
            "id": "prod-006",
            "sku": "KURO-CW-006",
            "brand": brand_kuro,
            "name": "Kuro Raw Slate Crewneck",
            "slug": "kuro-raw-slate-crewneck",
            "desc": "Sudadera clásica cuello redondo con costuras planas Flatlock vistas, teñida en pieza con pigmentos minerales oscuros tono pizarra.",
            "cat": "Hoodies & Sweaters",
            "gender": "Hombre",
            "style": "Minimalist",
            "price": 260000,
            "img": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
        },
        {
            "id": "prod-007",
            "sku": "ACRO-BMB-007",
            "brand": brand_acro,
            "name": "Acro Stealth Bomber Jacket",
            "slug": "acro-stealth-bomber-jacket",
            "desc": "Cazadora Bomber contemporánea acolchada con aislamiento térmico Thinsulate ultraligero y forro interior de satén negro satinado.",
            "cat": "Blazers & Outerwear",
            "gender": "Unisex",
            "style": "Techwear",
            "price": 480000,
            "img": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
        },
        {
            "id": "prod-008",
            "sku": "TTL-PNT-008",
            "brand": brand_titulo,
            "name": "TITULO Pleated Wide-Leg Trousers",
            "slug": "titulo-pleated-wide-leg-trousers",
            "desc": "Pantalón de caída fluida con doble pinza frontal profunda, tiro alto y pretina extendida con hebilla metálica de ajuste lateral.",
            "cat": "Pantalones & Cargo",
            "gender": "Mujer",
            "style": "Tailoring",
            "price": 340000,
            "img": "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80",
        }
    ]

    for p_info in products_data:
        prod = ProductBase(
            product_id=p_info["id"],
            sku_root=SKU(p_info["sku"]),
            brand=p_info["brand"],
            name=p_info["name"],
            slug=p_info["slug"],
            description=p_info["desc"],
            category=p_info["cat"],
            gender=p_info["gender"],
            style=p_info["style"],
            base_price=Money(p_info["price"], "COP"),
        )

        # Variantes por talla S, M, L, XL
        for size in ["S", "M", "L", "XL"]:
            v = ProductVariant(
                variant_id=f"{p_info['id']}-{size.lower()}",
                sku=SKU(f"{p_info['sku']}-{size}"),
                color_name="Pitch Black",
                color_hex="#0A0A0A",
                size_label=size,
                price_adjustment=Money(0, "COP"),
                stock_available=12,
                image_url=p_info["img"],
            )
            prod.add_variant(v)

        product_repo.save(prod)

    # 3. CUPONES PROMOCIONALES
    coupons = {
        "KAMIL10": Coupon(
            coupon_id=1,
            code="KAMIL10",
            description="10% de descuento de bienvenida en Kamil Shop",
            discount_percent=Decimal("10.00"),
            start_date=datetime.now(timezone.utc) - timedelta(days=10),
            end_date=datetime.now(timezone.utc) + timedelta(days=365),
        ),
        "KAMIL20": Coupon(
            coupon_id=2,
            code="KAMIL20",
            description="20% de descuento VIP clientes exclusivos Kamil Shop",
            discount_percent=Decimal("20.00"),
            start_date=datetime.now(timezone.utc) - timedelta(days=10),
            end_date=datetime.now(timezone.utc) + timedelta(days=365),
        ),
        "TITULO10": Coupon(
            coupon_id=3,
            code="TITULO10",
            description="10% de descuento en la colección debut",
            discount_percent=Decimal("10.00"),
            start_date=datetime.now(timezone.utc) - timedelta(days=10),
            end_date=datetime.now(timezone.utc) + timedelta(days=365),
        ),
        "TITULO20": Coupon(
            coupon_id=4,
            code="TITULO20",
            description="20% de descuento VIP clientes selectos",
            discount_percent=Decimal("20.00"),
            start_date=datetime.now(timezone.utc) - timedelta(days=10),
            end_date=datetime.now(timezone.utc) + timedelta(days=365),
        )
    }

    return {"coupons": coupons}
