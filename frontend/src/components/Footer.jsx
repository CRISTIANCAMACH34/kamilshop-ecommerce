import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';

export const Footer = ({ onOpenInfoModal }) => {
  const { showToast } = useCart();
  const { setActiveCategoryFilter } = useProducts();
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) {
      showToast('¡Te has suscrito con éxito a los drops exclusivos de KAMIL SHOP!');
      setEmail('');
    }
  };

  const handleToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (e, cat) => {
    e.preventDefault();
    if (setActiveCategoryFilter) setActiveCategoryFilter(cat);
    const catEl = document.getElementById('catalogo');
    if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="site-footer" id="footer">
      <div className="footer-container">
        <div className="footer-brand-col">
          <a href="#heroSection" className="footer-logo">
            KAMIL SHOP
          </a>
          <p className="footer-manifesto">
            Tienda online oficial en Colombia. Moda contemporánea, prendas exclusivas y despachos directos a nivel nacional desde nuestra Dark Store en Bogotá.
          </p>

          <form onSubmit={handleNewsletter} className="newsletter-form">
            <input
              type="email"
              required
              placeholder="Tu correo electrónico"
              className="newsletter-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="submit" className="newsletter-btn">SUSCRIBIRSE</button>
          </form>
        </div>

        <div className="footer-col">
          <div className="footer-col-title">Colección</div>
          <ul className="footer-links-list">
            <li><a href="#catalogo" onClick={(e) => handleCategoryClick(e, 'hoodies')}>Hoodies & Sudaderas</a></li>
            <li><a href="#catalogo" onClick={(e) => handleCategoryClick(e, 'camisetas')}>Camisetas Heavyweight</a></li>
            <li><a href="#catalogo" onClick={(e) => handleCategoryClick(e, 'chaquetas')}>Chaquetas Técnicas</a></li>
            <li><a href="#catalogo" onClick={(e) => handleCategoryClick(e, 'pantalones')}>Pantalones Cargo</a></li>
            <li><a href="#catalogo" onClick={(e) => handleCategoryClick(e, 'accesorios')}>Accesorios & Gorras</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <div className="footer-col-title">Innovación</div>
          <ul className="footer-links-list">
            <li><a href="#pasarela">Pasarela Infinite</a></li>
            <li><a href="#pasarela">Packaging Sostenible</a></li>
            <li><a href="#pasarela">Barrera al Oxígeno</a></li>
            <li><a href="#pasarela">Reciclabilidad 100%</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <div className="footer-col-title">Estudio & Soporte</div>
          <ul className="footer-links-list">
            <li><a href="#tallas" onClick={(e) => { e.preventDefault(); onOpenInfoModal?.('tallas'); }}>Guía de Tallas</a></li>
            <li><a href="#envios" onClick={(e) => { e.preventDefault(); onOpenInfoModal?.('envios'); }}>Política de Envíos</a></li>
            <li><a href="#devoluciones" onClick={(e) => { e.preventDefault(); onOpenInfoModal?.('devoluciones'); }}>Devoluciones</a></li>
            <li><a href="#terminos" onClick={(e) => { e.preventDefault(); onOpenInfoModal?.('terminos'); }}>Términos del Servicio</a></li>
            <li><a href="mailto:hola@kamilshop.store">hola@kamilshop.store</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} KAMIL SHOP • TIENDA ONLINE OFICIAL COLOMBIA</div>
        <button type="button" className="btn-back-to-top" onClick={handleToTop}>VOLVER ARRIBA ↑</button>
      </div>
    </footer>
  );
};
