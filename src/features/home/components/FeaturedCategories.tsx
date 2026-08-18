import React from 'react';
import Typography from '../../../shared/components/Typography';
import { useContentBlocks } from '../../../core/hooks/useContentBlocks';

interface FeaturedCategoriesProps {
  onNavigate: (tab: 'home' | 'catalog' | 'rituals' | 'profile' | 'admin', category?: string) => void;
  addToRevealRefs?: (el: HTMLDivElement | null) => void;
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ onNavigate, addToRevealRefs }) => {
  const { getBlock } = useContentBlocks();

  return (
    <section className="reveal-on-scroll" ref={addToRevealRefs} style={{ marginBottom: '80px' }}>
      <div className="container" style={{ padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Typography variant="caption" color="gold">{getBlock('home.categories.subtitle', 'Las Líneas de Calma')}</Typography>
          <Typography variant="h2" style={{ marginTop: '8px' }}>{getBlock('home.categories.title', 'Explorá por Universo Sensorial')}</Typography>
          <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-dorado-mate)', margin: '16px auto' }} />
        </div>


        <div className="categories-grid-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '20px',
          minHeight: '480px'
        }}>
          {/* 1. Aromaterapia (Col: 3, Row: 1) */}
          <div
            className="card-premium card-premium-hover"
            onClick={() => onNavigate('catalog', 'Aromaterapia')}
            style={{
              gridColumn: 'span 3',
              backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.4), rgba(35, 31, 28, 0.85)), url(https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=600&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minHeight: '280px',
              cursor: 'pointer',
              borderRadius: '20px',
              border: '1px solid rgba(197, 168, 128, 0.15)',
              padding: '24px'
            }}
          >
            <Typography variant="caption" color="gold">Óleos & Brumas</Typography>
            <Typography variant="h2" color="light" style={{ fontSize: '1.8rem', margin: '4px 0 8px' }}>Aromaterapia</Typography>
            <Typography variant="body-sm" color="light" style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
              Esencias puras prensadas en frío y brumas áuricas destiladas a mano.
            </Typography>
          </div>

          {/* 2. Bienestar y Spa (Col: 3, Row: 1) */}
          <div
            className="card-premium card-premium-hover"
            onClick={() => onNavigate('catalog', 'Spa')}
            style={{
              gridColumn: 'span 3',
              backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.4), rgba(35, 31, 28, 0.85)), url(https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minHeight: '280px',
              cursor: 'pointer',
              borderRadius: '20px',
              border: '1px solid rgba(197, 168, 128, 0.15)',
              padding: '24px'
            }}
          >
            <Typography variant="caption" color="gold">Cuidado de Sí</Typography>
            <Typography variant="h2" color="light" style={{ fontSize: '1.8rem', margin: '4px 0 8px' }}>Bienestar y Spa</Typography>
            <Typography variant="body-sm" color="light" style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
              Sales minerales, aceites de automasaje y arcillas purificadoras.
            </Typography>
          </div>

          {/* 3. Hogar con Intención (Col: 2) */}
          <div
            className="card-premium card-premium-hover"
            onClick={() => onNavigate('catalog', 'Hogar')}
            style={{
              gridColumn: 'span 2',
              backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.5), rgba(35, 31, 28, 0.9)), url(https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minHeight: '220px',
              cursor: 'pointer',
              borderRadius: '20px',
              border: '1px solid rgba(197, 168, 128, 0.15)',
              padding: '20px'
            }}
          >
            <Typography variant="caption" color="gold">Altares de Calma</Typography>
            <Typography variant="h3" color="light" style={{ fontSize: '1.4rem', margin: '4px 0' }}>Hogar con Intención</Typography>
            <Typography variant="body-sm" color="light" style={{ fontSize: '0.78rem' }}>
              Velas de soja, cerámicas y sahumerios de combustión lenta.
            </Typography>
          </div>

          {/* 4. Moda Consciente (Col: 2) */}
          <div
            className="card-premium card-premium-hover"
            onClick={() => onNavigate('catalog', 'Moda')}
            style={{
              gridColumn: 'span 2',
              backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.5), rgba(35, 31, 28, 0.9)), url(https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minHeight: '220px',
              cursor: 'pointer',
              borderRadius: '20px',
              border: '1px solid rgba(197, 168, 128, 0.15)',
              padding: '20px'
            }}
          >
            <Typography variant="caption" color="gold">Lino & Algodón Orgánico</Typography>
            <Typography variant="h3" color="light" style={{ fontSize: '1.4rem', margin: '4px 0' }}>Moda Consciente</Typography>
            <Typography variant="body-sm" color="light" style={{ fontSize: '0.78rem' }}>
              Prendas holgadas tejidas con amor para habitar tu cuerpo en libertad.
            </Typography>
          </div>

          {/* 5. Kits y Regalos (Col: 2) */}
          <div
            className="card-premium card-premium-hover"
            onClick={() => onNavigate('catalog', 'Kits')}
            style={{
              gridColumn: 'span 2',
              backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.5), rgba(35, 31, 28, 0.9)), url(https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minHeight: '220px',
              cursor: 'pointer',
              borderRadius: '20px',
              border: '1px solid rgba(197, 168, 128, 0.15)',
              padding: '20px'
            }}
          >
            <Typography variant="caption" color="gold">Cofres Sagrados</Typography>
            <Typography variant="h3" color="light" style={{ fontSize: '1.4rem', margin: '4px 0' }}>Kits y Regalos</Typography>
            <Typography variant="body-sm" color="light" style={{ fontSize: '0.78rem' }}>
              Combinaciones curadas para obsequiar calma, luz y sanación.
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
