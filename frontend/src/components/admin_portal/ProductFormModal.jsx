import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Trash2,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Layers,
  Check,
  Award,
  Scissors,
  Upload,
  Percent,
  Palette,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Search,
  Boxes,
  Ruler,
} from 'lucide-react';
import { AdminHelpBadge } from './AdminHelpBadge';
import { formatThousands, formatUSD, formatCOP, formatPriceDual } from '../../services/currencyService';
import { CATEGORIES_CONFIG, getCategorySizingOptions, SIZING_PRESETS } from '../../utils/categorySizingConfig';

/**
 * ProductFormModal - Modal Unificado para Creación y Edición de Prendas
 * - Todos los submódulos unificados en un flujo continuo y navegable
 * - Selección de MÚLTIPLES COLORES por prenda
 * - Enlace dinámico de COMBOS con otros productos del catálogo
 * - Desglose adaptativo de tallajes y atributos por categoría (Zapatillas, Pantalones, Superiores, Accesorios)
 */
export function ProductFormModal({

  open,
  product = null,
  allProducts = [],
  brands = [],
  garmentTypes = [],
  sizesList = [],
  colorsList = [],
  onClose,
  onSave,
  onDelete,
}) {
  const defaultBrands = [
    { name: 'TITULO Studio' },
    { name: 'Noir Archive' },
    { name: 'Atelier Kamil Shop' },
    { name: 'Minimalist Techwear' },
  ];

  const defaultTypes = [
    { name: 'Hoodies & Buzos', category: 'hoodies' },
    { name: 'Camisetas & Tops', category: 'camisetas' },
    { name: 'Chaquetas & Blazers', category: 'chaquetas' },
    { name: 'Pantalones & Jeans', category: 'pantalones' },
    { name: 'Zapatillas & Sneakers', category: 'calzado' },
    { name: 'Accesorios & Gorras', category: 'accesorios' },
  ];

  const defaultSizes = [
    { name: 'Textil Estándar (XS-XXL)', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { name: 'Calzado Deportivo (38-44)', sizes: ['38', '39', '40', '41', '42', '43', '44'] },
    { name: 'Pantalones Cintura (28-36)', sizes: ['28', '30', '32', '34', '36'] },
  ];

  const defaultColors = [
    { name: 'Noir Obsidian', hex: '#0a0a0a', palette: 'Neutros & Obscure' },
    { name: 'Blanco Crudo / Hueso', hex: '#f8f8f6', palette: 'Neutros & Obscure' },
    { name: 'Gris Asfalto Mineral', hex: '#4b5563', palette: 'Neutros & Obscure' },
    { name: 'Verde Militar Vintage', hex: '#4d5d43', palette: 'Tierras & Colección' },
    { name: 'Tierra Arcilla', hex: '#9a5b42', palette: 'Tierras & Colección' },
    { name: 'Azul Petróleo Profundo', hex: '#16384c', palette: 'Colección Runway' },
    { name: 'Beige Arena', hex: '#d9cdb8', palette: 'Básicos Contemporáneos' },
  ];

  const effectiveBrands = brands && brands.length > 0 ? brands : defaultBrands;
  const effectiveTypes = garmentTypes && garmentTypes.length > 0 ? garmentTypes : defaultTypes;
  const effectiveSizesList = sizesList && sizesList.length > 0 ? sizesList : defaultSizes;
  const effectiveColors = colorsList && colorsList.length > 0 ? colorsList : defaultColors;

  const [activeSection, setActiveSection] = useState('general');
  const [imagePreview, setImagePreview] = useState('');
  const [comboSearchQuery, setComboSearchQuery] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const formContainerRef = useRef(null);

  const initialSizing = getCategorySizingOptions(effectiveTypes[0]?.category || 'hoodies', 'unisex');
  const initialSizes = initialSizing.defaultPreset?.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const initialStocksObj = initialSizes.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  const initialDefaultColor = effectiveColors[0]?.name || 'Noir Obsidian';
  const initialDefaultHex = effectiveColors[0]?.hex || '#0a0a0a';

  const [formData, setFormData] = useState({
    name: '',
    brand: effectiveBrands[0]?.name || 'TITULO Studio',
    garmentType: effectiveTypes[0]?.name || 'Hoodies & Buzos',
    category: effectiveTypes[0]?.category || 'hoodies',
    status: 'active', // active | out_of_stock | coming_soon | in_production
    gender: 'unisex', // masculino | femenino | unisex
    collection: '',
    description: '',
    price: '',
    cost: '',
    comparePrice: '',
    stock: 0,
    selectedSizeGroup: initialSizing.defaultPreset?.name || 'Textil Estándar',
    sizes: initialSizes,
    sizeStock: initialStocksObj,
    textileType: '',
    categoryAttributes: {},
    // Múltiples colores seleccionados
    selectedColors: [initialDefaultColor],
    primaryColor: initialDefaultColor,
    activeColorTab: initialDefaultColor,
    // Configuración específica de imagen y existencias por cada color
    colorVariantsConfig: {
      [initialDefaultColor]: {
        image: '',
        size_stock: initialStocksObj,
        color_hex: initialDefaultHex
      }
    },
    // Combos con otros productos
    hasCombo: false,
    comboTitle: '',
    comboProducts: [], // array de IDs de productos enlazados
    comboDiscountPercent: 20,
    image: '',
    badge: 'NUEVO DROP',
    sku: `TTL-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  useEffect(() => {
    if (product) {
      let initialColors = [];
      let initialVariantsConfig = {};

      if (product.color_variants && Array.isArray(product.color_variants) && product.color_variants.length > 0) {
        product.color_variants.forEach((v) => {
          const cName = v.color_name || v.name;
          if (cName) {
            initialColors.push(cName);
            initialVariantsConfig[cName] = {
              image: v.image || product.image || '',
              size_stock: v.size_stock || product.size_stock || product.sizeStock || {},
              color_hex: v.color_hex || v.hex || '#111111'
            };
          }
        });
      } else if (product.group_id && allProducts && allProducts.length > 0) {
        const siblings = allProducts.filter((p) => p.group_id === product.group_id);
        if (siblings.length > 0) {
          siblings.forEach((s) => {
            const cName = s.color_name || s.colorName;
            if (cName && !initialColors.includes(cName)) {
              initialColors.push(cName);
              initialVariantsConfig[cName] = {
                image: s.image || '',
                size_stock: s.size_stock || s.sizeStock || {},
                color_hex: s.color_hex || s.colorHex || '#111111'
              };
            }
          });
        }
      }

      if (initialColors.length === 0) {
        if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
          initialColors = product.colors.map((c) => (typeof c === 'string' ? c : c.name));
        } else if (product.color_name || product.colorName) {
          initialColors = [product.color_name || product.colorName];
        } else {
          initialColors = [effectiveColors[0]?.name || 'Noir Obsidian'];
        }

        const primaryCol = initialColors[0];
        const colObj = effectiveColors.find((c) => c.name === primaryCol);
        initialVariantsConfig[primaryCol] = {
          image: product.image || '',
          size_stock: product.size_stock || product.sizeStock || {},
          color_hex: product.color_hex || product.colorHex || colObj?.hex || '#0a0a0a'
        };
      }

      const currentSizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      initialColors.forEach((cName) => {
        if (!initialVariantsConfig[cName]) {
          const colObj = effectiveColors.find((c) => c.name === cName);
          const defaultStocks = {};
          currentSizes.forEach((s) => { defaultStocks[s] = 0; });
          initialVariantsConfig[cName] = {
            image: product.image || '',
            size_stock: defaultStocks,
            color_hex: colObj?.hex || '#111111'
          };
        }
      });

      const prodCat = product.category || 'hoodies';
      const prodGen = product.gender || 'unisex';
      const sizing = getCategorySizingOptions(prodCat, prodGen);
      const primaryC = initialColors[0] || effectiveColors[0]?.name || 'Noir Obsidian';

      setFormData({
        name: product.name || '',
        brand: product.brand || effectiveBrands[0]?.name || 'TITULO Studio',
        garmentType: product.garmentType || product.category || 'Hoodies & Buzos',
        category: prodCat,
        status: product.status || 'active',
        gender: prodGen,
        collection: product.collection || '',
        description: product.description || '',
        price: product.price ? String(product.price) : '',
        cost: product.cost ? String(product.cost) : '',
        comparePrice: product.comparePrice ? String(product.comparePrice) : '',
        stock: product.stock ?? 0,
        selectedSizeGroup: product.selectedSizeGroup || sizing.defaultPreset?.name || 'Textil Estándar',
        sizes: currentSizes,
        sizeStock: product.size_stock || product.sizeStock || {},
        textileType: product.specs || product.textileType || '',
        categoryAttributes: product.categoryAttributes || {},
        selectedColors: initialColors,
        primaryColor: primaryC,
        activeColorTab: primaryC,
        colorVariantsConfig: initialVariantsConfig,
        hasCombo: Boolean(product.hasCombo || (product.comboProducts && product.comboProducts.length > 0)),
        comboTitle: product.comboTitle || '',
        comboProducts: product.comboProducts || [],
        comboDiscountPercent: product.comboDiscountPercent || 20,
        image: initialVariantsConfig[primaryC]?.image || product.image || '',
        badge: product.badge || 'NUEVO',
        sku: product.sku || `TTL-${product.id}`,
      });
      setImagePreview(initialVariantsConfig[primaryC]?.image || product.image || '');
    } else {
      const defaultCat = effectiveTypes[0]?.category || 'hoodies';
      const defaultType = effectiveTypes[0]?.name || 'Hoodies & Buzos';
      const sizing = getCategorySizingOptions(defaultCat, 'unisex');
      const defaultSizes = sizing.defaultPreset?.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const defaultInitialStocks = defaultSizes.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
      const defaultCol = effectiveColors[0]?.name || 'Noir Obsidian';
      const defaultHex = effectiveColors[0]?.hex || '#0a0a0a';

      setFormData({
        name: '',
        brand: effectiveBrands[0]?.name || 'TITULO Studio',
        garmentType: defaultType,
        category: defaultCat,
        status: 'active',
        gender: 'unisex',
        collection: '',
        description: '',
        price: '',
        cost: '',
        comparePrice: '',
        stock: 0,
        selectedSizeGroup: sizing.defaultPreset?.name || 'Textil Estándar',
        sizes: defaultSizes,
        sizeStock: defaultInitialStocks,
        textileType: '',
        categoryAttributes: {},
        selectedColors: [defaultCol],
        primaryColor: defaultCol,
        activeColorTab: defaultCol,
        colorVariantsConfig: {
          [defaultCol]: {
            image: '',
            size_stock: defaultInitialStocks,
            color_hex: defaultHex
          }
        },
        hasCombo: false,
        comboTitle: '',
        comboProducts: [],
        comboDiscountPercent: 20,
        image: '',
        badge: 'NUEVO DROP',
        sku: `TTL-${Math.floor(1000 + Math.random() * 9000)}`,
      });
      setImagePreview('');
    }
  }, [product, open]);

  if (!open) return null;

  // Desplazamiento suave hacia la sección
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Manejo de Subida de Archivo de Imagen General
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        const curTab = formData.activeColorTab || formData.primaryColor;
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
          colorVariantsConfig: {
            ...prev.colorVariantsConfig,
            [curTab]: {
              ...prev.colorVariantsConfig[curTab],
              image: reader.result
            }
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejo de Subida de Archivo para un Color Específico
  const handleColorImageUpload = (colorName, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        setFormData((prev) => ({
          ...prev,
          image: colorName === prev.primaryColor ? dataUrl : prev.image,
          colorVariantsConfig: {
            ...prev.colorVariantsConfig,
            [colorName]: {
              ...prev.colorVariantsConfig[colorName],
              image: dataUrl
            }
          }
        }));
        if (colorName === (formData.activeColorTab || formData.primaryColor)) {
          setImagePreview(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejo de URL para un Color Específico
  const handleColorImageUrlChange = (colorName, url) => {
    setFormData((prev) => ({
      ...prev,
      image: colorName === prev.primaryColor ? url : prev.image,
      colorVariantsConfig: {
        ...prev.colorVariantsConfig,
        [colorName]: {
          ...prev.colorVariantsConfig[colorName],
          image: url
        }
      }
    }));
    if (colorName === (formData.activeColorTab || formData.primaryColor)) {
      setImagePreview(url);
    }
  };

  // Manejo de Existencias por Talla para un Color Específico
  const handleColorSizeStockChange = (colorName, size, val) => {
    const qty = Math.max(0, parseInt(val, 10) || 0);
    setFormData((prev) => {
      const currentConfig = prev.colorVariantsConfig[colorName] || {};
      const currentStocks = currentConfig.size_stock || {};
      const nextStocks = { ...currentStocks, [size]: qty };

      const nextConfig = {
        ...prev.colorVariantsConfig,
        [colorName]: {
          ...currentConfig,
          size_stock: nextStocks
        }
      };

      let grandTotal = 0;
      prev.selectedColors.forEach((c) => {
        const cStk = nextConfig[c]?.size_stock || {};
        grandTotal += Object.values(cStk).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);
      });

      return {
        ...prev,
        colorVariantsConfig: nextConfig,
        sizeStock: colorName === prev.primaryColor ? nextStocks : prev.sizeStock,
        stock: grandTotal
      };
    });
  };

  // Rellenar todas las tallas de un color
  const handleAutofillColorStock = (colorName, qty) => {
    setFormData((prev) => {
      const nextStocks = {};
      prev.sizes.forEach((s) => {
        nextStocks[s] = qty;
      });

      const nextConfig = {
        ...prev.colorVariantsConfig,
        [colorName]: {
          ...prev.colorVariantsConfig[colorName],
          size_stock: nextStocks
        }
      };

      let grandTotal = 0;
      prev.selectedColors.forEach((c) => {
        const cStk = nextConfig[c]?.size_stock || {};
        grandTotal += Object.values(cStk).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);
      });

      return {
        ...prev,
        colorVariantsConfig: nextConfig,
        stock: grandTotal
      };
    });
  };

  // Copiar el inventario de un color a todos los demás colores activos
  const handleCopyStockToAllColors = (sourceColorName) => {
    setFormData((prev) => {
      const sourceStocks = prev.colorVariantsConfig[sourceColorName]?.size_stock || {};
      const nextConfig = { ...prev.colorVariantsConfig };

      prev.selectedColors.forEach((c) => {
        if (c !== sourceColorName) {
          nextConfig[c] = {
            ...nextConfig[c],
            size_stock: { ...sourceStocks }
          };
        }
      });

      let grandTotal = 0;
      prev.selectedColors.forEach((c) => {
        const cStk = nextConfig[c]?.size_stock || {};
        grandTotal += Object.values(cStk).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);
      });

      return {
        ...prev,
        colorVariantsConfig: nextConfig,
        stock: grandTotal
      };
    });
  };

  // Información dinámica de tallajes y atributos según la categoría y género
  const activeSizingInfo = getCategorySizingOptions(formData.category, formData.gender);

  // Cambio coordinado de Categoría o Género con reasignación inteligente de tallaje
  const handleCategoryOrGenderChange = (newCatSlug, newTypeName, newGenderVal) => {
    const nextCat = newCatSlug !== undefined ? newCatSlug : formData.category;
    const nextType = newTypeName !== undefined ? newTypeName : formData.garmentType;
    const nextGen = newGenderVal !== undefined ? newGenderVal : formData.gender;

    const sizingInfo = getCategorySizingOptions(nextCat, nextGen);
    const recommendedPreset = sizingInfo.defaultPreset;
    const newSizes = recommendedPreset ? recommendedPreset.sizes : ['S', 'M', 'L', 'XL'];

    setFormData((prev) => {
      const nextConfig = { ...prev.colorVariantsConfig };
      prev.selectedColors.forEach((c) => {
        const curStocks = prev.colorVariantsConfig[c]?.size_stock || {};
        const nextStocks = {};
        newSizes.forEach((s) => {
          nextStocks[s] = curStocks[s] ?? 0;
        });
        nextConfig[c] = {
          ...nextConfig[c],
          size_stock: nextStocks
        };
      });

      let grandTotal = 0;
      prev.selectedColors.forEach((c) => {
        const cStk = nextConfig[c]?.size_stock || {};
        grandTotal += Object.values(cStk).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);
      });

      return {
        ...prev,
        category: nextCat,
        garmentType: nextType,
        gender: nextGen,
        selectedSizeGroup: recommendedPreset ? recommendedPreset.name : prev.selectedSizeGroup,
        sizes: newSizes,
        colorVariantsConfig: nextConfig,
        stock: grandTotal
      };
    });
  };

  // Cambio de Sistema de Tallaje Predefinido
  const handleSizingPresetSelect = (preset) => {
    if (!preset || !preset.sizes) return;
    const newSizes = preset.sizes;

    setFormData((prev) => {
      const nextConfig = { ...prev.colorVariantsConfig };
      prev.selectedColors.forEach((c) => {
        const curStocks = prev.colorVariantsConfig[c]?.size_stock || {};
        const nextStocks = {};
        newSizes.forEach((s) => {
          nextStocks[s] = curStocks[s] ?? 0;
        });
        nextConfig[c] = {
          ...nextConfig[c],
          size_stock: nextStocks
        };
      });

      let grandTotal = 0;
      prev.selectedColors.forEach((c) => {
        const cStk = nextConfig[c]?.size_stock || {};
        grandTotal += Object.values(cStk).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);
      });

      return {
        ...prev,
        selectedSizeGroup: preset.name,
        sizes: newSizes,
        colorVariantsConfig: nextConfig,
        stock: grandTotal
      };
    });
  };

  // Añadir Talla Personalizada
  const handleAddCustomSize = (sizeInput) => {
    const clean = (sizeInput || '').trim().toUpperCase();
    if (!clean || formData.sizes.includes(clean)) return;

    const newSizes = [...formData.sizes, clean];
    setFormData((prev) => {
      const nextConfig = { ...prev.colorVariantsConfig };
      prev.selectedColors.forEach((c) => {
        const curStocks = prev.colorVariantsConfig[c]?.size_stock || {};
        nextConfig[c] = {
          ...nextConfig[c],
          size_stock: {
            ...curStocks,
            [clean]: 0
          }
        };
      });

      return {
        ...prev,
        sizes: newSizes,
        colorVariantsConfig: nextConfig
      };
    });
    setCustomSizeInput('');
  };

  // Eliminar Talla del Set Activo
  const handleRemoveSize = (sizeToRemove) => {
    if (formData.sizes.length <= 1) return; // Mantener al menos una talla
    const newSizes = formData.sizes.filter((s) => s !== sizeToRemove);

    setFormData((prev) => {
      const nextConfig = { ...prev.colorVariantsConfig };
      prev.selectedColors.forEach((c) => {
        const curStocks = { ...(prev.colorVariantsConfig[c]?.size_stock || {}) };
        delete curStocks[sizeToRemove];
        nextConfig[c] = {
          ...nextConfig[c],
          size_stock: curStocks
        };
      });

      let grandTotal = 0;
      prev.selectedColors.forEach((c) => {
        const cStk = nextConfig[c]?.size_stock || {};
        grandTotal += Object.values(cStk).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);
      });

      return {
        ...prev,
        sizes: newSizes,
        colorVariantsConfig: nextConfig,
        stock: grandTotal
      };
    });
  };

  // Modificación de Atributo Contextual
  const handleAttributeChange = (fieldId, val) => {
    setFormData((prev) => ({
      ...prev,
      categoryAttributes: {
        ...(prev.categoryAttributes || {}),
        [fieldId]: val
      }
    }));
  };

  // Compatibilidad hacia atrás de cambio de grupo
  const handleSizeGroupChange = (groupName) => {
    const foundGroup = effectiveSizesList.find((g) => g.name === groupName);
    const newSizes = foundGroup ? foundGroup.sizes : ['S', 'M', 'L'];
    
    setFormData((prev) => {
      const nextConfig = { ...prev.colorVariantsConfig };
      prev.selectedColors.forEach((c) => {
        const initialStocks = {};
        newSizes.forEach((s) => {
          initialStocks[s] = prev.colorVariantsConfig[c]?.size_stock?.[s] ?? 0;
        });
        nextConfig[c] = {
          ...nextConfig[c],
          size_stock: initialStocks
        };
      });

      let grandTotal = 0;
      prev.selectedColors.forEach((c) => {
        grandTotal += Object.values(nextConfig[c].size_stock).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);
      });

      return {
        ...prev,
        selectedSizeGroup: groupName,
        sizes: newSizes,
        colorVariantsConfig: nextConfig,
        stock: grandTotal
      };
    });
  };

  // Toggle de Selección de Múltiples Colores
  const toggleColorSelection = (colorName) => {
    const colObj = effectiveColors.find((c) => c.name === colorName);
    setFormData((prev) => {
      const exists = prev.selectedColors.includes(colorName);
      let updated;
      const nextConfig = { ...prev.colorVariantsConfig };

      if (exists) {
        if (prev.selectedColors.length <= 1) return prev; // Al menos un color
        updated = prev.selectedColors.filter((c) => c !== colorName);
        delete nextConfig[colorName];
      } else {
        updated = [...prev.selectedColors, colorName];
        if (!nextConfig[colorName]) {
          const defaultStocks = {};
          prev.sizes.forEach((s) => { defaultStocks[s] = 0; });
          nextConfig[colorName] = {
            image: '',
            size_stock: defaultStocks,
            color_hex: colObj?.hex || '#111111'
          };
        }
      }

      const nextPrimary = updated.includes(prev.primaryColor) ? prev.primaryColor : updated[0];
      const nextTab = updated.includes(prev.activeColorTab) ? prev.activeColorTab : updated[0];

      let grandTotal = 0;
      updated.forEach((c) => {
        const cStk = nextConfig[c]?.size_stock || {};
        grandTotal += Object.values(cStk).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);
      });

      return {
        ...prev,
        selectedColors: updated,
        primaryColor: nextPrimary,
        activeColorTab: nextTab,
        colorVariantsConfig: nextConfig,
        stock: grandTotal
      };
    });
  };

  // Toggle de Productos en el Combo
  const toggleComboProduct = (productId) => {
    setFormData((prev) => {
      const exists = prev.comboProducts.includes(productId);
      const updated = exists
        ? prev.comboProducts.filter((id) => id !== productId)
        : [...prev.comboProducts, productId];
      return {
        ...prev,
        comboProducts: updated,
      };
    });
  };

  // Cálculo en Vivo de Margen y Ganancia
  const priceVal = parseFloat(formData.price) || 0;
  const costVal = parseFloat(formData.cost) || 0;
  const marginPercent = priceVal > 0 && costVal > 0 ? (((priceVal - costVal) / priceVal) * 100).toFixed(1) : 0;
  const profitAmount = priceVal > 0 ? (priceVal - costVal).toFixed(2) : '0.00';

  // Productos disponibles para combo (excluyendo el que se está editando)
  const availableForCombo = allProducts.filter((p) => p.id !== product?.id);

  // Cálculos del Combo
  const linkedComboItems = allProducts.filter((p) => formData.comboProducts.includes(p.id));
  const comboSumRegular = priceVal + linkedComboItems.reduce((acc, it) => acc + (parseFloat(it.price) || 0), 0);
  const comboDiscountMultiplier = (100 - (formData.comboDiscountPercent || 0)) / 100;
  const comboFinalPrice = (comboSumRegular * comboDiscountMultiplier).toFixed(2);
  const comboSavings = (comboSumRegular - parseFloat(comboFinalPrice)).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const selectedTypeObj = effectiveTypes.find((t) => t.name === formData.garmentType || t.category === formData.category);
    const categorySlug = selectedTypeObj?.category || (formData.category ? formData.category.toLowerCase() : 'hoodies');

    // Construcción completa del arreglo de variantes de color con imagen y stock por talla
    const variantsArray = formData.selectedColors.map((colorName, idx) => {
      const cfg = formData.colorVariantsConfig[colorName] || {};
      const colObj = effectiveColors.find((c) => c.name === colorName);
      const cHex = cfg.color_hex || colObj?.hex || '#111111';
      const cImg = cfg.image || formData.image || '';
      const cSizeStock = cfg.size_stock || formData.sizeStock || {};
      const cTotal = Object.values(cSizeStock).reduce((sum, n) => sum + (parseInt(n, 10) || 0), 0);

      return {
        id: idx === 0 ? (product?.id || `app-${Date.now()}`) : `${product?.id || `app-${Date.now()}`}-${colorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        color_name: colorName,
        color_hex: cHex,
        image: cImg,
        size_stock: cSizeStock,
        sizes: Object.keys(cSizeStock).length > 0 ? Object.keys(cSizeStock) : formData.sizes,
        stock: cTotal
      };
    });

    const primaryCfg = formData.colorVariantsConfig[formData.primaryColor] || variantsArray[0] || {};
    const totalAllStock = variantsArray.reduce((acc, v) => acc + v.stock, 0);
    const baseGroupId = product?.group_id || `grp-${formData.sku ? formData.sku.toLowerCase() : Date.now()}`;

    const attrTexts = Object.entries(formData.categoryAttributes || {})
      .filter(([_, val]) => Boolean(val))
      .map(([_, val]) => val);
    const combinedSpecs = [formData.textileType, ...attrTexts].filter(Boolean).join(' • ');

    onSave({
      id: product?.id || `app-${Date.now()}`,
      group_id: baseGroupId,
      ...formData,
      category: categorySlug,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
      stock: totalAllStock || parseInt(formData.stock, 10) || 0,
      specs: combinedSpecs || formData.textileType,
      categoryAttributes: formData.categoryAttributes || {},
      colors: formData.selectedColors.map((cName) => {
        const col = effectiveColors.find((c) => c.name === cName);
        return { name: cName, hex: col?.hex || '#111111' };
      }),
      colorName: formData.primaryColor,
      color_name: formData.primaryColor,
      color_hex: primaryCfg.color_hex || effectiveColors.find((c) => c.name === formData.primaryColor)?.hex || '#0a0a0a',
      image: primaryCfg.image || formData.image || '',
      size_stock: primaryCfg.size_stock || formData.sizeStock,
      color_variants: variantsArray,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop con Blur Centrado */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Centrado Unificado */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Superior */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white shadow-sm">
              <Scissors size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Formulario Unificado • KAMIL SHOP
              </p>
              <h2 className="text-lg font-black text-slate-900">
                {product ? `Editar: ${product.name}` : 'Creación de Nueva Prenda'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Navegación de Secciones Unificadas (Anclas sin scroll cortado) */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 px-6 py-2.5 bg-slate-50/70 overflow-x-auto shrink-0">
          <span className="text-[10px] font-black uppercase text-slate-400 mr-2 tracking-wider">
            Secciones:
          </span>
          {[
            { id: 'sec-general', label: '1. General & Marca' },
            { id: 'sec-pricing', label: '2. Margen & Precios' },
            { id: 'sec-sizes-colors', label: '3. Tallas, Stock & Colores' },
            { id: 'sec-combos', label: '4. Combos & Promociones' },
            { id: 'sec-media', label: '5. Multimedia & Ficha' },
          ].map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSection === sec.id
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Cuerpo del Formulario Unificado en Flujo Continuo */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto" ref={formContainerRef}>
          <div className="p-6 space-y-8">
            {/* SECCIÓN 1: GENERAL & MARCA */}
            <section id="sec-general" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-slate-950 text-white text-[11px] font-black">
                  1
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  Identidad de la Prenda y Clasificación
                </h3>
              </div>

              <div>
                <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Nombre de la Prenda *</span>
                  <AdminHelpBadge text="El nombre comercial que verá el cliente en la tienda y en su recibo (ej. Buzo Oversize Heavyweight)." />
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Buzo Oversize Heavyweight, Zapatillas Running Pro, Pantalón Cargo"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Desplegable de Marca */}
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Marca de Moda *</span>
                    <AdminHelpBadge text="La marca a la que pertenece esta prenda (ej. TITULO Studio, Atelier Kamil Shop)." />
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                  >
                    {effectiveBrands.map((b) => (
                      <option key={b.name || b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Desplegable de Categoría */}
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Tipo o Categoría de Prenda *</span>
                    <AdminHelpBadge text="Sirve para que los clientes puedan filtrar la prenda en la tienda (Buzos, Chaquetas, Pantalones, etc.)." />
                  </label>
                  <select
                    value={formData.garmentType}
                    onChange={(e) => {
                      const selectedType = effectiveTypes.find((t) => t.name === e.target.value);
                      const cat = selectedType?.category || e.target.value;
                      handleCategoryOrGenderChange(cat, e.target.value, formData.gender);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                  >
                    {effectiveTypes.map((t) => (
                      <option key={t.name || t.id} value={t.name}>
                        {t.name} ({t.category || 'General'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Estado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado en Tienda *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                  >
                    <option value="active">Activo (Disponible)</option>
                    <option value="out_of_stock">Agotado</option>
                    <option value="coming_soon">Próximo Drop</option>
                    <option value="in_production">En Producción</option>
                  </select>
                </div>

                {/* Género */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Género *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => {
                      handleCategoryOrGenderChange(formData.category, formData.garmentType, e.target.value);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>

                {/* Colección */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Colección o Drop
                  </label>
                  <input
                    type="text"
                    value={formData.collection}
                    onChange={(e) => setFormData((prev) => ({ ...prev, collection: e.target.value }))}
                    placeholder="Ej. Drop 01 — Brutalism"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {/* DESGLOSE CONTEXTUAL DE ATRIBUTOS SEGÚN CATEGORÍA */}
              {activeSizingInfo.attributes && activeSizingInfo.attributes.fields && activeSizingInfo.attributes.fields.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-900" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                      {activeSizingInfo.attributes.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {activeSizingInfo.attributes.fields.map((fld) => (
                      <div key={fld.id}>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          {fld.label}
                        </label>
                        <select
                          value={formData.categoryAttributes?.[fld.id] || ''}
                          onChange={(e) => handleAttributeChange(fld.id, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                        >
                          <option value="">-- {fld.placeholder} --</option>
                          {fld.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* SECCIÓN 2: MARGEN & PRECIOS */}
            <section id="sec-pricing" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-slate-950 text-white text-[11px] font-black">
                  2
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  Precios de Venta y Margen de Utilidad
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Precio de Venta ($) *</span>
                    <AdminHelpBadge text="El precio en dólares que el cliente pagará por esta prenda en la tienda." />
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-xs font-black text-slate-900 outline-none focus:border-slate-900"
                  />
                  {priceVal > 0 && (
                    <p className="mt-1 text-[10px] font-mono text-slate-500">
                      Vista previa: <strong className="text-slate-900">{formatPriceDual(priceVal)}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Precio Costo / Compra ($) *</span>
                    <AdminHelpBadge text="Lo que te costó fabricar la prenda o comprarla al proveedor. Se usa para saber tu ganancia real." />
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                  />
                  {costVal > 0 && (
                    <p className="mt-1 text-[10px] font-mono text-slate-500">
                      Vista previa: <strong className="text-slate-900">{formatPriceDual(costVal)}</strong>
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Precio Antes / Rebaja ($)</span>
                    <AdminHelpBadge text="Precio tachado anterior (opcional). Si lo llenas, la tienda mostrará el porcentaje de descuento que tiene la prenda." />
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, comparePrice: e.target.value }))}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-mono text-xs font-medium text-slate-400 outline-none focus:border-slate-900"
                  />
                  {parseFloat(formData.comparePrice) > 0 && (
                    <p className="mt-1 text-[10px] font-mono text-slate-500">
                      Vista previa: <strong className="text-slate-900">{formatPriceDual(formData.comparePrice)}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Cálculo de Margen en Vivo */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-950">Rentabilidad y Margen Bruto</p>
                  <p className="text-[11px] text-emerald-800">
                    Cálculo en vivo: margen (%) y utilidad neta obtenida por prenda vendida.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-700">{marginPercent}%</span>
                  <p className="text-xs font-bold text-emerald-900">+{formatUSD(profitAmount)} de ganancia (≈ {formatCOP(profitAmount)})</p>
                </div>
              </div>
            </section>

            {/* SECCIÓN 3: TALLAS, STOCK & MÚLTIPLES COLORES */}
            <section id="sec-sizes-colors" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-slate-950 text-white text-[11px] font-black">
                    3
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Tallas, Stock y Múltiples Colores con Fotografía Independiente
                    </h3>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                  Total Inventario: {formData.stock} unidades
                </span>
              </div>

              {/* PANEL DE ESPECIALIZACIÓN DE TALLAS SEGÚN CATEGORÍA Y GÉNERO */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-900 text-white shadow-2xs">
                      <Ruler size={14} />
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900">
                          Sistema de Tallaje:
                        </span>
                        <span className="inline-block rounded-md bg-slate-950 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {formData.category}
                        </span>
                        <span className="inline-block rounded-md bg-slate-200 text-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {formData.gender}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {formData.selectedSizeGroup || 'Tallas especializadas según categoría y género.'}
                      </p>
                    </div>
                  </div>

                  {/* Selector / Conmutador Rápido de Presets */}
                  {activeSizingInfo.presets && activeSizingInfo.presets.length > 1 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alternar Sistema:</span>
                      {activeSizingInfo.presets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSizingPresetSelect(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                            formData.selectedSizeGroup === preset.name
                              ? 'bg-slate-950 text-white border-slate-950 shadow-xs ring-2 ring-slate-950/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {preset.type} ({preset.sizes[0]} - {preset.sizes[preset.sizes.length - 1]})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tallas Activas con Chips y opción de Quitar */}
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-800">
                      Tallas Habilitadas ({formData.sizes.length} tallas activas):
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Haz clic en la '✕' de una talla para excluirla de este producto
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {formData.sizes.map((sz) => (
                      <span
                        key={sz}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-900 shadow-2xs group"
                      >
                        <span>{sz}</span>
                        {formData.sizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(sz)}
                            className="text-slate-300 hover:text-rose-600 transition cursor-pointer"
                            title={`Excluir talla ${sz}`}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    ))}

                    {/* Añadir Talla Personalizada */}
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={customSizeInput}
                        onChange={(e) => setCustomSizeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSize(customSizeInput);
                          }
                        }}
                        placeholder="Ej. 46, 31..."
                        className="w-24 rounded-lg border border-dashed border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomSize(customSizeInput)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition cursor-pointer flex items-center gap-1"
                        title="Añadir talla personalizada"
                      >
                        <Plus size={12} />
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SELECTOR DE MÚLTIPLES COLORES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="flex items-center text-xs font-black text-slate-900">
                      <span>Colores Disponibles para esta Prenda (Selecciona Varios) *</span>
                      <AdminHelpBadge text="Marca todos los colores que manejas de esta prenda. Podrás subir una fotografía y definir el inventario por talla para cada color elegido." />
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Haz clic en los colores disponibles para activarlos o desactivarlos.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-black text-slate-800 border border-slate-200">
                    {formData.selectedColors.length} colores activos
                  </span>
                </div>

                {/* Chips Multi-Color Interactivos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {effectiveColors.map((c) => {
                    const isSelected = formData.selectedColors.includes(c.name);

                    return (
                      <div
                        key={c.name}
                        onClick={() => toggleColorSelection(c.name)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="h-5 w-5 rounded-full border border-white/20 shrink-0 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="truncate">{c.name}</span>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 ml-1" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-slate-300 shrink-0 ml-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CONFIGURACIÓN DETALLADA POR COLOR: IMAGEN Y STOCK POR TALLA */}
              {(() => {
                const activeColor = formData.activeColorTab || formData.primaryColor || formData.selectedColors[0] || 'Noir Obsidian';
                const activeColorConfig = formData.colorVariantsConfig[activeColor] || {};
                const activeColObj = effectiveColors.find((c) => c.name === activeColor);
                const activeColorUnits = Object.values(activeColorConfig.size_stock || {}).reduce((s, n) => s + (parseInt(n, 10) || 0), 0);

                return (
                  <div className="border-t border-slate-200 pt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <Palette size={14} className="text-slate-700" />
                          <span>Configuración Individual por Color (Fotografía & Tallas)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Selecciona un color para cargar su foto específica y definir sus existencias por talla.
                        </p>
                      </div>

                      {/* Selector de Color Principal */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500">Color Principal:</span>
                        <select
                          value={formData.primaryColor}
                          onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 outline-none"
                        >
                          {formData.selectedColors.map((cName) => (
                            <option key={cName} value={cName}>
                              {cName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Pestañas de Colores Seleccionados */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {formData.selectedColors.map((cName) => {
                        const colObj = effectiveColors.find((c) => c.name === cName);
                        const cfg = formData.colorVariantsConfig[cName] || {};
                        const cStock = Object.values(cfg.size_stock || {}).reduce((s, n) => s + (parseInt(n, 10) || 0), 0);
                        const isTabActive = activeColor === cName;

                        return (
                          <button
                            key={cName}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, activeColorTab: cName }))}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap ${
                              isTabActive
                                ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-white/30 shrink-0"
                              style={{ backgroundColor: cfg.color_hex || colObj?.hex || '#111' }}
                            />
                            <span>{cName}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black ${isTabActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              {cStock} un
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Panel del Color Activo */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-4">
                      {/* Barra de Herramientas del Color */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-6 w-6 rounded-full border border-slate-300 shadow-xs shrink-0"
                            style={{ backgroundColor: activeColorConfig.color_hex || activeColObj?.hex || '#111' }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900">Color Activo: {activeColor}</span>
                              {formData.primaryColor === activeColor && (
                                <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5">
                                  COLOR PRINCIPAL TIENDA
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Los clientes verán esta imagen al seleccionar el color {activeColor}.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleAutofillColorStock(activeColor, 5)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
                          >
                            Fijar 5 a todas las tallas
                          </button>
                          {formData.selectedColors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleCopyStockToAllColors(activeColor)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
                            >
                              Copiar tallas a los demás colores
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Grilla 2 Columnas: Fotografía y Existencias por Talla */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Columna Izquierda: Fotografía de este Color (5 cols) */}
                        <div className="md:col-span-5 space-y-3">
                          <label className="block text-xs font-bold text-slate-800">
                            Fotografía para {activeColor} *
                          </label>

                          {/* Vista Previa y Botón de Subida */}
                          <div className="flex items-center gap-3">
                            {activeColorConfig.image ? (
                              <div className="relative group shrink-0">
                                <img
                                  src={activeColorConfig.image}
                                  alt={activeColor}
                                  className="h-20 w-20 rounded-xl object-cover border border-slate-200 shadow-sm bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleColorImageUrlChange(activeColor, '')}
                                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition shadow cursor-pointer"
                                  title="Quitar foto"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0">
                                <ImageIcon size={22} className="stroke-[1.5]" />
                                <span className="text-[9px] font-bold text-slate-400 mt-1">Sin foto</span>
                              </div>
                            )}

                            <div className="space-y-1.5 min-w-0 flex-1">
                              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-black cursor-pointer shadow-xs transition">
                                <Upload size={13} />
                                <span>{activeColorConfig.image ? `Cambiar Foto (${activeColor})` : `Subir Foto (${activeColor})`}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleColorImageUpload(activeColor, e.target.files?.[0])}
                                  className="hidden"
                                />
                              </label>
                              <p className="text-[10px] text-slate-500">
                                PNG, JPG o WEBP en alta definición.
                              </p>
                            </div>
                          </div>

                          {/* URL Directa */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                              O URL Externa de la Foto:
                            </label>
                            <input
                              type="text"
                              value={activeColorConfig.image || ''}
                              onChange={(e) => handleColorImageUrlChange(activeColor, e.target.value)}
                              placeholder="https://... o ruta de archivo"
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-800 outline-none focus:border-slate-900"
                            />
                          </div>
                        </div>

                        {/* Columna Derecha: Existencias por Talla para este Color (7 cols) */}
                        <div className="md:col-span-7 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800">
                              Existencias en Bodega para {activeColor}
                            </label>
                            <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              Total {activeColor}: {activeColorUnits} prendas
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {formData.sizes.map((sz) => (
                              <div
                                key={sz}
                                className="rounded-xl border border-slate-200 bg-white p-2.5 flex items-center justify-between shadow-2xs"
                              >
                                <span className="font-mono text-xs font-black text-slate-800">Talla {sz}</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={activeColorConfig.size_stock?.[sz] ?? 0}
                                    onChange={(e) => handleColorSizeStockChange(activeColor, sz, e.target.value)}
                                    className="w-12 rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-1 text-center font-mono text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                                  />
                                  <span className="text-[10px] text-slate-400">un</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* SECCIÓN 4: COMBOS & ENLACE DE OTROS PRODUCTOS */}
            <section id="sec-combos" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-slate-950 text-white text-[11px] font-black">
                    4
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Combos y Enlace con Otros Productos del Catálogo
                    </h3>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasCombo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hasCombo: e.target.checked }))}
                    className="h-4 w-4 rounded accent-slate-950"
                  />
                  <span className="text-xs font-bold text-slate-800">Activar Combo</span>
                </label>
              </div>

              {formData.hasCombo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                        <span>Nombre o Título del Combo *</span>
                        <AdminHelpBadge text="El nombre comercial del paquete en la tienda (ej. Set Completo Streetwear Buzo + Pantalón)." />
                      </label>
                      <input
                        type="text"
                        value={formData.comboTitle}
                        onChange={(e) => setFormData((prev) => ({ ...prev, comboTitle: e.target.value }))}
                        placeholder="Ej. Set Completo Streetwear (Buzo + Cargo Pants)"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-xs font-bold text-slate-700 mb-1">
                        <span>Descuento del Combo (%)</span>
                        <AdminHelpBadge text="Porcentaje de rebaja que se le da al cliente si lleva las prendas juntas (ej. 15% OFF)." />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="5"
                          max="80"
                          value={formData.comboDiscountPercent}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              comboDiscountPercent: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 outline-none focus:border-slate-900"
                        />
                        <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">% OFF</span>
                      </div>
                    </div>
                  </div>

                  {/* Selector de Productos del Catálogo para el Combo */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black text-slate-900">
                        Selecciona las Prendas con las que se Enlaza ({formData.comboProducts.length} añadidas)
                      </label>
                      <div className="relative w-48">
                        <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
                        <input
                          type="text"
                          value={comboSearchQuery}
                          onChange={(e) => setComboSearchQuery(e.target.value)}
                          placeholder="Buscar prenda..."
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-7 pr-2 py-1 text-[11px] text-slate-800 outline-none focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
                      {availableForCombo
                        .filter((p) =>
                          !comboSearchQuery || p.name.toLowerCase().includes(comboSearchQuery.toLowerCase())
                        )
                        .map((cp) => {
                          const isLinked = formData.comboProducts.includes(cp.id);
                          return (
                            <div
                              key={cp.id}
                              onClick={() => toggleComboProduct(cp.id)}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                                isLinked
                                  ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {cp.image ? (
                                  <img
                                    src={cp.image}
                                    alt={cp.name}
                                    className="h-9 w-9 rounded-lg object-cover shrink-0 border border-white/10"
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                    <Scissors size={14} />
                                  </div>
                                )}
                                <div className="truncate">
                                  <p className="font-bold truncate">{cp.name}</p>
                                  <p className={`text-[10px] ${isLinked ? 'text-slate-300' : 'text-slate-400'}`}>
                                    {formatUSD(cp.price || 0)} (≈ {formatCOP(cp.price || 0)}) • {cp.brand || 'TITULO'}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`h-5 w-5 rounded-md flex items-center justify-center text-xs font-black ${
                                  isLinked ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-slate-50 text-transparent'
                                }`}
                              >
                                ✓
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Resumen del Combo */}
                  {formData.comboProducts.length > 0 && (
                    <div className="rounded-2xl border border-slate-300 bg-slate-100 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-black text-slate-950">
                          {formData.comboTitle || 'Combo Especial de Colección'}
                        </p>
                        <p className="text-[11px] text-slate-700 mt-0.5">
                          Incluye esta prenda + {formData.comboProducts.length} prenda(s) enlazada(s).
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-[10px] text-slate-400 line-through">
                            Normal: {formatUSD(comboSumRegular)} (≈ {formatCOP(comboSumRegular)})
                          </p>
                          <p className="font-mono text-sm font-black text-slate-900">
                            Combo: {formatUSD(comboFinalPrice)} (≈ {formatCOP(comboFinalPrice)})
                          </p>
                        </div>
                        <span className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-1 text-[11px] font-black text-white">
                          Ahorra {formatUSD(comboSavings)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Activa la casilla para crear un combo o conjunto con otras prendas del catálogo.
                </p>
              )}
            </section>

            {/* SECCIÓN 5: MULTIMEDIA, FICHA TEXTIL & DESCRIPCIÓN */}
            <section id="sec-media" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-slate-950 text-white text-[11px] font-black">
                  5
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  Fotografía de la Prenda y Ficha Textil
                </h3>
              </div>

              {/* Subida de Imagen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subir Imagen desde el Dispositivo *
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition">
                    <Upload size={20} className="text-slate-500 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Seleccionar archivo de imagen</span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <div className="mt-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-0.5">
                      O URL Externa de la Imagen
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, image: e.target.value }));
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://... o assets/products/..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Previsualización Activa */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {imagePreview ? (
                    <div className="text-center">
                      <img
                        src={imagePreview}
                        alt="Previsualización"
                        className="h-28 w-28 rounded-xl object-cover border border-slate-200 mx-auto shadow-xs"
                      />
                      <p className="mt-1 text-[11px] font-bold text-slate-700">Vista Previa Catálogo</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Sin imagen seleccionada</p>
                  )}
                </div>
              </div>

              {/* Galería Resumen de Todas las Variantes de Color Configuradas */}
              {formData.selectedColors.length > 0 && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900">
                      Variantes de Color Configuradas ({formData.selectedColors.length} colores con fotografía y tallas)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Haz clic en cualquier variante para editar su foto o stock
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {formData.selectedColors.map((cName) => {
                      const cfg = formData.colorVariantsConfig[cName] || {};
                      const colObj = effectiveColors.find((c) => c.name === cName);
                      const cUnits = Object.values(cfg.size_stock || {}).reduce((s, n) => s + (parseInt(n, 10) || 0), 0);
                      const isPrimary = formData.primaryColor === cName;

                      return (
                        <div
                          key={cName}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, activeColorTab: cName }));
                            scrollToSection('sec-sizes-colors');
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                            isPrimary
                              ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-400 text-slate-800'
                          }`}
                        >
                          {cfg.image ? (
                            <img
                              src={cfg.image}
                              alt={cName}
                              className="h-10 w-10 rounded-lg object-cover border border-white/20 bg-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-xs"
                                style={{ backgroundColor: cfg.color_hex || colObj?.hex || '#111' }}
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2.5 w-2.5 rounded-full border border-white/30 shrink-0"
                                style={{ backgroundColor: cfg.color_hex || colObj?.hex || '#111' }}
                              />
                              <p className="font-bold text-[11px] truncate">{cName}</p>
                            </div>
                            <p className={`font-mono text-[10px] ${isPrimary ? 'text-slate-300' : 'text-slate-500'}`}>
                              {cUnits} un {isPrimary ? '• Principal' : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ficha Textil & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo Textil y Composición *
                  </label>
                  <input
                    type="text"
                    value={formData.textileType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, textileType: e.target.value }))}
                    placeholder="Ej. 100% Algodón Peinado • 480 GSM • Poliéster Dry-Fit"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Etiqueta / Badge en Tienda
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value.toUpperCase() }))}
                    placeholder="NUEVO DROP, EXCLUSIVO, BEST SELLER"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-slate-900 uppercase"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Silueta, corte, recomendaciones de uso y detalles de confección..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
                />
              </div>
            </section>
          </div>

          {/* Footer Acciones */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/90 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                SKU: <span className="font-mono font-bold text-slate-800">{formData.sku}</span>
              </span>

              {product && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition cursor-pointer ml-2"
                  title="Eliminar esta prenda permanentemente"
                >
                  <Trash2 size={13} />
                  <span>Eliminar Prenda</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-black text-white hover:bg-black shadow-md transition cursor-pointer"
              >
                <Save size={15} />
                <span>{product ? 'Guardar Prenda' : 'Crear y Publicar Prenda'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    
      {/* Modal Confirmación Borrar Prenda desde Formulario */}
      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={() => {
          if (product && onDelete) {
            onDelete(product);
            setShowConfirmDelete(false);
            onClose?.();
          }
        }}
        title="¿Estás seguro de eliminar esta prenda del catálogo?"
        itemName={product?.name}
        description="Esta acción no se puede deshacer y borrará permanentemente el producto y todas sus variantes de Kamil Shop."
      />

    </div>
  );
}
