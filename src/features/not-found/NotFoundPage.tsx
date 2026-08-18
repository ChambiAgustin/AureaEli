import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Home, ArrowLeft } from 'lucide-react';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { useSEO } from '../../core/seo/useSEO';

export const NotFoundPage: React.FC = () => {
  useSEO({
    title: 'Página no encontrada (404) | Aurea Elizabeth',
    description: 'El sendero que buscás no ha sido encontrado en nuestro santuario botánico.',
  });

  const navigate = useNavigate();

  return (
    <div
      className="page-fade-in"
      style={{
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <Card
        className="glass-panel"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '48px 32px',
          borderRadius: '28px',
          border: '1px solid rgba(197, 168, 128, 0.25)',
          background: 'rgba(35, 31, 28, 0.85)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Resplandor radial decorativo */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(197, 168, 128, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* Icono de Brújula Espiritual */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(197, 168, 128, 0.08)',
            border: '1px solid rgba(197, 168, 128, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            position: 'relative',
            animation: 'floatCompass 4s ease-in-out infinite',
          }}
        >
          <Compass size={32} color="var(--color-dorado-mate, #c5a880)" strokeWidth={1.5} />
        </div>

        <Typography variant="caption" color="gold" weight="bold">
          404 • Espacio en Silencio
        </Typography>

        <Typography
          variant="h2"
          style={{
            fontSize: '2rem',
            margin: '12px 0 16px',
            fontFamily: 'var(--font-serif, serif)',
            color: 'var(--color-crema-calido, #f5efe4)',
            letterSpacing: '0.04em',
          }}
        >
          Sendero No Explorado
        </Typography>

        <div
          style={{
            width: '40px',
            height: '1px',
            backgroundColor: 'var(--color-dorado-mate, #c5a880)',
            margin: '0 auto 20px',
            opacity: 0.6,
          }}
        />

        <Typography
          variant="body"
          color="muted"
          style={{
            fontSize: '0.95rem',
            lineHeight: '1.7',
            marginBottom: '32px',
            color: 'rgba(245, 239, 228, 0.75)',
          }}
        >
          El portal que buscás no ha sido trazado aún en nuestro santuario botánico.
          Hacé una pausa consciente, respirá con intención y permitite regresar al origen.
        </Typography>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <Button
            variant="terracota"
            size="lg"
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              maxWidth: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '16px',
            }}
          >
            <Home size={18} />
            <span>Regresar al Santuario</span>
          </Button>

          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-dorado-mate, #c5a880)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              opacity: 0.8,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
          >
            <ArrowLeft size={14} />
            <span>Volver a la página anterior</span>
          </button>
        </div>
      </Card>

      <style>{`
        @keyframes floatCompass {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(8deg); }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
