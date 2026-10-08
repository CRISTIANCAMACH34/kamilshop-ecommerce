from typing import List, Optional, Dict, Any
from ..value_objects.money import Money
from ..value_objects.sku import SKU
from ..entities.brand import Brand
from ..exceptions import DomainException, InsufficientStockException


class ProductVariant:
    """Entidad POO de Variante de Producto (SKU hijo con talla, color y stock atómico)."""

    def __init__(
        self,
        variant_id: str,
        sku: SKU,
        color_name: str,
        color_hex: str,
        size_label: str,
        price_adjustment: Money,
        stock_available: int,
        image_url: str,
        is_active: bool = True,
    ):
        if stock_available < 0:
            raise DomainException("El stock de una variante no puede ser negativo.")

        self._variant_id = str(variant_id)
        self._sku = sku
        self._color_name = color_name.strip()
        self._color_hex = color_hex.strip()
        self._size_label = size_label.strip()
        self._price_adjustment = price_adjustment
        self._stock_available = stock_available
        self._image_url = image_url.strip()
        self._is_active = is_active

    @property
    def variant_id(self) -> str:
        return self._variant_id

    @property
    def sku(self) -> SKU:
        return self._sku

    @property
    def color_name(self) -> str:
        return self._color_name

    @property
    def color_hex(self) -> str:
        return self._color_hex

    @property
    def size_label(self) -> str:
        return self._size_label

    @property
    def price_adjustment(self) -> Money:
        return self._price_adjustment

    @property
    def stock_available(self) -> int:
        return self._stock_available

    @property
    def image_url(self) -> str:
        return self._image_url

    @property
    def is_active(self) -> bool:
        return self._is_active

    def has_stock(self, quantity: int) -> bool:
        return self._stock_available >= quantity and self._is_active

    def deduct_stock(self, quantity: int) -> None:
        if quantity <= 0:
            raise DomainException("La cantidad a descontar debe ser mayor a cero.")
        if self._stock_available < quantity:
            raise InsufficientStockException(self._sku.value, requested=quantity, available=self._stock_available)
        self._stock_available -= quantity

    def add_stock(self, quantity: int) -> None:
        if quantity <= 0:
            raise DomainException("La cantidad a reponer debe ser mayor a cero.")
        self._stock_available += quantity

    def to_dict(self) -> Dict[str, Any]:
        return {
            "variant_id": self._variant_id,
            "sku": self._sku.value,
            "color_name": self._color_name,
            "color_hex": self._color_hex,
            "size_label": self._size_label,
            "price_adjustment": self._price_adjustment.to_dict(),
            "stock_available": self._stock_available,
            "image_url": self._image_url,
            "is_active": self._is_active,
        }


class ProductBase:
    """Aggregate Root POO que modela una prenda de indumentaria en TITULO E-Commerce."""

    VALID_GENDERS = {"Hombre", "Mujer", "Unisex"}
    VALID_STYLES = {"Streetwear", "Minimalist", "Techwear", "Tailoring", "Avant-Garde"}

    def __init__(
        self,
        product_id: str,
        sku_root: SKU,
        brand: Brand,
        name: str,
        slug: str,
        description: str,
        category: str,
        gender: str,
        style: str,
        base_price: Money,
        weight_grams: int = 400,
        variants: Optional[List[ProductVariant]] = None,
        is_active: bool = True,
    ):
        if not name or len(name.strip()) < 3:
            raise DomainException("El nombre del producto debe contener al menos 3 caracteres.")
        if gender not in self.VALID_GENDERS:
            raise DomainException(f"Género inválido '{gender}'. Debe ser uno de {self.VALID_GENDERS}.")
        if style not in self.VALID_STYLES:
            raise DomainException(f"Estilo estético inválido '{style}'. Debe ser uno de {self.VALID_STYLES}.")

        self._product_id = str(product_id)
        self._sku_root = sku_root
        self._brand = brand
        self._name = name.strip()
        self._slug = slug.strip().lower()
        self._description = description.strip()
        self._category = category.strip()
        self._gender = gender
        self._style = style
        self._base_price = base_price
        self._weight_grams = weight_grams
        self._variants: List[ProductVariant] = variants if variants is not None else []
        self._is_active = is_active

    @property
    def product_id(self) -> str:
        return self._product_id

    @property
    def sku_root(self) -> SKU:
        return self._sku_root

    @property
    def brand(self) -> Brand:
        return self._brand

    @property
    def name(self) -> str:
        return self._name

    @property
    def slug(self) -> str:
        return self._slug

    @property
    def description(self) -> str:
        return self._description

    @property
    def category(self) -> str:
        return self._category

    @property
    def gender(self) -> str:
        return self._gender

    @property
    def style(self) -> str:
        return self._style

    @property
    def base_price(self) -> Money:
        return self._base_price

    @property
    def weight_grams(self) -> int:
        return self._weight_grams

    @property
    def variants(self) -> List[ProductVariant]:
        return list(self._variants)

    @property
    def is_active(self) -> bool:
        return self._is_active

    def add_variant(self, variant: ProductVariant) -> None:
        for existing in self._variants:
            if existing.size_label == variant.size_label and existing.color_name == variant.color_name:
                raise DomainException(
                    f"Ya existe una variante con talla '{variant.size_label}' y color '{variant.color_name}'."
                )
        self._variants.append(variant)

    def get_variant_by_id(self, variant_id: str) -> Optional[ProductVariant]:
        for v in self._variants:
            if v.variant_id == variant_id:
                return v
        return None

    def get_variant_by_size(self, size_label: str) -> Optional[ProductVariant]:
        for v in self._variants:
            if v.size_label.upper() == size_label.upper():
                return v
        return None

    def calculate_price_for_variant(self, variant_id: str) -> Money:
        variant = self.get_variant_by_id(variant_id)
        if not variant:
            raise DomainException(f"Variante '{variant_id}' no existe en el producto.")
        return self._base_price.add(variant.price_adjustment)

    def total_stock(self) -> int:
        return sum(v.stock_available for v in self._variants if v.is_active)

    def has_available_stock(self) -> bool:
        return self.total_stock() > 0 and self._is_active

    def to_dict(self) -> Dict[str, Any]:
        return {
            "product_id": self._product_id,
            "sku_root": self._sku_root.value,
            "brand": self._brand.to_dict(),
            "name": self._name,
            "slug": self._slug,
            "description": self._description,
            "category": self._category,
            "gender": self._gender,
            "style": self._style,
            "base_price": self._base_price.to_dict(),
            "weight_grams": self._weight_grams,
            "total_stock": self.total_stock(),
            "is_active": self._is_active,
            "variants": [v.to_dict() for v in self._variants],
        }

    def __repr__(self) -> str:
        return f"<ProductBase id={self._product_id} name='{self._name}' brand='{self._brand.commercial_name}'>"
