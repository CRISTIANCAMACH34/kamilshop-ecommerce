import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { X, Ruler, Sparkles, Check } from 'lucide-react';

/**
 * SizeGuideModal - Guía Interactiva de Tallas para KAMIL SHOP
 * Incluye tablas en centímetros y un recomendador virtual según altura y contextura.
 */
export const SizeGuideModal = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useCart();
  useBodyScrollLock(isSizeGuideOpen);
  const [activeTab, setActiveTab] = useState('tops'); // 'tops' | 'hoodies' | 'bottoms_men' | 'bottoms_women' | 'calzado_men' | 'calzado_women' | 'jackets'

  // Calculadora recomendadora
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [recommendedSize, setRecommendedSize] = useState('M');

  if (!isSizeGuideOpen) return null;

  const calculateRecommendation = (h, w) => {
    const numH = parseFloat(h) || 170;
    const numW = parseFloat(w) || 70;
    const bmi = numW / ((numH / 100) * (numH / 100));

    if (bmi < 19) return 'XS';
    if (bmi < 22) return 'S';
    if (bmi < 25) return 'M';
    if (bmi < 28) return 'L';
    if (bmi < 31) return 'XL';
    return 'XXL';
  };

  const handleHeightChange = (val) => {
    setHeight(val);
    setRecommendedSize(calculateRecommendation(val, weight));
  };

  const handleWeightChange = (val) => {
    setWeight(val);
    setRecommendedSize(calculateRecommendation(height, val));
  };

  const sizeTables = {
    tops: [
      { size: 'XS', col1: '86 - 90 cm', col2: '72 - 76 cm', col3: '68 cm' },
      { size: 'S', col1: '91 - 96 cm', col2: '77 - 82 cm', col3: '70 cm' },
      { size: 'M', col1: '97 - 102 cm', col2: '83 - 88 cm', col3: '72 cm' },
      { size: 'L', col1: '103 - 108 cm', col2: '89 - 94 cm', col3: '74 cm' },
      { size: 'XL', col1: '109 - 114 cm', col2: '95 - 100 cm', col3: '76 cm' },
      { size: 'XXL', col1: '115 - 122 cm', col2: '101 - 108 cm', col3: '78 cm' },
    ],
    hoodies: [
      { size: 'XS', col1: '92 - 96 cm', col2: '76 - 80 cm', col3: '69 cm' },
      { size: 'S', col1: '97 - 102 cm', col2: '81 - 86 cm', col3: '71 cm' },
      { size: 'M', col1: '103 - 108 cm', col2: '87 - 92 cm', col3: '73 cm' },
      { size: 'L', col1: '109 - 115 cm', col2: '93 - 98 cm', col3: '75 cm' },
      { size: 'XL', col1: '116 - 122 cm', col2: '99 - 105 cm', col3: '77 cm' },
      { size: 'XXL', col1: '123 - 130 cm', col2: '106 - 112 cm', col3: '79 cm' },
    ],
    bottoms_men: [
      { size: '28"', col1: '71 - 74 cm', col2: '88 - 91 cm', col3: '102 cm' },
      { size: '30"', col1: '76 - 79 cm', col2: '93 - 96 cm', col3: '103 cm' },
      { size: '32"', col1: '81 - 84 cm', col2: '98 - 101 cm', col3: '104 cm' },
      { size: '34"', col1: '86 - 89 cm', col2: '103 - 106 cm', col3: '105 cm' },
      { size: '36"', col1: '91 - 95 cm', col2: '108 - 112 cm', col3: '106 cm' },
      { size: '38"', col1: '96 - 100 cm', col2: '113 - 118 cm', col3: '107 cm' },
    ],
    bottoms_women: [
      { size: '4 (US 24)', col1: '60 - 64 cm', col2: '86 - 90 cm', col3: '100 cm' },
      { size: '6 (US 26)', col1: '65 - 69 cm', col2: '91 - 95 cm', col3: '101 cm' },
      { size: '8 (US 28)', col1: '70 - 74 cm', col2: '96 - 100 cm', col3: '102 cm' },
      { size: '10 (US 30)', col1: '75 - 79 cm', col2: '101 - 105 cm', col3: '103 cm' },
      { size: '12 (US 32)', col1: '80 - 85 cm', col2: '106 - 110 cm', col3: '104 cm' },
      { size: '14 (US 34)', col1: '86 - 91 cm', col2: '111 - 116 cm', col3: '105 cm' },
      { size: '16 (US 36)', col1: '92 - 97 cm', col2: '117 - 122 cm', col3: '106 cm' },
    ],
    calzado_men: [
      { size: 'US 7.0', col1: '38 COL', col2: 'EUR 39', col3: '25.0 cm' },
      { size: 'US 7.5', col1: '39 COL', col2: 'EUR 40', col3: '25.5 cm' },
      { size: 'US 8.0', col1: '40 COL', col2: 'EUR 41', col3: '26.0 cm' },
      { size: 'US 8.5', col1: '40.5 COL', col2: 'EUR 41.5', col3: '26.5 cm' },
      { size: 'US 9.0', col1: '41 COL', col2: 'EUR 42', col3: '27.0 cm' },
      { size: 'US 9.5', col1: '41.5 COL', col2: 'EUR 42.5', col3: '27.5 cm' },
      { size: 'US 10.0', col1: '42 COL', col2: 'EUR 43', col3: '28.0 cm' },
      { size: 'US 10.5', col1: '43 COL', col2: 'EUR 44', col3: '28.5 cm' },
      { size: 'US 11.0', col1: '43.5 COL', col2: 'EUR 44.5', col3: '29.0 cm' },
      { size: 'US 11.5', col1: '44 COL', col2: 'EUR 45', col3: '29.5 cm' },
      { size: 'US 12.0', col1: '45 COL', col2: 'EUR 46', col3: '30.0 cm' },
    ],
    calzado_women: [
      { size: 'US 5.0', col1: '35 COL', col2: 'EUR 35.5', col3: '22.0 cm' },
      { size: 'US 5.5', col1: '35.5 COL', col2: 'EUR 36', col3: '22.5 cm' },
      { size: 'US 6.0', col1: '36 COL', col2: 'EUR 36.5', col3: '23.0 cm' },
      { size: 'US 6.5', col1: '36.5 COL', col2: 'EUR 37', col3: '23.5 cm' },
      { size: 'US 7.0', col1: '37 COL', col2: 'EUR 37.5', col3: '24.0 cm' },
      { size: 'US 7.5', col1: '37.5 COL', col2: 'EUR 38', col3: '24.5 cm' },
      { size: 'US 8.0', col1: '38 COL', col2: 'EUR 38.5', col3: '25.0 cm' },
      { size: 'US 8.5', col1: '38.5 COL', col2: 'EUR 39', col3: '25.5 cm' },
      { size: 'US 9.0', col1: '39 COL', col2: 'EUR 40', col3: '26.0 cm' },
      { size: 'US 9.5', col1: '40 COL', col2: 'EUR 41', col3: '26.5 cm' },
      { size: 'US 10.0', col1: '41 COL', col2: 'EUR 42', col3: '27.0 cm' },
    ],
    jackets: [
      { size: 'XS (US)', col1: '90 - 94 cm', col2: '43 cm', col3: '67 cm' },
      { size: 'S (US)', col1: '95 - 100 cm', col2: '45 cm', col3: '69 cm' },
      { size: 'M (US)', col1: '101 - 106 cm', col2: '47 cm', col3: '71 cm' },
      { size: 'L (US)', col1: '107 - 112 cm', col2: '49 cm', col3: '73 cm' },
      { size: 'XL (US)', col1: '113 - 119 cm', col2: '51 cm', col3: '75 cm' },
      { size: 'XXL (US)', col1: '120 - 126 cm', col2: '53 cm', col3: '77 cm' },
    ]
  };

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'calzado_men':
      case 'calzado_women':
        return { h1: 'Talla US (Original)', h2: 'Equiv. Colombia', h3: 'Equiv. EUR', h4: 'Largo Pie (cm)' };
      case 'bottoms_men':
        return { h1: 'Cintura US (Pulg.)', h2: 'Cintura (cm)', h3: 'Cadera (cm)', h4: 'Largo Entrepierna' };
      case 'bottoms_women':
        return { h1: 'Jeans US Denim', h2: 'Cintura (cm)', h3: 'Cadera (cm)', h4: 'Largo Prenda' };
      case 'jackets':
        return { h1: 'Talla US', h2: 'Pecho / Busto', h3: 'Ancho Hombros', h4: 'Largo Prenda' };
      case 'hoodies':
      case 'tops':
      default:
        return { h1: 'Talla US', h2: 'Pecho / Busto', h3: 'Cintura', h4: 'Largo Prenda' };
    }
  };

  const headers = getTableHeaders();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSizeGuideOpen(false)}
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] text-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#121212]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white border border-white/20">
              <Ruler size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Guía Oficial de Tallas y Medidas</h3>
              <p className="text-xs text-white/50">KAMIL SHOP • Ropa & Calzado Importado de EE.UU. (US Standard)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSizeGuideOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Recomendador Inteligente Interactivo (Para Tops y Buzos) */}
        {(activeTab === 'tops' || activeTab === 'hoodies' || activeTab === 'jackets') && (
          <div className="p-5 border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles size={15} />
              <span>Recomendador Inteligente de Talla (Prendas Superiores)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase">Tu Estatura (cm)</label>
                <input
                  type="number"
                  min="140"
                  max="210"
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-white/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase">Tu Peso Aprox. (kg)</label>
                <input
                  type="number"
                  min="40"
                  max="140"
                  value={weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-white/50"
                />
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center">
                <span className="text-[10px] font-mono text-white/70 uppercase block">Talla Recomendada:</span>
                <span className="font-mono text-2xl font-black text-white">{recommendedSize}</span>
              </div>
            </div>
          </div>
        )}

        {/* Selector de Categorías de Prenda */}
        <div className="flex border-b border-white/10 bg-[#141414] px-4 overflow-x-auto gap-1">
          {[
            { id: 'tops', label: 'Camisetas & Tops' },
            { id: 'hoodies', label: 'Hoodies & Buzos' },
            { id: 'bottoms_men', label: 'Pantalones Hombre' },
            { id: 'bottoms_women', label: 'Pantalones Mujer' },
            { id: 'calzado_men', label: 'Sneakers Hombre' },
            { id: 'calzado_women', label: 'Sneakers Mujer' },
            { id: 'jackets', label: 'Chaquetas & Abrigos' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-white text-white bg-white/[0.04]'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tabla de Medidas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-[10px] font-mono uppercase text-white/60">
                <tr>
                  <th className="p-3">{headers.h1}</th>
                  <th className="p-3">{headers.h2}</th>
                  <th className="p-3">{headers.h3}</th>
                  <th className="p-3">{headers.h4}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(sizeTables[activeTab] || []).map((row) => (
                  <tr
                    key={row.size}
                    className={`hover:bg-white/[0.03] transition ${
                      row.size === recommendedSize && (activeTab === 'tops' || activeTab === 'hoodies') ? 'bg-white/10 font-bold text-white' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold flex items-center gap-1.5 text-white">
                      <span>{row.size}</span>
                      {row.size === recommendedSize && (activeTab === 'tops' || activeTab === 'hoodies') && (
                        <Check size={14} className="text-white" />
                      )}
                    </td>
                    <td className="p-3 text-white/80">{row.col1}</td>
                    <td className="p-3 text-white/80">{row.col2}</td>
                    <td className="p-3 text-white/80">{row.col3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tips de Medición según Categoría */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-[11px] text-white/70 space-y-1.5 leading-relaxed">
            <strong className="text-white block font-sans">💡 ¿Cómo medirte correctamente?</strong>
            {activeTab.startsWith('calzado') ? (
              <>
                <p>• <strong>Largo del Pie:</strong> Coloca una hoja de papel en el suelo pegada a la pared. Apoya el talón contra la pared y marca la punta de tu dedo más largo con un lápiz.</p>
                <p>• Mide la distancia en centímetros (cm) con una regla y compara con la columna <strong>Largo Pie (cm)</strong>.</p>
                <p>• <em>Tip de Calce:</em> Si tienes empeine alto o pie ancho, te sugerimos pedir media talla más en zapatillas deportivas.</p>
              </>
            ) : activeTab.startsWith('bottoms') ? (
              <>
                <p>• <strong>Cintura:</strong> Mide alrededor del punto natural de tu cintura (a la altura del ombligo o donde usas el pantalón con normalidad).</p>
                <p>• <strong>Cadera:</strong> Mide alrededor de la parte más prominente de tus caderas y glúteos manteniendo la cinta nivelada.</p>
                <p>• <em>Equivalencia:</em> Los pantalones masculinos usan pulgadas de cintura (28 a 38). Los femeninos se rigen por confección nacional (4 a 16).</p>
              </>
            ) : (
              <>
                <p>• <strong>Pecho / Busto:</strong> Pasa la cinta métrica por la parte más prominente del busto/pecho manteniendo la cinta horizontal.</p>
                <p>• <strong>Cintura:</strong> Mide alrededor del punto más estrecho del torso.</p>
                <p>• <strong>Largo:</strong> Desde el punto más alto del hombro hasta el dobladillo inferior.</p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 bg-[#121212] flex items-center justify-between">
          <span className="text-xs text-white/40">Garantía de 30 días para cambio de talla sin costo</span>
          <button
            type="button"
            onClick={() => setIsSizeGuideOpen(false)}
            className="rounded-xl bg-white px-4 py-2 text-xs font-black text-black hover:bg-neutral-200 transition cursor-pointer"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
