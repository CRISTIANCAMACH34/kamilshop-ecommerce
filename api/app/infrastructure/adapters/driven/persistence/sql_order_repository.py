import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import joinedload
from .....domain.entities.order import Order, OrderLine
from .....domain.value_objects.money import Money
from .....domain.value_objects.address_vo import AddressVO
from .....domain.ports.driven.order_repository_port import IOrderRepositoryPort
from ....database import (
    SessionLocal,
    OrderModel,
    OrderItemModel,
    CustomerModel,
    ReturnModel,
    init_db,
)


class SQLOrderRepository(IOrderRepositoryPort):
    """Adaptador de persistencia secundario para órdenes con almacenamiento real en Base de Datos,
    consultas rápidas O(1) por ID/PK, borrado en cascada optimizado e índices relacionales B-Tree.
    """

    def __init__(self):
        init_db()
        self._ensure_baseline_orders()

    def _ensure_baseline_orders(self):
        """Asegura la presencia de órdenes base reales en SQLite si la tabla está vacía."""
        session = SessionLocal()
        try:
            count = session.query(OrderModel).count()
            if count < 3:
                baselines = [
                    {
                        "id": "ord-101",
                        "code": "KML-ORD-8821",
                        "customer": "Valentina Rodríguez",
                        "email": "valentina.fashion@gmail.com",
                        "phone": "+57 310 987 6543",
                        "provider": "google",
                        "address": "Calle 93 #14-20, Apto 502, Chicó Norte",
                        "city": "Bogotá",
                        "items": [
                            {"name": "Chaqueta Oversize Leather", "size": "M", "sku": "KML-JKT-01", "qty": 1, "price": 155.00, "color": "Noir Obsidian"},
                            {"name": "Pantalón Cargo Wide Leg", "size": "S", "sku": "KML-PNT-02", "qty": 1, "price": 110.00, "color": "Militar Olive"}
                        ],
                        "total": 265.00,
                        "subtotal": 265.00,
                        "status": "NUEVA",
                        "carrier": "Coordinadora Express",
                        "trackingNumber": "CRD-992140-CO",
                    },
                    {
                        "id": "ord-102",
                        "code": "KML-ORD-8822",
                        "customer": "Mateo Silva",
                        "email": "mateo.silva@icloud.com",
                        "phone": "+57 300 456 7890",
                        "provider": "apple",
                        "address": "Carrera 43A #1-50, El Poblado",
                        "city": "Medellín",
                        "items": [
                            {"name": "Kamil Shop Heavyweight Boxy Hoodie", "size": "L", "sku": "KML-HD-04", "qty": 1, "price": 95.00, "color": "Graphite"}
                        ],
                        "total": 95.00,
                        "subtotal": 95.00,
                        "status": "EN_PICKING",
                        "carrier": "Servientrega",
                        "trackingNumber": "SRV-441029-CO",
                    },
                    {
                        "id": "ord-103",
                        "code": "KML-ORD-8823",
                        "customer": "Isabella Gómez",
                        "email": "isabella.gomez@gmail.com",
                        "phone": "+57 315 123 4567",
                        "provider": "google",
                        "address": "Calle 116 #19-40, Santa Bárbara",
                        "city": "Bogotá",
                        "items": [
                            {"name": "Aura Sculpted Asymmetric Top", "size": "S", "sku": "AURA-TOP-003", "qty": 1, "price": 120.00, "color": "Noir"}
                        ],
                        "total": 120.00,
                        "subtotal": 120.00,
                        "status": "DESPACHADA",
                        "carrier": "Coordinadora Express",
                        "trackingNumber": "CRD-551024-CO",
                    }
                ]
                for b in baselines:
                    existing = session.get(OrderModel, b["id"])
                    if not existing:
                        self.save_raw(b)
        except Exception:
            session.rollback()
        finally:
            session.close()

    def _model_to_domain(self, m: OrderModel) -> Order:
        shipping_fee = Money(m.shipping_fee or 0.0, m.currency or "COP")
        address = AddressVO(
            country_iso="CO",
            state_subdivision=m.city or "Bogota",
            city=m.city or "Bogota",
            street_type="Calle",
            street_name=m.delivery_address or "Carrera Principal",
            exterior_number="N/A",
            postal_code="110221",
        )

        lines = []
        for it in m.items:
            unit_price = Money(it.unit_price or 0.0, m.currency or "COP")
            lines.append(
                OrderLine(
                    line_id=it.item_id,
                    variant_id=it.sku,
                    sku=it.sku,
                    product_name=it.product_name,
                    size_label=it.size,
                    quantity=it.qty,
                    unit_price=unit_price,
                )
            )

        order = Order(
            order_id=m.order_id,
            order_code=m.order_code,
            customer_email=m.customer_email,
            customer_name=m.customer_name,
            shipping_address=address,
            lines=lines if lines else [
                OrderLine(
                    line_id=str(uuid.uuid4()),
                    variant_id="KML-01",
                    sku="KML-01",
                    product_name="Prenda Kamil Shop",
                    size_label="M",
                    quantity=1,
                    unit_price=Money(m.total, m.currency or "COP")
                )
            ],
            shipping_fee=shipping_fee,
            coupon=None,
            idempotency_key=m.idempotency_key,
            status=m.status,
            created_at=m.created_at,
        )
        return order

    def save(self, order: Order) -> Order:
        """Persiste una orden y sus líneas en la base de datos de manera atómica con búsqueda O(1)."""
        session = SessionLocal()
        try:
            # 1. Búsqueda rápida por PK en caché de identidad / árbol B-Tree
            existing = session.get(OrderModel, str(order.order_id))
            if not existing and order.idempotency_key:
                # Búsqueda por clave de idempotencia indexada
                existing = session.query(OrderModel).filter(OrderModel.idempotency_key == order.idempotency_key).first()

            if not existing:
                order_m = OrderModel(
                    order_id=order.order_id,
                    order_code=order.order_code,
                    customer_name=order._customer_name,
                    customer_email=order._customer_email.lower(),
                    delivery_address=str(order._shipping_address.street_name),
                    city=order._shipping_address.city or "Bogotá",
                    subtotal=float(order.subtotal.amount),
                    tax=float(order._tax.amount),
                    shipping_fee=float(order._shipping_fee.amount),
                    discount=float(order._discount.amount),
                    total=float(order.total.amount),
                    currency=order.total.currency,
                    status=order.status,
                    carrier="Coordinadora Express",
                    tracking_number=f"CRD-{order.order_code.replace('KML-', '').replace('TTL-', '')}-CO",
                    idempotency_key=order.idempotency_key,
                    created_at=order._created_at or datetime.now(timezone.utc),
                )
                session.add(order_m)
                session.flush()

                for line in order.lines:
                    item_m = OrderItemModel(
                        item_id=line.line_id or str(uuid.uuid4()),
                        order_id=order_m.order_id,
                        product_name=line.product_name,
                        size=line.size_label,
                        sku=line.sku,
                        qty=line.quantity,
                        unit_price=float(line.unit_price.amount),
                        subtotal=float(line.subtotal.amount),
                    )
                    session.add(item_m)

                # Registrar o actualizar cliente real en la base de datos mediante índice único
                cust = session.query(CustomerModel).filter(CustomerModel.email == order._customer_email.lower()).first()
                if not cust:
                    cust = CustomerModel(
                        customer_id=f"cust-{uuid.uuid4().hex[:8]}",
                        name=order._customer_name,
                        email=order._customer_email.lower(),
                        phone="",
                        city=order._shipping_address.city or "Bogotá",
                        total_spent=float(order.total.amount),
                        orders_count=1,
                        provider="store_guest",
                        tier="Standard",
                    )
                    session.add(cust)
                else:
                    cust.total_spent = float(cust.total_spent or 0.0) + float(order.total.amount)
                    cust.orders_count = (cust.orders_count or 0) + 1
                    if cust.total_spent >= 500.0:
                        cust.tier = "Black Member"

                session.commit()
            else:
                existing.status = order.status
                session.commit()

            return order
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def save_raw(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Crea una orden directamente desde un payload de pedido con soporte para transacciones ACID rápidas."""
        session = SessionLocal()
        try:
            order_id = str(data.get("id") or data.get("order_id") or f"ord-{uuid.uuid4().hex[:10]}")
            order_code = str(data.get("code") or data.get("order_code") or f"KML-ORD-{uuid.uuid4().hex[:6].upper()}")
            customer_name = str(data.get("name") or data.get("customer") or data.get("customer_name") or "Cliente Kamil Shop")
            customer_email = str(data.get("email") or data.get("customer_email") or "cliente@kamilshop.store").lower()
            phone = str(data.get("phone") or data.get("customer_phone") or "")
            address = str(data.get("address") or data.get("delivery_address") or "Dirección de Entrega")
            city = str(data.get("city") or "Bogotá")
            carrier = str(data.get("carrier") or "Coordinadora Express")
            tracking_number = str(data.get("trackingNumber") or data.get("tracking_number") or f"CRD-{uuid.uuid4().hex[:6].upper()}-CO")
            total = float(data.get("total") or 0.0)
            subtotal = float(data.get("subtotal") or total)
            tax = float(data.get("tax") or 0.0)
            shipping_fee = float(data.get("shipping_fee") or 0.0)
            status = str(data.get("status") or "NUEVA")
            notes = str(data.get("notes") or "")
            is_gift = bool(data.get("isGiftWrapped") or data.get("is_gift_wrapped") or False)
            provider = str(data.get("provider") or "store_guest")

            # Verificar si ya existe por Primary Key O(1)
            existing = session.get(OrderModel, order_id)
            if existing:
                existing.status = status
                session.commit()
                return existing.to_dict()

            order_m = OrderModel(
                order_id=order_id,
                order_code=order_code,
                customer_name=customer_name,
                customer_email=customer_email,
                customer_phone=phone,
                delivery_address=address,
                city=city,
                carrier=carrier,
                tracking_number=tracking_number,
                subtotal=subtotal,
                tax=tax,
                shipping_fee=shipping_fee,
                total=total,
                currency="COP",
                status=status,
                notes=notes,
                is_gift_wrapped=is_gift,
                provider=provider,
                created_at=datetime.now(timezone.utc),
            )
            session.add(order_m)
            session.flush()

            items = data.get("items") or []
            for item in items:
                item_m = OrderItemModel(
                    item_id=f"itm-{uuid.uuid4().hex[:8]}",
                    order_id=order_m.order_id,
                    product_name=item.get("name") or item.get("product_name") or "Prenda Kamil Shop",
                    size=item.get("size") or "M",
                    color=item.get("color") or "Noir",
                    sku=item.get("sku") or "KML-01",
                    qty=int(item.get("qty") or item.get("quantity") or 1),
                    unit_price=float(item.get("price") or item.get("unit_price") or 0.0),
                    subtotal=float(item.get("subtotal") or 0.0),
                )
                session.add(item_m)

            # Actualizar directorio de clientes
            cust = session.query(CustomerModel).filter(CustomerModel.email == customer_email).first()
            if not cust:
                cust = CustomerModel(
                    customer_id=f"cust-{uuid.uuid4().hex[:8]}",
                    name=customer_name,
                    email=customer_email,
                    phone=phone,
                    city=city,
                    total_spent=total,
                    orders_count=1,
                    provider=provider,
                    tier="Standard",
                )
                session.add(cust)
            else:
                cust.total_spent = (cust.total_spent or 0.0) + total
                cust.orders_count = (cust.orders_count or 0) + 1
                if cust.total_spent >= 500.0:
                    cust.tier = "Black Member"

            session.commit()
            return order_m.to_dict()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def find_by_id(self, order_id: str) -> Optional[Order]:
        """Búsqueda ultra-rápida O(1) por Primary Key, con fallback secundario por order_code indexado."""
        session = SessionLocal()
        try:
            m = session.get(OrderModel, str(order_id))
            if not m:
                m = session.query(OrderModel).filter(OrderModel.order_code == str(order_id)).first()
            if m:
                return self._model_to_domain(m)
            return None
        finally:
            session.close()

    def find_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        """Búsqueda indexada por código de orden o número de guía de transporte."""
        session = SessionLocal()
        try:
            target = code.strip().upper()
            m = session.query(OrderModel).filter(
                (OrderModel.order_code == target) | (OrderModel.tracking_number == target)
            ).first()
            if m:
                return m.to_dict()
            return None
        finally:
            session.close()

    def find_by_idempotency_key(self, key: str) -> Optional[Order]:
        """Búsqueda directa por clave de idempotencia indexada."""
        session = SessionLocal()
        try:
            m = session.query(OrderModel).filter(OrderModel.idempotency_key == key).first()
            if m:
                return self._model_to_domain(m)
            return None
        finally:
            session.close()

    def list_by_customer_email(self, email: str) -> List[Dict[str, Any]]:
        """Listado optimizado con índice compuesto (customer_email, created_at) y carga eager."""
        session = SessionLocal()
        try:
            target = email.strip().lower()
            orders = (
                session.query(OrderModel)
                .options(joinedload(OrderModel.items))
                .filter(OrderModel.customer_email == target)
                .order_by(OrderModel.created_at.desc())
                .all()
            )
            return [o.to_dict() for o in orders]
        finally:
            session.close()

    def list_all(self) -> List[Dict[str, Any]]:
        """Listado completo ordenado con índice B-Tree en created_at y precarga de ítems."""
        session = SessionLocal()
        try:
            orders = (
                session.query(OrderModel)
                .options(joinedload(OrderModel.items))
                .order_by(OrderModel.created_at.desc())
                .all()
            )
            return [o.to_dict() for o in orders]
        finally:
            session.close()

    def update_status(self, order_id: str, new_status: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Actualización directa O(1) de estado por ID primario indexado."""
        session = SessionLocal()
        try:
            order = session.get(OrderModel, str(order_id))
            if not order:
                order = session.query(OrderModel).filter(OrderModel.order_code == str(order_id)).first()
            if not order:
                return None
            order.status = new_status
            if notes:
                order.notes = f"{order.notes or ''}\n{notes}".strip()
            session.commit()
            return order.to_dict()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def delete(self, order_id: str) -> bool:
        """Eliminación ultra-rápida por ID primario.
        Aprovecha el motor SQLite con ON DELETE CASCADE activado e índice sobre order_id en order_items.
        """
        session = SessionLocal()
        try:
            order = session.get(OrderModel, str(order_id))
            if not order:
                order = session.query(OrderModel).filter(OrderModel.order_code == str(order_id)).first()
            if not order:
                return False
            session.delete(order)
            session.commit()
            return True
        except Exception:
            session.rollback()
            return False
        finally:
            session.close()

    # ---------------- Clientes Reales ----------------
    def list_customers(self) -> List[Dict[str, Any]]:
        """Listado de clientes ordenado por total_spent aprovechando el índice en la columna."""
        session = SessionLocal()
        try:
            customers = session.query(CustomerModel).order_by(CustomerModel.total_spent.desc()).all()
            return [c.to_dict() for c in customers]
        finally:
            session.close()

    # ---------------- Devoluciones Reales ----------------
    def list_returns(self) -> List[Dict[str, Any]]:
        """Listado de devoluciones ordenado con índice B-Tree en created_at."""
        session = SessionLocal()
        try:
            rmas = session.query(ReturnModel).order_by(ReturnModel.created_at.desc()).all()
            return [r.to_dict() for r in rmas]
        finally:
            session.close()

    def create_return(self, data: Dict[str, Any]) -> Dict[str, Any]:
        session = SessionLocal()
        try:
            rma_id = f"rma-{uuid.uuid4().hex[:8]}"
            rma_code = f"RMA-2026-{uuid.uuid4().hex[:4].upper()}"
            item = data.get("itemToReturn") or {}

            rma = ReturnModel(
                rma_id=rma_id,
                rma_code=rma_code,
                order_code=data.get("orderCode") or "N/A",
                customer_name=data.get("customer") or data.get("customer_name") or "Cliente Kamil Shop",
                customer_email=(data.get("email") or data.get("customer_email") or "cliente@kamilshop.store").lower(),
                customer_phone=data.get("phone") or "",
                city=data.get("city") or "Bogotá",
                item_name=item.get("name") or data.get("itemName") or "Prenda",
                size_to_return=item.get("size") or data.get("sizeToReturn") or "M",
                size_replacement=data.get("sizeReplacement") or "M",
                color=item.get("color") or data.get("color") or "Noir",
                reason=data.get("reason") or "Cambio de talla solicitado",
                status="SOLICITADA",
                created_at=datetime.now(timezone.utc),
            )
            session.add(rma)
            session.commit()
            return rma.to_dict()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
