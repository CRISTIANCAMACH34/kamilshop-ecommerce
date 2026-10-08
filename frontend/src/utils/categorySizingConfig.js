/**
 * categorySizingConfig.js - Motor Dinámico de Tallajes y Atributos por Categoría y Género
 * Especializa y adapta las tallas de zapatillas, pantalones, prendas superiores y accesorios.
 */

export const CATEGORIES_CONFIG = [
  {
    slug: 'hoodies',
    label: 'Hoodies & Buzos',
    groupName: 'Prendas Superiores',
    icon: 'Sparkles',
    defaultTextile: '100% Algodón Francés Peinado • 480 GSM • Felpa Perchada',
  },
  {
    slug: 'camisetas',
    label: 'Camisetas & Tops',
    groupName: 'Prendas Superiores',
    icon: 'Tag',
    defaultTextile: '100% Algodón Peinado 240 GSM • Cuello Ribete Reforzado',
  },
  {
    slug: 'chaquetas',
    label: 'Chaquetas & Blazers',
    groupName: 'Abrigos & Outerwear',
    icon: 'Scissors',
    defaultTextile: 'Cuero Genuino / Nylon Balístico DWR • Forro Térmico',
  },
  {
    slug: 'pantalones',
    label: 'Pantalones & Jeans',
    groupName: 'Prendas Inferiores',
    icon: 'Layers',
    defaultTextile: 'Sarga Reforzada 380 GSM • Denim Rígido 14 oz',
  },
  {
    slug: 'calzado',
    label: 'Zapatillas & Sneakers',
    groupName: 'Calzado & Sneakers',
    icon: 'Boxes',
    defaultTextile: 'Cuero Napa • Gamuza • Malla Transpirable',
  },
  {
    slug: 'accesorios',
    label: 'Accesorios & Gorras',
    groupName: 'Complementos',
    icon: 'Award',
    defaultTextile: 'Algodón Sarga • Broche Metálico Inoxidable',
  },
];

/**
 * Matriz de sistemas de tallaje según Categoría y Género
 */
export const SIZING_PRESETS = {
  // 1. CALZADO / ZAPATILLAS (Importación EE.UU.)
  calzado: {
    masculino: [
      {
        id: 'calzado-h-us',
        name: 'Tallas Calzado US Men (7-12) • Original EE.UU.',
        type: 'US Men',
        sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
        unit: 'US Men',
      },
      {
        id: 'calzado-h-col',
        name: 'Equivalencia COL / EUR (38-45)',
        type: 'COL / EUR',
        sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
        unit: 'EUR/COL',
      },
    ],
    femenino: [
      {
        id: 'calzado-m-us',
        name: 'Tallas Calzado US Women (5-10) • Original EE.UU.',
        type: 'US Women',
        sizes: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
        unit: 'US Women',
      },
      {
        id: 'calzado-m-col',
        name: 'Equivalencia COL / EUR (35-41)',
        type: 'COL / EUR',
        sizes: ['35', '36', '37', '38', '39', '40', '41'],
        unit: 'EUR/COL',
      },
    ],
    unisex: [
      {
        id: 'calzado-u-us',
        name: 'Tallas Calzado US Unisex (6-11.5) • Original EE.UU.',
        type: 'US Unisex',
        sizes: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5'],
        unit: 'US',
      },
      {
        id: 'calzado-u-col',
        name: 'Equivalencia COL / EUR (36-44)',
        type: 'COL / EUR',
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
        unit: 'EUR/COL',
      },
    ],
  },

  // 2. PANTALONES / JEANS / CARGO (Importación EE.UU.)
  pantalones: {
    masculino: [
      {
        id: 'pant-h-waist',
        name: 'Cintura US Waist en Pulgadas (28"-38") • Original EE.UU.',
        type: 'US Waist',
        sizes: ['28', '30', '32', '34', '36', '38'],
        unit: 'Cintura "',
      },
      {
        id: 'pant-h-alpha',
        name: 'Joggers / Cargo US Alfa (S-XXL)',
        type: 'Alfa US',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        unit: 'Alfa',
      },
    ],
    femenino: [
      {
        id: 'pant-m-waist',
        name: 'Jeans US Denim / Waist (24"-32") • Original EE.UU.',
        type: 'US Denim',
        sizes: ['24', '25', '26', '27', '28', '30', '32'],
        unit: 'Cintura "',
      },
      {
        id: 'pant-m-us-num',
        name: 'Tallas Numéricas US Pants (2-14)',
        type: 'US Numeric',
        sizes: ['2', '4', '6', '8', '10', '12', '14'],
        unit: 'US',
      },
      {
        id: 'pant-m-col',
        name: 'Equivalencia Confección COL (4-16)',
        type: 'COL Confección',
        sizes: ['4', '6', '8', '10', '12', '14', '16'],
        unit: 'Talla Mujer',
      },
      {
        id: 'pant-m-alpha',
        name: 'Leggings / Joggers Alfa (XS-XL)',
        type: 'Alfa US',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        unit: 'Alfa',
      },
    ],
    unisex: [
      {
        id: 'pant-u-waist',
        name: 'Cintura Estándar US (28"-36")',
        type: 'US Waist',
        sizes: ['28', '30', '32', '34', '36'],
        unit: 'Cintura "',
      },
      {
        id: 'pant-u-alpha',
        name: 'Alfa Unisex US (XS-XXL)',
        type: 'Alfa US',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        unit: 'Alfa',
      },
    ],
  },

  // 3. PRENDAS SUPERIORES (HOODIES, CAMISETAS, CHAQUETAS)
  tops: {
    masculino: [
      {
        id: 'top-h-alpha',
        name: 'Textil Estándar Hombre (S-3XL)',
        type: 'Alfa Estándar',
        sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
        unit: 'Talla',
      },
      {
        id: 'top-h-alpha-xs',
        name: 'Textil Completo (XS-XXL)',
        type: 'Alfa',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        unit: 'Talla',
      },
    ],
    femenino: [
      {
        id: 'top-m-alpha',
        name: 'Textil Mujer (XS-XXL)',
        type: 'Alfa Mujer',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        unit: 'Talla',
      },
      {
        id: 'top-m-crops',
        name: 'Crop Tops & Siluetas Cortas (XXS-L)',
        type: 'Cropped',
        sizes: ['XXS', 'XS', 'S', 'M', 'L'],
        unit: 'Talla',
      },
    ],
    unisex: [
      {
        id: 'top-u-alpha',
        name: 'Textil Estándar Unisex (XS-XXL)',
        type: 'Alfa Unisex',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        unit: 'Talla',
      },
    ],
  },

  // 4. ACCESORIOS & GORRAS
  accesorios: {
    all: [
      {
        id: 'acc-unica',
        name: 'Talla Única Estándar',
        type: 'Única',
        sizes: ['ÚNICA'],
        unit: 'Talla',
      },
      {
        id: 'acc-ajustable',
        name: 'Ajustable con Correa / Broche',
        type: 'Ajustable',
        sizes: ['AJUSTABLE'],
        unit: 'Talla',
      },
      {
        id: 'acc-cinturon',
        name: 'Cinturones & Correas (S/M, L/XL)',
        type: 'Dual',
        sizes: ['S/M', 'L/XL'],
        unit: 'Rango',
      },
    ],
  },
};

/**
 * Atributos contextuales especializados según categoría
 */
export const CATEGORY_ATTRIBUTES = {
  calzado: {
    title: 'Especificaciones Técnicas de Calzado',
    fields: [
      {
        id: 'soleType',
        label: 'Tipo de Suela',
        placeholder: 'Ej. Caucho Vulcanizado de Alta Tracción / Goma EVA Liviana / Vibram',
        options: ['Caucho Vulcanizado', 'Goma EVA Liviana', 'Suela de Plataforma', 'Suela Vibram Rugosa', 'Poliuretano Inyectado'],
      },
      {
        id: 'shaftHeight',
        label: 'Altura de Caña',
        placeholder: 'Selecciona altura...',
        options: ['Caña Baja (Low-Top)', 'Caña Media (Mid-Top)', 'Caña Alta (High-Top / Botín)', 'Plataforma Elevada'],
      },
      {
        id: 'closureType',
        label: 'Sistema de Cierre',
        placeholder: 'Selecciona cierre...',
        options: ['Cordones Tradicionales', 'Cordones con Ajuste Rápido Toggle', 'Slip-on Sin Cordones', 'Velcro / Hebillas'],
      },
    ],
  },
  pantalones: {
    title: 'Patronaje y Corte de Pantalón',
    fields: [
      {
        id: 'pantCut',
        label: 'Silueta y Corte',
        placeholder: 'Selecciona silueta...',
        options: ['Corte Cargo Utilitario', 'Baggy Oversized (Pierna Ancha)', 'Recto Clásico (Straight Leg)', 'Wide Leg Fluido', 'Slim Fit Moderno', 'Mom Fit / Tiro Alto'],
      },
      {
        id: 'pantRise',
        label: 'Altura del Tiro',
        placeholder: 'Selecciona tiro...',
        options: ['Tiro Alto (High Rise)', 'Tiro Medio Estándar (Mid Rise)', 'Tiro Bajo (Low Rise)'],
      },
    ],
  },
  hoodies: {
    title: 'Corte y Silueta de Prenda Superior',
    fields: [
      {
        id: 'topFit',
        label: 'Calce / Silueta',
        placeholder: 'Selecciona calce...',
        options: ['Oversized Drop-Shoulder', 'Boxy Cropped Cut', 'Regular Streetwear', 'Slim Fit Entallado'],
      },
    ],
  },
  camisetas: {
    title: 'Corte y Silueta de Prenda Superior',
    fields: [
      {
        id: 'topFit',
        label: 'Calce / Silueta',
        placeholder: 'Selecciona calce...',
        options: ['Heavyweight Boxy Fit', 'Oversized Clásica', 'Regular Fit Contemporáneo', 'Crop Top Femenino', 'Slim Fit Peinado'],
      },
    ],
  },
  chaquetas: {
    title: 'Estructura y Abrigo',
    fields: [
      {
        id: 'jacketStructure',
        label: 'Estructura y Cierre',
        placeholder: 'Selecciona tipo...',
        options: ['Cremallera Bidireccional Termosellada', 'Botones Metálicos a Presión', 'Botonadura Sastre Desestructurada', 'Corte Biker Cruzado con Solapas'],
      },
    ],
  },
  accesorios: {
    title: 'Detalles del Accesorio',
    fields: [
      {
        id: 'accessoryType',
        label: 'Tipo de Accesorio',
        placeholder: 'Selecciona tipo...',
        options: ['Gorra Trucker / Dad Cap', 'Gorro Beanie Tejido', 'Bolso Crossbody / Riñonera', 'Joyería / Cadena de Acero', 'Cinturón Utilitario con Broche'],
      },
    ],
  },
};

/**
 * Obtiene las opciones de tallaje según la categoría y género
 */
export function getCategorySizingOptions(categorySlug, gender = 'unisex') {
  const normCategory = (categorySlug || '').toLowerCase().trim();
  const normGender = (gender || 'unisex').toLowerCase().trim();

  // Mapeo a grupo de tallas
  if (normCategory === 'calzado' || normCategory === 'zapatillas' || normCategory === 'sneakers') {
    const list = SIZING_PRESETS.calzado[normGender] || SIZING_PRESETS.calzado.unisex;
    return {
      categoryFamily: 'calzado',
      presets: list,
      defaultPreset: list[0],
      attributes: CATEGORY_ATTRIBUTES.calzado,
    };
  }

  if (normCategory === 'pantalones' || normCategory === 'shorts' || normCategory === 'cargos') {
    const list = SIZING_PRESETS.pantalones[normGender] || SIZING_PRESETS.pantalones.unisex;
    return {
      categoryFamily: 'pantalones',
      presets: list,
      defaultPreset: list[0],
      attributes: CATEGORY_ATTRIBUTES.pantalones,
    };
  }

  if (normCategory === 'accesorios' || normCategory === 'gorras' || normCategory === 'bolsos') {
    const list = SIZING_PRESETS.accesorios.all;
    return {
      categoryFamily: 'accesorios',
      presets: list,
      defaultPreset: list[0],
      attributes: CATEGORY_ATTRIBUTES.accesorios,
    };
  }

  // Por defecto: Prendas Superiores (hoodies, camisetas, chaquetas, etc.)
  const list = SIZING_PRESETS.tops[normGender] || SIZING_PRESETS.tops.unisex;
  const attrKey = normCategory in CATEGORY_ATTRIBUTES ? normCategory : 'hoodies';
  return {
    categoryFamily: 'tops',
    presets: list,
    defaultPreset: list[0],
    attributes: CATEGORY_ATTRIBUTES[attrKey] || CATEGORY_ATTRIBUTES.hoodies,
  };
}
