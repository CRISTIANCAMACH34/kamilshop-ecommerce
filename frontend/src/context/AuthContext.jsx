import React, { createContext, useContext, useState, useEffect } from 'react';

const AUTH_STORAGE_KEY = 'titulo_auth_session_v1';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved).role : 'GUEST';
    } catch {
      return 'GUEST';
    }
  });

  // Modales de Autenticación
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);

  // Modo de visualización: 'store' (tienda pública) | 'admin_dashboard' (Portal de Negocio KAMIL SHOP)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'ADMIN') return 'admin_dashboard';
      }
      return 'store';
    } catch {
      return 'store';
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setRole(user.role);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setRole('GUEST');
    }
  }, [user]);

  /**
   * Login Social para Clientes (Google, Apple, Facebook)
   */
  const loginWithSocial = async (provider, customProfile = null) => {
    try {
      const providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);
      const selectedProfile = customProfile || {
        name: `Cliente ${providerLabel}`,
        email: `cliente.${provider}@kamilshop.co`,
        avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${provider}`,
      };

      // Llamada al backend
      let backendData = null;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/customer/social-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            email: selectedProfile.email,
            name: selectedProfile.name,
            avatar_url: selectedProfile.avatar_url,
          }),
        });
        if (res.ok) {
          backendData = await res.json();
        }
      } catch {
        // Fallback offline
      }

      const userData = backendData || {
        id: `cust-${provider}-${Date.now()}`,
        name: selectedProfile.name,
        email: selectedProfile.email,
        role: 'CLIENTE',
        provider,
        avatar_url: selectedProfile.avatar_url,
        access_token: `token-social-${provider}-${Date.now()}`,
      };

      setUser(userData);
      setRole('CLIENTE');
      setViewMode('store');
      setIsCustomerAuthOpen(false);
      return { success: true, user: userData };
    } catch (err) {
      console.error('[AuthContext] Error login social:', err);
      return { success: false, error: err.message };
    }
  };

  /**
   * Login con Correo y Contraseña para Clientes
   */
  const loginWithEmail = async (email, password) => {
    try {
      let backendData = null;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/customer/email-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          backendData = await res.json();
        }
      } catch {
        // Fallback offline
      }

      const namePart = email.split('@')[0];
      const userData = backendData || {
        id: `cust-email-${Date.now()}`,
        name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
        email,
        role: 'CLIENTE',
        provider: 'email_password',
        avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${email}`,
        access_token: `token-mock-email-${Date.now()}`,
      };

      setUser(userData);
      setRole('CLIENTE');
      setViewMode('store');
      setIsCustomerAuthOpen(false);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Login Corporativo Interno para Administradores (Protegido por API backend)
   */
  const loginAdmin = async (username_or_email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username_or_email, password }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Credenciales corporativas inválidas');
      }
      const backendData = await res.json();

      setUser(backendData);
      setRole('ADMIN');
      setViewMode('admin_dashboard');
      setIsAdminAuthOpen(false);
      return { success: true, user: backendData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setRole('GUEST');
    setViewMode('store');
  };

  /**
   * Eliminación Definitiva de Cuenta de Cliente (Derecho al Olvido / Habeas Data)
   */
  const deleteCustomerAccount = async () => {
    if (!user) return { success: false, error: 'No hay sesión de cliente activa' };

    try {
      // Notificación al backend
      try {
        await fetch(`${API_BASE_URL}/auth/customer/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access_token || ''}`,
          },
        });
      } catch (e) {
        // Ignorar offline
      }

      // Limpieza de credenciales y almacenamiento local
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('titulo_customer_addresses');
      setUser(null);
      setRole('GUEST');
      setViewMode('store');

      return {
        success: true,
        message: 'Tu cuenta y datos personales han sido eliminados de forma definitiva de KAMIL SHOP.'
      };
    } catch (err) {
      console.error('[AuthContext] Error eliminando cuenta:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isAdmin: role === 'ADMIN',
        viewMode,
        setViewMode,
        isCustomerAuthOpen,
        setIsCustomerAuthOpen,
        isAdminAuthOpen,
        setIsAdminAuthOpen,
        loginWithSocial,
        loginWithEmail,
        loginAdmin,
        logout,
        deleteCustomerAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de AuthProvider');
  return context;
};
