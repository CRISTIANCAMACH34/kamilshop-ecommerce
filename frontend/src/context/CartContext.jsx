import React, { createContext, useContext, useState, useEffect } from 'react';
import { triggerHapticFeedback } from '../services/nativeBridge';
import { usePromotions } from './PromotionsContext';

const CART_KEY = 'titulo_cart_react_v1';
const WISHLIST_KEY = 'titulo_wishlist_react_v1';
const FREE_SHIPPING_THRESHOLD = 120.00; // Meta para Envío Gratis a todo Colombia

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { validateCoupon } = usePromotions();

  // Carrito de compras
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Bolsa de Favoritos / Wishlist
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [toast, setToast] = useState(null);

  // Opciones de personalización del pedido
  const [orderNotes, setOrderNotes] = useState('');
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const addItem = (product, size = 'M', quantity = 1, color = null) => {
    if (!product) return;
    triggerHapticFeedback();

    const colorKey = color || (product.colors && product.colors[0] ? product.colors[0].name : '');
    const itemKey = `${product.id}_${size}_${colorKey}`;

    setItems(prev => {
      const existing = prev.find(it => it.key === itemKey);
      if (existing) {
        return prev.map(it => it.key === itemKey ? { ...it, quantity: it.quantity + quantity } : it);
      } else {
        return [...prev, {
          key: itemKey,
          productId: product.id,
          name: product.name,
          price: parseFloat(product.price),
          size,
          color: colorKey,
          image: product.image,
          quantity
        }];
      }
    });

    setIsDrawerOpen(true);
    showToast(`"${product.name}" (${size}${colorKey ? ` - ${colorKey}` : ''}) añadido al carrito`);
  };

  const updateQuantity = (itemKey, delta) => {
    triggerHapticFeedback();
    setItems(prev => prev.map(it => {
      if (it.key === itemKey) {
        const newQty = it.quantity + delta;
        return newQty > 0 ? { ...it, quantity: newQty } : null;
      }
      return it;
    }).filter(Boolean));
  };

  const removeItem = (itemKey) => {
    triggerHapticFeedback();
    setItems(prev => prev.filter(it => it.key !== itemKey));
    showToast('Prenda eliminada del carrito');
  };

  const clearCart = () => {
    setItems([]);
    setDiscountPercent(0);
    setCoupon('');
    setOrderNotes('');
    setIsGiftWrapped(false);
    showToast('El carrito ha sido vaciado');
  };

  const applyCoupon = (code) => {
    if (!validateCoupon) return false;
    const res = validateCoupon(code);
    if (res.valid) {
      setDiscountPercent(res.discountPercent || 0);
      setCoupon(res.coupon.code);
      showToast(res.message, 'success');
      return true;
    } else {
      showToast(res.message, 'error');
      return false;
    }
  };

  // Gestión de Wishlist / Favoritos
  const toggleWishlist = (product) => {
    if (!product) return;
    triggerHapticFeedback();

    setWishlist(prev => {
      const exists = prev.some(it => it.id === product.id);
      if (exists) {
        showToast(`"${product.name}" removida de favoritos`);
        return prev.filter(it => it.id !== product.id);
      } else {
        showToast(`"${product.name}" guardada en tus favoritos`, 'success');
        return [...prev, {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          image: product.image,
          category: product.category,
          gender: product.gender,
          sizes: product.sizes || ['S', 'M', 'L'],
          specs: product.specs || product.description
        }];
      }
    });
  };

  const isWishlisted = (productId) => {
    return wishlist.some(it => it.id === productId);
  };

  const removeFromWishlist = (productId) => {
    triggerHapticFeedback();
    setWishlist(prev => prev.filter(it => it.id !== productId));
    showToast('Prenda eliminada de favoritos');
  };

  const count = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = Math.max(0, subtotal - discountAmount);

  // Progreso de Envío Gratis
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <CartContext.Provider value={{
      items,
      count,
      subtotal,
      discountPercent,
      discountAmount,
      total,
      isDrawerOpen,
      setIsDrawerOpen,
      isWishlistOpen,
      setIsWishlistOpen,
      isSizeGuideOpen,
      setIsSizeGuideOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      orderConfirmed,
      setOrderConfirmed,
      toast,
      showToast,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      // Wishlist
      wishlist,
      wishlistCount: wishlist.length,
      toggleWishlist,
      isWishlisted,
      removeFromWishlist,
      // Opciones de pedido
      orderNotes,
      setOrderNotes,
      isGiftWrapped,
      setIsGiftWrapped,
      // Envío gratis
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountNeededForFreeShipping,
      freeShippingProgress,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
