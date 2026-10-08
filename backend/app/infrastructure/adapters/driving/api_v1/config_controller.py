from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter(prefix="/config", tags=["Configuration"])

@router.get("/app-config")
def get_app_config() -> Dict[str, Any]:
    """Proporciona toda la configuración dinámica, parámetros comerciales y metadatos de tienda
    para que el frontend no contenga ningún dato estático o hardcodeado."""
    return {
        "store_info": {
            "name": "KAMIL SHOP",
            "tagline": "Kamil Shop • Contemporary Apparel & Haute Couture",
            "address": "Carrera 15 # 88-21, Chicó Norte, Bogotá, Colombia",
            "city": "Bogotá D.C.",
            "country": "Colombia",
            "time_zone": "COT (UTC-5)",
            "support_email": "soporte@kamilshop.store",
            "whatsapp": "+57 300 888 9900"
        },
        "shipping": {
            "free_shipping_threshold_usd": 120.0,
            "default_carrier": "Servientrega Direct",
            "estimated_delivery_days": "1 - 3 días hábiles en Colombia"
        },
        "trending_tags": [
            {"label": "🔥 Heavyweight", "query": "Heavyweight"},
            {"label": "Oversized", "query": "Oversized"},
            {"label": "Cargo", "query": "Cargo"},
            {"label": "Impermeable", "query": "Waterproof"},
            {"label": "Algodón Pima", "query": "Algodón"},
            {"label": "Edición Limitada", "query": "Limitada"}
        ],
        "category_synonyms": {
            "hoodies": ["hoodie", "sweater", "sudadera", "buzo", "crewneck"],
            "camisetas": ["camiseta", "tee", "top", "t-shirt"],
            "chaquetas": ["chaqueta", "blazer", "outerwear", "bomber", "windbreaker", "abrigo"],
            "pantalones": ["pantal", "cargo", "trouser", "jean", "jogger"],
            "accesorios": ["accesorio", "cap", "gorra", "bolso", "cinturón", "cinturon"]
        },
        "payment_channels": [
            {
                "id": "bancolombia",
                "label": "Bancolombia",
                "description": "Botón y Transferencia sin costo",
                "is_active": True
            },
            {
                "id": "pse",
                "label": "PSE",
                "description": "Débito desde cualquier banco nacional",
                "is_active": True
            },
            {
                "id": "nequi",
                "label": "Nequi",
                "description": "Aprobación móvil en tiempo real",
                "is_active": True
            },
            {
                "id": "card",
                "label": "Tarjetas",
                "description": "Crédito o Débito Visa/Mastercard/Amex",
                "is_active": True
            }
        ],
        "colombian_banks": [
            {"id": "bancolombia", "name": "Bancolombia"},
            {"id": "davivienda", "name": "Davivienda"},
            {"id": "bogota", "name": "Banco de Bogotá"},
            {"id": "bbva", "name": "BBVA Colombia"},
            {"id": "occidente", "name": "Banco de Occidente"},
            {"id": "popular", "name": "Banco Popular"},
            {"id": "scotiabank", "name": "Scotiabank Colpatria"},
            {"id": "itau", "name": "Itaú Colombia"},
            {"id": "nequi", "name": "Nequi (vía PSE)"},
            {"id": "dale", "name": "Dale!"},
            {"id": "lulo", "name": "Lulo Bank"},
            {"id": "nu", "name": "Nu Colombia"},
            {"id": "falabella", "name": "Banco Falabella"}
        ]
    }
