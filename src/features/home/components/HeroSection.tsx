import React from 'react';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import logoAureaImg from '../../../assets/logo-aurea.png';
import { ShieldCheck, HeartHandshake, Compass } from 'lucide-react';
import { useContentBlocks } from '../../../core/hooks/useContentBlocks';

interface HeroSectionProps {
  onNavigate: (tab: 'home' | 'catalog' | 'rituals' | 'profile' | 'admin', category?: string) => void;
  addToRevealRefs?: (el: HTMLDivElement | null) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, addToRevealRefs }) => {
  const { getBlock } = useContentBlocks();

  return (
    <>
      {/* 1. HERO SENSORIAL CON HUMO DE SAHUMERIO */}
      <section
        className="hero-container"
        style={{
          position: 'relative',
          padding: '60px 0',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: 'var(--color-tierra-profunda)',
          borderBottom: '1px solid rgba(197, 160, 89, 0.18)',
          borderRadius: '24px',
          marginBottom: '60px'
        }}
      >
        {/* Capas de Humo de Sahumerio de Alta Gama con micro-animaciones en 3D */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
          {/* Hebra de Humo 1 (Bronce Intenso) */}
          <div style={{
            position: 'absolute',
            bottom: '0px',
            left: '32%',
            width: '45px',
            height: '420px',
            background: 'linear-gradient(to top, transparent, rgba(163, 107, 78, 0.06) 45%, transparent)',
            borderRadius: '50%',
            animation: 'floatSmoke 13s infinite ease-in-out',
            filter: 'blur(9px)',
          }} />
          {/* Hebra de Humo 2 (Oro Sagrado) */}
          <div style={{
            position: 'absolute',
            bottom: '0px',
            left: '52%',
            width: '55px',
            height: '470px',
            background: 'linear-gradient(to top, transparent, rgba(197, 160, 89, 0.06) 35%, transparent)',
            borderRadius: '50%',
            animation: 'floatSmoke 17s infinite ease-in-out',
            animationDelay: '2.5s',
            filter: 'blur(13px)',
          }} />
          {/* Hebra de Humo 3 (Teja Silvestre) */}
          <div style={{
            position: 'absolute',
            bottom: '0px',
            left: '46%',
            width: '24px',
            height: '380px',
            background: 'linear-gradient(to top, transparent, rgba(163, 107, 78, 0.05) 55%, transparent)',
            borderRadius: '50%',
            animation: 'floatSmoke 10s infinite ease-in-out',
            animationDelay: '5s',
            filter: 'blur(7px)',
          }} />
          {/* Hebra de Humo 4 (Niebla Bronce Suave) */}
          <div style={{
            position: 'absolute',
            bottom: '0px',
            left: '40%',
            width: '35px',
            height: '440px',
            background: 'linear-gradient(to top, transparent, rgba(163, 107, 78, 0.04) 50%, transparent)',
            borderRadius: '50%',
            animation: 'floatSmoke 21s infinite ease-in-out',
            animationDelay: '8.5s',
            filter: 'blur(11px)',
          }} />
        </div>

        {/* Gradiente de fondo sensorial */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 75% 35%, rgba(163, 107, 78, 0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 3, padding: '40px 24px' }}>
          {/* Contenedor del Hero Centrado de Lujo */}
          <div
            className="reveal-on-scroll active"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '20px',
              width: '100%',
              maxWidth: '820px',
              margin: '0 auto',
              zIndex: 10,
              position: 'relative'
            }}
          >
            {/* Contenedor del Círculo y del Logotipo + Tag */}
            <div
              className="hero-orbit-container"
              style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 0',
                zIndex: 1
              }}
            >
              {/* Geometría Sagrada Orbital de Fondo */}
              <div
                className="hero-orbit-circle"
                style={{
                  position: 'absolute',
                  top: '60%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 'min(95vw, 600px)',
                  height: 'min(95vw, 600px)',
                  borderRadius: '50%',
                  border: '1px dashed var(--color-selected-active, rgba(197, 160, 89, 0.3))',
                  animation: 'spin 180s linear infinite',
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              />

              {/* Tag superior minimalista */}
              <span style={{
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                color: 'var(--color-magenta-oscuro)',
                fontWeight: '600',
                marginBottom: '10px',
                zIndex: 1,
                position: 'relative'
              }}>
                {getBlock('home.hero.badge', '— Ritual y Pausa —')}
              </span>

              {/* Logo de la Marca en Gran Formato Amplio */}
              <img
                src={logoAureaImg}
                alt="Aurea Elizabeth Logo Completo"
                className="hero-brand-logo"
                style={{
                  width: '100%',
                  maxWidth: 'min(85vw, 380px)',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 24px rgba(44, 36, 32, 0.06))',
                  animation: 'pulseLogo 8s ease-in-out infinite',
                  margin: '10px 0',
                  zIndex: 1,
                  position: 'relative'
                }}
              />
            </div>

            {/* El Texto Poético Solicitado en Gran Formato Serif */}
            <p
              className="hero-slogan"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)',
                fontWeight: 300,
                lineHeight: '1.7',
                color: 'var(--color-text-dark)',
                fontStyle: 'italic',
                maxWidth: '760px',
                marginTop: '12px',
                letterSpacing: '0.02em'
              }}
            >
              {getBlock('home.hero.slogan', 'Un espacio dedicado a nutrir tu bienestar. Encontrá elementos de primera calidad y seleccionados con amor para intencionar tus días, armar tus altares y conectar con tu magia cotidiana, llenando de armonía cada rincón de tu hogar.')}
            </p>

            {/* Los Botones Interactivos */}
            <div
              className="hero-buttons-container"
              style={{
                display: 'flex',
                gap: '16px',
                marginTop: '24px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              <Button
                variant="terracota"
                size="lg"
                onClick={() => onNavigate('catalog')}
              >
                Ver colección
              </Button>
              <Button
                variant="terracota-outline"
                size="lg"
                onClick={() => onNavigate('rituals')}
              >
                Ver rituales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FAJA DE CONFIANZA POÉTICA */}
      <section
        className="reveal-on-scroll"
        ref={addToRevealRefs}
        style={{
          padding: '24px 0',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(197, 168, 128, 0.1)',
          borderBottom: '1px solid rgba(197, 168, 128, 0.1)',
          marginBottom: '80px'
        }}
      >
        <div className="container" style={{ padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px' }}>
              <ShieldCheck size={26} color="var(--color-oliva-salvia)" />
              <Typography variant="body" weight="semibold" style={{ fontSize: '0.95rem' }}>Compra Segura e Intuitiva</Typography>
              <Typography variant="body-sm" color="muted" style={{ fontSize: '0.82rem', maxWidth: '250px' }}>
                Pagos encriptados a través de canales protegidos para resguardar tu paz.
              </Typography>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px' }}>
              <HeartHandshake size={26} color="var(--color-terracota-suave)" />
              <Typography variant="body" weight="semibold" style={{ fontSize: '0.95rem' }}>Envíos con Cuidado Amoroso</Typography>
              <Typography variant="body-sm" color="muted" style={{ fontSize: '0.82rem', maxWidth: '250px' }}>
                Cada paquete se prepara artesanalmente, aromatizado con intenciones de bienestar.
              </Typography>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px' }}>
              <Compass size={26} color="var(--color-dorado-mate)" />
              <Typography variant="body" weight="semibold" style={{ fontSize: '0.95rem' }}>Almas Amigas</Typography>
              <Typography variant="body-sm" color="muted" style={{ fontSize: '0.82rem', maxWidth: '250px' }}>
                Atención humanizada y sensible para guiarte en la elección de tu ritual perfecto.
              </Typography>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
