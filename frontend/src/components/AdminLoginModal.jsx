import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const AdminLoginModal = () => {
  const { isAdminAuthOpen, setIsAdminAuthOpen, loginAdmin } = useAuth();
  useBodyScrollLock(isAdminAuthOpen);
  const { showToast } = useCart();

  const [username, setUsername] = useState('admin@kamilshop.store');
  const [password, setPassword] = useState('admin2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAdminAuthOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await loginAdmin(username, password);
    setLoading(false);

    if (res.success) {
      showToast('¡Autenticado con Rol: ADMINISTRADOR! Abriendo centro de control.');
      setIsAdminAuthOpen(false);
    } else {
      setErrorMsg(res.error || 'Credenciales corporativas inválidas');
    }
  };

  const handleFillDemo = () => {
    setUsername('admin@kamilshop.store');
    setPassword('admin2026');
    setErrorMsg('');
  };

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => { if (e.target === e.currentTarget) setIsAdminAuthOpen(false); }}
      style={{ zIndex: 1200 }}
    >
      <div className="modal-window" style={{ maxWidth: 460, padding: 36, border: '1px solid rgba(255, 255, 255, 0.2)' }}>
        <button
          type="button"
          className="btn-close-modal"
          onClick={() => setIsAdminAuthOpen(false)}
          aria-label="Cerrar acceso admin"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            letterSpacing: '0.1em',
            marginBottom: 8,
          }}>
            🔒 PORTAL CORPORATIVO INTERNO // RBAC
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            ACCESO DE ADMINISTRADOR
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            Acceso restringido para personal autorizado. Administre dark stores, órdenes e inventario.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(230, 57, 70, 0.15)',
            border: '1px solid rgba(230, 57, 70, 0.4)',
            color: 'var(--accent-red)',
            padding: '10px 14px',
            borderRadius: 4,
            fontSize: '0.8rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Usuario Corporativo o Correo Interno</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="admin@titulo.store"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña Empresarial</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleFillDemo}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              ⚡ Autocompletar Demo (admin@kamilshop.store)
            </button>
          </div>

          <button
            type="submit"
            className="btn-admin-submit"
            disabled={loading}
            style={{
              padding: 14,
              textAlign: 'center',
              background: '#ffffff',
              color: '#0A0A0A',
              fontWeight: 800,
            }}
          >
            {loading ? 'AUTENTICANDO RBAC...' : 'INGRESAR AL PORTAL ADMINISTRATIVO'}
          </button>
        </form>
      </div>
    </div>
  );
};
