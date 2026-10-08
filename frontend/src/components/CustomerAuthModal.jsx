import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { UserCheck, ShieldCheck, Mail, Lock, ArrowRight, X } from 'lucide-react';

/**
 * CustomerAuthModal - Modal de Autenticación de Clientes para KAMIL SHOP
 * Soporta Social Login (Google, Apple, Facebook), Registro con Correo y Compra como Invitado.
 */
export const CustomerAuthModal = () => {
  const { isCustomerAuthOpen, setIsCustomerAuthOpen, loginWithSocial, loginWithEmail } = useAuth();
  useBodyScrollLock(isCustomerAuthOpen);
  const { showToast } = useCart();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isCustomerAuthOpen) return null;

  const handleSocialClick = async (provider) => {
    setLoading(true);
    const customProfile = (email || name) ? {
      name: name || email.split('@')[0],
      email: email || `cliente.${provider}@kamilshop.co`,
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${email || provider}`,
    } : null;
    const res = await loginWithSocial(provider, customProfile);
    setLoading(false);
    if (res.success) {
      showToast(`¡Bienvenido a Kamil Shop, ${res.user.name}!`, 'success');
    } else {
      showToast(`Error al autenticar con ${provider}`, 'error');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const res = await loginWithEmail(email, password);
    setLoading(false);
    if (res.success) {
      showToast(`¡Hola de nuevo, ${res.user.name}!`, 'success');
    } else {
      showToast('Error en las credenciales ingresadas', 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setIsCustomerAuthOpen(false); }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCustomerAuthOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md overflow-y-auto max-h-[95vh] rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0d0d0d] text-white shadow-2xl p-5 sm:p-7 animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

        
        {/* Botón Cerrar */}
        <button
          type="button"
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition"
          onClick={() => setIsCustomerAuthOpen(false)}
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6 space-y-1">
          <span className="font-mono text-[10px] font-bold text-white/80 uppercase tracking-widest block">
            ACCESO CLIENTES EXCLUSIVOS
          </span>
          <h3 className="text-lg font-black text-white uppercase tracking-wide">
            KAMIL SHOP
          </h3>
          <p className="text-xs text-white/60">
            {authMode === 'login'
              ? 'Accede a tus compras, rastreo en vivo y beneficios VIP.'
              : 'Únete hoy y disfruta de cupones exclusivos de bienvenida.'}
          </p>
        </div>

        {/* Selector de Modo: Iniciar Sesión / Crear Cuenta */}
        <div className="flex rounded-2xl bg-white/5 border border-white/10 p-1 mb-5">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              authMode === 'login' ? 'bg-white text-black font-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              authMode === 'register' ? 'bg-white text-black font-black shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* BOTONES SOCIAL LOGIN */}
        <div className="flex flex-col gap-2.5 mb-5">
          {/* GOOGLE */}
          <button
            type="button"
            onClick={() => handleSocialClick('google')}
            disabled={loading}
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-zinc-900 font-bold text-xs hover:bg-white/90 transition shadow-sm cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continuar con Google</span>
          </button>

          {/* APPLE */}
          <button
            type="button"
            onClick={() => handleSocialClick('apple')}
            disabled={loading}
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-900 border border-white/15 text-white font-bold text-xs hover:bg-zinc-800 transition cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 170 170" fill="currentColor">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.86-12-14.45-6.84-10.42-12-22.68-15.48-36.78-3.48-14.1-5.22-26.65-5.22-37.66 0-16.71 4.37-30.46 13.11-41.25 8.74-10.79 19.34-16.32 31.8-16.6 5.86 0 12.01 1.62 18.45 4.86 6.44 3.24 10.71 4.97 12.82 5.19 1.9-.22 6.33-2.03 13.29-5.41 6.96-3.38 13.06-4.86 18.3-4.43 14.54.98 25.87 6.38 33.99 16.2-12.81 7.7-19.12 18.17-18.91 31.41.22 10.42 4.29 19.16 12.22 26.22 7.93 7.06 17.16 11.05 27.69 11.97-2.18 6.94-4.89 14.18-8.15 21.72zM119.22 31.95c0-7.39 2.66-14.34 7.98-20.85 5.32-6.51 11.89-10.59 19.71-12.25.11 1.09.16 2.07.16 2.94 0 7.28-2.77 14.34-8.31 21.18-5.54 6.84-12.27 11.08-20.19 12.71-.33-1.2-.55-2.22-.65-3.07-.44-.22-.7-.44-.7-.66z" />
            </svg>
            <span>Continuar con Apple ID</span>
          </button>
        </div>

        {/* Separador */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] font-mono text-white/40 uppercase">O CON CORREO</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Formulario Correo */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {authMode === 'register' && (
            <div>
              <label className="text-[10px] font-mono text-white/50 uppercase">Tu Nombre Completo</label>
              <input
                type="text"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-white/50"
                placeholder="Tu nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono text-white/50 uppercase">Correo Electrónico</label>
            <input
              type="email"
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-white/50"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-white/50 uppercase">Contraseña</label>
            <input
              type="password"
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-white/50"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-black text-black hover:bg-neutral-200 transition cursor-pointer mt-1"
          >
            <span>{loading ? 'AUTENTICANDO...' : authMode === 'login' ? 'INICIAR SESIÓN' : 'CREAR MI CUENTA'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Continuar como invitado */}
        <div className="text-center pt-4 border-t border-white/10 mt-5">
          <button
            type="button"
            onClick={() => setIsCustomerAuthOpen(false)}
            className="text-xs text-white/50 hover:text-white transition underline cursor-pointer"
          >
            Continuar explorando como invitado →
          </button>
        </div>
      </div>
    </div>
  );
};
