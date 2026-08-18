import React, { useState, useEffect } from 'react';
import type { Product } from '../../core/api/IRepository';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import { Heart, ShoppingCart, Leaf, Plus, Minus } from 'lucide-react';
import { HapticsService } from '../../core/services/HapticsService';
import { useCart } from '../../core/context/CartContext';
import { useFavorites } from '../../core/context/FavoritesContext';
import { useSEO } from '../../core/seo/useSEO';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onClose,
  onAddToCart: propOnAddToCart,
  isFavorite: propIsFavorite,
  onToggleFavorite: propOnToggleFavorite,
}) => {
  useSEO({
    title: `${product.name} | Aurea Elizabeth`,
    description:
      product.description ||
      product.sensoryDescription ||
      'Elemento de alquimia botánica seleccionado con amor para intencionar tus días.',
    image: product.imageUrl,
    type: 'product',
  });

  const { addItem } = useCart();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();

  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : checkIsFavorite(product.id);
  const onToggleFavorite = propOnToggleFavorite || toggleFavorite;
  const onAddToCart = propOnAddToCart || ((p: Product) => addItem(p));

  const [quantity, setQuantity] = useState<number>(1);

  // Soporte para tecla Escape y bloqueo de scroll de fondo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // Manejo de incremento y decremento de cantidad
  const handleIncrease = () => {
    if (product.stock && quantity < product.stock) {
      HapticsService.selection();
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      HapticsService.selection();
      setQuantity((prev) => prev - 1);
    }
  };

  // Agregar al carrito considerando la cantidad seleccionada
  const handleAdd = () => {
    if (product.stock === 0) return;
    HapticsService.success();
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
  };

  return (
    <div
      className="product-detail-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(14, 11, 7, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'backdropFadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="product-detail-modal"
        style={{
          width: 'min(92vw, 540px)',
          maxHeight: '85dvh',
          overflowY: 'auto',
          backgroundColor: '#1C1917',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          position: 'relative',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cierre '✕' accesible */}
        <button
          className="product-detail-close-btn"
          onClick={onClose}
          type="button"
          aria-label="Cerrar detalle de producto"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 50,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FDFBF7',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>

        {/* Imagen del producto de altura controlada */}
        <div
          className="product-detail-image-wrapper"
          style={{
            width: '100%',
            maxHeight: '280px',
            height: '240px',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            marginBottom: '20px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-detail-image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '12px',
              display: 'block',
            }}
          />
          {product.stock <= 5 && product.stock > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 10px',
                backgroundColor: 'rgba(158, 98, 82, 0.9)',
                color: '#FDFBF7',
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              Últimas {product.stock} unidades
            </span>
          )}
        </div>

        {/* Categoría y Subcategoría */}
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#c5a880',
              fontWeight: 600,
            }}
          >
            {product.category} {product.subcategory ? `— ${product.subcategory}` : ''}
          </span>
        </div>

        {/* Título con tipografía serif */}
        <Typography
          variant="h2"
          style={{
            fontSize: '1.65rem',
            color: '#FDFBF7',
            fontFamily: 'var(--font-serif, serif)',
            marginBottom: '12px',
            lineHeight: 1.25,
            fontWeight: 500,
          }}
        >
          {product.name}
        </Typography>

        {/* Precio, Descuento y Stock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '1.6rem',
              color: '#c5a880',
              fontWeight: 700,
              fontFamily: 'var(--font-sans, sans-serif)',
            }}
          >
            ${(product.promoPrice ?? product.price).toLocaleString('es-AR')}
          </span>
          {product.promoPrice && (
            <span
              style={{
                fontSize: '1rem',
                color: '#8a7d6b',
                textDecoration: 'line-through',
              }}
            >
              ${product.price.toLocaleString('es-AR')}
            </span>
          )}
          {product.promoPrice && (
            <span
              style={{
                fontSize: '0.7rem',
                backgroundColor: 'rgba(197, 168, 128, 0.18)',
                color: '#c5a880',
                border: '1px solid rgba(197, 168, 128, 0.4)',
                borderRadius: '6px',
                padding: '2px 8px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              PROMO
            </span>
          )}
          <span
            style={{
              fontSize: '0.78rem',
              color: product.stock > 0 ? '#9CA3AF' : '#EF4444',
              marginLeft: 'auto',
            }}
          >
            {product.stock > 0 ? `Stock: ${product.stock} disp.` : 'Sin stock disponible'}
          </span>
        </div>

        {/* Descripción breve */}
        {product.description && (
          <p
            style={{
              fontSize: '0.9rem',
              color: '#D5C8B4',
              lineHeight: 1.6,
              margin: '0 0 16px',
            }}
          >
            {product.description}
          </p>
        )}

        {/* Descripción poética/sensorial si existe */}
        {product.sensoryDescription && (
          <div
            style={{
              borderLeft: '3px solid #c5a880',
              padding: '10px 14px',
              marginBottom: '16px',
              backgroundColor: 'rgba(197, 168, 128, 0.08)',
              borderRadius: '0 8px 8px 0',
            }}
          >
            <p
              style={{
                fontSize: '0.85rem',
                color: '#E5D9C4',
                fontStyle: 'italic',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              "{product.sensoryDescription}"
            </p>
          </div>
        )}

        {/* Notas de aroma e ingredientes botánicos */}
        {(product.aroma || (product.ingredients && product.ingredients.length > 0)) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            {product.aroma && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  padding: '5px 12px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(79, 94, 76, 0.25)',
                  border: '1px solid rgba(79, 94, 76, 0.45)',
                  color: '#C7D9C4',
                }}
              >
                🌿 Aroma: {product.aroma}
              </span>
            )}
            {product.ingredients?.map((ing) => (
              <span
                key={ing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(197, 168, 128, 0.12)',
                  border: '1px solid rgba(197, 168, 128, 0.25)',
                  color: '#E5D9C4',
                }}
              >
                <Leaf size={12} color="#c5a880" />
                {ing}
              </span>
            ))}
          </div>
        )}

        {/* Fila de Acciones: Selector de cantidad, Favorito y Agregar al Carrito */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: '1px solid rgba(212, 175, 55, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              justifyContent: 'space-between',
            }}
          >
            {/* Selector de Cantidad */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '4px',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={handleDecrease}
                disabled={quantity <= 1 || product.stock === 0}
                aria-label="Disminuir cantidad"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: quantity <= 1 ? 'rgba(255, 255, 255, 0.25)' : '#FDFBF7',
                  cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (quantity > 1) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Minus size={16} />
              </button>

              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#FDFBF7',
                  minWidth: '24px',
                  textAlign: 'center',
                }}
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrease}
                disabled={quantity >= product.stock || product.stock === 0}
                aria-label="Aumentar cantidad"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: quantity >= product.stock ? 'rgba(255, 255, 255, 0.25)' : '#FDFBF7',
                  cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (quantity < product.stock) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Botón de Favorito */}
            <Button
              variant="secondary"
              onClick={() => onToggleFavorite(product.id)}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              style={{
                width: '44px',
                height: '44px',
                padding: 0,
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderColor: isFavorite ? 'rgba(158, 98, 82, 0.8)' : 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Heart
                size={20}
                color={isFavorite ? 'var(--color-terracota-suave, #9E6252)' : '#FDFBF7'}
                fill={isFavorite ? 'var(--color-terracota-suave, #9E6252)' : 'none'}
              />
            </Button>
          </div>

          {/* Botón Principal: Agregar al Carrito */}
          <Button
            variant="primary"
            disabled={product.stock === 0}
            onClick={handleAdd}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontWeight: 600,
              fontSize: '0.95rem',
              boxShadow: '0 8px 24px rgba(197, 168, 128, 0.25)',
            }}
          >
            <ShoppingCart size={18} />
            <span>
              {product.stock > 0
                ? `Agregar al Carrito (${quantity})`
                : 'Sin Stock'}
            </span>
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .product-detail-modal::-webkit-scrollbar {
          width: 6px;
        }
        .product-detail-modal::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .product-detail-modal::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.25);
          border-radius: 8px;
        }
        .product-detail-modal::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.45);
        }

        @media (max-width: 767px) {
          .product-detail-backdrop {
            padding: 12px !important;
          }
          .product-detail-modal {
            padding: 18px !important;
            max-height: 88dvh !important;
            border-radius: 14px !important;
          }
          .product-detail-image-wrapper {
            height: 180px !important;
            max-height: 180px !important;
            margin-bottom: 14px !important;
          }
          .product-detail-close-btn {
            top: 12px !important;
            right: 12px !important;
            width: 36px !important;
            height: 36px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
