import React from 'react';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import { HapticsService } from '../../../core/services/HapticsService';
import { Search, Heart, SlidersHorizontal, Sparkles, ArrowUpDown } from 'lucide-react';

export type IntentionType = 'all' | 'calma' | 'limpieza' | 'sueno' | 'frecuencia' | 'proteccion' | 'abundancia';
export type SortOptionType = 'featured' | 'price-asc' | 'price-desc' | 'name';

export const INTENTIONS: { value: IntentionType; label: string }[] = [
  { value: 'all', label: 'Todas las Intenciones' },
  { value: 'calma', label: '🧘 Calma Mental' },
  { value: 'limpieza', label: '🌿 Limpieza Energética' },
  { value: 'sueno', label: '🌙 Sueño Profundo' },
  { value: 'frecuencia', label: '✨ Frecuencia Alta' },
  { value: 'proteccion', label: '🛡️ Protección Sagrada' },
  { value: 'abundancia', label: '🌟 Abundancia & Luz' },
];

export const SORT_OPTIONS: { value: SortOptionType; label: string }[] = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'name', label: 'Nombre A-Z' },
];

interface CatalogFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: SortOptionType;
  setSortBy: (sort: SortOptionType) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categoryFilters: string[];
  selectedIntention: IntentionType;
  setSelectedIntention: (intention: IntentionType) => void;
  selectedAroma: string;
  setSelectedAroma: (aroma: string) => void;
  aromas: string[];
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  showNewOnly: boolean;
  setShowNewOnly: (val: boolean) => void;
  showFeaturedOnly: boolean;
  setShowFeaturedOnly: (val: boolean) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (val: boolean) => void;
  onResetFilters: () => void;
  favoritesCount: number;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  selectedCategory,
  setSelectedCategory,
  categoryFilters,
  selectedIntention,
  setSelectedIntention,
  selectedAroma,
  setSelectedAroma,
  aromas,
  maxPrice,
  setMaxPrice,
  showNewOnly,
  setShowNewOnly,
  showFeaturedOnly,
  setShowFeaturedOnly,
  showAdvancedFilters,
  setShowAdvancedFilters,
  onResetFilters,
  favoritesCount
}) => {
  return (
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

        {/* Botón de ver Favoritos */}
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
          <span>Favoritos ({favoritesCount})</span>
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
      <div className="mobile-scroll-x" style={{ paddingBottom: '8px' }}>
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
              onClick={onResetFilters}
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
  );
};

export default CatalogFilters;
