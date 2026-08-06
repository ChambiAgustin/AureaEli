import React, { useState, useEffect } from 'react';
import type { Product, UserProfile } from '../../core/api/IRepository';
import { useProducts } from '../../core/hooks/useProducts';
import { useCategories } from '../../core/hooks/useCategories';
import { ErrorState } from '../../shared/components/ErrorState';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import ProductDetail from './ProductDetail';
import { HapticsService } from '../../core/services/HapticsService';
import { Search, Heart, SlidersHorizontal, ShoppingCart, Eye, Sparkles, RefreshCw, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

const normalizeString = (str: string) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

export type IntentionType = 'all' | 'limpieza' | 'proteccion' | 'calma' | 'abundancia' | 'amor';
export type SortOptionType = 'featured' | 'price-asc' | 'price-desc' | 'name';

const INTENTIONS: { value: IntentionType; label: string }[] = [
  { value: 'all', label: 'Todas las Intenciones' },
  { value: 'limpieza', label: 'Limpieza & Armonía' },
  { value: 'proteccion', label: 'Protección & Fuerza' },
  { value: 'calma', label: 'Calma & Paz' },
  { value: 'abundancia', label: 'Abundancia & Prosperidad' },
  { value: 'amor', label: 'Amor Propio & Magia' },
];

const SORT_OPTIONS: { value: SortOptionType; label: string }[] = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'name', label: 'Nombre A-Z' },
];

interface CatalogPageProps {
  onAddToCart: (product: Product) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  initialCategory?: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onAddToCart,
  favorites,
  onToggleFavorite,
  initialCategory,
}) => {
  const { products, loading, error: productsError, reload: reloadProducts } = useProducts();
  const { categoryNames } = useCategories();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedIntention, setSelectedIntention] = useState<IntentionType>('all');
  const [sortBy, setSortBy] = useState<SortOptionType>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Debounce para el término de búsqueda (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Normaliza el initialCategory contra los nombres reales de la BD
  useEffect(() => {
    if (!initialCategory || categoryNames.length === 0) return;
    const lower = initialCategory.toLowerCase();
    const match = categoryNames.find(name => name.toLowerCase().includes(lower) || lower.includes(name.toLowerCase()));
    setSelectedCategory(match ?? 'Todos');
  }, [initialCategory, categoryNames]);
  const [selectedAroma, setSelectedAroma] = useState<string>('Todos');
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [showNewOnly, setShowNewOnly] = useState<boolean>(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  
  // Product Detail State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Los productos vienen del hook useProducts (Supabase + Realtime)

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

    // Intention filter
    if (selectedIntention !== 'all') {
      const normIntention = normalizeString(selectedIntention);
      result = result.filter((p) => {
        const combined = normalizeString(
          `${p.name} ${p.description} ${p.sensoryDescription} ${p.aroma} ${p.category} ${p.subcategory} ${(p.tags || []).join(' ')} ${(p as any).intention || ''}`
        );
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

  // Aromas derivados de los productos reales (únicos, no vacíos)
  const aromas = ['Todos', ...Array.from(
    new Set(products.map(p => p.aroma).filter(a => a && a !== 'Neutro'))
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
          El Catálogo Sensorial
        </Typography>
        <div style={{
          width: '40px',
          height: '1px',
          backgroundColor: 'var(--color-dorado-mate)',
          margin: '0 auto 20px'
        }} />
        <Typography variant="body" color="muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
          Fragancias, textiles y alquimias botánicas formuladas con intenciones sagradas para elevar la energía de tu ser y tus espacios cotidianos.
        </Typography>
      </div>

      {/* Buscador & Acceso a Filtros */}
      <div style={{
        maxWidth: '750px',
        margin: '0 auto 30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="catalog-actions-container" style={{
          display: 'flex',
          gap: '12px',
          width: '100%',
          flexWrap: 'wrap'
        }}>
          {/* Barra de búsqueda minimalista */}
          <div style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            minWidth: '260px'
          }}>
            <Search 
              size={18} 
              color="var(--color-dorado-mate)" 
              style={{
                position: 'absolute',
                left: '16px',
                pointerEvents: 'none'
              }} 
            />
            <input
              type="text"
              placeholder="Buscar aroma, ingrediente, ritual..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                backgroundColor: 'rgba(35, 31, 28, 0.04)',
                border: '1px solid rgba(197, 168, 128, 0.25)',
                borderRadius: '16px',
                color: 'var(--color-text-dark)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-dorado-mate)';
                e.target.style.boxShadow = '0 0 15px rgba(197, 168, 128, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(197, 168, 128, 0.25)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Selector desplegable de ordenamiento (sortBy) */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOptionType)}
              aria-label="Ordenar por"
              style={{
                padding: '14px 36px 14px 16px',
                borderRadius: '16px',
                backgroundColor: 'rgba(44, 36, 32, 0.04)',
                border: '1px solid var(--color-dorado-mate)',
                color: 'var(--color-text-dark)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: '#1c1815', color: '#f7f4ee' }}>
                  Ordenar: {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown
              size={14}
              color="var(--color-dorado-mate)"
              style={{
                position: 'absolute',
                right: '12px',
                pointerEvents: 'none'
              }}
            />
          </div>

          {/* Botón de ver Favoritos (Sección de Intenciones) */}
          <Button
            variant={selectedCategory === 'Favoritos' ? 'primary' : 'secondary'}
            onClick={() => setSelectedCategory(selectedCategory === 'Favoritos' ? 'Todos' : 'Favoritos')}
            style={{
              padding: '14px 20px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: selectedCategory === 'Favoritos' ? 'var(--color-crema-calido)' : 'var(--color-text-dark)',
              borderColor: selectedCategory === 'Favoritos' ? 'var(--color-terracota-suave)' : 'var(--color-dorado-mate)',
              backgroundColor: selectedCategory === 'Favoritos' ? 'var(--color-terracota-suave)' : 'rgba(44, 36, 32, 0.04)',
            }}
          >
            <Heart size={16} fill={selectedCategory === 'Favoritos' ? 'var(--color-crema-calido)' : 'none'} color={selectedCategory === 'Favoritos' ? 'var(--color-crema-calido)' : 'var(--color-terracota-suave)'} />
            <span>Favoritos ({favorites.length})</span>
          </Button>

          {/* Toggle de filtros avanzados */}
          <Button
            variant="secondary"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              padding: '14px 20px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--color-text-dark)',
              borderColor: showAdvancedFilters ? 'var(--color-text-dark)' : 'var(--color-dorado-mate)',
              backgroundColor: 'rgba(44, 36, 32, 0.04)',
            }}
          >
            <SlidersHorizontal size={16} />
            <span>Filtros</span>
          </Button>
        </div>

        {/* Chips de Intenciones Sagradas */}
        <div className="mobile-scroll-x" style={{ paddingBottom: '4px', display: 'flex', gap: '8px' }}>
          {INTENTIONS.map((intention) => (
            <button
              key={intention.value}
              onClick={() => {
                HapticsService.medium();
                setSelectedIntention(intention.value);
              }}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedIntention === intention.value ? 'var(--color-dorado-mate)' : 'rgba(176, 142, 98, 0.25)',
                backgroundColor: selectedIntention === intention.value ? 'rgba(197, 168, 128, 0.18)' : 'rgba(44, 36, 32, 0.04)',
                color: selectedIntention === intention.value ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                fontWeight: selectedIntention === intention.value ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (selectedIntention !== intention.value) {
                  e.currentTarget.style.background = 'rgba(44, 36, 32, 0.08)';
                  e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedIntention !== intention.value) {
                  e.currentTarget.style.background = 'rgba(44, 36, 32, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.25)';
                }
              }}
            >
              {selectedIntention === intention.value && <Sparkles size={12} color="var(--color-dorado-mate)" />}
              <span>{intention.label}</span>
            </button>
          ))}
        </div>

        {/* Filtros de Categoría Rápidos (Scroll horizontal en mobile) */}
        <div className="mobile-scroll-x" style={{
          paddingBottom: '8px'
        }}>
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '8px 18px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--color-oliva-salvia)' : 'rgba(176, 142, 98, 0.25)',
                backgroundColor: selectedCategory === cat ? 'var(--color-oliva-salvia)' : 'rgba(44, 36, 32, 0.04)',
                color: selectedCategory === cat ? 'var(--color-crema-calido)' : 'var(--color-text-dark)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                fontWeight: selectedCategory === cat ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.background = 'rgba(44, 36, 32, 0.08)';
                  e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat) {
                  e.currentTarget.style.background = 'rgba(44, 36, 32, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.25)';
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Panel de Filtros Avanzados (Expandible) */}
        {showAdvancedFilters && (
          <div 
            className="glass-panel" 
            style={{
              padding: '24px',
              animation: 'fadeIn 0.4s ease-out',
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '20px',
              border: '1px solid rgba(197, 168, 128, 0.25)',
              marginTop: '10px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              
              {/* Filtro por Aroma */}
              <div>
                <Typography variant="caption" color="gold" style={{ marginBottom: '8px', display: 'block' }}>
                  Filtrar por Aroma
                </Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {aromas.map((aroma) => (
                    <button
                      key={aroma}
                      onClick={() => setSelectedAroma(aroma)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: selectedAroma === aroma ? 'var(--color-oliva-salvia)' : 'rgba(255, 255, 255, 0.06)',
                        backgroundColor: selectedAroma === aroma ? 'rgba(110, 126, 107, 0.2)' : 'transparent',
                        color: selectedAroma === aroma ? 'var(--color-crema-calido)' : 'var(--color-text-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {aroma}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro de Precio */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Typography variant="caption" color="gold">Precio Máximo</Typography>
                  <Typography variant="body-sm" color="gold" weight="semibold">${maxPrice.toLocaleString('es-AR')}</Typography>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="30000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--color-dorado-mate)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    height: '4px',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>$2.000</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>$30.000</span>
                </div>
              </div>

              {/* Filtros por Estado */}
              <div>
                <Typography variant="caption" color="gold" style={{ marginBottom: '8px', display: 'block' }}>
                  Estados Especiales
                </Typography>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <input
                      type="checkbox"
                      checked={showNewOnly}
                      onChange={(e) => setShowNewOnly(e.target.checked)}
                      style={{ accentColor: 'var(--color-dorado-mate)' }}
                    />
                    <span>Nuevas Incorporaciones</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <input
                      type="checkbox"
                      checked={showFeaturedOnly}
                      onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                      style={{ accentColor: 'var(--color-dorado-mate)' }}
                    />
                    <span>Destacados de Aurea</span>
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
              <button
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-dorado-mate)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grilla de Productos */}
      <div className="container" style={{ padding: '0 0 40px 0' }}>
        {productsError ? (
          <ErrorState
            message={productsError}
            onRetry={reloadProducts}
          />
        ) : loading ? (
          /* Skeletons de Carga Premium */
          <div className="grid-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} style={{ minHeight: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div 
                  style={{
                    height: '200px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }} 
                />
                <div style={{ width: '40%', height: '14px', backgroundColor: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '4px' }} />
                <div style={{ width: '90%', height: '24px', backgroundColor: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '4px' }} />
                <div style={{ width: '100%', height: '40px', backgroundColor: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '4px' }} />
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '30%', height: '20px', backgroundColor: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '4px' }} />
                  <div style={{ width: '35%', height: '32px', backgroundColor: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '12px' }} />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Estado Sin Resultados - "Respirar Hondo" */
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '24px',
            border: '1px solid rgba(197, 168, 128, 0.1)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Sparkles size={40} color="var(--color-dorado-mate)" style={{ margin: '0 auto 20px', opacity: 0.8 }} />
            <Typography variant="h3" style={{ marginBottom: '16px' }}>El aire sigue fluyendo</Typography>
            <Typography variant="body" color="muted" style={{ marginBottom: '24px', lineHeight: '1.7' }}>
              No encontramos alquimias botánicas con los filtros seleccionados. <br />
              <strong>Te sugerimos tomar una inhalación profunda... retener el aire... y exhalar con calma.</strong> <br />
              A veces, la quietud y volver a empezar es el mejor ritual.
            </Typography>
            <Button variant="primary" size="sm" onClick={handleResetFilters}>
              Reiniciar Búsqueda
            </Button>
          </div>
        ) : (
          /* Render de Tarjetas de Productos Paginados */
          (() => {
            const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
            const indexOfLastProduct = currentPage * itemsPerPage;
            const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
            const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

            return (
              <>
                <div className="grid-3 catalog-grid">
                  {currentProducts.map((product) => {
                    const isFav = favorites.includes(product.id);
                    
                    return (
                      <Card 
                        className="catalog-product-card"
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: '440px',
                          padding: '20px',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                      >
                  {/* Favorito Button Floater */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      HapticsService.medium();
                      onToggleFavorite(product.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      zIndex: 10,
                      background: 'rgba(35, 31, 28, 0.7)',
                      border: '1px solid rgba(197, 168, 128, 0.25)',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.25)';
                    }}
                  >
                    <Heart 
                      size={18} 
                      color={isFav ? 'var(--color-terracota-suave)' : 'var(--color-crema-calido)'} 
                      fill={isFav ? 'var(--color-terracota-suave)' : 'none'} 
                      style={{ transition: 'fill 0.3s ease, color 0.3s ease' }}
                    />
                  </button>

                  <div>
                    {/* Imagen de Producto */}
                    <div 
                      className="product-card-image-wrapper"
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                      style={{
                        height: '180px',
                        width: '100%',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '16px',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                      
                      {/* Tags flotantes de Nuevos/Destacados */}
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '4px' }}>
                        {product.isNew && (
                          <span style={{
                            fontSize: '0.6rem',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            padding: '3px 8px',
                            backgroundColor: 'var(--color-oliva-salvia)',
                            color: 'var(--color-crema-calido)',
                            borderRadius: '4px',
                            letterSpacing: '0.05em'
                          }}>
                            Nuevo
                          </span>
                        )}
                        {product.isFeatured && (
                          <span style={{
                            fontSize: '0.6rem',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            padding: '3px 8px',
                            backgroundColor: 'var(--color-dorado-mate)',
                            color: 'var(--color-tierra-profunda)',
                            borderRadius: '4px',
                            letterSpacing: '0.05em'
                          }}>
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Categoría & Subcategoría */}
                    <Typography 
                      variant="caption" 
                      color="gold" 
                      style={{ display: 'block', marginBottom: '6px', fontSize: '0.7rem' }}
                    >
                      {product.category} — {product.subcategory}
                    </Typography>

                    {/* Título de Producto */}
                    <Typography 
                      className="product-card-title"
                      variant="h3" 
                      style={{ 
                        fontSize: '1.2rem', 
                        marginBottom: '8px', 
                        cursor: 'pointer',
                        transition: 'color 0.2s ease'
                      }}
                      onClick={() => setSelectedProduct(product)}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-dorado-mate)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                    >
                      {product.name}
                    </Typography>

                    {/* Descripción corta */}
                    <Typography 
                      className="product-card-desc"
                      variant="body-sm" 
                      color="muted" 
                      style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '42px',
                        marginBottom: '16px',
                        fontSize: '0.85rem'
                      }}
                    >
                      {product.description}
                    </Typography>
                  </div>

                  {/* Fila de Compra e Interacción */}
                  <div className="product-card-footer" style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '10px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block' }}>
                        Aporte Ritual
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <Typography variant="h3" color="gold" style={{ fontSize: '1.25rem' }}>
                          ${(product.promoPrice ?? product.price).toLocaleString('es-AR')}
                        </Typography>
                        {product.promoPrice && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                            ${product.price.toLocaleString('es-AR')}
                          </span>
                        )}
                      </div>
                      {product.promoPrice && (
                        <span style={{ fontSize: '0.6rem', background: 'rgba(163,76,55,0.15)', color: '#c0604a', borderRadius: 4, padding: '1px 6px', fontWeight: 700, letterSpacing: '0.5px' }}>
                          PROMO
                        </span>
                      )}
                    </div>

                    <div className="product-card-actions" style={{ display: 'flex', gap: '6px' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        style={{ 
                          padding: '8px 12px', 
                          borderRadius: '12px',
                          color: 'var(--color-text-dark)',
                          borderColor: 'rgba(197, 160, 89, 0.35)',
                          backgroundColor: 'rgba(44, 36, 32, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-dorado-mate)';
                          e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
                          e.currentTarget.style.backgroundColor = 'rgba(44, 36, 32, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-dark)';
                          e.currentTarget.style.borderColor = 'rgba(197, 160, 89, 0.35)';
                          e.currentTarget.style.backgroundColor = 'rgba(44, 36, 32, 0.04)';
                        }}
                      >
                        <Eye size={15} />
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={product.stock === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          HapticsService.success();
                          onAddToCart(product);
                        }}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <ShoppingCart size={14} />
                        <span>{product.stock === 0 ? 'Sin Stock' : 'Llevar'}</span>
                      </Button>
                    </div>
                  </div>
                </Card>
                    );
                  })}
                </div>

                {/* Controles de Paginación Premium */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '48px',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      style={{
                        background: 'rgba(44, 36, 32, 0.04)',
                        border: '1px solid rgba(176, 142, 98, 0.25)',
                        color: currentPage === 1 ? 'rgba(0, 0, 0, 0.2)' : 'var(--color-text-dark)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: currentPage === 1 ? 0.4 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage > 1) {
                          e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
                          e.currentTarget.style.background = 'rgba(44, 36, 32, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage > 1) {
                          e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.25)';
                          e.currentTarget.style.background = 'rgba(44, 36, 32, 0.04)';
                        }
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)', fontWeight: '500' }}>
                      Página {currentPage} de {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      style={{
                        background: 'rgba(44, 36, 32, 0.04)',
                        border: '1px solid rgba(176, 142, 98, 0.25)',
                        color: currentPage === totalPages ? 'rgba(0, 0, 0, 0.2)' : 'var(--color-text-dark)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: currentPage === totalPages ? 0.4 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage < totalPages) {
                          e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
                          e.currentTarget.style.background = 'rgba(44, 36, 32, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage < totalPages) {
                          e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.25)';
                          e.currentTarget.style.background = 'rgba(44, 36, 32, 0.04)';
                        }
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            );
          })()
        )}
      </div>

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



      {/* Sabor de Pulse Animation en CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.2;
          }
        }

        /* Responsive Overrides for Catalog */
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
