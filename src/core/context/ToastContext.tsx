import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'gold';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  triggerToast: (message: string) => void; // Compatibilidad hacia atrás
  hideToast: (id?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const hideToast = useCallback((id?: string) => {
    setToasts((prev) => {
      if (!id) {
        // Limpiar todos
        timeoutsRef.current.forEach((t) => clearTimeout(t));
        timeoutsRef.current.clear();
        return [];
      }
      const timer = timeoutsRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timeoutsRef.current.delete(id);
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'gold', duration: number = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev.slice(-2), newToast]); // Mantiene máximo 3 toasts visibles

      const timer = setTimeout(() => {
        hideToast(id);
      }, duration);

      timeoutsRef.current.set(id, timer);
    },
    [hideToast]
  );

  const triggerToast = useCallback(
    (message: string) => {
      showToast(message, 'gold', 3500);
    },
    [showToast]
  );

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          background: 'rgba(28, 38, 29, 0.96)',
          border: '1px solid rgba(79, 94, 76, 0.6)',
          iconColor: '#7ba075',
          accentColor: 'var(--color-oliva-salvia, #4F5E4C)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(79, 94, 76, 0.2)',
        };
      case 'error':
        return {
          background: 'rgba(42, 22, 20, 0.96)',
          border: '1px solid rgba(158, 98, 82, 0.6)',
          iconColor: '#e07a68',
          accentColor: 'var(--color-terracota-suave, #9E6252)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(158, 98, 82, 0.2)',
        };
      case 'info':
        return {
          background: 'rgba(25, 23, 22, 0.96)',
          border: '1px solid rgba(197, 168, 128, 0.3)',
          iconColor: '#c5a880',
          accentColor: 'var(--color-dorado-mate, #B08E62)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(197, 168, 128, 0.1)',
        };
      case 'gold':
      default:
        return {
          background: 'rgba(28, 24, 20, 0.97)',
          border: '1px solid rgba(176, 142, 98, 0.55)',
          iconColor: '#d6b88d',
          accentColor: 'var(--color-dorado-mate, #B08E62)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5), 0 0 24px rgba(176, 142, 98, 0.25)',
        };
    }
  };

  const renderIcon = (type: ToastType, color: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color={color} style={{ flexShrink: 0 }} />;
      case 'error':
        return <AlertCircle size={18} color={color} style={{ flexShrink: 0 }} />;
      case 'info':
        return <Info size={18} color={color} style={{ flexShrink: 0 }} />;
      case 'gold':
      default:
        return <Sparkles size={18} color={color} style={{ flexShrink: 0 }} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, triggerToast, hideToast }}>
      {children}

      {/* Contenedor Visual de Toasts */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'fixed',
            bottom: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
            pointerEvents: 'none',
            maxWidth: '92vw',
            width: 'max-content',
          }}
        >
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            return (
              <div
                key={toast.id}
                style={{
                  pointerEvents: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 22px',
                  borderRadius: '30px',
                  background: styles.background,
                  color: 'var(--color-crema-calido, #F5EFE4)',
                  border: styles.border,
                  boxShadow: styles.boxShadow,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  fontSize: '0.86rem',
                  fontFamily: 'var(--font-sans, "Cinzel Decorative", sans-serif)',
                  letterSpacing: '0.02em',
                  lineHeight: 1.4,
                  textAlign: 'left',
                  animation: 'aureaToastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  transition: 'all 0.3s ease',
                  maxWidth: '520px',
                }}
              >
                {renderIcon(toast.type, styles.iconColor)}
                <span style={{ flex: 1 }}>{toast.message}</span>
                <button
                  onClick={() => hideToast(toast.id)}
                  aria-label="Cerrar notificación"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(245, 239, 228, 0.6)',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245, 239, 228, 0.6)')}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes aureaToastIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un <ToastProvider>');
  }
  return context;
};
