import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useToast } from '../context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute
 * Guard de seguridad para rutas protegidas del templo.
 * Valida el estado de autenticación y privilegios de administrador.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = true,
}) => {
  const { user, isAdmin, isLoading, openAuthModal } = useAuth();
  const { triggerToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        triggerToast('Se requiere iniciar sesión para acceder al Altar de Autogestión.', 'warning');
        openAuthModal();
      } else if (requireAdmin && !isAdmin) {
        triggerToast('Acceso reservado a guardianes del templo con privilegios de administración.', 'error');
      }
    }
  }, [isLoading, user, isAdmin, requireAdmin, openAuthModal, triggerToast]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          padding: '40px',
          borderRadius: '24px',
          background: 'rgba(197, 168, 128, 0.05)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(197, 168, 128, 0.2)',
          boxShadow: '0 8px 32px rgba(44, 36, 32, 0.05)',
          margin: '40px auto',
          maxWidth: '480px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '2px solid rgba(197, 168, 128, 0.2)',
            borderTopColor: 'var(--color-dorado-mate, #c5a880)',
            animation: 'spinProtected 1s linear infinite',
            marginBottom: '16px',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: '0.85rem',
            color: 'var(--color-dorado-mate, #c5a880)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Verificando Llaves Sagradas...
        </span>
        <style>{`
          @keyframes spinProtected {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
