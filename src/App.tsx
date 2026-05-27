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
import type { Product, UserProfile, Order } from './core/api/IRepository';
import logoImg from './assets/logo.png';
import sloganImg from './assets/slogan.png';
import { InteractiveParticles } from './shared/components/InteractiveParticles';
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
  };

  // Toast Trigger
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  };

  // Load User Profile and orders on mount
  useEffect(() => {
    const loadAppData = async () => {
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
    loadAppData();
  }, []);

  // Home Breathing timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
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

      {/* Botón flotante de Administrador superior derecho, libre de barras */}
      <button 
        onClick={() => {
          handleNavigate('admin');
          triggerToast('Accediendo al Altar de Autogestión.');
        }}
        style={{
          position: 'fixed',
          top: '24px',
          right: '32px',
          zIndex: 1000,
          background: 'rgba(250, 246, 238, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: activeTab === 'admin' ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          borderRadius: '50%',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(176, 142, 98, 0.15)',
          boxShadow: '0 4px 12px rgba(44, 36, 32, 0.03)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.4)';
          e.currentTarget.style.color = 'var(--color-dorado-mate)';
          e.currentTarget.style.background = 'rgba(250, 246, 238, 0.8)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.15)';
          e.currentTarget.style.color = activeTab === 'admin' ? 'var(--color-dorado-mate)' : 'var(--color-text-dark)';
          e.currentTarget.style.background = 'rgba(250, 246, 238, 0.4)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Portal de Administración"
      >
        <User size={22} style={{ strokeWidth: 1.5 }} />
      </button>

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
        className="glass-panel"
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Columna 1: Logotipo, Slogan e Intención */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <img src={logoImg} alt="Aurea Elizabeth Logo" style={{ height: '48px', width: 'auto', alignSelf: 'flex-start', filter: 'brightness(1.05)' }} />
            <img src={sloganImg} alt="El silencio es elocuente" style={{ height: '16px', width: 'auto', alignSelf: 'flex-start', opacity: 0.85 }} />
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
              <span>📍 Oasis Central, Buenos Aires, Argentina</span>
              <span>✉️ almas@aureaelizabeth.com</span>
              <span>📞 +54 9 11 3842-8812 (WhatsApp Directo)</span>
              <span style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--color-dorado-mate)' }}>"Lunes a Viernes a ritmo lento y pausado"</span>
            </div>
          </div>

          {/* Columna 4: Redes Minimalistas y Conexión */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Typography variant="caption" color="gold" weight="bold">Vibrar en Sintonía</Typography>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
              Unite a nuestro círculo de calma para recibir bitácoras de respiración e invitaciones exclusivas.
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', marginTop: '8px' }}>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-dorado-mate)', fontWeight: 'bold', textDecoration: 'none' }}>Instagram</a>
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-dorado-mate)', fontWeight: 'bold', textDecoration: 'none' }}>Pinterest</a>
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
              <a href="https://spotify.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-dorado-mate)', fontWeight: 'bold', textDecoration: 'none' }}>Spotify</a>
            </div>
          </div>
        </div>

        {/* Línea Divisoria y Métodos de Pago Monocromáticos */}
        <div style={{
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

          {/* Iconos Monocromáticos de Métodos de Pago */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', opacity: 0.55 }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Medios de Pago:</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid', padding: '3px 8px', borderRadius: '4px' }}>VISA</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid', padding: '3px 8px', borderRadius: '4px' }}>MC</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid', padding: '3px 8px', borderRadius: '4px' }}>MP</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid', padding: '3px 8px', borderRadius: '4px' }}>WA</span>
          </div>
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
      `}</style>
    </div>
  );
}

export default App;
