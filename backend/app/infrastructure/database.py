"""Módulo de Persistencia y Modelos Relacionales (SQLAlchemy + SQLite / PostgreSQL).
Garantiza persistencia física de órdenes, ítems, clientes, devoluciones, marcas y productos
con optimizaciones de motor PRAGMA (WAL, normal sync, memory cache, mmap) e índices compuestos B-Tree.
"""

import os
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy import (
    create_engine,
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Index,
    event,
    select,
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from app.config import settings

Base = declarative_base()

# Directorio de datos locales para SQLite (soporte de entorno de solo lectura en Vercel/Lambda)
is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
if is_serverless:
    DB_PATH = Path("/tmp/kamilshop.db")
else:
    DB_PATH = Path(__file__).resolve().parent.parent.parent / "kamilshop.db"
SQLITE_URL = f"sqlite:///{DB_PATH}"

# Normalizar URL de base de datos (Supabase / PostgreSQL con driver pg8000 100% pure-Python)
raw_db_url = settings.DATABASE_URL or ""
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql+pg8000://", 1)
elif raw_db_url.startswith("postgresql://") and "+pg8000" not in raw_db_url:
    raw_db_url = raw_db_url.replace("postgresql://", "postgresql+pg8000://", 1)

# Configuración del motor relacional con optimizaciones de conexión (SQLite local o Supabase PostgreSQL)
try:
    if raw_db_url.startswith("postgresql"):
        engine = create_engine(
            raw_db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args={"connect_timeout": 10},
        )
        with engine.connect() as conn:
            pass
    else:
        engine = create_engine(
            SQLITE_URL,
            connect_args={"check_same_thread": False},
        )
except Exception as err:
    # Fallback transparente a SQLite local si la base de datos PostgreSQL remota no responde
    print(f"[Database Warning] Fallo de conexión a PostgreSQL remota ({err}). Utilizando motor SQLite local.")
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False},
    )


# -------------------------------------------------------------
# MEJORES PRÁCTICAS: PRAGMAS DE ALTO RENDIMIENTO PARA SQLITE
# -------------------------------------------------------------
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Aplica directivas de alto rendimiento únicamente al motor SQLite."""
    if engine.dialect.name == "sqlite":
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode = WAL;")
            cursor.execute("PRAGMA synchronous = NORMAL;")
            cursor.execute("PRAGMA foreign_keys = ON;")
            cursor.execute("PRAGMA cache_size = -64000;")
            cursor.execute("PRAGMA temp_store = MEMORY;")
            cursor.execute("PRAGMA mmap_size = 268435456;")
            cursor.close()
        except Exception:
            pass


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# -------------------------------------------------------------
# TABLAS / MODELOS RELACIONALES CON ÍNDICES COMPUESTOS
# -------------------------------------------------------------

class OrderModel(Base):
    __tablename__ = "orders"

    order_id = Column(String(64), primary_key=True)  # Clustered PK index
    order_code = Column(String(32), unique=True, index=True, nullable=False)
    customer_name = Column(String(128), nullable=False)
    customer_email = Column(String(128), index=True, nullable=False)
    customer_phone = Column(String(64), nullable=True)
    delivery_address = Column(String(256), nullable=False)
    city = Column(String(64), default="Bogotá")
    carrier = Column(String(64), default="Coordinadora Express")
    tracking_number = Column(String(64), index=True, nullable=False)
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    shipping_fee = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    currency = Column(String(8), default="COP")
    status = Column(String(32), default="NUEVA", index=True)  # NUEVA, EN_PICKING, DESPACHADA, ENTREGADA, CANCELADA
    notes = Column(Text, nullable=True)
    is_gift_wrapped = Column(Boolean, default=False)
    idempotency_key = Column(String(128), unique=True, index=True, nullable=True)
    provider = Column(String(32), default="store_guest")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    items = relationship("OrderItemModel", back_populates="order", cascade="all, delete-orphan", lazy="joined")

    __table_args__ = (
        Index("idx_orders_customer_created", "customer_email", "created_at"),
        Index("idx_orders_status_created", "status", "created_at"),
        Index("idx_orders_code_tracking", "order_code", "tracking_number"),
    )

    def to_dict(self):
        return {
            "id": self.order_id,
            "order_id": self.order_id,
            "code": self.order_code,
            "order_code": self.order_code,
            "customer": self.customer_name,
            "customer_name": self.customer_name,
            "email": self.customer_email,
            "customer_email": self.customer_email,
            "phone": self.customer_phone,
            "address": self.delivery_address,
            "delivery_address": self.delivery_address,
            "city": self.city,
            "carrier": self.carrier,
            "trackingNumber": self.tracking_number,
            "tracking_number": self.tracking_number,
            "subtotal": self.subtotal,
            "tax": self.tax,
            "shipping_fee": self.shipping_fee,
            "discount": self.discount,
            "total": self.total,
            "currency": self.currency,
            "status": self.status,
            "notes": self.notes,
            "isGiftWrapped": self.is_gift_wrapped,
            "provider": self.provider,
            "items": [item.to_dict() for item in self.items],
            "createdAt": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat(),
            "created_at": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat(),
        }


class OrderItemModel(Base):
    __tablename__ = "order_items"

    item_id = Column(String(64), primary_key=True)
    order_id = Column(String(64), ForeignKey("orders.order_id", ondelete="CASCADE"), nullable=False, index=True)
    product_name = Column(String(128), nullable=False)
    size = Column(String(32), nullable=False)
    color = Column(String(64), default="Noir Obsidian")
    sku = Column(String(64), nullable=False, index=True)
    qty = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    subtotal = Column(Float, default=0.0)

    order = relationship("OrderModel", back_populates="items")

    __table_args__ = (
        Index("idx_order_items_order_sku", "order_id", "sku"),
    )

    def to_dict(self):
        return {
            "name": self.product_name,
            "product_name": self.product_name,
            "size": self.size,
            "color": self.color,
            "sku": self.sku,
            "qty": self.qty,
            "price": self.unit_price,
            "unit_price": self.unit_price,
            "subtotal": self.subtotal,
        }


class CustomerModel(Base):
    __tablename__ = "customers"

    customer_id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    phone = Column(String(64), nullable=True)
    city = Column(String(64), default="Bogotá")
    total_spent = Column(Float, default=0.0, index=True)  # Índice para consultas CRM ordenadas por volumen
    orders_count = Column(Integer, default=0)
    provider = Column(String(32), default="store_guest")
    tier = Column(String(32), default="Standard", index=True)  # Standard, Black Member, VIP
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        return {
            "id": self.customer_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone or "",
            "city": self.city or "Bogotá",
            "totalSpent": self.total_spent,
            "ordersCount": self.orders_count,
            "provider": self.provider,
            "tier": self.tier,
            "createdAt": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat(),
        }


class ReturnModel(Base):
    __tablename__ = "returns"

    rma_id = Column(String(64), primary_key=True)
    rma_code = Column(String(32), unique=True, index=True, nullable=False)
    order_code = Column(String(32), index=True, nullable=False)
    customer_name = Column(String(128), nullable=False)
    customer_email = Column(String(128), index=True, nullable=False)
    customer_phone = Column(String(64), nullable=True)
    city = Column(String(64), default="Bogotá")
    item_name = Column(String(128), nullable=False)
    size_to_return = Column(String(32), nullable=False)
    size_replacement = Column(String(32), nullable=True)
    color = Column(String(64), default="Noir")
    reason = Column(Text, nullable=False)
    status = Column(String(32), default="SOLICITADA", index=True)  # SOLICITADA, REVISION_CALIDAD, APROBADA, RECHAZADA, COMPLETADA
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    __table_args__ = (
        Index("idx_returns_status_created", "status", "created_at"),
    )

    def to_dict(self):
        return {
            "id": self.rma_id,
            "code": self.rma_code,
            "orderCode": self.order_code,
            "customer": self.customer_name,
            "email": self.customer_email,
            "phone": self.customer_phone or "",
            "city": self.city or "Bogotá",
            "itemToReturn": {
                "name": self.item_name,
                "size": self.size_to_return,
                "color": self.color,
            },
            "sizeReplacement": self.size_replacement or self.size_to_return,
            "reason": self.reason,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat(),
        }


# -------------------------------------------------------------
# MODELOS RELACIONALES PARA MARCAS Y CATÁLOGO CON ÍNDICES
# -------------------------------------------------------------

class BrandModel(Base):
    __tablename__ = "brands"

    brand_id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(64), unique=True, index=True, nullable=False)
    commercial_name = Column(String(128), index=True, nullable=False)
    country_origin = Column(String(64), index=True, default="Colombia")
    website_url = Column(String(256), nullable=True)
    biography = Column(Text, nullable=True)
    is_own_brand = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    products = relationship("ProductModel", back_populates="brand", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "brand_id": self.brand_id,
            "code": self.code,
            "commercial_name": self.commercial_name,
            "country_origin": self.country_origin,
            "website_url": self.website_url,
            "biography": self.biography,
            "is_own_brand": self.is_own_brand,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat(),
        }


class ProductModel(Base):
    __tablename__ = "products"

    product_id = Column(String(64), primary_key=True)
    sku_root = Column(String(64), index=True, nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.brand_id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(256), index=True, nullable=False)
    slug = Column(String(256), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(64), index=True, nullable=False)
    gender = Column(String(32), index=True, nullable=False)
    style = Column(String(64), index=True, default="Streetwear")
    base_price = Column(Float, index=True, nullable=False)
    currency = Column(String(8), default="COP")
    weight_grams = Column(Integer, default=400)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    brand = relationship("BrandModel", back_populates="products")
    variants = relationship("ProductVariantModel", back_populates="product", cascade="all, delete-orphan", lazy="joined")

    __table_args__ = (
        Index("idx_products_cat_gender", "category", "gender"),
        Index("idx_products_brand_cat", "brand_id", "category"),
        Index("idx_products_price_active", "base_price", "is_active"),
    )

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "sku_root": self.sku_root,
            "brand_id": self.brand_id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "category": self.category,
            "gender": self.gender,
            "style": self.style,
            "base_price": self.base_price,
            "currency": self.currency,
            "weight_grams": self.weight_grams,
            "is_active": self.is_active,
            "variants": [v.to_dict() for v in self.variants],
            "created_at": self.created_at.isoformat() if self.created_at else datetime.now(timezone.utc).isoformat(),
        }


class ProductVariantModel(Base):
    __tablename__ = "product_variants"

    variant_id = Column(String(64), primary_key=True)
    product_id = Column(String(64), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False, index=True)
    sku = Column(String(64), unique=True, index=True, nullable=False)
    color_name = Column(String(64), index=True, default="Pitch Black")
    color_hex = Column(String(16), default="#0A0A0A")
    size_label = Column(String(32), index=True, nullable=False)
    price_adjustment = Column(Float, default=0.0)
    stock_available = Column(Integer, default=10, index=True)
    image_url = Column(Text, nullable=True)

    product = relationship("ProductModel", back_populates="variants")

    __table_args__ = (
        Index("idx_variants_prod_size_color", "product_id", "size_label", "color_name"),
    )

    def to_dict(self):
        return {
            "variant_id": self.variant_id,
            "product_id": self.product_id,
            "sku": self.sku,
            "color_name": self.color_name,
            "color_hex": self.color_hex,
            "size_label": self.size_label,
            "price_adjustment": self.price_adjustment,
            "stock_available": self.stock_available,
            "image_url": self.image_url,
        }


def init_db():
    """Crea todas las tablas e índices en la base de datos de manera idempotente."""
    try:
        Base.metadata.create_all(bind=engine)

        raw_indexes = [
            "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders(customer_email, created_at);",
            "CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);",
            "CREATE INDEX IF NOT EXISTS idx_orders_code_tracking ON orders(order_code, tracking_number);",
            "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);",
            "CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku);",
            "CREATE INDEX IF NOT EXISTS idx_order_items_order_sku ON order_items(order_id, sku);",
            "CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON customers(total_spent);",
            "CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);",
            "CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_returns_customer_email ON returns(customer_email);",
            "CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at);",
            "CREATE INDEX IF NOT EXISTS idx_returns_status_created ON returns(status, created_at);",
        ]
        with engine.begin() as conn:
            for sql in raw_indexes:
                try:
                    conn.exec_driver_sql(sql)
                except Exception:
                    pass
    except Exception as err:
        print(f"[Database Warning] Fallo en inicialización de esquema: {err}")
