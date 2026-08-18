import React, { useState, useEffect } from 'react';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import { Play, Pause } from 'lucide-react';

interface BreathingSimulatorProps {
  className?: string;
  style?: React.CSSProperties;
}

export const BreathingSimulator: React.FC<BreathingSimulatorProps> = ({ className, style }) => {
  const [breathPhase, setBreathPhase] = useState<'Inhalá' | 'Retené' | 'Exhalá' | 'Pausa'>('Pausa');
  const [breathActive, setBreathActive] = useState<boolean>(false);
  const [breathSeconds, setBreathSeconds] = useState<number>(4);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (breathActive) {
      timer = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'Pausa' || breathPhase === 'Exhalá') {
              setBreathPhase('Inhalá');
              return 4;
            } else if (breathPhase === 'Inhalá') {
              setBreathPhase('Retené');
              return 4;
            } else if (breathPhase === 'Retené') {
              setBreathPhase('Exhalá');
              return 4;
            }
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathPhase('Pausa');
      setBreathSeconds(4);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [breathActive, breathPhase]);

  const handleToggleBreathing = () => {
    setBreathActive(!breathActive);
    setBreathPhase(breathActive ? 'Pausa' : 'Inhalá');
    setBreathSeconds(4);
  };

  return (
    <div
      className={`glass-panel ${className || ''}`}
      style={{
        padding: '36px',
        border: '1px solid rgba(197, 168, 128, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'space-between',
        minHeight: '440px',
        ...style
      }}
    >
      <div>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-dorado-mate)', fontWeight: 'bold', letterSpacing: '0.15em' }}>
          El Respiro Sagrado
        </span>
        <Typography variant="h3" style={{ fontSize: '1.6rem', marginTop: '8px' }}>Técnica de Respiración Circular</Typography>
        <Typography variant="body-sm" color="muted" style={{ maxWidth: '300px', margin: '8px auto 0', fontSize: '0.85rem' }}>
          Reducí la ansiedad de inmediato sincronizando tu aire con el pulso botánico.
        </Typography>
      </div>

      {/* Círculo pulsante animado */}
      <div
        className={`breathing-circle ${
          breathActive && (breathPhase === 'Inhalá' || breathPhase === 'Retené') ? 'inhale' : ''
        } ${breathActive && breathPhase === 'Exhalá' ? 'exhale' : ''}`}
        style={{
          width: '160px',
          height: '160px',
          margin: '30px 0',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: breathActive
            ? ((breathPhase === 'Inhalá' || breathPhase === 'Retené') ? '0 0 50px rgba(176, 142, 98, 0.5)' : '0 0 30px rgba(79, 94, 76, 0.3)')
            : '0 8px 24px rgba(44, 36, 32, 0.05)',
          background: breathActive
            ? ((breathPhase === 'Inhalá' || breathPhase === 'Retené') ? 'radial-gradient(circle, var(--color-dorado-mate) 0%, var(--color-oliva-salvia) 100%)' : 'radial-gradient(circle, var(--color-bosque-suave) 0%, var(--color-arena-tostada) 100%)')
            : 'rgba(79, 94, 76, 0.08)',
          border: '1px solid rgba(176, 142, 98, 0.35)',
          color: breathActive ? 'var(--color-text-light)' : 'var(--color-oliva-salvia)'
        }}
      >
        {!breathActive ? (
          <Typography variant="h3" style={{ fontSize: '1.3rem', color: 'var(--color-oliva-salvia)', fontWeight: 'bold' }}>PAUSA</Typography>
        ) : (
          <>
            <Typography variant="h3" style={{ fontSize: '1.25rem', letterSpacing: '0.05em', color: 'var(--color-text-light)' }}>{breathPhase}</Typography>
            <span style={{ fontSize: '0.8rem', opacity: 0.9, fontFamily: 'var(--font-sans)', marginTop: '4px', color: 'var(--color-text-light)' }}>
              {breathSeconds} segundos
            </span>
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '240px' }}>
        <Button
          variant={breathActive ? 'secondary' : 'terracota'}
          onClick={handleToggleBreathing}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            ...(breathActive ? {
              color: 'var(--color-text-dark)',
              borderColor: 'var(--color-text-dark)',
              backgroundColor: 'rgba(61, 46, 40, 0.05)'
            } : {})
          }}
        >
          {breathActive ? <Pause size={14} /> : <Play size={14} />}
          <span>{breathActive ? 'Detener Ritual' : 'Iniciar Respiración'}</span>
        </Button>

        {breathActive && (
          <Typography variant="caption" color="gold" style={{ fontSize: '0.65rem' }}>
            * Inhalá (4s) → Retené (4s) → Exhalá (4s)
          </Typography>
        )}
      </div>
    </div>
  );
};

export default BreathingSimulator;
