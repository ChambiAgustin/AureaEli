import React from 'react';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import { HelpCircle, ArrowRight } from 'lucide-react';

interface AlchemyExperienceBannerProps {
  onNavigate: (tab: 'home' | 'catalog' | 'rituals' | 'profile' | 'admin', category?: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const AlchemyExperienceBanner: React.FC<AlchemyExperienceBannerProps> = ({
  onNavigate,
  className,
  style
}) => {
  return (
    <div
      className={`glass-panel ${className || ''}`}
      style={{
        padding: '36px',
        border: '1px solid rgba(197, 168, 128, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.6), rgba(35, 31, 28, 0.95)), url(https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '440px',
        ...style
      }}
    >
      <div>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-dorado-mate)', fontWeight: 'bold', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HelpCircle size={14} />
          Filtro Sensorial
        </span>

        <Typography variant="h3" style={{ fontSize: '1.6rem', marginTop: '12px', marginBottom: '14px', color: 'var(--color-arena-tostada)' }}>
          Encuentra tu ritual de calma
        </Typography>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          color: 'rgba(234, 222, 201, 0.8)',
          marginBottom: '20px'
        }}>
          ¿Te sentís abrumado por la inmediatez? ¿Buscás purificar tu espacio o restaurar tu balance interno? Respondé un cuestionario místico de 4 preguntas y dejá que nuestro algoritmo holístico elija las alquimias perfectas para vos.
        </p>
      </div>

      {/* Graphic element representing Quiz states */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '16px',
        background: 'rgba(35, 31, 28, 0.6)',
        borderRadius: '16px',
        border: '1px solid rgba(197, 168, 128, 0.1)',
        margin: '10px 0'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(234, 222, 201, 0.55)' }}>Paso 1</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-arena-tostada)' }}>Sentir</span>
        </div>
        <div style={{ width: '20px', height: '1px', backgroundColor: 'var(--color-dorado-mate)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(234, 222, 201, 0.55)' }}>Paso 2</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-arena-tostada)' }}>Aroma</span>
        </div>
        <div style={{ width: '20px', height: '1px', backgroundColor: 'var(--color-dorado-mate)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(234, 222, 201, 0.55)' }}>Paso 3</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-arena-tostada)' }}>Ritual</span>
        </div>
      </div>

      <Button
        variant="terracota"
        onClick={() => onNavigate('rituals')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '16px'
        }}
      >
        <span>Descubrir mi Ritual</span>
        <ArrowRight size={14} />
      </Button>
    </div>
  );
};

export default AlchemyExperienceBanner;
