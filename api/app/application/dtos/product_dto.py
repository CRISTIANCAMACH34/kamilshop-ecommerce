from pydantic import BaseModel, Field
from typing import List, Optional
from .brand_dto import BrandOutputDTO
from ...domain.entities.product import ProductBase


class ProductVariantDTO(BaseModel):
    variant_id: str
    sku: str
    color_name: str
    color_hex: str
    size_label: str
    price_adjustment: float = 0.0
    stock_available: int
    image_url: str
    is_active: bool = True


class ProductOutputDTO(BaseModel):
    product_id: str
    sku_root: str
    brand: BrandOutputDTO
    name: str
    slug: str
    description: str
    category: str
    gender: str
    style: str
    base_price: float
    currency: str = "COP"
    weight_grams: int = 400
    total_stock: int
    is_active: bool = True
    variants: List[ProductVariantDTO]

    @classmethod
    def from_entity(cls, p: ProductBase) -> "ProductOutputDTO":
        variants_dto = [
            ProductVariantDTO(
                variant_id=v.variant_id,
                sku=v.sku.value,
                color_name=v.color_name,
                color_hex=v.color_hex,
                size_label=v.size_label,
                price_adjustment=v.price_adjustment.to_float(),
                stock_available=v.stock_available,
                image_url=v.image_url,
                is_active=v.is_active,
            )
            for v in p.variants
        ]
        return cls(
            product_id=p.product_id,
            sku_root=p.sku_root.value,
            brand=BrandOutputDTO(**p.brand.to_dict()),
            name=p.name,
            slug=p.slug,
            description=p.description,
            category=p.category,
            gender=p.gender,
            style=p.style,
            base_price=p.base_price.to_float(),
            currency=p.base_price.currency,
            weight_grams=p.weight_grams,
            total_stock=p.total_stock(),
            is_active=p.is_active,
            variants=variants_dto,
        )


class CreateVariantInputDTO(BaseModel):
    sku: str
    color_name: str = "Pitch Black"
    color_hex: str = "#0A0A0A"
    size_label: str
    price_adjustment: float = 0.0
    stock_available: int = 10
    image_url: str


class CreateProductInputDTO(BaseModel):
    name: str = Field(..., min_length=3, max_length=120)
    brand_id: int
    category: str
    gender: str = Field(..., pattern="^(Hombre|Mujer|Unisex)$")
    style: str = Field(..., pattern="^(Streetwear|Minimalist|Techwear|Tailoring|Avant-Garde)$")
    description: str = Field(..., min_length=10)
    base_price: float = Field(..., gt=0)
    weight_grams: int = 400
    variants: List[CreateVariantInputDTO] = []


class CategoryOutputDTO(BaseModel):
    id: str
    name: str
    slug: str
    icon: str = "Tag"
    count: int = 0


class PaginatedProductsResponseDTO(BaseModel):
    items: List[ProductOutputDTO]
    total_count: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool


