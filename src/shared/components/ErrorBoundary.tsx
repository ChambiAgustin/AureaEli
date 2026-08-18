import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary con diseño sensorial de lujo para Aurea Elizabeth.
 * Captura excepciones no controladas en el árbol de componentes y presenta
 * una experiencia visual armónica y reconfortante en lugar de una pantalla en blanco.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Aurea Santuario ErrorBoundary]', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <main
          role="alert"
          style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-tierra-profunda, #E5D9C4)',
            backgroundImage: `
              radial-gradient(circle at 50% 30%, rgba(176, 142, 98, 0.12) 0%, transparent 65%),
              linear-gradient(rgba(245, 239, 228, 0.5), var(--color-tierra-profunda, #E5D9C4))
            `,
            padding: '24px',
            boxSizing: 'border-box',
            fontFamily: 'var(--font-sans, "Manrope", sans-serif)',
            color: 'var(--color-text-dark, #3D2E28)',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.82)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '24px',
              border: '1px solid rgba(176, 142, 98, 0.28)',
              boxShadow: '0 20px 45px -10px rgba(61, 46, 40, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
              padding: '48px 36px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            {/* Emblema Místico */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(176, 142, 98, 0.12)',
                border: '1px solid rgba(176, 142, 98, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#B08E62',
                boxShadow: '0 0 24px rgba(176, 142, 98, 0.2)',
              }}
            >
              <Sparkles size={34} strokeWidth={1.4} />
            </div>

            {/* Encabezado Editorial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#9E6252',
                  fontWeight: 600,
                }}
              >
                AUREA ELIZABETH · SANTUARIO
              </span>
              <h1
                style={{
                  fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)',
                  fontSize: '2.2rem',
                  fontWeight: 400,
                  color: 'var(--color-text-dark, #3D2E28)',
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                Pausa en el Santuario
              </h1>
            </div>

            {/* Mensaje Calmo */}
            <p
              style={{
                fontSize: '0.96rem',
                lineHeight: 1.65,
                color: 'var(--color-text-muted, #6E5C54)',
                margin: 0,
                maxWidth: '420px',
              }}
            >
              El flujo de la experiencia ha tenido una breve alteración en el plano terrenal.
              Te invitamos a reiniciar el santuario para restablecer la armonía y continuar tu recorrido.
            </p>

            {/* Botón de Acción Principal */}
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backgroundColor: 'var(--color-oliva-salvia, #4F5E4C)',
                color: 'var(--color-crema-calido, #F5EFE4)',
                border: 'none',
                borderRadius: '14px',
                padding: '14px 28px',
                fontSize: '0.92rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-sans, "Manrope", sans-serif)',
                cursor: 'pointer',
                boxShadow: '0 8px 20px -4px rgba(79, 94, 76, 0.35)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bosque-suave, #343F32)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(52, 63, 50, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-oliva-salvia, #4F5E4C)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(79, 94, 76, 0.35)';
              }}
            >
              <RotateCcw size={16} />
              Reiniciar Santuario
            </button>

            {/* Detalles técnicos sutiles en entorno de desarrollo */}
            {import.meta.env.DEV && this.state.error && (
              <details
                style={{
                  width: '100%',
                  marginTop: '12px',
                  textAlign: 'left',
                  fontSize: '0.78rem',
                  color: '#9E6252',
                  backgroundColor: 'rgba(158, 98, 82, 0.06)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(158, 98, 82, 0.18)',
                  cursor: 'pointer',
                }}
              >
                <summary style={{ fontWeight: 600, outline: 'none' }}>
                  Detalles del error (modo desarrollo)
                </summary>
                <pre
                  style={{
                    marginTop: '8px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.74rem',
                    color: '#3D2E28',
                  }}
                >
                  {this.state.error.toString()}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
