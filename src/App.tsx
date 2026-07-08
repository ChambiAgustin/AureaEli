import React, { useState, useEffect } from 'react';
import Typography from './shared/components/Typography';
import Button from './shared/components/Button';
import Card from './shared/components/Card';
import HomePage from './features/home/HomePage';
import CatalogPage from './features/catalog/CatalogPage';
import RitualsPage from './features/rituals/RitualsPage';
import SlideOutCart from './features/checkout/SlideOutCart';
import CheckoutFlow from './features/checkout/CheckoutFlow';
import ProfilePage from './features/profile/ProfilePage';
import AuthPage from './features/auth/AuthPage';
import { AdminPage } from './features/admin/AdminPage';
import { apiRepository } from './core/api';
import { supabase } from './core/supabase/client';
import type { Product, UserProfile, Order } from './core/api/IRepository';
import logoImg from './assets/logo.png';
import sloganImg from './assets/slogan.png';
import { InteractiveParticles } from './shared/components/InteractiveParticles';
import { WHATSAPP_URL } from './shared/constants';
import {
  Home,
  Sparkles,
  Wind,
  ShoppingCart,
  User,
} from 'lucide-react';

// Tipado para paleta cromática de la Home
interface ColorToken {
  name: string;
  variable: string;
  hex: string;
  meaning: string;
  mood: string;
}

const colorPalette: ColorToken[] = [
  {
    name: 'Tierra Profunda',
    variable: '--color-tierra-profunda',
    hex: '#E5D9C4',
    meaning: 'La base de arena y lino que ancla tu respiración.',
    mood: 'Estabilidad y Arraigo'
  },
  {
    name: 'Arena Tostada',
    variable: '--color-arena-tostada',
    hex: '#D5C8B4',
    meaning: 'La calidez orgánica de las texturas que nos sostienen.',
    mood: 'Pausa y Refugio'
  },
  {
    name: 'Crema Cálido',
    variable: '--color-crema-calido',
    hex: '#F5EFE4',
    meaning: 'La luz tenue que invita a respirar con tranquilidad.',
    mood: 'Claridad y Calma'
  },
  {
    name: 'Oliva Salvia',
    variable: '--color-oliva-salvia',
    hex: '#4F5E4C',
    meaning: 'La conexión botánica que restaura el flujo vital.',
    mood: 'Armonía y Equilibrio'
  },
  {
    name: 'Bosque Suave',
    variable: '--color-bosque-suave',
    hex: '#343F32',
    meaning: 'La sabiduría y quietud de los espacios inexplorados.',
    mood: 'Paz Profunda'
  },
  {
    name: 'Dorado Mate',
    variable: '--color-dorado-mate',
    hex: '#B08E62',
    meaning: 'El brillo sutil de los detalles que importan.',
    mood: 'Sutileza y Valor'
  },
  {
    name: 'Terracota Suave',
    variable: '--color-terracota-suave',
    hex: '#9E6252',
    meaning: 'El fuego lento que reconforta el alma cansada.',
    mood: 'Calidez Humana'
  },
  {
    name: 'Magenta Oscuro',
    variable: '--color-magenta-oscuro',
    hex: '#8A004F',
    meaning: 'Un acento vibrante de vitalidad y misterio profundo.',
    mood: 'Vitalidad y Misterio'
  }
];

function App() {
  // Navigation Tabs: 'home' | 'catalog' | 'rituals' | 'profile' | 'admin'
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'rituals' | 'profile' | 'admin'>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');

  // Application Data States
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Modals / Panels toggles
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  // Home Interactive states (from Phase 1)
  const [selectedColor, setSelectedColor] = useState<ColorToken>(colorPalette[0]);
  const [breathPhase, setBreathPhase] = useState<'Espera' | 'Inhalá' | 'Retené' | 'Exhalá'>('Espera');
  const [breathActive, setBreathActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(4);

  // Decoupled reactive navigation handler
  const handleNavigate = (tab: 'home' | 'catalog' | 'rituals' | 'profile' | 'admin', category?: string) => {
    setActiveTab(tab);
    if (category) {
      setSelectedCategoryFilter(category);
      triggerToast(`Abriendo catálogo pre-filtrado por: ${category}`);
    } else {
      setSelectedCategoryFilter('');
    }
    if (tab === 'admin') {
      triggerToast('Accediendo al Altar de Autogestión.');
    }
  };

  // Toast Trigger
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  };

  // Scroll to top automatically when activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Cargar perfil y órdenes cuando hay una sesión real de Supabase Auth,
  // y limpiarlos al cerrar sesión (antes esto era un perfil mockeado fijo)
  useEffect(() => {
    const loadForSession = async (hasSession: boolean) => {
      if (!hasSession) {
        setUserProfile(null);
        setFavorites([]);
        setOrders([]);
        return;
      }
      try {
        const profile = await apiRepository.getUserProfile();
        setUserProfile(profile);
        setFavorites(profile.favorites || []);

        const ordersData = await apiRepository.getOrders();
        setOrders(ordersData);
      } catch (err) {
        console.error('Error loading initial app data:', err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadForSession(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadForSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Home Breathing timer effect
  useEffect(() => {
    let interval: any = null;

    if (breathActive) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'Espera' || breathPhase === 'Exhalá') {
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
      setBreathPhase('Espera');
      setCountdown(4);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breathActive, breathPhase]);

  // Toggle favorites with persistence
  const handleToggleFavorite = async (productId: string) => {
    if (!userProfile) {
      triggerToast('Iniciá sesión para guardar en tus intenciones sagradas.');
      setActiveTab('profile');
      return;
    }

    const isFav = favorites.includes(productId);
    const updatedFavs = isFav
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];

    setFavorites(updatedFavs);

    const updatedProfile: UserProfile = {
      ...userProfile,
      favorites: updatedFavs
    };
    setUserProfile(updatedProfile);

    try {
      await apiRepository.updateUserProfile(updatedProfile);
      triggerToast(isFav ? 'Eliminado de tus intenciones.' : 'Guardado en tus intenciones sagradas.');
    } catch (err) {
      console.error('Error updating favorites profile:', err);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        triggerToast(`Se incrementó la dosis de: ${product.name}`);
        return prevItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      triggerToast(`Agregado a tu altar: ${product.name}`);
      return [...prevItems, { product, quantity: 1 }];
    });
  };

  const handleAddMultipleToCart = (productsToAdd: Product[]) => {
    setCartItems((prevItems) => {
      let updated = [...prevItems];
      productsToAdd.forEach((product) => {
        const existing = updated.find((item) => item.product.id === product.id);
        if (existing) {
          updated = updated.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          updated.push({ product, quantity: 1 });
        }
      });
      return updated;
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      });
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
    triggerToast('Elemento removido.');
  };

  // Actualizar el carrito en caliente si un producto fue editado o eliminado
  const handleSyncCartWithRepository = async () => {
    try {
      const dbProducts = await apiRepository.getProducts();
      setCartItems((prevItems) => {
        return prevItems.map((item) => {
          const matchingDbProduct = dbProducts.find((p) => p.id === item.product.id);
          if (matchingDbProduct) {
            return { ...item, product: matchingDbProduct };
          }
          return item;
        }).filter(item => dbProducts.some(p => p.id === item.product.id)); // Remueve si fue eliminado del altar
      });
    } catch (err) {
      console.error('Error syncing cart with DB:', err);
    }
  };

  // Handles completion of CheckoutFlow
  const handleOrderComplete = async (completedOrder: Order) => {
    // Reload orders list in real time
    try {
      const ordersData = await apiRepository.getOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Error reloading orders after completion:', err);
    }
    setCartItems([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', overflowX: 'hidden', position: 'relative' }}>

      {/* Fondo interactivo premium de alto rendimiento en Canvas 2D */}
      <InteractiveParticles />

      {/* Toast premium interactivo (Contraste verde salvia profundo y oro) */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '16px 24px',
          background: 'rgba(63, 76, 59, 0.98)', /* Verde salvia terapéutico profundo */
          color: 'var(--color-crema-calido)',
          borderRadius: '16px',
          border: '1px solid var(--color-dorado-mate)',
          boxShadow: '0 8px 30px rgba(63, 76, 59, 0.25)',
          zIndex: 1100,
          fontFamily: 'var(--font-sans)',
          fontSize: '0.85rem',
          textAlign: 'center',
          minWidth: '280px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {toastMsg}
        </div>
      )}

      {/* Navbar Superior con Composición Editorial (Logo 56px, eslogan debajo, botón perfil a la derecha) */}
      <header className="templo-header" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        padding: '24px 40px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        zIndex: 1000
      }}>
        {/* Logo reactivo centrado editorialmente */}
        <div 
          onClick={() => handleNavigate('home')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img 
            src={logoImg} 
            alt="Aurea Elizabeth Logo" 
            style={{ 
              height: '56px', 
              width: 'auto', 
              filter: 'brightness(1.05) drop-shadow(0 2px 10px rgba(245, 239, 228, 0.12))' 
            }} 
          />
          <img 
            src={sloganImg} 
            alt="El silencio es elocuente" 
            style={{ 
              height: '14px', 
              width: 'auto', 
              marginTop: '8px', 
              opacity: 0.8 
            }} 
          />
        </div>

        {/* Acceso Directo Estético (Administración / Perfil) en el extremo derecho */}
        <button 
          onClick={() => {
            handleNavigate('admin');
          }}
          style={{
            position: 'absolute',
            right: '40px',
            background: 'rgba(197, 168, 128, 0.05)',
            border: '1px solid rgba(176, 142, 98, 0.15)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeTab === 'admin' ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 4px 12px rgba(44, 36, 32, 0.03)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.4)';
            e.currentTarget.style.color = 'var(--color-dorado-mate)';
            e.currentTarget.style.background = 'rgba(197, 168, 128, 0.12)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.15)';
            e.currentTarget.style.color = activeTab === 'admin' ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)';
            e.currentTarget.style.background = 'rgba(197, 168, 128, 0.05)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Portal de Administración"
        >
          <User size={20} style={{ strokeWidth: 1.5 }} />
        </button>
      </header>

      {/* Contenedor Principal con Espaciado Lateral y Auto-crecimiento */}
      <main className="container" style={{ flex: '1 0 auto', paddingBottom: '80px', marginTop: '20px' }}>

        {/* ==================== RENDERING TABS ==================== */}

        {/* 1. HOME TEMPLO (SILENT SELLER) */}
        {activeTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* 2. CATALOGO SENSORIAL */}
        {activeTab === 'catalog' && (
          <CatalogPage
            onAddToCart={handleAddToCart}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            initialCategory={selectedCategoryFilter}
          />
        )}

        {/* 3. GUIA DE RITUALES */}
        {activeTab === 'rituals' && (
          <RitualsPage
            onAddToCart={handleAddToCart}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddMultipleToCart={handleAddMultipleToCart}
            triggerToast={triggerToast}
          />
        )}

        {/* 4. PERFIL / AUTENTICACION */}
        {activeTab === 'profile' && (
          userProfile ? (
            <ProfilePage
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
              onAddToCart={handleAddToCart}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              triggerToast={triggerToast}
              orders={orders}
            />
          ) : (
            <AuthPage
              onLoginSuccess={(profile) => {
                setUserProfile(profile);
                setFavorites(profile.favorites || []);
                apiRepository.getOrders().then(setOrders);
              }}
              triggerToast={triggerToast}
            />
          )
        )}

        {/* 5. ALTAR DE AUTOGESTION (ADMIN PANEL) */}
        {activeTab === 'admin' && (
          <AdminPage
            onProductsChange={handleSyncCartWithRepository}
            triggerToast={triggerToast}
          />
        )}

      </main>

      {/* ==================== FOOTER DE LUJO REFINADO ==================== */}
      <footer
        className="glass-panel templo-footer"
        style={{
          marginTop: '80px',
          padding: '60px 40px 120px', // Extra bottom spacing to clear the floating bottom navigation bar
          borderTop: '1px solid rgba(210, 180, 140, 0.12)',
          background: 'rgba(21, 19, 17, 0.96)',
          borderRadius: '24px 24px 0 0',
          color: 'var(--color-crema-calido)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div className="footer-grid-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Columna 1: Logotipo, Slogan e Intención */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              position: 'relative',
              display: 'inline-flex',
              alignSelf: 'flex-start',
              padding: '10px 0'
            }}>
              {/* Resplandor radial de alta gama integrado sin bordes rígidos */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(245, 239, 228, 0.1) 0%, rgba(176, 142, 98, 0.03) 45%, transparent 75%)',
                borderRadius: '50%',
                pointerEvents: 'none',
                filter: 'blur(8px)',
                zIndex: 0
              }} />
              <img
                src={logoImg}
                alt="Aurea Elizabeth Logo"
                style={{
                  height: '42px',
                  width: 'auto',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'brightness(1.05) drop-shadow(0 2px 10px rgba(245, 239, 228, 0.12))'
                }}
              />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: '1.6', marginTop: '10px' }}>
              “El bienestar no es una meta distante; es la decisión consciente de respirar con intención en este preciso instante.”
            </p>
          </div>

          {/* Columna 2: Navegación del Templo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Typography variant="caption" color="gold" weight="bold">El Templo</Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('home'); }} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Inicio Sensorial</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('catalog'); }} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Colección Botánica</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('rituals'); }} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Guía de Rituales</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleNavigate('admin'); }} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Altar de Autogestión</a>
            </div>
          </div>

          {/* Columna 3: Información Poética de Contacto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Typography variant="caption" color="gold" weight="bold">Contacto Álmico</Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', flexShrink: 0, opacity: 0.75 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Salta, Argentina</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', flexShrink: 0, opacity: 0.75 }}>
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
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-dorado-mate)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', flexShrink: 0 }}>
                  <path d="M12.004 2c-5.51 0-9.993 4.483-9.993 9.993 0 1.763.457 3.49 1.328 5.02L2 22l5.163-1.355c1.48.807 3.148 1.233 4.838 1.234h.005c5.508 0 9.99-4.483 9.99-9.994C21.996 6.483 17.513 2 12.004 2zm5.725 13.916c-.244.687-1.42 1.309-1.954 1.393-.473.074-.93.125-3.036-.757-2.693-1.127-4.42-3.87-4.555-4.053-.134-.183-1.102-1.467-1.102-2.799 0-1.332.695-1.986.945-2.247.25-.262.545-.327.728-.327.182 0 .364.001.52.01.162.008.38-.06.595.46.223.54.76 1.85.826 1.983.067.133.11.288.02.469-.09.18-.135.3-.27.458-.137.16-.288.356-.412.478-.137.133-.28.278-.12.553.16.275.71 1.171 1.522 1.895.666.593 1.228.97 1.524 1.117.296.147.467.123.642-.08.175-.203.76-.882.964-1.184.204-.302.408-.252.687-.15.28.102 1.77.834 2.073.987.303.153.504.229.577.354.073.126.073.729-.17 1.417z"/>
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
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-dorado-mate)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', flexShrink: 0 }}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span>@aurea.elizabeth</span>
              </a>
              <span style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-dorado-mate)' }}>"Lunes a Viernes a ritmo lento y pausado"</span>
            </div>
          </div>
        </div>

        {/* Línea Divisoria y Métodos de Pago Monocromáticos */}
        <div className="footer-bottom-container" style={{
          borderTop: '1px solid rgba(197, 168, 128, 0.15)',
          paddingTop: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
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
          onClick={() => handleNavigate('home')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'home' ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'home' ? '600' : '400',
          }}
        >
          <Home size={18} />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => handleNavigate('catalog')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'catalog' ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'catalog' ? '600' : '400',
          }}
        >
          <Sparkles size={18} />
          <span>Catálogo</span>
        </button>

        <button
          onClick={() => handleNavigate('rituals')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'rituals' ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: activeTab === 'rituals' ? '600' : '400',
          }}
        >
          <Wind size={18} />
          <span>Rituales</span>
        </button>

        {/* BOTÓN DE CARRITO */}
        <button
          onClick={() => setIsCartOpen(true)}
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
            position: 'relative'
          }}
        >
          <ShoppingCart size={18} />
          <span>Carrito</span>
          {cartItems.length > 0 && (
            <span style={{
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
              animation: 'bounceBadge 0.3s ease-out'
            }}>
              {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
            </span>
          )}
        </button>
      </nav>

      {/* ==================== OUT-OF-LAYOUT OVERLAYS ==================== */}

      {/* Slide-out Cart Panel */}
      <SlideOutCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveFromCart={handleRemoveFromCart}
        onCheckoutStart={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Flow */}
      <CheckoutFlow
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        userProfile={userProfile}
        onOrderComplete={handleOrderComplete}
        triggerToast={triggerToast}
      />

      <style>{`
        @keyframes bounceBadge {
          0% { transform: scale(0.3); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        /* Responsive Overrides for Templo App Frame */
        @media (max-width: 767px) {
          .templo-header { padding: 12px 16px !important; }
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
}

export default App;
