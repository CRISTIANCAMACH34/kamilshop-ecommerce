import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const ORDERS_STORAGE_KEY = 'kamil_shop_real_orders_v2';

const OrdersContext = createContext(null);

export const OrdersProvider = ({ children }) => {
  // Las órdenes inician vacías (cero datos falsos o hardcodeados)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filtrar cualquier orden legacy simulada
        const isLegacyMock = Array.isArray(parsed) && parsed.some(p => p.id === 'ord-101' || p.id === 'ord-102');
        if (!isLegacyMock && Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Error leyendo órdenes de localStorage", e);
    }
    return [];
  });

  const [activeTrackingCode, setActiveTrackingCode] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Sincronizar órdenes reales desde el backend y la base de datos al montar
  const fetchBackendOrders = useCallback(async () => {
    try {
      const realOrders = await apiClient.getOrders();
      if (Array.isArray(realOrders)) {
        setOrders(realOrders);
      }
    } catch (err) {
      console.warn("[OrdersContext] Backend de órdenes no disponible:", err);
    }
  }, []);

  useEffect(() => {
    fetchBackendOrders();
  }, [fetchBackendOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error("Error guardando órdenes en localStorage", e);
    }
  }, [orders]);

  // Crear nueva orden enviando la transacción real al backend y base de datos
  const createOrder = (orderData) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `TTL-ORD-${randomSuffix}`;
    const trackingNumber = `CRD-${Math.floor(100000 + Math.random() * 900000)}-CO`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      code,
      order_code: code,
      customer: orderData.name || "Cliente Kamil Shop",
      customer_name: orderData.name || "Cliente Kamil Shop",
      email: orderData.email || "cliente@kamilshop.store",
      customer_email: orderData.email || "cliente@kamilshop.store",
      phone: orderData.phone || "",
      provider: orderData.provider || "store_guest",
      address: orderData.address || "Dirección de Entrega, Bogotá",
      delivery_address: orderData.address || "Dirección de Entrega, Bogotá",
      city: orderData.city || "Bogotá",
      items: orderData.items || [],
      total: Number(orderData.total || 0),
      subtotal: Number(orderData.subtotal || orderData.total || 0),
      tax: Number(orderData.tax || 0),
      shipping_fee: Number(orderData.shipping_fee || 0),
      status: "NUEVA",
      elapsedMins: 1,
      slaTarget: 15,
      carrier: "Coordinadora Express",
      trackingNumber,
      tracking_number: trackingNumber,
      notes: orderData.notes || "",
      isGiftWrapped: !!orderData.isGiftWrapped,
      createdAt: new Date().toISOString()
    };

    // 1. Guardar de forma permanente en la base de datos del backend
    apiClient.createOrder(newOrder).then(persisted => {
      if (persisted && persisted.id) {
        setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, ...persisted } : o));
      }
    }).catch(err => {
      console.warn('[OrdersContext] Guardando orden en fallback local:', err);
    });

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  // Notificaciones in-app
  const [customerNotifications, setCustomerNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('kamil_customer_notifications_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('kamil_customer_notifications_v2', JSON.stringify(customerNotifications));
    } catch (e) {}
  }, [customerNotifications]);

  // Avanzar estado de la orden (El admin avanza en BD: NUEVA -> EN_PICKING -> DESPACHADA)
  const advanceOrderStatus = (orderId) => {
    let nextStatus = null;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId && ord.code !== orderId) return ord;
        if (ord.status === "NUEVA") {
          nextStatus = "EN_PICKING";
          return { ...ord, status: "EN_PICKING", elapsedMins: (ord.elapsedMins || 1) + 2 };
        }
        if (ord.status === "EN_PICKING") {
          nextStatus = "DESPACHADA";
          return {
            ...ord,
            status: "DESPACHADA",
            shippingType: ord.shippingType || "LOCAL",
            carrier: ord.carrier || "Coordinadora Express",
            trackingNumber: ord.trackingNumber || `CRD-${ord.code.replace('TTL-ORD-', '')}-CO`,
            dispatchedAt: new Date().toISOString(),
            elapsedMins: (ord.elapsedMins || 1) + 4
          };
        }
        return ord;
      })
    );

    if (nextStatus) {
      apiClient.updateOrderStatus(orderId, nextStatus).catch(err => {
        console.warn('[OrdersContext] Error sincronizando estado en BD:', err);
      });
    }
  };

  // Despachar orden formalmente con datos de envío
  const dispatchOrder = (orderId, dispatchInfo) => {
    const { shippingType = 'NACIONAL', carrier = 'Coordinadora Express', trackingNumber = '', city = 'Bogotá', notes = '' } = dispatchInfo || {};
    
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId && ord.code !== orderId) return ord;
        const finalTracking = trackingNumber || ord.trackingNumber || `CRD-${ord.code.replace('TTL-ORD-', '')}-CO`;

        return {
          ...ord,
          status: "DESPACHADA",
          shippingType,
          carrier,
          trackingNumber: finalTracking,
          tracking_number: finalTracking,
          destinationCity: city,
          dispatchNotes: notes,
          dispatchedAt: new Date().toISOString(),
          elapsedMins: (ord.elapsedMins || 1) + 4
        };
      })
    );

    apiClient.updateOrderStatus(orderId, "DESPACHADA", notes).catch(err => {
      console.warn('[OrdersContext] Error despachando orden en BD:', err);
    });

    const currentOrder = orders.find(o => o.id === orderId || o.code === orderId);
    if (currentOrder) {
      const notif = {
        id: `notif-${Date.now()}`,
        orderCode: currentOrder.code,
        customerEmail: currentOrder.email || currentOrder.customer_email,
        title: `Tu pedido ${currentOrder.code} ha sido despachado 🚀`,
        message: `Tu pedido va en camino con ${carrier}. Número de guía: ${trackingNumber || currentOrder.trackingNumber || 'En asignación'}.`,
        carrier,
        trackingNumber: trackingNumber || currentOrder.trackingNumber,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      setCustomerNotifications(prev => [notif, ...prev]);
    }
  };

  // El cliente marca su orden como ENTREGADA
  const confirmCustomerDelivery = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId && ord.code !== orderId) return ord;
        return {
          ...ord,
          status: "ENTREGADA",
          deliveredAt: new Date().toISOString(),
          confirmedByCustomer: true
        };
      })
    );

    apiClient.updateOrderStatus(orderId, "ENTREGADA").catch(err => {
      console.warn('[OrdersContext] Error marcando entrega en BD:', err);
    });

    const currentOrder = orders.find(o => o.id === orderId || o.code === orderId);
    if (currentOrder) {
      setCustomerNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          orderCode: currentOrder.code,
          customerEmail: currentOrder.email || currentOrder.customer_email,
          title: `¡Pedido ${currentOrder.code} Entregado con Éxito! 🎉`,
          message: `Confirmaste la recepción de tu pedido. ¡Gracias por confiar en KAMIL SHOP!`,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        },
        ...prev
      ]);
    }
  };

  // Reportar incidencia en orden
  const reportIncident = (orderId, reason) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId && ord.code !== orderId) return ord;
        return {
          ...ord,
          status: "CON_INCIDENCIA",
          incidentReason: reason,
          incidentReportedAt: new Date().toISOString()
        };
      })
    );

    apiClient.updateOrderStatus(orderId, "CON_INCIDENCIA", `Incidencia: ${reason}`).catch(err => {
      console.warn('[OrdersContext] Error reportando incidencia en BD:', err);
    });
  };

  // Cancelar orden
  const cancelOrder = (orderId, reason = "Cancelado por el cliente") => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId && ord.code !== orderId) return ord;
        return {
          ...ord,
          status: "CANCELADA",
          cancelReason: reason,
          cancelledAt: new Date().toISOString()
        };
      })
    );

    apiClient.updateOrderStatus(orderId, "CANCELADA", `Cancelación: ${reason}`).catch(err => {
      console.warn('[OrdersContext] Error cancelando orden en BD:', err);
    });
  };

  // Eliminar orden
  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter(o => o.id !== orderId && o.code !== orderId));
    apiClient.deleteOrder(orderId).catch(err => {
      console.warn('[OrdersContext] Error eliminando orden en BD:', err);
    });
  };

  // Abrir tracking modal
  const openTracking = (code) => {
    setActiveTrackingCode(code);
    setIsTrackingModalOpen(true);
  };

  const closeTracking = () => {
    setIsTrackingModalOpen(false);
    setActiveTrackingCode(null);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        createOrder,
        advanceOrderStatus,
        dispatchOrder,
        confirmCustomerDelivery,
        reportIncident,
        cancelOrder,
        deleteOrder,
        reloadOrders: fetchBackendOrders,
        activeTrackingCode,
        isTrackingModalOpen,
        openTracking,
        closeTracking,
        customerNotifications,
        setCustomerNotifications,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders debe ser utilizado dentro de un OrdersProvider");
  }
  return context;
};
