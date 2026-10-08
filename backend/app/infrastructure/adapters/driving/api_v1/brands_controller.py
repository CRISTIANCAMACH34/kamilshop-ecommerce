from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List
import time
from ..dependencies import get_list_brands_uc, get_container
from .....application.use_cases.list_brands_use_case import ListBrandsUseCase
from .....application.dtos.brand_dto import BrandOutputDTO, CreateBrandInputDTO, UpdateBrandInputDTO
from .....domain.entities.brand import Brand
from .....domain.exceptions import BrandNotFoundException
from ...driven.cache.redis_cache import cache_manager

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.get("", response_model=List[BrandOutputDTO])
def list_brands(
    active_only: bool = Query(True, description="Filtrar solo marcas activas"),
    use_case: ListBrandsUseCase = Depends(get_list_brands_uc),
):
    """Consulta de marcas y diseñadores con aceleración por caché Redis."""
    cache_key = f"brands:list:active={active_only}"
    cached_data = cache_manager.get(cache_key)
    if cached_data is not None:
        return [BrandOutputDTO(**item) for item in cached_data]

    brands = use_case.execute(active_only=active_only)
    dtos = [BrandOutputDTO(**b.to_dict()) for b in brands]
    cache_manager.set(cache_key, [d.model_dump() for d in dtos], ttl=600)
    return dtos


@router.get("/{brand_id}", response_model=BrandOutputDTO)
def get_brand(brand_id: int):
    """Obtiene información y biografía de una marca por ID con caché Redis."""
    cache_key = f"brands:detail:{brand_id}"
    cached_data = cache_manager.get(cache_key)
    if cached_data is not None:
        return BrandOutputDTO(**cached_data)

    brand = get_container().brand_repo.find_by_id(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Marca con ID {brand_id} no encontrada.")
    dto = BrandOutputDTO(**brand.to_dict())
    cache_manager.set(cache_key, dto.model_dump(), ttl=600)
    return dto


@router.post("", response_model=BrandOutputDTO, status_code=status.HTTP_201_CREATED)
def create_brand(input_dto: CreateBrandInputDTO):
    """Crea una nueva marca de moda en el catálogo e invalida caché."""
    repo = get_container().brand_repo
    existing = repo.find_by_code(input_dto.code)
    if existing:
        raise HTTPException(status_code=400, detail=f"Ya existe una marca con el código '{input_dto.code}'.")

    brand_id = int(time.time() * 1000) % 1000000
    brand = Brand(
        brand_id=brand_id,
        code=input_dto.code,
        commercial_name=input_dto.commercial_name,
        country_origin=input_dto.country_origin,
        website_url=input_dto.website_url,
        biography=input_dto.biography,
        is_own_brand=input_dto.is_own_brand,
        is_active=True
    )
    saved = repo.save(brand)
    cache_manager.invalidate_prefix("brands:")
    return BrandOutputDTO(**saved.to_dict())


@router.put("/{brand_id}", response_model=BrandOutputDTO)
def update_brand(brand_id: int, input_dto: UpdateBrandInputDTO):
    """Actualiza una marca existente e invalida caché."""
    repo = get_container().brand_repo
    brand = repo.find_by_id(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail=f"Marca con ID {brand_id} no encontrada.")

    updated_brand = Brand(
        brand_id=brand.brand_id,
        code=input_dto.code if input_dto.code is not None else brand.code,
        commercial_name=input_dto.commercial_name if input_dto.commercial_name is not None else brand.commercial_name,
        country_origin=input_dto.country_origin if input_dto.country_origin is not None else brand.country_origin,
        website_url=input_dto.website_url if input_dto.website_url is not None else brand.website_url,
        biography=input_dto.biography if input_dto.biography is not None else brand.biography,
        is_own_brand=input_dto.is_own_brand if input_dto.is_own_brand is not None else brand.is_own_brand,
        is_active=input_dto.is_active if input_dto.is_active is not None else brand.is_active,
    )
    saved = repo.save(updated_brand)
    cache_manager.invalidate_prefix("brands:")
    return BrandOutputDTO(**saved.to_dict())


@router.delete("/{brand_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_brand(brand_id: int):
    """Elimina una marca por ID e invalida caché."""
    repo = get_container().brand_repo
    deleted = repo.delete(brand_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Marca con ID {brand_id} no encontrada.")
    cache_manager.invalidate_prefix("brands:")
    return None

