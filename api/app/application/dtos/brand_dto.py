from pydantic import BaseModel, Field
from typing import Optional


class BrandOutputDTO(BaseModel):
    brand_id: int
    code: str
    commercial_name: str
    country_origin: str
    website_url: Optional[str] = None
    biography: Optional[str] = None
    is_own_brand: bool = False
    is_active: bool = True


class CreateBrandInputDTO(BaseModel):
    code: str = Field(..., min_length=2, max_length=30)
    commercial_name: str = Field(..., min_length=2, max_length=100)
    country_origin: str = Field(..., min_length=2, max_length=80)
    website_url: Optional[str] = None
    biography: Optional[str] = None
    is_own_brand: bool = False


class UpdateBrandInputDTO(BaseModel):
    code: Optional[str] = None
    commercial_name: Optional[str] = None
    country_origin: Optional[str] = None
    website_url: Optional[str] = None
    biography: Optional[str] = None
    is_own_brand: Optional[bool] = None
    is_active: Optional[bool] = None
