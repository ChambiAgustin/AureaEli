import React, { useState } from 'react';
import type { Product } from '../../../core/api/IRepository';
import { ErrorState } from '../../../shared/components/ErrorState';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { HapticsService } from '../../../core/services/HapticsService';
import { Heart, Eye, ShoppingBag, Sparkles, ChevronLeft, ChevronRight, Flame, Leaf, Check, AlertCircle } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage?: number;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onResetFilters: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  error,
  onRetry,
  currentPage,
  setCurrentPage,
  itemsPerPage = 9,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct,
  onResetFilters
}) => {
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    HapticsService.light();
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((prev) => (prev === product.id ? null : prev));
    }, 1800);
  };

  return (
    <div className="container" style={{ padding: '0 0 40px 0' }}>
      {error ? (
        <ErrorState
          message={error}
          onRetry={onRetry}
        />
      ) : loading ? (
        /* Skeletons de Carga Premium */
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              style={{
                minHeight: '460px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '24px',
                border: '1px solid rgba(197, 160, 89, 0.15)',
                padding: '22px'
              }}
            >
              <div
                style={{
                  height: '210px',
                  backgroundColor: 'rgba(229, 217, 196, 0.5)',
                  borderRadius: '16px',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }}
              />
              <div style={{ width: '45%', height: '18px', backgroundColor: 'rgba(229, 217, 196, 0.5)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '12px' }} />
              <div style={{ width: '85%', height: '26px', backgroundColor: 'rgba(229, 217, 196, 0.5)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '6px' }} />
              <div style={{ width: '100%', height: '40px', backgroundColor: 'rgba(229, 217, 196, 0.3)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '6px' }} />
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '35%', height: '24px', backgroundColor: 'rgba(229, 217, 196, 0.5)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '6px' }} />
                <div style={{ width: '40%', height: '38px', backgroundColor: 'rgba(229, 217, 196, 0.5)', animation: 'pulse 1.5s infinite ease-in-out', borderRadius: '14px' }} />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Estado Sin Resultados - "Respirar Hondo" */
        <div style={{
          textAlign: 'center',
          padding: '80px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '28px',
          border: '1px solid rgba(197, 168, 128, 0.25)',
          maxWidth: '620px',
          margin: '0 auto',
          boxShadow: '0 12px 36px rgba(61, 46, 40, 0.06)'
        }}>
          <Sparkles size={44} color="var(--color-dorado-mate)" style={{ margin: '0 auto 20px', opacity: 0.9 }} />
          <Typography variant="h3" style={{ marginBottom: '16px', fontSize: '1.6rem' }}>El aire sigue fluyendo</Typography>
          <Typography variant="body" color="muted" style={{ marginBottom: '24px', lineHeight: '1.7', fontSize: '0.95rem' }}>
            No encontramos alquimias botánicas con los filtros seleccionados. <br />
            <strong>Te sugerimos tomar una inhalación profunda... retener el aire... y exhalar con calma.</strong> <br />
            A veces, la quietud y volver a empezar es el mejor ritual.
          </Typography>
          <Button variant="primary" size="sm" onClick={onResetFilters} style={{ borderRadius: '16px', padding: '12px 24px' }}>
            Reiniciar Búsqueda
          </Button>
        </div>
      ) : (
        /* Render de Tarjetas de Productos Paginados con Alta Conversión */
        (() => {
          const totalPages = Math.ceil(products.length / itemsPerPage);
          const indexOfLastProduct = currentPage * itemsPerPage;
          const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
          const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

          return (
            <>
              <div className="grid-3 catalog-grid" style={{ gap: '28px' }}>
                {currentProducts.map((product) => {
                  const isFav = favorites.includes(product.id);
                  const isAdded = addedProductId === product.id;
                  const hasDiscount = Boolean(product.promoPrice && product.price > product.promoPrice);
                  const discountPercent = hasDiscount
                    ? Math.round(((product.price - (product.promoPrice ?? product.price)) / product.price) * 100)
                    : 0;
                  const savingsAmount = hasDiscount
                    ? product.price - (product.promoPrice ?? product.price)
                    : 0;
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isOutOfStock = product.stock === 0;

                  // Botanical scent / notes extractor
                  const botanicalNote = product.aroma && product.aroma !== 'Neutro'
                    ? `Notas de ${product.aroma}`
                    : product.ingredients && product.ingredients.length > 0
                    ? `Notas de ${product.ingredients.slice(0, 2).join(' & ')}`
                    : 'Notas Botánicas Puras';

                  return (
                    <Card
                      className="catalog-product-card luxury-catalog-card"
                      key={product.id}
                      onClick={() => onSelectProduct(product)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '460px',
                        padding: '22px',
                        position: 'relative',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.72)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(197, 160, 89, 0.22)',
                        borderRadius: '24px',
                        boxShadow: '0 10px 30px rgba(61, 46, 40, 0.05)',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {/* Favorito Button Floater con animación dorada */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          HapticsService.medium();
                          onToggleFavorite(product.id);
                        }}
                        aria-label="Agregar a favoritos"
                        className="catalog-fav-btn"
                        style={{
                          position: 'absolute',
                          top: '32px',
                          right: '32px',
                          zIndex: 12,
                          background: isFav
                            ? 'linear-gradient(135deg, rgba(158, 98, 82, 0.95), rgba(138, 0, 79, 0.85))'
                            : 'rgba(35, 31, 28, 0.65)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: isFav
                            ? '1px solid var(--color-dorado-mate)'
                            : '1px solid rgba(197, 168, 128, 0.3)',
                          borderRadius: '50%',
                          width: '38px',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: isFav
                            ? '0 0 16px rgba(176, 142, 98, 0.55), 0 4px 12px rgba(0,0,0,0.2)'
                            : '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        <Heart
                          size={17}
                          color={isFav ? '#FFFFFF' : 'var(--color-crema-calido)'}
                          fill={isFav ? '#FFFFFF' : 'none'}
                          style={{
                            transition: 'all 0.3s ease',
                            transform: isFav ? 'scale(1.1)' : 'scale(1)'
                          }}
                        />
                      </button>

                      <div>
                        {/* Contenedor de Imagen de Producto con Zoom Óptico */}
                        <div
                          className="product-card-image-wrapper luxury-image-wrapper"
                          onClick={(e) => { e.stopPropagation(); onSelectProduct(product); }}
                          style={{
                            height: '210px',
                            width: '100%',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            marginBottom: '16px',
                            cursor: 'pointer',
                            position: 'relative',
                            backgroundColor: 'rgba(229, 217, 196, 0.4)'
                          }}
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="catalog-optical-img"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                          />

                          {/* Badges Flotantes de Deseo, Descuento y Escasez */}
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

                            {isLowStock && (
                              <span
                                style={{
                                  fontSize: '0.63rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.05em',
                                  padding: '4px 9px',
                                  background: 'rgba(158, 98, 82, 0.95)',
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
                                <AlertCircle size={11} color="#FFD1BA" /> Pocas unidades disponibles
                              </span>
                            )}

                            {product.isFeatured && !hasDiscount && !isLowStock && (
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

                            {product.isNew && !hasDiscount && !product.isFeatured && !isLowStock && (
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

                        {/* Chip Botánico Aromático */}
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
                          <Typography
                            variant="caption"
                            color="gold"
                            style={{ fontSize: '0.68rem', letterSpacing: '0.12em' }}
                          >
                            {product.category} {product.subcategory ? `— ${product.subcategory}` : ''}
                          </Typography>
                        </div>

                        {/* Título de Producto */}
                        <Typography
                          className="product-card-title"
                          variant="h3"
                          style={{
                            fontSize: '1.25rem',
                            marginBottom: '8px',
                            cursor: 'pointer',
                            lineHeight: 1.25,
                            transition: 'color 0.2s ease'
                          }}
                          onClick={() => onSelectProduct(product)}
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
                            marginBottom: '12px',
                            fontSize: '0.84rem',
                            lineHeight: 1.45
                          }}
                        >
                          {product.sensoryDescription?.trim() || product.description?.trim() || ''}
                        </Typography>
                      </div>

                      {/* Fila de Compra, Anclaje de Precio e Interacción */}
                      <div className="product-card-footer" style={{
                        borderTop: '1px solid rgba(197, 160, 89, 0.18)',
                        paddingTop: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: '12px'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', letterSpacing: '0.1em', marginBottom: '2px' }}>
                            Inversión en calma
                          </span>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                            <Typography variant="h3" style={{ fontSize: '1.35rem', color: 'var(--color-dorado-mate)', fontWeight: 700, lineHeight: 1 }}>
                              ${(product.promoPrice ?? product.price).toLocaleString('es-AR')}
                            </Typography>
                            {hasDiscount && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', opacity: 0.7 }}>
                                ${product.price.toLocaleString('es-AR')}
                              </span>
                            )}
                          </div>
                          {hasDiscount && (
                            <div style={{ marginTop: '3px' }}>
                              <span style={{
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                color: 'var(--color-terracota-suave)',
                                backgroundColor: 'rgba(158, 98, 82, 0.1)',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                border: '1px solid rgba(158, 98, 82, 0.25)',
                                letterSpacing: '0.02em'
                              }}>
                                Ahorrás ${savingsAmount.toLocaleString('es-AR')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="product-card-actions" style={{ display: 'flex', gap: '8px' }}>
                          {/* Botón Explorar Detalle */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProduct(product);
                            }}
                            aria-label="Ver detalle de la alquimia"
                            style={{
                              padding: '10px 12px',
                              borderRadius: '14px',
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
                            <Eye size={16} />
                          </Button>

                          {/* Botón Directo 1-Click Agregar al Altar */}
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={(e) => handleAddToCart(e, product)}
                            style={{
                              padding: '10px 18px',
                              borderRadius: '14px',
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
                                <span>{isOutOfStock ? 'Sin Stock' : 'Llevar'}</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Controles de Paginación */}
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
                    aria-label="Página anterior"
                    style={{
                      background: 'rgba(44, 36, 32, 0.04)',
                      border: '1px solid rgba(176, 142, 98, 0.25)',
                      color: currentPage === 1 ? 'rgba(0, 0, 0, 0.2)' : 'var(--color-text-dark)',
                      width: '42px',
                      height: '42px',
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

                  <span style={{ fontSize: '0.92rem', color: 'var(--color-text-dark)', fontWeight: '600' }}>
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    aria-label="Página siguiente"
                    style={{
                      background: 'rgba(44, 36, 32, 0.04)',
                      border: '1px solid rgba(176, 142, 98, 0.25)',
                      color: currentPage === totalPages ? 'rgba(0, 0, 0, 0.2)' : 'var(--color-text-dark)',
                      width: '42px',
                      height: '42px',
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

      <style>{`
        .luxury-catalog-card:hover .catalog-optical-img {
          transform: scale(1.06);
        }
        .catalog-fav-btn:hover {
          transform: scale(1.12);
        }
      `}</style>
    </div>
  );
};

export default ProductGrid;

