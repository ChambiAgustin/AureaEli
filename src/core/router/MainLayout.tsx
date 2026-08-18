import React, { Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Typography from '../../shared/components/Typography';
import SlideOutCart from '../../features/checkout/SlideOutCart';
import AmbientAudioPlayer from '../../features/rituals/AmbientAudioPlayer';
import AuthPage from '../../features/auth/AuthPage';
import logoImg from '../../assets/logo.png';
import sloganImg from '../../assets/slogan.png';
import { InteractiveParticles } from '../../shared/components/InteractiveParticles';
import { WHATSAPP_URL } from '../../shared/constants';
import {
  Home,
  Sparkles,
  Wind,
  ShoppingCart,
  User,
  Shield,
  X,
} from 'lucide-react';
import { useCart, useAuth, useToast } from '../context';

// Componente Fallback sutil con estética glassmorphic mística en tono dorado mate (#c5a880)
export const PageLoadingFallback: React.FC = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
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
        animation: 'spinFallback 1s linear infinite',
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
      Sintonizando Alquimia...
    </span>
    <style>{`
      @keyframes spinFallback {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/**
 * MainLayout
 * Shell arquitectónico visual persistente de la aplicación.
 * Contiene partículas de fondo, header sensorial, navegación flotante inferior,
 * modales globales de autenticación / carrito, y el footer de la marca.
 */
export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Contexts
  const { isCartOpen, openCart, closeCart, cartCount } = useCart();
  const { userProfile, isAdmin, isAuthModalOpen, closeAuthModal, refreshProfile } = useAuth();
  const { triggerToast } = useToast();

  const currentPath = location.pathname;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Fondo interactivo premium en Canvas 2D */}
      <InteractiveParticles />

      {/* ==================== HEADER SENSORIAL EDITORIAL ==================== */}
      <header
        className="templo-header"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: '24px 40px',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          zIndex: 1000,
        }}
      >
        {/* Reproductor de Música Ambiental Ritual */}
        <AmbientAudioPlayer />

        {/* Logo reactivo centrado editorialmente */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <img
            src={logoImg}
            alt="Aurea Elizabeth Logo"
            className="templo-logo-img"
            style={{
              height: '56px',
              width: 'auto',
              filter: 'brightness(1.05) drop-shadow(0 2px 10px rgba(245, 239, 228, 0.12))',
            }}
          />
          <img
            src={sloganImg}
            alt="El silencio es elocuente"
            className="templo-slogan-img"
            style={{
              height: '14px',
              width: 'auto',
              marginTop: '8px',
              opacity: 0.8,
            }}
          />
        </div>

        {/* Acceso Directo Estético (Administración / Perfil) en el extremo derecho */}
        <div
          style={{
            position: 'absolute',
            right: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          className="templo-header-actions"
        >
          {isAdmin && (
            <button
              className="templo-admin-btn"
              onClick={() => {
                triggerToast('Accediendo al Altar de Autogestión.');
                navigate('/admin');
              }}
              style={{
                background: currentPath === '/admin' ? 'rgba(197, 168, 128, 0.15)' : 'rgba(197, 168, 128, 0.05)',
                border: '1px solid rgba(176, 142, 98, 0.25)',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentPath === '/admin' ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 12px rgba(44, 36, 32, 0.03)',
              }}
              title="Portal de Administración"
            >
              <Shield size={18} style={{ strokeWidth: 1.5 }} />
            </button>
          )}

          <button
            className="templo-profile-btn"
            onClick={() => navigate('/perfil')}
            style={{
              background: currentPath === '/perfil' ? 'rgba(197, 168, 128, 0.15)' : 'rgba(197, 168, 128, 0.05)',
              border: '1px solid rgba(176, 142, 98, 0.15)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentPath === '/perfil' ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 12px rgba(44, 36, 32, 0.03)',
            }}
            title={userProfile ? `Perfil: ${userProfile.name}` : 'Mi Espacio Sagrado'}
          >
            <User size={20} style={{ strokeWidth: 1.5 }} />
          </button>
        </div>
      </header>

      {/* ==================== CONTENEDOR PRINCIPAL CON OUTLET ==================== */}
      <main
        className="container page-fade-in"
        style={{
          flex: '1 0 auto',
          paddingBottom: '80px',
          marginTop: '20px',
        }}
      >
        <Suspense fallback={<PageLoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>

      {/* ==================== FOOTER DE LUJO REFINADO ==================== */}
      <footer
        className="glass-panel templo-footer"
        style={{
          marginTop: '80px',
          padding: '60px 40px 120px', // Espaciado inferior para dejar libre la barra de navegación flotante
          borderTop: '1px solid rgba(210, 180, 140, 0.12)',
          background: 'rgba(21, 19, 17, 0.96)',
          borderRadius: '24px 24px 0 0',
          color: 'var(--color-crema-calido)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div
          className="footer-grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '40px',
          }}
        >
          {/* Columna 1: Logotipo, Slogan e Intención */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignSelf: 'flex-start',
                padding: '10px 0',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '180px',
                  height: '180px',
                  background:
                    'radial-gradient(circle, rgba(245, 239, 228, 0.1) 0%, rgba(176, 142, 98, 0.03) 45%, transparent 75%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  filter: 'blur(8px)',
                  zIndex: 0,
                }}
              />
              <img
                src={logoImg}
                alt="Aurea Elizabeth Logo"
                style={{
                  height: '42px',
                  width: 'auto',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'brightness(1.05) drop-shadow(0 2px 10px rgba(245, 239, 228, 0.12))',
                }}
              />
            </div>
            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-text-muted)',
                lineHeight: '1.6',
                marginTop: '10px',
              }}
            >
              “El bienestar no es una meta distante; es la decisión consciente de respirar con intención en este preciso instante.”
            </p>
          </div>

          {/* Columna 2: Navegación del Templo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Typography variant="caption" color="gold" weight="bold">
              El Templo
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <span
                onClick={() => navigate('/')}
                style={{ color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-dorado-mate)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                Inicio Sensorial
              </span>
              <span
                onClick={() => navigate('/catalogo')}
                style={{ color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-dorado-mate)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                Colección Botánica
              </span>
              <span
                onClick={() => navigate('/rituales')}
                style={{ color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-dorado-mate)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                Guía de Rituales
              </span>
              <span
                onClick={() => navigate('/perfil')}
                style={{ color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-dorado-mate)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                Mi Espacio Sagrado
              </span>
              <span
                onClick={() => navigate('/admin')}
                style={{ color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-dorado-mate)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                Altar de Autogestión
              </span>
            </div>
          </div>

          {/* Columna 3: Información Poética de Contacto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Typography variant="caption" color="gold" weight="bold">
              Contacto Álmico
            </Typography>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: 'inline-block', flexShrink: 0, opacity: 0.75 }}
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Salta, Argentina</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: 'inline-block', flexShrink: 0, opacity: 0.75 }}
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>almas@aureaelizabeth.com</span>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-dorado-mate)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ display: 'inline-block', flexShrink: 0 }}
                >
                  <path d="M12.004 2c-5.51 0-9.993 4.483-9.993 9.993 0 1.763.457 3.49 1.328 5.02L2 22l5.163-1.355c1.48.807 3.148 1.233 4.838 1.234h.005c5.508 0 9.99-4.483 9.99-9.994C21.996 6.483 17.513 2 12.004 2zm5.725 13.916c-.244.687-1.42 1.309-1.954 1.393-.473.074-.93.125-3.036-.757-2.693-1.127-4.42-3.87-4.555-4.053-.134-.183-1.102-1.467-1.102-2.799 0-1.332.695-1.986.945-2.247.25-.262.545-.327.728-.327.182 0 .364.001.52.01.162.008.38-.06.595.46.223.54.76 1.85.826 1.983.067.133.11.288.02.469-.09.18-.135.3-.27.458-.137.16-.288.356-.412.478-.137.133-.28.278-.12.553.16.275.71 1.171 1.522 1.895.666.593 1.228.97 1.524 1.117.296.147.467.123.642-.08.175-.203.76-.882.964-1.184.204-.302.408-.252.687-.15.28.102 1.77.834 2.073.987.303.153.504.229.577.354.073.126.073.729-.17 1.417z" />
                </svg>
                <span>+54 9 3875 21-8180</span>
              </a>
              <a
                href="https://instagram.com/aurea.elizabeth"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-dorado-mate)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: 'inline-block', flexShrink: 0 }}
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span>@aurea.elizabeth</span>
              </a>
              <span style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-dorado-mate)' }}>
                "Lunes a Viernes a ritmo lento y pausado"
              </span>
            </div>
          </div>
        </div>

        {/* Línea Divisoria y Copyright */}
        <div
          className="footer-bottom-container"
          style={{
            borderTop: '1px solid rgba(197, 168, 128, 0.15)',
            paddingTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <Typography variant="body-sm" color="muted" style={{ fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} Aurea Elizabeth. Hecho con intenciones puras y cuidado infinito.
          </Typography>
        </div>
      </footer>

      {/* ==================== BOTTOM FLOATING NAVIGATION BAR ==================== */}
      <nav
        className="glass-panel"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '92%',
          maxWidth: '560px',
          height: '68px',
          zIndex: 900,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 16px',
          border: '1px solid rgba(176, 142, 98, 0.25)',
          boxShadow: '0 12px 32px rgba(44, 36, 32, 0.06)',
          borderRadius: '24px',
          background: 'rgba(245, 239, 228, 0.72)',
          backdropFilter: 'blur(25px)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: currentPath === '/' ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: currentPath === '/' ? '600' : '400',
          }}
        >
          <Home size={18} />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => navigate('/catalogo')}
          style={{
            background: 'none',
            border: 'none',
            color: currentPath.startsWith('/catalogo') ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: currentPath.startsWith('/catalogo') ? '600' : '400',
          }}
        >
          <Sparkles size={18} />
          <span>Catálogo</span>
        </button>

        <button
          onClick={() => navigate('/rituales')}
          style={{
            background: 'none',
            border: 'none',
            color: currentPath.startsWith('/rituales') ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: currentPath.startsWith('/rituales') ? '600' : '400',
          }}
        >
          <Wind size={18} />
          <span>Rituales</span>
        </button>

        <button
          onClick={() => navigate('/perfil')}
          style={{
            background: 'none',
            border: 'none',
            color: currentPath.startsWith('/perfil') ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: currentPath.startsWith('/perfil') ? '600' : '400',
          }}
        >
          <User size={18} />
          <span>Perfil</span>
        </button>

        {/* BOTÓN DE CARRITO */}
        <button
          onClick={openCart}
          style={{
            background: 'none',
            border: 'none',
            color: isCartOpen ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: isCartOpen ? '600' : '400',
            position: 'relative',
          }}
        >
          <ShoppingCart size={18} />
          <span>Carrito</span>
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '2px',
                backgroundColor: 'var(--color-terracota-suave)',
                color: 'var(--color-crema-calido)',
                fontSize: '0.55rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '15px',
                height: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                animation: 'bounceBadge 0.3s ease-out',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      {/* ==================== MODALES GLOBALES ==================== */}

      {/* 1. Slide-out Cart Panel */}
      <SlideOutCart
        isOpen={isCartOpen}
        onClose={closeCart}
        onCheckoutStart={() => {
          closeCart();
          navigate('/checkout');
        }}
      />

      {/* 2. Modal de Autenticación / Registro de Alma */}
      {isAuthModalOpen && (
        <div
          onClick={closeAuthModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(21, 19, 17, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeInAuthModal 0.3s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={closeAuthModal}
              aria-label="Cerrar modal"
              style={{
                position: 'absolute',
                top: '52px',
                right: '32px',
                background: 'rgba(197, 168, 128, 0.15)',
                border: '1px solid rgba(197, 168, 128, 0.3)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-crema-calido, #f5efe4)',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(197, 168, 128, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(197, 168, 128, 0.15)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={16} />
            </button>
            <AuthPage
              onLoginSuccess={() => {
                refreshProfile();
                closeAuthModal();
              }}
            />
          </div>
        </div>
      )}

      {/* ==================== ESTILOS GLOBALES / RESPONSIVE ==================== */}
      <style>{`
        @keyframes bounceBadge {
          0% { transform: scale(0.3); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        @keyframes fadeInAuthModal {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Responsive Overrides for Templo App Frame */
        @media (max-width: 767px) {
          .templo-header {
            padding: 12px 16px !important;
            min-height: 60px !important;
          }
          .templo-header-actions {
            right: 16px !important;
            gap: 6px !important;
          }
          .templo-admin-btn,
          .templo-profile-btn {
            width: 38px !important;
            height: 38px !important;
          }
          .templo-logo-img {
            height: 44px !important;
          }
          .templo-slogan-img {
            height: 11px !important;
            margin-top: 4px !important;
          }
          main.container { margin-top: 0 !important; }
          .templo-footer {
            padding: 32px 16px 100px !important;
          }
          .templo-footer > div {
            gap: 28px !important;
          }
          .footer-grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px 16px !important;
          }
          .templo-footer > div[style*="borderTop"],
          .templo-footer > div[style*="border-top"],
          .footer-bottom-container {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
