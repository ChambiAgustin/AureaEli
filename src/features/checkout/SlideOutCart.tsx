import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import type { Product } from '../../core/api/IRepository';

interface SlideOutCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { product: Product; quantity: number }[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onCheckoutStart: () => void;
}

export const SlideOutCart: React.FC<SlideOutCartProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckoutStart,
}) => {
  if (!isOpen) return null;

  const totalCart = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <>
      {/* Backdrop con Blur y Fade-In */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(35, 31, 28, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 950,
          animation: 'fadeInBackdrop 0.4s ease-out',
        }}
      />

      {/* Drawer deslizante desde la derecha */}
      <div
        className="glass-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '100%',
          maxWidth: '480px',
          zIndex: 960,
          backgroundColor: 'rgba(35, 31, 28, 0.96)',
          borderLeft: '1px solid rgba(197, 168, 128, 0.2)',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          borderRadius: '24px 0 0 24px',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInCart 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          padding: '24px 20px',
        }}
      >
        {/* Cabecera del Carrito */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={20} color="var(--color-dorado-mate)" />
            <Typography variant="h3" color="light" style={{ fontSize: '1.4rem' }}>Tu Altar Sagrado</Typography>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(197, 168, 128, 0.2)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-crema-calido)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
              e.currentTarget.style.backgroundColor = 'rgba(197, 168, 128, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.2)';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Listado de Productos */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', textAlign: 'center', padding: '0 20px' }}>
              <ShoppingCart size={48} color="var(--color-dorado-mate)" style={{ opacity: 0.4, marginBottom: '16px' }} />
              <Typography variant="h3" color="light" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>El carrito está vacío</Typography>
              <Typography variant="body-sm" style={{ fontSize: '0.85rem', marginBottom: '20px', color: 'rgba(247, 244, 240, 0.7)' }}>
                Aún no has incorporado ningún producto al carrito.
              </Typography>
              <Button variant="primary" size="sm" onClick={onClose}>
                Explorar Categorías
              </Button>
            </div>
          ) : (
            cartItems.map((item) => (
              <Card
                key={item.product.id}
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  backgroundColor: 'rgba(35, 31, 28, 0.5)',
                  border: '1px solid rgba(197, 168, 128, 0.1)',
                  borderRadius: '16px',
                  transition: 'transform 0.2s ease',
                  color: 'var(--color-crema-calido)'
                }}
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '1px solid rgba(197, 168, 128, 0.15)',
                  }}
                />

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <Typography variant="caption" color="gold" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>
                    {item.product.category}
                  </Typography>
                  <Typography variant="body" color="light" weight="medium" style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.product.name}
                  </Typography>
                  <Typography variant="body-sm" color="gold" style={{ marginTop: '2px', fontSize: '0.8rem' }}>
                    ${item.product.price.toLocaleString('es-AR')}
                  </Typography>
                </div>

                {/* Controles del artículo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '2px 4px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-crema-calido)', display: 'flex', alignItems: 'center', padding: '2px' }}
                    >
                      <Minus size={10} />
                    </button>
                    <span style={{ fontSize: '0.75rem', minWidth: '14px', textAlign: 'center', fontWeight: '500' }}>{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-crema-calido)', display: 'flex', alignItems: 'center', padding: '2px' }}
                    >
                      <Plus size={10} />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveFromCart(item.product.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-terracota-suave)',
                      fontSize: '0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      opacity: 0.8,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  >
                    <Trash2 size={10} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Resumen y Botón de Pago */}
        {cartItems.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(247, 244, 240, 0.7)' }}>
                <span>Artículos en Altar</span>
                <span style={{ color: 'var(--color-crema-calido)' }}>{totalItems}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(247, 244, 240, 0.7)' }}>
                <span>Entrega Botánica</span>
                <span style={{ color: 'var(--color-oliva-salvia)', fontWeight: 'bold' }}>Bonificada (Gratis)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '8px', color: 'var(--color-crema-calido)' }}>
                <Typography variant="body" color="light" weight="medium">Aporte Total</Typography>
                <span style={{ color: 'var(--color-dorado-mate)', fontWeight: 'bold', fontFamily: 'var(--font-sans)' }}>
                  ${totalCart.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                onCheckoutStart();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                borderRadius: '16px',
                fontSize: '0.85rem',
              }}
            >
              <span>Iniciar Ritual de Compra</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Estilos locales para las animaciones del Drawer */}
      <style>{`
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInCart {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default SlideOutCart;
