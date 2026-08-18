import React, { useState } from 'react';
import type { Product } from '../../../core/api/IRepository';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import { useFavorites } from '../../../core/context/FavoritesContext';
import { HapticsService } from '../../../core/services/HapticsService';
import { ShoppingBag, Heart, Sparkles, Flame, Check, Leaf } from 'lucide-react';
import { useContentBlocks } from '../../../core/hooks/useContentBlocks';

interface FeaturedProductsProps {
  products?: Product[];
  loading?: boolean;
  onAddToCart: (product: Product) => void;
  onNavigate: (tab: 'home' | 'catalog' | 'rituals' | 'profile' | 'admin', category?: string) => void;
  addToRevealRefs?: (el: HTMLDivElement | null) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products = [],
  loading = false,
  onAddToCart,
  onNavigate,
  addToRevealRefs
}) => {
  const { getBlock } = useContentBlocks();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    HapticsService.light();
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((prev) => (prev === product.id ? null : prev));
    }, 1800);
  };

  const handleToggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    HapticsService.medium();
    toggleFavorite(productId);
  };

  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <section className="reveal-on-scroll" ref={addToRevealRefs} style={{ marginBottom: '80px' }}>
      <div className="container" style={{ padding: '0 24px' }}>
        {/* Cabecera Sensorial */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Sparkles size={14} color="var(--color-dorado-mate)" />
            <Typography variant="caption" color="gold">Alta Alquimia Botánica</Typography>
            <Sparkles size={14} color="var(--color-dorado-mate)" />
          </div>
          <Typography variant="h2" style={{ marginTop: '4px' }}>
            {getBlock('home.featured.title', 'Destacados de la Temporada')}
          </Typography>
          <Typography variant="body" color="muted" style={{ maxWidth: '600px', margin: '8px auto 0', fontSize: '0.92rem' }}>
            {getBlock('home.featured.subtitle', 'Una selección artesanal de nuestros sahumerios, óleos y cerámicas más amados.')}
          </Typography>
          <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-dorado-mate)', margin: '16px auto' }} />
        </div>

        {loading ? (
          <div className="grid-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: '460px',
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '24px',
                  border: '1px solid rgba(197, 160, 89, 0.15)',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }}
              />
            ))}
          </div>
        ) : safeProducts.length === 0 ? null : (
          <div className="grid-3" style={{ gap: '28px' }}>
            {safeProducts.map((product) => {
              const isFav = isFavorite(product.id);
              const isAdded = addedProductId === product.id;
              const hasDiscount = Boolean(product.promoPrice && product.price > product.promoPrice);
              const discountPercent = hasDiscount
                ? Math.round(((product.price - (product.promoPrice ?? product.price)) / product.price) * 100)
                : 0;
              const savingsAmount = hasDiscount
                ? product.price - (product.promoPrice ?? product.price)
                : 0;

              // Botanical scent / notes extractor
              const botanicalNote = product.aroma && product.aroma !== 'Neutro'
                ? `Notas de ${product.aroma}`
                : product.ingredients && product.ingredients.length > 0
                ? `Notas de ${product.ingredients.slice(0, 2).join(' & ')}`
                : 'Notas Botánicas Puras';

              return (
                <div
                  key={product.id}
                  className="card-premium card-premium-hover luxury-featured-card"
                  onClick={() => onNavigate('catalog', product.category)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '460px',
                    padding: '22px',
                    background: 'rgba(255, 255, 255, 0.72)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(197, 160, 89, 0.22)',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 10px 30px rgba(61, 46, 40, 0.05)'
                  }}
                >
                  {/* Botón de Favorito Flotante con pulso y resplandor dorado */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, product.id)}
                    aria-label="Guardar en favoritos"
                    className="fav-gold-btn"
                    style={{
                      position: 'absolute',
                      top: '32px',
                      right: '32px',
                      zIndex: 12,
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: isFav
                        ? 'linear-gradient(135deg, rgba(158, 98, 82, 0.95), rgba(138, 0, 79, 0.85))'
                        : 'rgba(35, 31, 28, 0.65)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: isFav
                        ? '1px solid var(--color-dorado-mate)'
                        : '1px solid rgba(197, 168, 128, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: isFav
                        ? '0 0 16px rgba(176, 142, 98, 0.55), 0 4px 12px rgba(0,0,0,0.2)'
                        : '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <Heart
                      size={17}
                      color={isFav ? '#FFFFFF' : 'var(--color-crema-calido)'}
                      fill={isFav ? '#FFFFFF' : 'none'}
                      style={{
                        transition: 'transform 0.3s ease, fill 0.3s ease',
                        transform: isFav ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  </button>

                  <div>
                    {/* Contenedor de Imagen con Zoom Óptico Sutil */}
                    <div
                      className="luxury-image-wrapper"
                      style={{
                        height: '210px',
                        width: '100%',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        marginBottom: '16px',
                        position: 'relative',
                        backgroundColor: 'rgba(229, 217, 196, 0.4)'
                      }}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="luxury-optical-img"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      />

                      {/* Badges Flotantes de Deseo y Neuromarketing */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          zIndex: 10
                        }}
                      >
                        {hasDiscount && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              padding: '4px 9px',
                              background: 'linear-gradient(135deg, rgba(158, 98, 82, 0.95), rgba(138, 0, 79, 0.9))',
                              color: 'var(--color-crema-calido)',
                              borderRadius: '20px',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255, 255, 255, 0.25)',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            ✨ {discountPercent}% OFF
                          </span>
                        )}

                        {product.isFeatured && !hasDiscount && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              padding: '4px 9px',
                              background: 'linear-gradient(135deg, rgba(176, 142, 98, 0.95), rgba(79, 94, 76, 0.95))',
                              color: 'var(--color-crema-calido)',
                              borderRadius: '20px',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255, 255, 255, 0.25)',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Flame size={12} color="#FCE790" /> Alquimia Más Deseada
                          </span>
                        )}

                        {product.isNew && !hasDiscount && !product.isFeatured && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              letterSpacing: '0.06em',
                              padding: '4px 9px',
                              background: 'rgba(79, 94, 76, 0.92)',
                              color: 'var(--color-crema-calido)',
                              borderRadius: '20px',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            🌿 Nueva Cosecha
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chip de Notas Olfativas Botánicas */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '14px',
                          backgroundColor: 'rgba(79, 94, 76, 0.08)',
                          border: '1px solid rgba(79, 94, 76, 0.22)',
                          color: 'var(--color-oliva-salvia)',
                          letterSpacing: '0.03em'
                        }}
                      >
                        <Leaf size={11} color="var(--color-oliva-salvia)" />
                        {botanicalNote}
                      </span>
                      <Typography variant="caption" color="gold" style={{ fontSize: '0.68rem', letterSpacing: '0.12em' }}>
                        {product.category}
                      </Typography>
                    </div>

                    {/* Título de Producto */}
                    <Typography
                      variant="h3"
                      style={{
                        fontSize: '1.25rem',
                        margin: '2px 0 8px',
                        lineHeight: 1.25,
                        transition: 'color 0.2s ease'
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* Descripción Sensorial */}
                    <Typography
                      variant="body-sm"
                      color="muted"
                      style={{
                        fontSize: '0.84rem',
                        height: '42px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.45
                      }}
                    >
                      {product.sensoryDescription?.trim() || product.description?.trim() || ''}
                    </Typography>
                  </div>

                  {/* Fila de Precios & 1-Click CTA */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      marginTop: '18px',
                      borderTop: '1px solid rgba(197, 160, 89, 0.18)',
                      paddingTop: '14px'
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.62rem',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          display: 'block',
                          marginBottom: '2px'
                        }}
                      >
                        Inversión en calma
                      </span>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                        <Typography
                          variant="h3"
                          style={{
                            fontSize: '1.35rem',
                            color: 'var(--color-dorado-mate)',
                            fontWeight: 700,
                            lineHeight: 1
                          }}
                        >
                          ${(product.promoPrice ?? product.price).toLocaleString('es-AR')}
                        </Typography>

                        {hasDiscount && (
                          <span
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--color-text-muted)',
                              textDecoration: 'line-through',
                              opacity: 0.7
                            }}
                          >
                            ${product.price.toLocaleString('es-AR')}
                          </span>
                        )}
                      </div>

                      {hasDiscount && (
                        <div style={{ marginTop: '3px' }}>
                          <span
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              color: 'var(--color-terracota-suave)',
                              backgroundColor: 'rgba(158, 98, 82, 0.1)',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              border: '1px solid rgba(158, 98, 82, 0.25)',
                              letterSpacing: '0.02em'
                            }}
                          >
                            Ahorrás ${savingsAmount.toLocaleString('es-AR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botón 1-Click "Agregar al Altar" con Feedback Instantáneo */}
                    <Button
                      variant={isAdded ? 'primary' : 'primary'}
                      size="sm"
                      onClick={(e) => handleAddToCart(e, product)}
                      style={{
                        borderRadius: '14px',
                        padding: '10px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        backgroundColor: isAdded ? 'var(--color-bosque-suave)' : 'var(--color-oliva-salvia)',
                        boxShadow: isAdded
                          ? '0 0 15px rgba(79, 94, 76, 0.5)'
                          : '0 6px 16px rgba(79, 94, 76, 0.25)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} color="#A7F3D0" />
                          <span style={{ color: '#A7F3D0' }}>¡En tu Altar!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          <span>Agregar al Altar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Button
            variant="terracota"
            onClick={() => onNavigate('catalog')}
            style={{
              padding: '14px 32px',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(158, 98, 82, 0.25)'
            }}
          >
            Ver toda la colección botánica
          </Button>
        </div>
      </div>

      {/* Estilos sutiles de microinteracciones */}
      <style>{`
        .luxury-featured-card:hover .luxury-optical-img {
          transform: scale(1.06);
        }
        .fav-gold-btn:hover {
          transform: scale(1.12);
        }
        @keyframes favPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
      `}</style>
    </section>
  );
};

export default FeaturedProducts;

