import threading
from collections import defaultdict
from typing import List, Optional, Dict, Set
from .....domain.entities.product import ProductBase
from .....domain.ports.driven.product_repository_port import IProductRepositoryPort


CATEGORY_SYNONYMS = {
    "hoodies": ["hoodie", "sweater", "sudadera", "buzo", "crewneck"],
    "camisetas": ["camiseta", "tee", "top", "t-shirt"],
    "chaquetas": ["chaqueta", "blazer", "outerwear", "bomber", "windbreaker", "abrigo"],
    "pantalones": ["pantal", "cargo", "trouser", "jean", "jogger"],
    "accesorios": ["accesorio", "cap", "gorra", "bolso", "cinturón", "cinturon"]
}


class InMemoryProductRepository(IProductRepositoryPort):
    """Adaptador de persistencia secundario para productos y variantes con índices optimizados."""

    def __init__(self):
        self._lock = threading.RLock()
        self._products: Dict[str, ProductBase] = {}
        # Índices secundarios para acelerar consultas O(1)
        self._slug_index: Dict[str, str] = {}
        self._category_index: Dict[str, Set[str]] = defaultdict(set)
        self._brand_id_index: Dict[int, Set[str]] = defaultdict(set)
        self._brand_code_index: Dict[str, Set[str]] = defaultdict(set)
        self._gender_index: Dict[str, Set[str]] = defaultdict(set)
        self._style_index: Dict[str, Set[str]] = defaultdict(set)
        self._in_stock_index: Set[str] = set()
        self._color_index: Dict[str, Set[str]] = defaultdict(set)
        self._size_index: Dict[str, Set[str]] = defaultdict(set)

    def _unindex_product(self, product_id: str):
        pid = str(product_id)
        slug_to_remove = None
        for s, p_id in self._slug_index.items():
            if p_id == pid:
                slug_to_remove = s
                break
        if slug_to_remove:
            self._slug_index.pop(slug_to_remove, None)

        for s in self._category_index.values():
            s.discard(pid)
        for s in self._brand_id_index.values():
            s.discard(pid)
        for s in self._brand_code_index.values():
            s.discard(pid)
        for s in self._gender_index.values():
            s.discard(pid)
        for s in self._style_index.values():
            s.discard(pid)
        self._in_stock_index.discard(pid)
        for s in self._color_index.values():
            s.discard(pid)
        for s in self._size_index.values():
            s.discard(pid)

    def _index_product(self, p: ProductBase):
        pid = str(p.product_id)
        if getattr(p, "slug", None):
            self._slug_index[p.slug.strip().lower()] = pid

        cat_lower = p.category.strip().lower()
        self._category_index[cat_lower].add(pid)
        for canonical, synonyms in CATEGORY_SYNONYMS.items():
            if any(syn in cat_lower for syn in synonyms):
                self._category_index[canonical].add(pid)

        if getattr(p, "brand", None):
            self._brand_id_index[p.brand.brand_id].add(pid)
            self._brand_code_index[p.brand.code.strip().lower()].add(pid)

        if getattr(p, "gender", None):
            self._gender_index[p.gender.strip().upper()].add(pid)

        if getattr(p, "style", None):
            self._style_index[p.style.strip().upper()].add(pid)

        stock_val = p.total_stock() if callable(getattr(p, "total_stock", None)) else getattr(p, "total_stock", 0)
        is_act = p.is_active if not callable(getattr(p, "is_active", None)) else p.is_active()
        if stock_val > 0 and is_act:
            self._in_stock_index.add(pid)

        for v in getattr(p, "variants", []):
            if getattr(v, "color_name", None):
                self._color_index[v.color_name.strip().lower()].add(pid)
            if getattr(v, "size_label", None):
                self._size_index[v.size_label.strip().lower()].add(pid)

        for c in getattr(p, "colors", []):
            c_name = c.get("name", "") if isinstance(c, dict) else str(c)
            if c_name:
                self._color_index[c_name.strip().lower()].add(pid)

        for s in getattr(p, "sizes", []):
            if s:
                self._size_index[str(s).strip().lower()].add(pid)

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
        color: Optional[str] = None,
        size: Optional[str] = None,
        badge: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ProductBase]:
        with self._lock:
            candidate_ids: Optional[Set[str]] = None

            # 1. Filtro rápido por género mediante índice O(1)
            if gender and gender.upper() not in ("ALL", "TODOS"):
                g_target = gender.strip().upper()
                g_ids = set(self._gender_index.get(g_target, set())) | set(self._gender_index.get("UNISEX", set()))
                candidate_ids = g_ids if candidate_ids is None else candidate_ids & g_ids

            # 2. Filtro rápido por categoría mediante índice O(1)
            if category and category.upper() not in ("ALL", "TODOS"):
                cat_key = category.strip().lower()
                c_ids = set(self._category_index.get(cat_key, set()))
                if not c_ids:
                    synonyms = CATEGORY_SYNONYMS.get(cat_key, [cat_key])
                    for syn in synonyms:
                        c_ids |= self._category_index.get(syn, set())
                candidate_ids = c_ids if candidate_ids is None else candidate_ids & c_ids

            # 3. Filtro rápido por ID de marca mediante índice O(1)
            if brand_id is not None:
                b_ids = set(self._brand_id_index.get(brand_id, set()))
                candidate_ids = b_ids if candidate_ids is None else candidate_ids & b_ids

            # 4. Filtro rápido por estilo mediante índice O(1)
            if style and style.upper() not in ("ALL", "TODOS"):
                st_ids = set(self._style_index.get(style.strip().upper(), set()))
                candidate_ids = st_ids if candidate_ids is None else candidate_ids & st_ids

            # 5. Filtro rápido por stock disponible mediante índice O(1)
            if in_stock_only:
                candidate_ids = set(self._in_stock_index) if candidate_ids is None else candidate_ids & self._in_stock_index

            # 6. Filtro rápido por color mediante índice
            if color and color.upper() not in ("ALL", "TODOS"):
                clr_term = color.strip().lower()
                matching_clr = set()
                for c_k, c_pids in self._color_index.items():
                    if clr_term in c_k:
                        matching_clr |= c_pids
                candidate_ids = matching_clr if candidate_ids is None else candidate_ids & matching_clr

            # 7. Filtro rápido por talla mediante índice
            if size and size.upper() not in ("ALL", "TODOS"):
                sz_term = size.strip().lower()
                sz_ids = set(self._size_index.get(sz_term, set()))
                candidate_ids = sz_ids if candidate_ids is None else candidate_ids & sz_ids

            # Conjunto base de productos ya filtrado por índices
            if candidate_ids is not None:
                result = [self._products[pid] for pid in candidate_ids if pid in self._products]
            else:
                result = list(self._products.values())

            # Filtros lineales remanentes (búsqueda de texto, rangos de precio, badge)
            if brand and brand.upper() not in ("ALL", "TODOS"):
                b_term = brand.strip().lower()
                result = [
                    p for p in result
                    if b_term == str(p.brand.brand_id)
                    or b_term in p.brand.code.lower()
                    or b_term in p.brand.commercial_name.lower()
                ]

            if min_price is not None:
                result = [p for p in result if p.base_price.amount >= min_price]

            if max_price is not None:
                result = [p for p in result if p.base_price.amount <= max_price]

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
            pid = str(product_id)
            res = self._products.get(pid)
            if res is None:
                pid_alt = self._slug_index.get(pid.strip().lower())
                if pid_alt:
                    res = self._products.get(pid_alt)
            return res

    def find_by_slug(self, slug: str) -> Optional[ProductBase]:
        with self._lock:
            target = slug.strip().lower()
            pid = self._slug_index.get(target)
            if pid and pid in self._products:
                return self._products[pid]
            # Fallback
            for p in self._products.values():
                if getattr(p, "slug", "") == target:
                    return p
            return None

    def save(self, product: ProductBase) -> ProductBase:
        with self._lock:
            pid = str(product.product_id)
            if pid in self._products:
                self._unindex_product(pid)
            self._products[pid] = product
            self._index_product(product)
            return product

    def delete(self, product_id: str) -> bool:
        with self._lock:
            pid = str(product_id)
            target = pid
            if target not in self._products:
                alt = self._slug_index.get(pid.strip().lower())
                if alt:
                    target = alt
            if target in self._products:
                self._unindex_product(target)
                del self._products[target]
                return True
            return False
