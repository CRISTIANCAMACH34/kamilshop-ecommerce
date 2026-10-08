from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from ..dependencies import get_list_products_uc, get_product_detail_uc, get_categories_uc, get_container
from .....application.use_cases.list_products_use_case import ListProductsUseCase
from .....application.use_cases.get_categories_use_case import GetCategoriesUseCase
from .....application.use_cases.get_product_detail_use_case import GetProductDetailUseCase
from .....application.dtos.product_dto import ProductOutputDTO, CategoryOutputDTO
from .....domain.exceptions import ProductNotFoundException
from ...driven.cache.redis_cache import cache_manager

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/categories", response_model=List[CategoryOutputDTO])
def get_categories(
    use_case: GetCategoriesUseCase = Depends(get_categories_uc),
):
    """Obtiene el listado consolidado de categorías con conteo de prendas activas."""
    cache_key = "products:categories:summary"
    cached_data = cache_manager.get(cache_key)
    if cached_data is not None:
        return [CategoryOutputDTO(**item) for item in cached_data]

    summary = use_case.execute()
    result = [CategoryOutputDTO(**item) for item in summary]
    cache_manager.set(cache_key, [c.model_dump() for c in result], ttl=300)
    return result


@router.get("/brands/summary")
def get_brands_summary():
    """Obtiene el listado de marcas con conteo consolidado de prendas en catálogo."""
    cache_key = "products:brands:summary"
    cached_data = cache_manager.get(cache_key)
    if cached_data is not None:
        return cached_data

    summary = get_container().product_repo.get_brands_summary()
    cache_manager.set(cache_key, summary, ttl=300)
    return summary


@router.get("")
def list_products(
    gender: Optional[str] = Query(None, description="Filtro por género (Hombre, Mujer, Unisex)"),
    category: Optional[str] = Query(None, description="Filtro por categoría (Hoodies, Camisetas, Chaquetas, Pantalones, Accesorios)"),
    brand: Optional[str] = Query(None, description="Filtro por marca (nombre, código o ID)"),
    brand_id: Optional[int] = Query(None, description="ID de la marca"),
    style: Optional[str] = Query(None, description="Filtro por estilo (Streetwear, Minimalist, Techwear, Tailoring, Avant-Garde)"),
    min_price: Optional[float] = Query(None, description="Precio mínimo"),
    max_price: Optional[float] = Query(None, description="Precio máximo"),
    in_stock_only: Optional[bool] = Query(None, description="Solo prendas con inventario disponible"),
    color: Optional[str] = Query(None, description="Filtro por tono o variante de color (e.g. Negro, Blanco, Beige)"),
    size: Optional[str] = Query(None, description="Filtro por talla (e.g. S, M, L, XL)"),
    badge: Optional[str] = Query(None, description="Filtro por etiqueta especial"),
    search: Optional[str] = Query(None, description="Término de búsqueda libre"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(12, ge=1, le=100, description="Tamaño de página"),
    paginate: bool = Query(False, description="Formatear respuesta con metadatos de paginación"),
    use_case: ListProductsUseCase = Depends(get_list_products_uc),
):
    """Consulta de prendas de indumentaria con paginación en servidor, caché Redis y filtros avanzados."""
    cache_key = f"products:list:g={gender}:c={category}:br={brand}:bid={brand_id}:s={style}:min={min_price}:max={max_price}:stk={in_stock_only}:clr={color}:sz={size}:bdg={badge}:q={search}:p={page}:ps={page_size}:pag={paginate}"
    cached_data = cache_manager.get(cache_key)
    if cached_data is not None:
        return cached_data

    products = use_case.execute(
        gender=gender,
        category=category,
        brand=brand,
        brand_id=brand_id,
        style=style,
        min_price=min_price,
        max_price=max_price,
        in_stock_only=in_stock_only,
        color=color,
        size=size,
        badge=badge,
        search=search,
    )
    all_dtos = [ProductOutputDTO.from_entity(p) for p in products]

    if paginate:
        total_count = len(all_dtos)
        total_pages = max(1, (total_count + page_size - 1) // page_size)
        start = (page - 1) * page_size
        end = start + page_size
        page_items = all_dtos[start:end]

        result = {
            "items": [p.model_dump() for p in page_items],
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }
    else:
        result = [p.model_dump() for p in all_dtos]

    # Guardar en caché Redis por 5 minutos
    cache_manager.set(cache_key, result, ttl=300)
    return result


@router.get("/{identifier}", response_model=ProductOutputDTO)
def get_product(
    identifier: str,
    use_case: GetProductDetailUseCase = Depends(get_product_detail_uc),
):
    """Obtiene la ficha técnica completa y variantes de una prenda por ID o Slug con caché Redis."""
    cache_key = f"products:detail:{identifier}"
    cached_data = cache_manager.get(cache_key)
    if cached_data is not None:
        return ProductOutputDTO(**cached_data)

    try:
        product = use_case.execute(identifier)
        dto = ProductOutputDTO.from_entity(product)
        cache_manager.set(cache_key, dto.model_dump(), ttl=600)
        return dto
    except ProductNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
