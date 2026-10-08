import uuid
import re
from typing import Dict, Any
from ...domain.entities.product import ProductBase, ProductVariant
from ...domain.value_objects.money import Money
from ...domain.value_objects.sku import SKU
from ...domain.ports.driven.product_repository_port import IProductRepositoryPort
from ...domain.ports.driven.brand_repository_port import IBrandRepositoryPort
from ...domain.exceptions import BrandNotFoundException, ProductNotFoundException


class ManageCatalogUseCase:
    """Caso de uso de administración para crear, editar o eliminar prendas en el catálogo."""

    def __init__(
        self,
        product_repo: IProductRepositoryPort,
        brand_repo: IBrandRepositoryPort,
    ):
        self._product_repo = product_repo
        self._brand_repo = brand_repo

    def create_product(self, data: Dict[str, Any]) -> ProductBase:
        brand = self._brand_repo.find_by_id(data["brand_id"])
        if not brand:
            raise BrandNotFoundException(str(data["brand_id"]))

        product_id = str(uuid.uuid4())
        sku_clean = re.sub(r"[^A-Za-z0-9]", "", data["name"].upper())[:10]
        sku_root = SKU(f"TTL-{sku_clean}-{data.get('gender', 'UNI')[:3].upper()}")

        slug = re.sub(r"[^a-z0-9]+", "-", data["name"].lower()).strip("-")
        base_price = Money(data["base_price"], data.get("currency", "COP"))

        product = ProductBase(
            product_id=product_id,
            sku_root=sku_root,
            brand=brand,
            name=data["name"],
            slug=slug,
            description=data["description"],
            category=data["category"],
            gender=data["gender"],
            style=data["style"],
            base_price=base_price,
            weight_grams=data.get("weight_grams", 400),
        )

        # Variantes por defecto o suministradas
        raw_variants = data.get("variants", [])
        if not raw_variants:
            # Crea tallas por defecto si no vienen
            for size in ["S", "M", "L", "XL"]:
                v_sku = SKU(f"{sku_root.value}-{size}")
                variant = ProductVariant(
                    variant_id=str(uuid.uuid4()),
                    sku=v_sku,
                    color_name="Pitch Black",
                    color_hex="#0A0A0A",
                    size_label=size,
                    price_adjustment=Money(0, base_price.currency),
                    stock_available=15,
                    image_url=data.get("image_url", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"),
                )
                product.add_variant(variant)
        else:
            for item in raw_variants:
                v_sku = SKU(item.get("sku", f"{sku_root.value}-{item['size_label']}"))
                variant = ProductVariant(
                    variant_id=str(uuid.uuid4()),
                    sku=v_sku,
                    color_name=item.get("color_name", "Pitch Black"),
                    color_hex=item.get("color_hex", "#0A0A0A"),
                    size_label=item["size_label"],
                    price_adjustment=Money(item.get("price_adjustment", 0), base_price.currency),
                    stock_available=item.get("stock_available", 10),
                    image_url=item.get("image_url", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"),
                )
                product.add_variant(variant)

        return self._product_repo.save(product)

    def delete_product(self, product_id: str) -> bool:
        existing = self._product_repo.find_by_id(product_id)
        if not existing:
            raise ProductNotFoundException(product_id)
        return self._product_repo.delete(product_id)
