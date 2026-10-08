import React, { createContext, useContext, useState, useEffect } from 'react';

const PROMOTIONS_STORAGE_KEY = 'kamil_shop_promotions_v2';

// Purga de datos obsoletos
try {
  localStorage.removeItem('titulo_ecommerce_promotions_v1');
} catch (e) {}

const sanitizeCoupon = (c) => {
  if (!c) return c;
  try {
    let str = JSON.stringify(c);
    str = str.replace(/Camila\s*(&|y)\s*T[ií]o/gi, 'Kamil Shop');
    str = str.replace(/Camila/gi, 'Kamil');
    str = str.replace(/Chic[oó](\s*Norte)?/gi, 'Centro Logístico');
    return JSON.parse(str);
  } catch (e) {
    return c;
  }
};

const INITIAL_COUPONS = [
  {
    code: "KAMIL10",
    description: "10% de descuento de bienvenida Kamil Shop",
    discountPercent: 10,
    discountAmount: 0,
    type: "percentage",
    uses: 48,
    status: "Activo",
    expires: "31/12/2026",
  },
  {
    code: "KAMIL20",
    description: "20% de descuento VIP clientes selectos Kamil Shop",
    discountPercent: 20,
    discountAmount: 0,
    type: "percentage",
    uses: 19,
    status: "Activo",
    expires: "31/12/2026",
  },
  {
    code: "TITULO10",
    description: "10% de descuento en primera compra",
    discountPercent: 10,
    discountAmount: 0,
    type: "percentage",
    uses: 48,
    status: "Activo",
    expires: "31/12/2026",
  },
  {
    code: "NOIRVIP",
    description: "Acceso exclusivo colección Noir (Clientes VIP)",
    discountPercent: 15,
    discountAmount: 0,
    type: "percentage",
    uses: 19,
    status: "Activo",
    expires: "15/11/2026",
  },
  {
    code: "ENVIOGRATIS",
    description: "Envío nacional sin costo en cualquier compra",
    discountPercent: 0,
    discountAmount: 0,
    type: "free_shipping",
    uses: 112,
    status: "Activo",
    expires: "Permanente",
  },
  {
    code: "CYBER25",
    description: "Descuento especial de temporada",
    discountPercent: 25,
    discountAmount: 0,
    type: "percentage",
    uses: 34,
    status: "Activo",
    expires: "30/10/2026",
  },
];

const PromotionsContext = createContext(null);

export const PromotionsProvider = ({ children }) => {
  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem(PROMOTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(sanitizeCoupon);
      }
    } catch (e) {
      console.warn("Error leyendo promociones de localStorage", e);
    }
    return INITIAL_COUPONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(coupons));
    } catch (e) {
      console.error("Error guardando promociones en localStorage", e);
    }
  }, [coupons]);

  // Validar y aplicar cupón
  const validateCoupon = (inputCode) => {
    if (!inputCode) return { valid: false, message: "Ingresa un código de cupón" };
    const clean = inputCode.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === clean);

    if (!found) {
      return {
        valid: false,
        message: `Cupón "${clean}" no válido. Prueba con KAMIL10 o KAMIL20`,
      };
    }

    if (found.status !== "Activo") {
      return {
        valid: false,
        message: `El cupón "${clean}" ha expirado o está inactivo`,
      };
    }

    return {
      valid: true,
      coupon: found,
      discountPercent: found.discountPercent || 0,
      isFreeShipping: found.type === "free_shipping",
      message: `¡Cupón ${found.code} aplicado con éxito! (${found.description})`,
    };
  };

  // Actualizar cupón existente
  const updateCoupon = (originalCode, updatedData) => {
    const newCode = (updatedData.code || originalCode).trim().toUpperCase();
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.code.toUpperCase() === originalCode.toUpperCase()) {
          return {
            ...c,
            ...updatedData,
            code: newCode,
            discountPercent: parseFloat(updatedData.discountPercent) || 0,
            discountAmount: parseFloat(updatedData.discountAmount) || 0,
          };
        }
        return c;
      })
    );
    return { success: true };
  };

  // Crear nuevo cupón (desde Admin)
  const addCoupon = (newCouponData) => {
    const code = (newCouponData.code || '').trim().toUpperCase();
    if (!code) return { success: false, message: "Código inválido" };

    const exists = coupons.some((c) => c.code.toUpperCase() === code);
    if (exists) {
      return updateCoupon(code, newCouponData);
    }

    const created = {
      code,
      description: newCouponData.description || `Promoción ${code}`,
      productId: newCouponData.productId || 'all',
      productName: newCouponData.productName || 'Todas las prendas del catálogo',
      comboProductId: newCouponData.comboProductId || '',
      comboProductName: newCouponData.comboProductName || '',
      discountPercent: parseFloat(newCouponData.discountPercent) || 0,
      discountAmount: parseFloat(newCouponData.discountAmount) || 0,
      type: newCouponData.type || "percentage", // percentage | bundle | free_shipping | fixed
      uses: 0,
      status: "Activo",
      expires: newCouponData.expires || "31/12/2026",
    };

    setCoupons((prev) => [created, ...prev]);
    return { success: true, coupon: created };
  };

  // Eliminar o desactivar cupón
  const removeCoupon = (code) => {
    setCoupons((prev) => prev.filter((c) => c.code.toUpperCase() !== code.toUpperCase()));
  };

  return (
    <PromotionsContext.Provider
      value={{
        coupons,
        validateCoupon,
        addCoupon,
        updateCoupon,
        removeCoupon,
      }}
    >
      {children}
    </PromotionsContext.Provider>
  );
};

export const usePromotions = () => {
  const context = useContext(PromotionsContext);
  if (!context) {
    throw new Error("usePromotions debe ser utilizado dentro de un PromotionsProvider");
  }
  return context;
};
