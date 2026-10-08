import threading
from typing import List, Optional, Dict
from .....domain.entities.product import ProductBase
from .....domain.entities.brand import Brand
from .....domain.ports.driven.product_repository_port import IProductRepositoryPort
from .....domain.ports.driven.brand_repository_port import IBrandRepositoryPort


class InMemoryCatalogRepository(IProductRepositoryPort, IBrandRepositoryPort):
    """Adaptador de persistencia secundario (Driven Adapter) en memoria con seguridad de hilos (thread-safe)."""

    def __init__(self):
        self._lock = threading.RLock()
        self._products: Dict[str, ProductBase] = {}
        self._brands: Dict[int, Brand] = {}

    # --- IProductRepositoryPort ---

CATEGORY_SYNONYMS = {
    "hoodies": ["hoodie", "sweater", "sudadera", "buzo", "crewneck"],
    "camisetas": ["camiseta", "tee", "top", "t-shirt"],
    "chaquetas": ["chaqueta", "blazer", "outerwear", "bomber", "windbreaker", "abrigo"],
    "pantalones": ["pantal", "cargo", "trouser", "jean", "jogger"],
    "accesorios": ["accesorio", "cap", "gorra", "bolso", "cinturón", "cinturon"]
}


    def find_all(
        self,
        gender: Optional[str] = None,
        category: Optional[str] = None,
        brand: Optional[str] = None,
        brand_id: Optional[int] = None,
        style: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock_only: Optional[bool] = None,
        badge: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ProductBase]:
        with self._lock:
            result = list(self._products.values())

            if gender and gender.upper() not in ("ALL", "TODOS"):
                result = [p for p in result if p.gender.upper() == gender.upper() or p.gender.upper() == "UNISEX"]

            if category and category.upper() not in ("ALL", "TODOS"):
                cat_key = category.strip().lower()
                synonyms = CATEGORY_SYNONYMS.get(cat_key, [cat_key])
                result = [
                    p for p in result
                    if any(syn in p.category.lower() for syn in synonyms)
                ]

            if brand and brand.upper() not in ("ALL", "TODOS"):
                b_term = brand.strip().lower()
                result = [
                    p for p in result
                    if b_term == str(p.brand.brand_id)
                    or b_term in p.brand.code.lower()
                    or b_term in p.brand.commercial_name.lower()
                ]

            if brand_id is not None:
                result = [p for p in result if p.brand.brand_id == brand_id]

            if style and style.upper() not in ("ALL", "TODOS"):
                result = [p for p in result if p.style.upper() == style.upper()]

            if min_price is not None:
                result = [p for p in result if p.base_price.amount >= min_price]

            if max_price is not None:
                result = [p for p in result if p.base_price.amount <= max_price]

            if in_stock_only:
                result = [p for p in result if p.total_stock > 0 and p.is_active]

            if badge and badge.upper() not in ("ALL", "TODOS"):
                badge_term = badge.strip().lower()
                result = [
                    p for p in result
                    if (hasattr(p, 'badge') and p.badge and badge_term in p.badge.lower())
                    or (hasattr(p, 'badgeType') and p.badgeType and badge_term in p.badgeType.lower())
                ]

            if search:
                term = search.strip().lower()
                result = [
                    p for p in result
                    if term in p.name.lower()
                    or term in p.description.lower()
                    or term in p.brand.commercial_name.lower()
                    or term in p.category.lower()
                    or term in p.style.lower()
                ]

            return result

    def get_brands_summary(self) -> List[dict]:
        with self._lock:
            products = list(self._products.values())
            brand_map = {}
            for p in products:
                b_id = p.brand.brand_id
                if b_id not in brand_map:
                    brand_map[b_id] = {
                        "id": b_id,
                        "code": p.brand.code,
                        "name": p.brand.commercial_name,
                        "country": p.brand.country_origin,
                        "count": 0
                    }
                brand_map[b_id]["count"] += 1
            return list(brand_map.values())

    def get_categories_summary(self) -> List[dict]:
        with self._lock:
            products = list(self._products.values())
            total_count = len(products)

            categories_def = [
                {"id": "todos", "name": "Todas", "slug": "todos", "icon": "Layers"},
                {"id": "hoodies", "name": "Hoodies & Buzos", "slug": "hoodies", "icon": "Flame"},
                {"id": "camisetas", "name": "Camisetas & Tops", "slug": "camisetas", "icon": "Shirt"},
                {"id": "chaquetas", "name": "Chaquetas & Blazers", "slug": "chaquetas", "icon": "Shield"},
                {"id": "pantalones", "name": "Pantalones & Cargo", "slug": "pantalones", "icon": "Scissors"},
                {"id": "accesorios", "name": "Accesorios & Gorras", "slug": "accesorios", "icon": "Sparkles"},
            ]

            summary = []
            for cat in categories_def:
                cat_id = cat["id"]
                if cat_id == "todos":
                    count = total_count
                else:
                    synonyms = CATEGORY_SYNONYMS.get(cat_id, [cat_id])
                    count = sum(1 for p in products if any(syn in p.category.lower() for syn in synonyms))
                summary.append({
                    "id": cat_id,
                    "name": cat["name"],
                    "slug": cat["slug"],
                    "icon": cat["icon"],
                    "count": count
                })

            known_cats = set()
            for synonyms in CATEGORY_SYNONYMS.values():
                known_cats.update(synonyms)

            custom_categories = {}
            for p in products:
                cat_lower = p.category.lower()
                if not any(k in cat_lower for k in known_cats):
                    custom_categories[p.category] = custom_categories.get(p.category, 0) + 1

            for custom_name, count in custom_categories.items():
                slug = custom_name.strip().lower().replace(" ", "-")
                summary.append({
                    "id": slug,
                    "name": custom_name,
                    "slug": slug,
                    "icon": "Tag",
                    "count": count
                })

            return summary

    def find_by_id(self, product_id: str) -> Optional[ProductBase]:
        with self._lock:
            return self._products.get(str(product_id))

    def find_by_slug(self, slug: str) -> Optional[ProductBase]:
        with self._lock:
            target = slug.strip().lower()
            for p in self._products.values():
                if p.slug == target:
                    return p
            return None

    def save(self, product: ProductBase) -> ProductBase:
        with self._lock:
            self._products[product.product_id] = product
            return product

    def delete(self, product_id: str) -> bool:
        with self._lock:
            if product_id in self._products:
                del self._products[product_id]
                return True
            return False

    # --- IBrandRepositoryPort ---

    def find_all_brands(self, active_only: bool = True) -> List[Brand]:
        with self._lock:
            if active_only:
                return [b for b in self._brands.values() if b.is_active]
            return list(self._brands.values())

    def find_brand_by_id(self, brand_id: int) -> Optional[Brand]:
        with self._lock:
            return self._brands.get(brand_id)

    def find_brand_by_code(self, code: str) -> Optional[Brand]:
        with self._lock:
            target = code.strip().upper()
            for b in self._brands.values():
                if b.code == target:
                    return b
            return None

    def save_brand(self, brand: Brand) -> Brand:
        with self._lock:
            self._brands[brand.brand_id] = brand
            return brand

    # Aliases for IBrandRepositoryPort compliance
    def find_all(self, *args, **kwargs):
        # Disambiguation based on arguments
        if "active_only" in kwargs or (len(args) == 1 and isinstance(args[0], bool)):
            return self.find_all_brands(*args, **kwargs)
        return self.find_all_products(*args, **kwargs)

    def find_all_products(
        self,
        gender: Optional[str] = None,
        style: Optional[str] = None,
        brand_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[ProductBase]:
        return self.find_all(gender=gender, style=style, brand_id=brand_id, search=search)
