import React, { useState } from 'react';
import type { Product } from '../../../core/api/IRepository';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface TestimonialsSectionProps {
  products?: Product[];
  onAddToCart: (product: Product) => void;
  addToRevealRefs?: (el: HTMLDivElement | null) => void;
}

const testimonialCopy = [
  {
    rating: 5,
    sales: 142,
    review: '“Un aroma sagrado que te ancla de inmediato. Lo uso al comenzar y al terminar el día laboral para limpiar mi campo áurico.”',
    author: 'Sofía M., Terapeuta Holística'
  },
  {
    rating: 5,
    sales: 98,
    review: '“No genera humo negro y el olor a resina pura te envuelve en una manta de total seguridad. Hermosa terminación artesanal.”',
    author: 'Bautista L., Diseñador de Interiores'
  },
  {
    rating: 4,
    sales: 210,
    review: '“El sándalo es genuino y su combustión lenta es perfecta para meditar. Se siente de verdad premium.”',
    author: 'Gabriela K., Instructora de Yoga'
  }
];

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  products = [],
  onAddToCart,
  addToRevealRefs
}) => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<number>(0);

  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const featuredForCarousel = safeProducts.filter(p => p.isFeatured);
  const bestSellers = (featuredForCarousel.length >= 3 ? featuredForCarousel : safeProducts).slice(0, 3);
  const activeBestSeller = bestSellers.length > 0 ? bestSellers[activeCarouselIndex % bestSellers.length] : null;
  const activeTestimonial = testimonialCopy[activeCarouselIndex % testimonialCopy.length];

  if (!activeBestSeller) return null;

  const handlePrevCarousel = () => {
    setActiveCarouselIndex((prev) => (prev === 0 ? bestSellers.length - 1 : prev - 1));
  };

  const handleNextCarousel = () => {
    setActiveCarouselIndex((prev) => (prev === bestSellers.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="reveal-on-scroll" ref={addToRevealRefs} style={{ marginBottom: '80px' }}>
      <div className="container" style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <Typography variant="caption" color="gold">Testimoniales Sensoriales</Typography>
            <Typography variant="h2" style={{ marginTop: '8px' }}>Los Rituales más Elegidos</Typography>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrevCarousel}
              aria-label="Testimonio anterior"
              style={{
                background: 'rgba(44, 36, 32, 0.04)',
                border: '1px solid rgba(176, 142, 98, 0.35)',
                color: 'var(--color-text-dark)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
                e.currentTarget.style.background = 'rgba(44, 36, 32, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.35)';
                e.currentTarget.style.background = 'rgba(44, 36, 32, 0.04)';
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextCarousel}
              aria-label="Siguiente testimonio"
              style={{
                background: 'rgba(44, 36, 32, 0.04)',
                border: '1px solid rgba(176, 142, 98, 0.35)',
                color: 'var(--color-text-dark)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
                e.currentTarget.style.background = 'rgba(44, 36, 32, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.35)';
                e.currentTarget.style.background = 'rgba(44, 36, 32, 0.04)';
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Item de Carrusel Activo */}
        <div
          className="glass-panel testimonial-carousel-panel"
          style={{
            padding: '40px',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '32px',
            alignItems: 'center',
            border: '1px solid rgba(176, 142, 98, 0.22)',
            position: 'relative'
          }}
        >
          <div className="grid-2" style={{ alignItems: 'center', gap: '32px' }}>
            <div style={{ height: '280px', borderRadius: '16px', overflow: 'hidden' }}>
              <img
                src={activeBestSeller.imageUrl}
                alt={activeBestSeller.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    color="var(--color-dorado-mate)"
                    fill={i < activeTestimonial.rating ? 'var(--color-dorado-mate)' : 'none'}
                  />
                ))}
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                  ({activeTestimonial.sales} almas conformes)
                </span>
              </div>

              <Typography variant="caption" color="gold">{activeBestSeller.category}</Typography>
              <Typography variant="h2" style={{ fontSize: '1.8rem', color: 'var(--color-text-dark)' }}>{activeBestSeller.name}</Typography>

              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.25rem',
                lineHeight: '1.6',
                fontStyle: 'italic',
                color: 'var(--color-text-dark)'
              }}>
                {activeTestimonial.review}
              </p>

              <div>
                <Typography variant="body" weight="semibold" style={{ display: 'block', fontSize: '0.9rem' }}>{activeTestimonial.author}</Typography>
                <Typography variant="body-sm" color="gold" style={{ fontSize: '0.8rem' }}>Comprador verificado</Typography>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAddToCart(activeBestSeller)}
                >
                  Llevar este elemento — ${(activeBestSeller.promoPrice ?? activeBestSeller.price).toLocaleString('es-AR')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Paginador visual de puntitos */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '24px'
        }}>
          {bestSellers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCarouselIndex(idx)}
              aria-label={`Ir al testimonio ${idx + 1}`}
              style={{
                width: idx === activeCarouselIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: idx === activeCarouselIndex ? 'var(--color-dorado-mate)' : 'rgba(61, 46, 40, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
