from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal


class SocialLoginRequestDTO(BaseModel):
    provider: Literal["google", "apple", "facebook"]
    token: Optional[str] = None
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None


class CustomerEmailLoginRequestDTO(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class AdminLoginRequestDTO(BaseModel):
    username_or_email: str
    password: str


class AuthUserResponseDTO(BaseModel):
    id: str
    name: str
    email: str
    role: Literal["CLIENTE", "ADMIN", "GESTOR_CATALOGO"]
    provider: str
    avatar_url: Optional[str] = None
    access_token: str
    token_type: str = "bearer"
