from fastapi import APIRouter, Depends, HTTPException, status
from ..dependencies import get_manage_catalog_uc
from .....application.use_cases.manage_catalog_use_case import ManageCatalogUseCase
from .....application.dtos.product_dto import CreateProductInputDTO, ProductOutputDTO
from .....domain.exceptions import BrandNotFoundException, ProductNotFoundException, DomainException
from ...driven.cache.redis_cache import cache_manager
from app.infrastructure.security import get_current_admin

router = APIRouter(prefix="/admin/products", tags=["Admin Catalog"])


@router.post("", response_model=ProductOutputDTO, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: CreateProductInputDTO,
    use_case: ManageCatalogUseCase = Depends(get_manage_catalog_uc),
    admin: dict = Depends(get_current_admin),
):
    """Crea una nueva prenda en el catálogo vinculada a una marca existente. Acceso exclusivo Admin."""
    try:
        product = use_case.create_product(payload.model_dump())
        # Invalidación de caché en Redis para reflejar la nueva prenda inmediatamente
        cache_manager.invalidate_prefix("products:")
        return ProductOutputDTO.from_entity(product)
    except BrandNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DomainException as e:
        raise HTTPException(status_code=422, detail={"code": e.code, "message": str(e)})


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: str,
    use_case: ManageCatalogUseCase = Depends(get_manage_catalog_uc),
    admin: dict = Depends(get_current_admin),
):
    """Elimina una prenda del catálogo por su ID único. Acceso exclusivo Admin."""
    try:
        use_case.delete_product(product_id)
        # Invalidar listados y detalles cacheados en Redis
        cache_manager.invalidate_prefix("products:")
        return None
    except ProductNotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
