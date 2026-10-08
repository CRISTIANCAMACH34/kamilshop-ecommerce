import React from 'react';
import { useCart } from '../context/CartContext';
import { WompiPaymentModal } from './WompiPaymentModal';

/**
 * CheckoutModal - Entrada Principal de Checkout
 * Delega directamente al flujo oficial de Wompi Colombia para KAMIL SHOP.
 */
export const CheckoutModal = () => {
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart();

  return (
    <WompiPaymentModal
      open={isCheckoutOpen}
      onClose={() => setIsCheckoutOpen(false)}
    />
  );
};
