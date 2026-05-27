import React, { useState, useEffect } from 'react';
import type { Product } from '../../core/api/IRepository';
import { apiRepository } from '../../core/api';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import { X, Heart, ShoppingCart, ShieldCheck, Sparkles, Leaf } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}) => {
  const [activeProduct, setActiveProduct] = useState<Product>(product);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState<boolean>(true);

  // Sync state if product prop changes (e.g. when opening a different detail from other pages)
  useEffect(() => {
    setActiveProduct(product);
  }, [product]);

  // Load recommended products
  useEffect(() => {
    const fetchRecommended = async () => {
      setLoadingRecommended(true);
      try {
        const allProducts = await apiRepository.getProducts();
        // Filter out active product, and match by category or tags
        const filtered = allProducts
          .filter((p) => p.id !== activeProduct.id)
          .filter(
            (p) =>
              p.category === activeProduct.category ||
              p.tags.some((t) => activeProduct.tags.includes(t))
          )
          .slice(0, 3); // limit to 3 recommendations
        
        setRecommended(filtered);
      } catch (error) {
        console.error('Error fetching recommended products:', error);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchRecommended();
  }, [activeProduct]);

  // Prevent background scroll when modal is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(23, 20, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'backdropFadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'rgba(35, 31, 28, 0.95)',
          border: '1px solid rgba(197, 168, 128, 0.3)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '0',
          animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Floater */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            background: 'rgba(35, 31, 28, 0.8)',
            border: '1px solid rgba(197, 168, 128, 0.25)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-crema-calido)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotate(90deg)';
            e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotate(0deg)';
            e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.25)';
          }}
        >
          <X size={20} />
        </button>

        {/* Dos columnas de Ficha */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: '1fr 1.1fr', gap: '0' }}>
          
          {/* Columna Izquierda: Imagen Sensorial */}
          <div style={{
            position: 'relative',
            height: '350px',
            md: 'auto',
            minHeight: '400px',
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}>
            <img 
              src={activeProduct.imageUrl} 
              alt={activeProduct.name} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* Overlay sutil */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(35, 31, 28, 0) 60%, rgba(35, 31, 28, 0.9) 100%)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Columna Derecha: Detalle Sensorial */}
          <div style={{ padding: '40px 32px 32px 32px' }}>
            
            {/* Categoría & Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Typography variant="caption" color="gold" weight="semibold" style={{ fontSize: '0.75rem' }}>
                {activeProduct.category} — {activeProduct.subcategory}
              </Typography>
              
              {activeProduct.stock <= 5 && activeProduct.stock > 0 && (
                <span style={{
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  backgroundColor: 'rgba(194, 139, 120, 0.15)',
                  border: '1px solid var(--color-terracota-suave)',
                  color: 'var(--color-terracota-suave)',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  Últimos Cupos
                </span>
              )}
            </div>

            {/* Nombre */}
            <Typography variant="h2" style={{ fontSize: '1.8rem', marginBottom: '16px' }}>
              {activeProduct.name}
            </Typography>

            {/* Descripción poética destacada */}
            <div style={{
              borderLeft: '2px solid var(--color-dorado-mate)',
              paddingLeft: '16px',
              marginBottom: '24px',
              fontStyle: 'italic',
              backgroundColor: 'rgba(197, 168, 128, 0.03)',
              padding: '12px 16px 12px 20px',
              borderRadius: '0 8px 8px 0'
            }}>
              <Typography variant="body" color="light" style={{ fontSize: '0.98rem', lineHeight: '1.7' }}>
                "{activeProduct.sensoryDescription}"
              </Typography>
            </div>

            {/* Ingredientes Botánicos Clave */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Leaf size={14} color="var(--color-oliva-salvia)" />
                <Typography variant="caption" color="gold">Ingredientes Clave</Typography>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {activeProduct.ingredients.map((ing) => (
                  <span 
                    key={ing}
                    style={{
                      fontSize: '0.75rem',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(110, 126, 107, 0.1)',
                      border: '1px solid rgba(110, 126, 107, 0.25)',
                      color: 'var(--color-crema-calido)',
                      display: 'inline-block',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Detalles Técnicos Rápidos */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '30px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.04)'
            }}>
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Aroma</span>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-crema-calido)', fontWeight: '500' }}>{activeProduct.aroma}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Materialidad</span>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-crema-calido)', fontWeight: '500' }}>{activeProduct.material}</span>
              </div>
            </div>

            {/* Fila de Precio, Stock y CTA */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              sm: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              sm: 'align-items-center',
              gap: '16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography variant="h2" color="gold" style={{ fontSize: '2rem' }}>
                    ${activeProduct.price.toLocaleString('es-AR')}
                  </Typography>
                </div>
                <Typography variant="body-sm" color="muted" style={{ fontSize: '0.75rem' }}>
                  {activeProduct.stock > 0 ? `Stock disponible: ${activeProduct.stock} unidades` : 'Sin stock disponible'}
                </Typography>
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%', sm: 'width: auto' }}>
                <Button
                  variant="secondary"
                  onClick={() => onToggleFavorite(activeProduct.id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    borderColor: 'rgba(197, 168, 128, 0.4)'
                  }}
                >
                  <Heart 
                    size={18} 
                    color={isFavorite ? 'var(--color-terracota-suave)' : 'var(--color-crema-calido)'} 
                    fill={isFavorite ? 'var(--color-terracota-suave)' : 'none'} 
                  />
                </Button>
                
                <Button
                  variant="primary"
                  disabled={activeProduct.stock === 0}
                  onClick={() => onAddToCart(activeProduct)}
                  style={{
                    flex: 1,
                    padding: '14px 28px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <ShoppingCart size={16} />
                  <span>{activeProduct.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}</span>
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Sección: Recomendados en la base del modal */}
        <div style={{
          backgroundColor: 'rgba(23, 20, 18, 0.4)',
          borderTop: '1px solid rgba(197, 168, 128, 0.15)',
          padding: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Sparkles size={16} color="var(--color-dorado-mate)" />
            <Typography variant="caption" color="gold" weight="semibold">
              Productos Relacionados para tu Alquimia
            </Typography>
          </div>

          {loadingRecommended ? (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', padding: '20px 0' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Armonizando complementos...</span>
            </div>
          ) : recommended.length === 0 ? (
            <div style={{ padding: '10px 0' }}>
              <Typography variant="body-sm" color="muted">Este producto es una obra única. Experimentalo en su esencia.</Typography>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {recommended.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setActiveProduct(rec)}
                  style={{
                    backgroundColor: 'rgba(35, 31, 28, 0.8)',
                    border: '1px solid rgba(197, 168, 128, 0.1)',
                    borderRadius: '16px',
                    padding: '12px',
                    display: 'flex',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <img
                    src={rec.imageUrl}
                    alt={rec.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                    <Typography 
                      variant="body-sm" 
                      weight="medium" 
                      style={{ 
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '4px'
                      }}
                    >
                      {rec.name}
                    </Typography>
                    <Typography variant="caption" color="gold" style={{ fontSize: '0.75rem' }}>
                      ${rec.price.toLocaleString('es-AR')}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Estilos locales para las animaciones del modal */}
      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Queries para estilos responsivos puros sin Tailwind */
        @media (min-width: 768px) {
          div[style*="gridTemplateColumns: 1fr"] {
            grid-template-columns: 1fr 1.1fr !important;
          }
          div[style*="height: 350px"] {
            height: auto !important;
          }
          button[style*="display: none"] {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
