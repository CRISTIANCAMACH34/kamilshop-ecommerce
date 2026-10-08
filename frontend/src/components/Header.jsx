import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../services/audio';
import {
  Heart,
  ShoppingBag,
  User,
  LogIn,
  X,
  Menu,
  Sparkles,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  LogOut,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

export const Header = ({ onOpenCustomerAccount, onOpenTracking }) => {
  const { count, setIsDrawerOpen, wishlistCount, setIsWishlistOpen } = useCart();
  const { adminMode, setAdminMode, openAdminModal } = useProducts();
  const { user, isAdmin, setIsCustomerAuthOpen, setIsAdminAuthOpen, setViewMode, logout } = useAuth();
  const [time, setTime] = useState('');
  const [soundOn, setSoundOn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTime(`${String(hours).padStart(2, '0')}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  const handleSoundToggle = () => {
    const next = soundEngine.toggle();
    setSoundOn(next);
  };

  const handleMobileNavClick = (callback) => {
    setMobileMenuOpen(false);
    if (callback) callback();
  };

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          <div className="header-left">
            <a href="#heroSection" className="brand-logo" title="Kamil Shop - Inicio">
              <span className="brand-name-full">KAMIL SHOP</span>
              <span className="brand-name-short">KAMIL SHOP</span>
            </a>

            <div className="header-meta">
              <div className="live-clock">
                <span className="clock-dot"></span>
                <span>{time || '12:00 PM'} • BOGOTÁ (COT)</span>
              </div>

              <button
                type="button"
                className={`sound-toggle-btn ${soundOn ? 'is-active' : ''}`}
                onClick={handleSoundToggle}
                title="Alternar sonido ambiental"
              >
                <div className="sound-waves">
                  <span className="sound-bar"></span>
                  <span className="sound-bar"></span>
                  <span className="sound-bar"></span>
                </div>
                <span>SOUND: {soundOn ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          <nav className="header-center">
            <a href="#pasarela" className="nav-link">Pasarela</a>
            <a href="#catalogo" className="nav-link">Ropa / Colección</a>
            <a
              href="#rastreo"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                onOpenTracking?.();
              }}
            >
              Rastrear Pedido
            </a>
            <a href="#footer" className="nav-link">Acerca de</a>
          </nav>

          <div className="header-right">
            {/* Botón de Autenticación de Cliente (Oculto en pantallas pequeñas para evitar solapamiento) */}
            {user && user.role === 'CLIENTE' ? (
              <div
                className="customer-header-pill hidden md:flex"
                onClick={onOpenCustomerAccount}
                style={{ cursor: 'pointer' }}
                title={`Ver cuenta: ${user.name} (${user.email})`}
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                  alt={user.name}
                  className="customer-header-avatar"
                />
                <span className="customer-header-name">{user.name.split(' ')[0]}</span>
                <button
                  type="button"
                  className="btn-customer-logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                  }}
                  title="Cerrar sesión de cliente"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-auth-header hidden md:flex"
                onClick={() => setIsCustomerAuthOpen(true)}
                title="Iniciar sesión cliente (Google, Apple, Facebook)"
              >
                <User size={13} />
                <span>INGRESAR</span>
              </button>
            )}

            {/* Botón de Administrador (Portal Admin) */}
            {isAdmin && (
              <button
                type="button"
                className="btn-admin-header hidden sm:flex"
                onClick={() => setViewMode('admin_dashboard')}
                title="Ir al Portal de Operaciones y Negocio"
              >
                <span>⚡</span>
                <span className="hidden lg:inline">PORTAL</span> ADMIN
              </button>
            )}

            {/* Botón de Favoritos (Wishlist) */}
            <button
              type="button"
              className="btn-wishlist-header"
              onClick={() => setIsWishlistOpen(true)}
              title="Ver prendas favoritas"
            >
              <Heart size={14} className={wishlistCount > 0 ? 'fill-rose-400 text-rose-400' : ''} />
              <span className="hidden sm:inline">FAVORITOS</span>
              {wishlistCount > 0 && (
                <span className="wishlist-badge">{wishlistCount}</span>
              )}
            </button>

            {/* Botón de Carrito */}
            <button
              type="button"
              className="btn-cart-header"
              onClick={() => setIsDrawerOpen(true)}
              title="Abrir carrito"
            >
              <ShoppingBag size={14} />
              <span className="hidden xs:inline">CARRITO</span>
              <span className={`cart-count-badge ${count > 0 ? 'has-items' : ''}`}>{count}</span>
            </button>

            {/* Botón Hamburguesa Móvil */}
            <button
              type="button"
              className={`hamburger-btn ${mobileMenuOpen ? 'is-active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X size={20} stroke="#ffffff" /> : <Menu size={20} stroke="#ffffff" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil overlay de lujo */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}>
        {/* Cabecera interna del drawer móvil */}
        <div className="mobile-menu-header">
          <div className="mobile-brand-title">
            <span className="mobile-brand-tag font-mono">IMPORTADO USA • ORIGINAL</span>
            <span className="mobile-brand-main">KAMIL SHOP</span>
          </div>

          <button
            type="button"
            className="mobile-menu-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tarjeta de Inicio de Sesión / Usuario */}
        <div className="mobile-auth-box">
          {user && user.role === 'CLIENTE' ? (
            <div className="mobile-user-card">
              <div className="mobile-user-info">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                  alt={user.name}
                  className="mobile-user-avatar"
                />
                <div>
                  <div className="mobile-user-name">{user.name}</div>
                  <div className="mobile-user-email">{user.email}</div>
                  <div className="mobile-user-badge">Cliente Registrado</div>
                </div>
              </div>
              <div className="mobile-user-actions">
                <button
                  type="button"
                  className="btn-mobile-user-action"
                  onClick={() => handleMobileNavClick(onOpenCustomerAccount)}
                >
                  <User size={13} />
                  <span>Mi Perfil</span>
                </button>
                <button
                  type="button"
                  className="btn-mobile-user-action danger"
                  onClick={() => handleMobileNavClick(logout)}
                >
                  <LogOut size={13} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="mobile-login-card"
              onClick={() => handleMobileNavClick(() => setIsCustomerAuthOpen(true))}
            >
              <div className="mobile-login-left">
                <div className="mobile-login-icon-box">
                  <User size={18} className="text-white" />
                </div>
                <div>
                  <div className="mobile-login-title">MI CUENTA & PEDIDOS</div>
                  <div className="mobile-login-subtitle">Ingresa con Google, Apple o Facebook</div>
                </div>
              </div>
              <button type="button" className="btn-mobile-login-trigger">
                <span>ENTRAR</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Links de Navegación Estilo Fashion Atelier */}
        <nav className="mobile-nav-list">
          <a
            href="#heroSection"
            className="mobile-nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-nav-num">01</span>
            <span className="mobile-nav-text">INICIO</span>
          </a>

          <a
            href="#pasarela"
            className="mobile-nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-nav-num">02</span>
            <div className="flex-1 flex items-center justify-between">
              <span className="mobile-nav-text">PASARELA INFINITA</span>
              <span className="mobile-nav-chip">RUNWAY</span>
            </div>
          </a>

          <a
            href="#catalogo"
            className="mobile-nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-nav-num">03</span>
            <div className="flex-1 flex items-center justify-between">
              <span className="mobile-nav-text">CATÁLOGO DE ROPA</span>
              <span className="mobile-nav-chip">COLECCIÓN</span>
            </div>
          </a>

          <a
            href="#rastreo"
            className="mobile-nav-item"
            onClick={(e) => {
              e.preventDefault();
              handleMobileNavClick(onOpenTracking);
            }}
          >
            <span className="mobile-nav-num">04</span>
            <div className="flex-1 flex items-center justify-between">
              <span className="mobile-nav-text">RASTREAR PEDIDO</span>
              <PackageCheck size={16} className="text-white/40" />
            </div>
          </a>

          <a
            href="#footer"
            className="mobile-nav-item"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-nav-num">05</span>
            <span className="mobile-nav-text">SOBRE EL ATELIER</span>
          </a>
        </nav>

        {/* Accesos Rápidos (Carrito & Favoritos) */}
        <div className="mobile-quick-tiles">
          <button
            type="button"
            className="mobile-quick-tile"
            onClick={() => handleMobileNavClick(() => setIsDrawerOpen(true))}
          >
            <ShoppingBag size={18} className="text-white/80" />
            <div className="text-left">
              <div className="mobile-tile-title">TU CARRITO</div>
              <div className="mobile-tile-desc">{count} {count === 1 ? 'prendas' : 'prendas'} guardadas</div>
            </div>
            <span className="mobile-tile-badge">{count}</span>
          </button>

          <button
            type="button"
            className="mobile-quick-tile"
            onClick={() => handleMobileNavClick(() => setIsWishlistOpen(true))}
          >
            <Heart size={18} className={wishlistCount > 0 ? 'fill-rose-400 text-rose-400' : 'text-white/80'} />
            <div className="text-left">
              <div className="mobile-tile-title">FAVORITOS</div>
              <div className="mobile-tile-desc">{wishlistCount} guardadas</div>
            </div>
            {wishlistCount > 0 && <span className="mobile-tile-badge rose">{wishlistCount}</span>}
          </button>
        </div>

        {/* Portal de Administración (Si el usuario es admin) */}
        {isAdmin && (
          <button
            type="button"
            className="mobile-admin-access-btn"
            onClick={() => handleMobileNavClick(() => setViewMode('admin_dashboard'))}
          >
            <Sparkles size={16} className="text-amber-400 animate-pulse" />
            <span>PORTAL ADMINISTRATIVO Y OPERACIONES</span>
            <ArrowRight size={14} />
          </button>
        )}

        {/* Footer del Menú */}
        <div className="mobile-menu-footer">
          <div className="mobile-footer-meta font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping" />
            TIENDA EN VIVO • BOGOTÁ, COLOMBIA
          </div>
          <div className="mobile-footer-sub">
            KAMIL SHOP © 2026 • MODA & STREETWEAR IMPORTADO USA
          </div>
        </div>
      </div>
    </>
  );
};
