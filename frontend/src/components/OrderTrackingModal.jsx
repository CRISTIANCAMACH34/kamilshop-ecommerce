import React, { useState } from 'react';
import { useOrders } from '../context/OrdersContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { formatUSD, formatCOP } from '../services/currencyService';

export const OrderTrackingModal = ({ open, code = null, onClose }) => {
  useBodyScrollLock(open);
  const { getOrder, orders, confirmCustomerDelivery } = useOrders();
  const [searchInput, setSearchInput] = useState(code || '');

  if (!open) return null;

  // Si hay código proporcionado o buscado, traer la orden correspondiente; si no, mostrar la última
  const activeOrder = getOrder(searchInput) || (orders.length > 0 ? orders[0] : null);

  const steps = [
    { id: 'NUEVA', title: '1. Pedido Confirmado', desc: 'Pago aprobado y asignado a centro de distribución' },
    { id: 'EN_PICKING', title: '2. Bodega & Empaque', desc: 'Prendas seleccionadas y empacadas en Bodega Central Kamil Shop' },
    { id: 'DESPACHADA', title: '3. En Ruta de Entrega', desc: 'En tránsito con transportadora nacional (Coordinadora / Servientrega)' },
    { id: 'ENTREGADA', title: '4. Entregado', desc: 'Paquete recibido satisfactoriamente por el cliente' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'NUEVA': return 0;
      case 'EN_PICKING': return 1;
      case 'DESPACHADA': return 2;
      case 'ENTREGADA': return 3;
      default: return 0;
    }
  };

  const currentIdx = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <div className="modal-overlay active" style={{ zIndex: 1250, padding: 12 }}>
      <div
        className="modal-window"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '94vh',
          padding: 'clamp(16px, 4vw, 32px)',
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12,
          overflowY: 'auto'
        }}
      >
        <button
          type="button"
          className="btn-close-modal"
          onClick={onClose}
          aria-label="Cerrar rastreo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(0.65rem, 1.8vw, 0.72rem)',
              color: '#ffffff',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            LOGÍSTICA NACIONAL // KAMIL SHOP
          </div>
          <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 800, textTransform: 'uppercase', color: '#fff', marginTop: 4 }}>
            Rastreo de Pedido
          </h2>
          <p style={{ color: '#a3a3a3', fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)', marginTop: 4, lineHeight: 1.4 }}>
            Ingresa tu código de orden o número de guía para verificar el estado de tu envío en tiempo real.
          </p>
        </div>

        {/* Buscador de Tracking */}
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <input
            type="text"
            placeholder="Ej: TTL-ORD-8821 o CRD-992140-CO"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4,
              color: '#fff',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <button
            type="button"
            onClick={() => {}}
            style={{
              padding: '10px 18px',
              background: '#fff',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            BUSCAR
          </button>
        </div>

        {activeOrder ? (
          <div style={{ marginTop: 24 }}>
            {/* Meta de la Orden */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#737373' }}>
                  CÓDIGO DE ORDEN:
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {activeOrder.code}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background:
                      activeOrder.status === 'ENTREGADA'
                        ? 'rgba(74, 222, 128, 0.15)'
                        : 'rgba(59, 130, 246, 0.15)',
                    color: activeOrder.status === 'ENTREGADA' ? '#4ade80' : '#60a5fa',
                    border:
                      activeOrder.status === 'ENTREGADA'
                        ? '1px solid rgba(74, 222, 128, 0.3)'
                        : '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {activeOrder.status === 'NUEVA' && 'Recibido / Alistando'}
                  {activeOrder.status === 'EN_PICKING' && 'En Preparación'}
                  {activeOrder.status === 'DESPACHADA' && 'En Ruta Nacional'}
                  {activeOrder.status === 'ENTREGADA' && 'Entregado'}
                  {activeOrder.status === 'CON_INCIDENCIA' && 'En Revisión'}
                </span>
              </div>
            </div>

            {/* Línea de Tiempo de 4 Etapas */}
            <div style={{ marginTop: 24, position: 'relative', paddingLeft: 24 }}>
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  bottom: 8,
                  left: 7,
                  width: 2,
                  background: 'rgba(255,255,255,0.1)'
                }}
              />

              {steps.map((step, idx) => {
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.id} style={{ position: 'relative', marginBottom: 20 }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: -24,
                        top: 2,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: isPassed ? '#2563eb' : '#262626',
                        border: isCurrent ? '3px solid #93c5fd' : '2px solid rgba(255,255,255,0.2)',
                        boxShadow: isCurrent ? '0 0 10px rgba(59, 130, 246, 0.6)' : 'none'
                      }}
                    />

                    <div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: isPassed ? '#fff' : '#737373'
                        }}
                      >
                        {step.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isPassed ? '#a3a3a3' : '#525252', marginTop: 2 }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detalles Logísticos */}
            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.8rem',
                color: '#d4d4d4',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12
              }}
            >
              <div>
                <span style={{ color: '#737373', fontSize: '0.7rem', display: 'block' }}>TRANSPORTADORA:</span>
                <strong>{activeOrder.carrier || 'Coordinadora Express'}</strong>
              </div>
              <div>
                <span style={{ color: '#737373', fontSize: '0.7rem', display: 'block' }}>GUÍA / TRACKING:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{activeOrder.trackingNumber || 'CRD-88210-CO'}</strong>
              </div>
              <div>
                <span style={{ color: '#737373', fontSize: '0.7rem', display: 'block' }}>DIRECCIÓN DE ENTREGA:</span>
                <span>{activeOrder.address}</span>
              </div>
              <div>
                <span style={{ color: '#737373', fontSize: '0.7rem', display: 'block' }}>TOTAL ORDEN:</span>
                <strong style={{ color: '#4ade80', fontFamily: 'var(--font-mono)' }}>{formatUSD(activeOrder.total)} <span style={{ fontSize: '0.8rem', color: '#86efac' }}>(≈ {formatCOP(activeOrder.total)})</span></strong>
              </div>
            </div>

            {/* Acción Exclusiva del Cliente: Confirmar Entrega */}
            {activeOrder.status === 'DESPACHADA' && (
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => confirmCustomerDelivery(activeOrder.id)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  <span>✓ He recibido mi pedido (Confirmar Entrega)</span>
                </button>
              </div>
            )}

            {activeOrder.status === 'ENTREGADA' && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 8,
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '1px solid rgba(74, 222, 128, 0.25)',
                  textAlign: 'center',
                  color: '#4ade80',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                ✓ Entrega confirmada y recibida por el cliente.
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 24, padding: 24, textAlign: 'center', color: '#737373' }}>
            No se encontró ninguna orden con ese código.
          </div>
        )}
      </div>
    </div>
  );
};
