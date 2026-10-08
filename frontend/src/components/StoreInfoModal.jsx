import React, { useState, useEffect } from 'react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const StoreInfoModal = ({ open, initialTab = 'tallas', onClose }) => {
  useBodyScrollLock(open);
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab, open]);

  if (!open) return null;

  return (
    <div className="modal-overlay active" style={{ zIndex: 1250 }}>
      <div
        className="modal-window"
        style={{
          maxWidth: 720,
          padding: 32,
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8
        }}
      >
        <button
          type="button"
          className="btn-close-modal"
          onClick={onClose}
          aria-label="Cerrar modal informativo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#a3a3a3',
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            KAMIL SHOP // GUÍAS Y POLÍTICAS OFICIALES
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', marginTop: 4 }}>
            Información de la Tienda
          </h2>
        </div>

        {/* Pestañas */}
        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10, overflowX: 'auto' }}>
          {[
            { id: 'tallas', label: 'Guía de Tallas' },
            { id: 'envios', label: 'Política de Envíos' },
            { id: 'devoluciones', label: 'Devoluciones y Cambios' },
            { id: 'terminos', label: 'Términos del Servicio' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 4,
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: tab === t.id ? '#ffffff' : 'transparent',
                color: tab === t.id ? '#000000' : '#a3a3a3',
                transition: 'all 0.2s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido según pestaña */}
        <div style={{ marginTop: 24, maxHeight: '60vh', overflowY: 'auto' }}>
          {tab === 'tallas' && (
            <div>
              <p style={{ color: '#a3a3a3', fontSize: '0.85rem', marginBottom: 16 }}>
                Nuestras prendas están cortadas con siluetas contemporáneas y holgadas (Boxy & Oversize). Si prefieres un ajuste más ajustado al cuerpo, te recomendamos ordenar una talla menor.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', color: '#737373', fontFamily: 'var(--font-mono)' }}>
                      <th style={{ padding: '8px 12px' }}>TALLA</th>
                      <th style={{ padding: '8px 12px' }}>PECHO (CM)</th>
                      <th style={{ padding: '8px 12px' }}>CINTURA (CM)</th>
                      <th style={{ padding: '8px 12px' }}>CADERA (CM)</th>
                      <th style={{ padding: '8px 12px' }}>LARGO (CM)</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#d4d4d4' }}>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#fff' }}>XS</td>
                      <td style={{ padding: '10px 12px' }}>88 - 92</td>
                      <td style={{ padding: '10px 12px' }}>68 - 72</td>
                      <td style={{ padding: '10px 12px' }}>90 - 94</td>
                      <td style={{ padding: '10px 12px' }}>66</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#fff' }}>S</td>
                      <td style={{ padding: '10px 12px' }}>93 - 98</td>
                      <td style={{ padding: '10px 12px' }}>73 - 78</td>
                      <td style={{ padding: '10px 12px' }}>95 - 100</td>
                      <td style={{ padding: '10px 12px' }}>68</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#fff' }}>M</td>
                      <td style={{ padding: '10px 12px' }}>99 - 104</td>
                      <td style={{ padding: '10px 12px' }}>79 - 84</td>
                      <td style={{ padding: '10px 12px' }}>101 - 106</td>
                      <td style={{ padding: '10px 12px' }}>71</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#fff' }}>L</td>
                      <td style={{ padding: '10px 12px' }}>105 - 110</td>
                      <td style={{ padding: '10px 12px' }}>85 - 90</td>
                      <td style={{ padding: '10px 12px' }}>107 - 112</td>
                      <td style={{ padding: '10px 12px' }}>73</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#fff' }}>XL</td>
                      <td style={{ padding: '10px 12px' }}>111 - 118</td>
                      <td style={{ padding: '10px 12px' }}>91 - 98</td>
                      <td style={{ padding: '10px 12px' }}>113 - 120</td>
                      <td style={{ padding: '10px 12px' }}>76</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#fff' }}>XXL</td>
                      <td style={{ padding: '10px 12px' }}>119 - 126</td>
                      <td style={{ padding: '10px 12px' }}>99 - 106</td>
                      <td style={{ padding: '10px 12px' }}>121 - 128</td>
                      <td style={{ padding: '10px 12px' }}>78</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'envios' && (
            <div style={{ spaceY: 16, color: '#d4d4d4', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                Envíos Nacionales y Logística de Importación USA
              </h4>
              <p>
                Todas nuestras prendas y sneakers son importados originalmente de Estados Unidos y preparados para despacho desde nuestra <strong>Bodega Central Kamil Shop</strong> con cobertura en todo el territorio colombiano.
              </p>
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong>Despacho Inmediato:</strong> Pedidos preparados y rotulados en 24 horas hábiles.</li>
                <li><strong>Envíos Nacionales Asegurados:</strong> Entrega de 2 a 4 días hábiles a ciudades principales y municipios mediante Coordinadora, Servientrega e Inter Rapidísimo con guía de rastreo.</li>
                <li><strong>Envío Gratis:</strong> Aplicable a compras superiores a $100 USD o con el cupón <code>ENVIOGRATIS</code>.</li>
              </ul>
            </div>
          )}

          {tab === 'devoluciones' && (
            <div style={{ color: '#d4d4d4', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                Garantía de Satisfacción & Cambios de Talla
              </h4>
              <p>
                Dispones de <strong>30 días calendario</strong> a partir de la entrega de tu pedido para solicitar cambio de talla o devolución.
              </p>
              <p style={{ marginTop: 8 }}>
                <strong>Requisitos:</strong> La prenda o calzado debe conservar sus etiquetas originales de importación, empaque o caja original y encontrarse sin señales de uso.
              </p>
              <p style={{ marginTop: 8 }}>
                Para solicitar tu cambio, comunícate con nuestro equipo a <code>soporte@kamilshop.com</code> con tu código de orden <code>KML-ORD-XXXX</code>.
              </p>
            </div>
          )}

          {tab === 'terminos' && (
            <div style={{ color: '#d4d4d4', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                Términos del Servicio y Privacidad
              </h4>
              <p>
                <strong>KAMIL SHOP</strong> garantiza la confidencialidad absoluta de tus datos personales conforme a la ley de protección de datos (Habeas Data Ley 1581 de 2012 de Colombia).
              </p>
              <p style={{ marginTop: 8 }}>
                Todas las transacciones son procesadas mediante encriptación bancaria SSL de 256 bits y la pasarela oficial Wompi Bancolombia certificada PCI-DSS Nivel 1. No almacenamos datos sensibles de tarjetas de crédito en nuestros servidores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
