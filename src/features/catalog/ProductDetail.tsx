import React, { useState, useEffect } from 'react';
import type { Product } from '../../core/api/IRepository';
import { apiRepository } from '../../core/api';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import { X, Heart, ShoppingCart, Sparkles, Leaf } from 'lucide-react';
import { HapticsService } from '../../core/services/HapticsService';

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

  const INTENCIONES_MAP: Record<string, string> = {
    'copal y rosas': 'Copal y Rosas: Sintonía de amor propio y purificación áurica. El copal limpia las energías estancadas abriendo el canal espiritual, mientras que los pétalos de rosa atraen la armonía y la compasión hacia uno mismo y el entorno.',
    'copal': 'Copal Sagrado: Resina ancestral de purificación y conexión espiritual. Limpia ambientes de densidades energéticas, elevando la vibración del espacio y favoreciendo estados meditativos profundos.',
    'rosas': 'Rosas Místicas: Elemento dulce y femenino para consagrar la armonía, la ternura y la vibración del amor. Ideal para atenuar tensiones cotidianas y endulzar el aire áurico de tu hogar.',
    'sándalo': 'Sándalo Sagrado: Protector espiritual y pacificador mental. Calma la ansiedad, estimula el enraizamiento y propicia una atmósfera de serenidad mental ideal para la introspección y el yoga.',
    'lavanda': 'Lavanda Silvestre: Elixir de relajación profunda y paz nocturna. Su sutil humo ayuda a inducir el descanso físico y mental, aplacando la hiperactividad del sistema nervioso.',
    'romero': 'Romero Consagrado: Claridad mental, protección activa y renovación energética. Ideal para encender al comenzar tus tareas, estimulando el foco intelectual y disipando las dudas mentales.'
  };

  const getIntencionTexto = () => {
    const nameLower = activeProduct.name.toLowerCase();
    const descLower = activeProduct.description?.toLowerCase() || '';
    const tagsLower = activeProduct.tags?.map(t => t.toLowerCase()) || [];
    
    for (const [key, value] of Object.entries(INTENCIONES_MAP)) {
      if (nameLower.includes(key) || descLower.includes(key) || tagsLower.includes(key)) {
        return value;
      }
    }
    
    return 'Armonía Botánica: Intención sagrada y vibración natural. Sahumado artesanal elaborado a base de resinas nobles y hierbas medicinales seleccionadas con amor para purificar tu ambiente, restaurar la calma y consagrar tu santuario cotidiano.';
  };

  useEffect(() => {
    setActiveProduct(product);
  }, [product]);

  useEffect(() => {
    const fetchRecommended = async () => {
      setLoadingRecommended(true);
      try {
        const allProducts = await apiRepository.getProducts();
        const filtered = allProducts
          .filter((p) => p.id !== activeProduct.id)
          .filter(
            (p) =>
              p.category === activeProduct.category ||
              p.tags.some((t) => activeProduct.tags.includes(t))
          )
          .slice(0, 3);
        
        setRecommended(filtered);
      } catch (error) {
        console.error('Error fetching recommended products:', error);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchRecommended();
  }, [activeProduct]);

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
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 12, 11, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 2000,
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'backdropFadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(90vw, 950px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'rgba(245, 239, 228, 0.95)',
          borderRadius: '28px',
          border: '1.5px solid var(--color-dorado-mate, #c5a880)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.6)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón "✕" de cierre prominente */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Cerrar modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 100,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1.5px solid var(--color-dorado-mate, #c5a880)',
            color: 'var(--color-tierra-profunda, #0f0c0b)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotate(90deg)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(197, 168, 128, 0.8), 0 4px 15px rgba(0,0,0,0.2)';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
          }}
        >
          ✕
        </button>

        {/* Layout en dos columnas */}
        <div className="grid-responsive-2" style={{ gap: '28px', alignItems: 'flex-start' }}>
          
          {/* Columna Izquierda: Foto gigante HD con bordes suaves de 20px */}
          <div 
            className="product-detail-image-container" 
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(15, 12, 11, 0.15)',
              backgroundColor: 'rgba(0,0,0,0.03)',
            }}
          >
            <img 
              src={activeProduct.imageUrl} 
              alt={activeProduct.name} 
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '520px',
                objectFit: 'cover',
                borderRadius: '20px',
                display: 'block'
              }}
            />
          </div>

          {/* Columna Derecha: Detalle Sensorial y Chips */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Categoría & Stock */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#a38053', fontWeight: 600 }}>
                {activeProduct.category} — {activeProduct.subcategory}
              </span>
              
              {activeProduct.stock <= 5 && activeProduct.stock > 0 && (
                <span style={{
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  backgroundColor: 'rgba(158, 98, 82, 0.12)',
                  border: '1px solid rgba(158, 98, 82, 0.3)',
                  color: '#9e6252',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  Últimos Cupos
                </span>
              )}
            </div>

            {/* Nombre */}
            <Typography variant="h2" style={{ fontSize: '1.9rem', color: '#0f0c0b', marginBottom: '14px', lineHeight: '1.2' }}>
              {activeProduct.name}
            </Typography>

            {/* Descripción poética destacada */}
            <div style={{
              borderLeft: '3px solid var(--color-dorado-mate, #c5a880)',
              padding: '12px 16px',
              marginBottom: '20px',
              backgroundColor: 'rgba(197, 168, 128, 0.08)',
              borderRadius: '0 12px 12px 0'
            }}>
              <p style={{ fontSize: '0.96rem', color: '#3d322c', fontStyle: 'italic', margin: 0, lineHeight: '1.6' }}>
                "{activeProduct.sensoryDescription}"
              </p>
            </div>

            {/* Chip de Intención Sagrada */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={16} color="var(--color-dorado-mate, #c5a880)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f0c0b' }}>
                  Intención Sagrada
                </span>
              </div>
              <div style={{
                padding: '14px 18px',
                borderRadius: '16px',
                backgroundColor: 'rgba(197, 168, 128, 0.12)',
                border: '1px solid rgba(197, 168, 128, 0.35)',
                color: '#2c2420',
                fontSize: '0.88rem',
                lineHeight: '1.6'
              }}>
                {getIntencionTexto()}
              </div>
            </div>

            {/* Chips de Aroma e Ingredientes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              
              {/* Chip Aroma */}
              {activeProduct.aroma && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#594d42', marginBottom: '6px' }}>
                    Aroma Principal
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    padding: '6px 14px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(79, 94, 76, 0.12)',
                    border: '1px solid rgba(79, 94, 76, 0.3)',
                    color: '#2b3829',
                    fontFamily: 'var(--font-sans)'
                  }}>
                    🌿 {activeProduct.aroma}
                  </span>
                </div>
              )}

              {/* Chips Ingredientes */}
              {activeProduct.ingredients && activeProduct.ingredients.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Leaf size={14} color="var(--color-oliva-salvia, #4f5e4c)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#594d42' }}>
                      Ingredientes Botánicos
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {activeProduct.ingredients.map((ing) => (
                      <span 
                        key={ing}
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          padding: '6px 14px',
                          borderRadius: '20px',
                          backgroundColor: 'rgba(197, 168, 128, 0.15)',
                          border: '1px solid rgba(197, 168, 128, 0.4)',
                          color: '#3d3024',
                          fontFamily: 'var(--font-sans)'
                        }}
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Fila de Precio y CTA */}
            <div className="product-detail-purchase-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              borderTop: '1px solid rgba(197, 168, 128, 0.25)',
              paddingTop: '20px',
              marginTop: 'auto'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <Typography variant="h2" style={{ fontSize: '2rem', color: '#a38053', fontWeight: 700 }}>
                    ${(activeProduct.promoPrice ?? activeProduct.price).toLocaleString('es-AR')}
                  </Typography>
                  {activeProduct.promoPrice && (
                    <span style={{ fontSize: '1.1rem', color: '#8a7d6b', textDecoration: 'line-through' }}>
                      ${activeProduct.price.toLocaleString('es-AR')}
                    </span>
                  )}
                  {activeProduct.promoPrice && (
                    <span style={{ fontSize: '0.72rem', background: 'rgba(158,98,82,0.15)', color: '#9e6252', border: '1px solid rgba(158,98,82,0.3)', borderRadius: 6, padding: '3px 8px', fontWeight: 700, letterSpacing: '0.5px' }}>
                      PROMO
                    </span>
                  )}
                </div>
                <span style={{ display: 'block', fontSize: '0.78rem', color: '#6e6357', marginTop: '2px' }}>
                  {activeProduct.stock > 0 ? `Stock disponible: ${activeProduct.stock} unidades` : 'Sin stock disponible'}
                </span>
              </div>

              <div className="product-detail-buttons-container" style={{ display: 'flex', gap: '12px' }}>
                <Button
                  variant="secondary"
                  onClick={() => onToggleFavorite(activeProduct.id)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    borderColor: 'rgba(197, 168, 128, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    color: '#0f0c0b'
                  }}
                >
                  <Heart 
                    size={20} 
                    color={isFavorite ? 'var(--color-terracota-suave, #9e6252)' : '#0f0c0b'} 
                    fill={isFavorite ? 'var(--color-terracota-suave, #9e6252)' : 'none'} 
                  />
                </Button>
                
                <Button
                  variant="primary"
                  disabled={activeProduct.stock === 0}
                  onClick={() => {
                    HapticsService.success();
                    onAddToCart(activeProduct);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px 28px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 8px 24px rgba(197, 168, 128, 0.4)'
                  }}
                >
                  <ShoppingCart size={18} />
                  <span>{activeProduct.stock > 0 ? 'Agregar al Altar / Carrito' : 'Sin Stock'}</span>
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Sección: Recomendados en la base del modal */}
        <div style={{
          backgroundColor: 'rgba(235, 227, 212, 0.5)',
          border: '1px solid rgba(197, 168, 128, 0.25)',
          borderRadius: '20px',
          padding: '24px',
          marginTop: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={16} color="var(--color-dorado-mate, #c5a880)" />
            <Typography variant="caption" style={{ color: '#0f0c0b', fontWeight: 700, fontSize: '0.85rem' }}>
              Productos Relacionados para tu Alquimia
            </Typography>
          </div>

          {loadingRecommended ? (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', padding: '16px 0' }}>
              <span style={{ fontSize: '0.85rem', color: '#6e6357' }}>Armonizando complementos...</span>
            </div>
          ) : recommended.length === 0 ? (
            <div style={{ padding: '8px 0' }}>
              <Typography variant="body-sm" style={{ color: '#6e6357' }}>Este producto es una obra única. Experimentalo en su esencia.</Typography>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {recommended.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setActiveProduct(rec)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid rgba(197, 168, 128, 0.3)',
                    borderRadius: '16px',
                    padding: '12px',
                    display: 'flex',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-dorado-mate, #c5a880)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={rec.imageUrl}
                    alt={rec.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '10px'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                    <Typography 
                      variant="body-sm" 
                      weight="medium" 
                      style={{ 
                        fontSize: '0.82rem',
                        color: '#0f0c0b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '4px'
                      }}
                    >
                      {rec.name}
                    </Typography>
                    <Typography variant="caption" style={{ color: '#a38053', fontWeight: 600, fontSize: '0.78rem' }}>
                      ${rec.price.toLocaleString('es-AR')}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Estilos locales para animaciones y responsividad */}
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
        
        .product-detail-image-container {
          height: 300px;
        }
        .product-detail-purchase-row {
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }
        .product-detail-buttons-container {
          width: 100%;
        }
        @media (min-width: 768px) {
          .product-detail-image-container {
            height: 100% !important;
            min-height: 400px;
          }
        }
        @media (min-width: 640px) {
          .product-detail-purchase-row {
            flex-direction: row !important;
            align-items: center !important;
          }
          .product-detail-buttons-container {
            width: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
