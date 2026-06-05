import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Componente reutilizable para mostrar errores de carga con botón de reintento.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Hubo un problema al cargar los datos.',
  onRetry,
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    gap: '16px',
    textAlign: 'center',
  }}>
    <div style={{
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'rgba(163,76,55,0.08)',
      border: '1px solid rgba(163,76,55,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <AlertTriangle size={24} color="#A34C37" />
    </div>

    <p style={{
      color: 'var(--color-text-muted)',
      fontSize: '0.9rem',
      fontFamily: 'var(--font-sans)',
      margin: 0,
      maxWidth: 360,
    }}>
      {message}
    </p>

    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '9px 18px',
          background: 'transparent',
          border: '1px solid rgba(176,142,98,0.35)',
          borderRadius: 10,
          color: 'var(--color-bosque-suave)',
          fontSize: '0.82rem',
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-dorado-mate)'; e.currentTarget.style.background = 'rgba(176,142,98,0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(176,142,98,0.35)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <RefreshCw size={14} />
        Reintentar
      </button>
    )}
  </div>
);
