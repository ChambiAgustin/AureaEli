import React from 'react';
import Typography from '../../../shared/components/Typography';
import { useContentBlocks } from '../../../core/hooks/useContentBlocks';

interface ManifestoSectionProps {
  addToRevealRefs?: (el: HTMLDivElement | null) => void;
}

export const ManifestoSection: React.FC<ManifestoSectionProps> = ({ addToRevealRefs }) => {
  const { getBlock } = useContentBlocks();

  return (
    <section
      className="reveal-on-scroll"
      ref={addToRevealRefs}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '100px auto',
        position: 'relative',
        width: '100%'
      }}
    >
      <div
        className="manifesto-circle"
        style={{
          width: 'min(90vw, 640px)',
          height: 'min(90vw, 640px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 30%, rgba(61, 46, 40, 0.9) 0%, rgba(36, 28, 24, 0.98) 100%)',
          border: '2px solid var(--color-dorado-mate)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(197, 160, 89, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'min(8vw, 65px)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 3,
          overflow: 'hidden'
        }}
      >
        {/* Brillos orbitales decorativos minimalistas */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '120%',
          height: '120%',
          background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(197, 160, 89, 0.03) 65%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'spin 120s linear infinite'
        }} />

        <Typography
          variant="caption"
          className="manifesto-tag"
          style={{
            color: 'var(--color-dorado-mate)',
            fontWeight: 'bold',
            letterSpacing: '0.25em',
            fontSize: 'clamp(0.6rem, 2vw, 0.75rem)',
            marginBottom: '16px'
          }}
        >
          El Manifiesto Áurea
        </Typography>

        <h2
          className="manifesto-title"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.1rem, 3.2vw, 1.85rem)',
            fontWeight: 300,
            lineHeight: '1.35',
            margin: '0 0 20px',
            color: '#F4DFB8',
            letterSpacing: '0.04em',
            textShadow: '0 2px 10px rgba(210, 180, 140, 0.15)'
          }}
        >
          {getBlock('home.manifesto.title', '“Vivimos a una velocidad que no le pertenece al alma. Nuestra sagrada intención es invitarte a frenar, encender un sahumerio y fundar tu espacio de paz.”')}
        </h2>

        <div
          className="manifesto-divider"
          style={{
            width: '40px',
            height: '1px',
            backgroundColor: 'var(--color-dorado-mate)',
            opacity: 0.5,
            margin: '0 auto 20px'
          }}
        />

        <p
          className="manifesto-text"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(0.75rem, 2vw, 0.95rem)',
            lineHeight: '1.65',
            color: '#E5DFD9',
            maxWidth: '480px',
            margin: '0 auto',
            fontWeight: 300
          }}
        >
          {getBlock('home.manifesto.body', 'Aurea Elizabeth nació de la búsqueda honesta de calma y texturas nobles en un mundo ruidoso. Elegimos conscientemente cada extracto herbáceo, cada veta de lino y cada trazo de arcilla cocida a horno de leña. La compra no es el fin, es la puerta de entrada a tu ritual sagrado.')}
        </p>
      </div>
    </section>
  );
};

export default ManifestoSection;
