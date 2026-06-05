import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastContextValue {
  triggerToast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  triggerToast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMsg, setToastMsg] = useState('');
  const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const triggerToast = useCallback((msg: string) => {
    if (toastTimer) clearTimeout(toastTimer);
    setToastMsg(msg);
    const t = setTimeout(() => setToastMsg(''), 3000);
    setToastTimer(t);
  }, [toastTimer]);

  return (
    <ToastContext.Provider value={{ triggerToast }}>
      {children}
      {/* Toast UI — se renderiza una sola vez aquí, accesible desde cualquier componente */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 25, 22, 0.96)',
            color: 'var(--color-crema-calido)',
            padding: '13px 24px',
            borderRadius: '40px',
            border: '1px solid rgba(197, 168, 128, 0.25)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-sans)',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            maxWidth: '90vw',
            textAlign: 'center',
            animation: 'toastIn 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {toastMsg}
        </div>
      )}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

/** Hook para disparar toasts desde cualquier componente sin prop drilling */
export const useToast = () => useContext(ToastContext);
