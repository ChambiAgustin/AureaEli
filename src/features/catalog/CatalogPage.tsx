import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Product } from '../../core/api/IRepository';
import { useProducts } from '../../core/hooks/useProducts';
import { useCategories } from '../../core/hooks/useCategories';
import { useContentBlocks } from '../../core/hooks/useContentBlocks';
import { useCart } from '../../core/context/CartContext';
import { useFavorites } from '../../core/context/FavoritesContext';
import { useSEO } from '../../core/seo/useSEO';
import { HapticsService } from '../../core/services/HapticsService';
import Typography from '../../shared/components/Typography';
import ProductDetail from './ProductDetail';
import CatalogFilters, { type IntentionType, type SortOptionType } from './components/CatalogFilters';
import ProductGrid from './components/ProductGrid';


const normalizeString = (str?: string): string =>
  str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

interface CatalogPageProps {
  onAddToCart?: (product: Product) => void;
  favorites?: string[];
  onToggleFavorite?: (productId: string) => void;
  initialCategory?: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onAddToCart: propOnAddToCart,
  favorites: propFavorites,
  onToggleFavorite: propOnToggleFavorite,
  initialCategory,
}) => {
  const [searchParams] = useSearchParams();
  const effectiveCategory = searchParams.get('categoria') || searchParams.get('category') || initialCategory;

  const { addItem } = useCart();
  const { favorites: contextFavorites, toggleFavorite: contextToggleFavorite } = useFavorites();

  const onAddToCart = propOnAddToCart || ((p: Product) => addItem(p));
  const favorites = propFavorites || contextFavorites;
  const onToggleFavorite = propOnToggleFavorite || contextToggleFavorite;

  const { products, loading, error: productsError, reload: reloadProducts } = useProducts();
  const { categoryNames } = useCategories();
  const { getBlock } = useContentBlocks();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedIntention, setSelectedIntention] = useState<IntentionType>('all');
  const [selectedAroma, setSelectedAroma] = useState<string>('Todos');
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [showNewOnly, setShowNewOnly] = useState<boolean>(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOptionType>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Product Detail State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useSEO({
    title: selectedCategory && selectedCategory !== 'Todos'
      ? `${selectedCategory} | Catálogo Sensorial | Aurea Elizabeth`
      : 'Catálogo Sensorial | Aurea Elizabeth',
    description: 'Fragancias, textiles y alquimias botánicas formuladas con intenciones sagradas para elevar la energía de tu ser y tus espacios cotidianos.',
  });

  // Debounce para el término de búsqueda (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Normaliza el initialCategory / query param contra los nombres reales de la BD
  useEffect(() => {
    if (!effectiveCategory || categoryNames.length === 0) return;
    const lower = effectiveCategory.toLowerCase();
    const match = categoryNames.find(name => name.toLowerCase().includes(lower) || lower.includes(name.toLowerCase()));
    setSelectedCategory(match ?? 'Todos');
  }, [effectiveCategory, categoryNames]);

  // Filter application logic
  useEffect(() => {
    let result = [...products];

    // Search filter con normalizeString sobre debouncedSearchTerm
    if (debouncedSearchTerm.trim() !== '') {
      const term = normalizeString(debouncedSearchTerm);
      result = result.filter(
        (p) =>
          normalizeString(p.name).includes(term) ||
          normalizeString(p.description).includes(term) ||
          normalizeString(p.aroma).includes(term) ||
          normalizeString(p.sensoryDescription).includes(term) ||
          p.ingredients.some((i) => normalizeString(i).includes(term)) ||
          p.tags.some((t) => normalizeString(t).includes(term))
      );
    }

    // Category filter — usa los nombres reales de Supabase
    if (selectedCategory !== 'Todos') {
      result = result.filter((p) => {
        if (selectedCategory === 'Favoritos') return favorites.includes(p.id);
        return p.category === selectedCategory;
      });
    }

    // Intention filter con mapeo botánico y semántico
    if (selectedIntention !== 'all') {
      const normIntention = normalizeString(selectedIntention);
      result = result.filter((p) => {
        const combined = normalizeString(
          `${p.name} ${p.description} ${p.sensoryDescription} ${p.aroma} ${p.category} ${p.subcategory} ${(p.tags || []).join(' ')} ${(p.ingredients || []).join(' ')} ${(p as any).intention || ''}`
        );
        if (normIntention === 'calma') {
          return combined.includes('calma') || combined.includes('paz') || combined.includes('seren') || combined.includes('relaj') || combined.includes('lavanda') || combined.includes('manzanilla') || combined.includes('spa');
        }
        if (normIntention === 'limpieza') {
          return combined.includes('limpieza') || combined.includes('armon') || combined.includes('purif') || combined.includes('defum') || combined.includes('salvia') || combined.includes('ruda') || combined.includes('copal') || combined.includes('palo santo') || combined.includes('sahumerio');
        }
        if (normIntention === 'sueno') {
          return combined.includes('sueno') || combined.includes('noche') || combined.includes('nocturn') || combined.includes('descans') || combined.includes('dorm') || combined.includes('calma') || combined.includes('lavanda') || combined.includes('melisa');
        }
        if (normIntention === 'frecuencia') {
          return combined.includes('frecuencia') || combined.includes('alta') || combined.includes('energia') || combined.includes('vibr') || combined.includes('luz') || combined.includes('magia') || combined.includes('eleva') || combined.includes('oleo') || combined.includes('alquimia');
        }
        if (normIntention === 'proteccion') {
          return combined.includes('proteccion') || combined.includes('fuerza') || combined.includes('escudo') || combined.includes('ruda') || combined.includes('romero');
        }
        if (normIntention === 'abundancia') {
          return combined.includes('abundancia') || combined.includes('prosperidad') || combined.includes('oro') || combined.includes('canela') || combined.includes('laurel');
        }
        return combined.includes(normIntention);
      });
    }

    // Aroma filter
    if (selectedAroma !== 'Todos') {
      const aromaQuery = normalizeString(selectedAroma);
      result = result.filter((p) => {
        const matchesAromaField = normalizeString(p.aroma).includes(aromaQuery);
        const matchesName = normalizeString(p.name).includes(aromaQuery);
        const matchesIngredients = p.ingredients.some((i) => normalizeString(i).includes(aromaQuery));
        const matchesTags = p.tags.some((t) => normalizeString(t).includes(aromaQuery));

        // Special case: Madera matches sandalo/bosque/ wood textures
        if (aromaQuery === 'madera') {
          return (
            matchesAromaField ||
            matchesName ||
            matchesIngredients ||
            matchesTags ||
            normalizeString(p.aroma).includes('sandalo') ||
            p.ingredients.some((i) => normalizeString(i).includes('sandalo'))
          );
        }

        return matchesAromaField || matchesName || matchesIngredients || matchesTags;
      });
    }

    // Price filter — usa promoPrice si existe
    result = result.filter((p) => (p.promoPrice ?? p.price) <= maxPrice);

    // States filter
    if (showNewOnly) {
      result = result.filter((p) => p.isNew);
    }
    if (showFeaturedOnly) {
      result = result.filter((p) => p.isFeatured);
    }

    // Sort by
    result.sort((a, b) => {
      if (sortBy === 'price-asc') {
        return (a.promoPrice ?? a.price) - (b.promoPrice ?? b.price);
      }
      if (sortBy === 'price-desc') {
        return (b.promoPrice ?? b.price) - (a.promoPrice ?? a.price);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'featured') {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      }
      return 0;
    });

    setFilteredProducts(result);
  }, [products, debouncedSearchTerm, selectedCategory, selectedIntention, selectedAroma, maxPrice, showNewOnly, showFeaturedOnly, sortBy, favorites]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory, selectedIntention, selectedAroma, maxPrice, showNewOnly, showFeaturedOnly, sortBy]);

  // Categorías dinámicas desde Supabase + "Todos" y "Favoritos" fijos
  const categoryFilters = ['Todos', ...categoryNames];

  // Aromas derivados de los productos reales
  const aromas = ['Todos', ...Array.from(
    new Set(products.map(p => p.aroma).filter((item): item is string => Boolean(item && item !== 'Neutro')))
  ).slice(0, 8)];

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategory('Todos');
    setSelectedIntention('all');
    setSelectedAroma('Todos');
    setMaxPrice(30000);
    setShowNewOnly(false);
    setShowFeaturedOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      {/* Header Sensorial */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Typography variant="caption" color="gold" weight="semibold">
          Colección Botánica
        </Typography>
        <Typography variant="h2" style={{ marginTop: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>
          {getBlock('catalog.header.title', 'El Catálogo Sensorial')}
        </Typography>
        <div style={{
          width: '40px',
          height: '1px',
          backgroundColor: 'var(--color-dorado-mate)',
          margin: '0 auto 20px'
        }} />
        <Typography variant="body" color="muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
          {getBlock('catalog.header.subtitle', 'Fragancias, textiles y alquimias botánicas formuladas con intenciones sagradas para elevar la energía de tu ser y tus espacios cotidianos.')}
        </Typography>
      </div>

      {/* Buscador & Filtros */}
      <CatalogFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoryFilters={categoryFilters}
        selectedIntention={selectedIntention}
        setSelectedIntention={setSelectedIntention}
        selectedAroma={selectedAroma}
        setSelectedAroma={setSelectedAroma}
        aromas={aromas}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        showNewOnly={showNewOnly}
        setShowNewOnly={setShowNewOnly}
        showFeaturedOnly={showFeaturedOnly}
        setShowFeaturedOnly={setShowFeaturedOnly}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        onResetFilters={handleResetFilters}
        favoritesCount={favorites.length}
      />

      {/* Grilla de Productos */}
      <ProductGrid
        products={filteredProducts}
        loading={loading}
        error={productsError}
        onRetry={reloadProducts}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onAddToCart={onAddToCart}
        onSelectProduct={setSelectedProduct}
        onResetFilters={handleResetFilters}
      />

      {/* Modal de Ficha de Producto de Lujo */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p) => {
            HapticsService.success();
            onAddToCart(p);
          }}
          isFavorite={favorites.includes(selectedProduct.id)}
          onToggleFavorite={(id) => {
            HapticsService.medium();
            onToggleFavorite(id);
          }}
        />
      )}

      {/* Sabor de Pulse Animation en CSS y Responsive Overrides */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.2;
          }
        }

        @media (max-width: 767px) {
          .catalog-actions-container {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .catalog-actions-container > button,
          .catalog-actions-container > div {
            width: 100% !important;
            flex: none !important;
            min-width: 0 !important;
          }
          .catalog-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .catalog-product-card {
            padding: 12px !important;
            min-height: 310px !important;
            border-radius: 16px !important;
          }
          .product-card-image-wrapper {
            height: 110px !important;
            margin-bottom: 8px !important;
          }
          .product-card-title {
            font-size: 0.95rem !important;
            line-height: 1.2 !important;
            margin-bottom: 4px !important;
          }
          .product-card-desc {
            display: none !important;
          }
          .product-card-footer {
            margin-top: 6px !important;
            padding-top: 8px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .product-card-actions {
            width: 100% !important;
          }
          .product-card-actions > button {
            flex: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CatalogPage;
