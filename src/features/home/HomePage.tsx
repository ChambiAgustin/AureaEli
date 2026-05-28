import React, { useState, useEffect, useRef } from 'react';
import { apiRepository } from '../../core/api';
import type { Product } from '../../core/api/IRepository';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import logoAureaImg from '../../assets/logo-aurea.png';
import {
  ShieldCheck,
  HeartHandshake,
  Compass,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Clock,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: 'home' | 'catalog' | 'rituals' | 'profile' | 'admin', category?: string) => void;
  onAddToCart: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onAddToCart }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Breathing Guide States
  const [breathPhase, setBreathPhase] = useState<'Inhalá' | 'Retené' | 'Exhalá' | 'Pausa'>('Pausa');
  const [breathActive, setBreathActive] = useState<boolean>(false);
  const [breathSeconds, setBreathSeconds] = useState<number>(4);

  // Carousel States
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<number>(0);

  // Kit Destacado Steps Interactivity
  const [activeKitStep, setActiveKitStep] = useState<number>(0);

  // Ref to observe items entering viewport
  const revealRefs = useRef<HTMLDivElement[]>([]);

  const addToRevealRefs = (el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  // Fetch Featured and New Products
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const allProducts = await apiRepository.getProducts();
        // Filter those marked as isFeatured or isNew
        const selected = allProducts.filter(p => p.isFeatured || p.isNew).slice(0, 8);
        setFeaturedProducts(selected);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchFeatured();
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    revealRefs.current.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [featuredProducts, loadingProducts]);

  // Breathing Guide Loop (Inhale 4s -> Hold 4s -> Exhale 4s)
  useEffect(() => {
    let timer: any = null;
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

  // Carousel Items
  const bestSellers = [
    {
      id: 'bs-1',
      name: 'Bruma Áurea Sahasrara',
      rating: 5,
      sales: 142,
      review: '“Un aroma sagrado que te ancla de inmediato. Lo uso al comenzar y al terminar el día laboral para limpiar mi campo áurico.”',
      author: 'Sofía M., Terapeuta Holística',
      price: 8400,
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop',
      category: 'Aromaterapia'
    },
    {
      id: 'bs-2',
      name: 'Vela Cera de Abejas y Copal',
      rating: 5,
      sales: 98,
      review: '“No genera humo negro y el olor a resina pura te envuelve en una manta de total seguridad. Hermosa terminación artesanal.”',
      author: 'Bautista L., Diseñador de Interiores',
      price: 6900,
      imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop',
      category: 'Hogar con intención'
    },
    {
      id: 'bs-3',
      name: 'Sahumerios de Sándalo Silvestre',
      rating: 4,
      sales: 210,
      review: '“El sándalo es genuino y su combustión lenta es perfecta para meditar. Es un sahumerio que se siente de verdad premium.”',
      author: 'Gabriela K., Instructora de Yoga',
      price: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
      category: 'Aromaterapia'
    }
  ];

  const handlePrevCarousel = () => {
    setActiveCarouselIndex((prev) => (prev === 0 ? bestSellers.length - 1 : prev - 1));
  };

  const handleNextCarousel = () => {
    setActiveCarouselIndex((prev) => (prev === bestSellers.length - 1 ? 0 : prev + 1));
  };

  // Kit Destacado Steps
  const kitSteps = [
    {
      step: 1,
      title: 'Purificar el Ambiente',
      description: 'Encendé la vela de cera de soja en un plato de cerámica artesanal y rociá la Bruma Sahasrara tres veces en forma de círculo sobre tu cabeza.',
      duration: '2 minutos'
    },
    {
      step: 2,
      title: 'Respiración Profunda',
      description: 'Sentate con la columna erguida. Focalizá tu mirada en la llama de la vela. Inhalá sintiendo el aroma del eucalipto y el sándalo sagrado.',
      duration: '5 minutos'
    },
    {
      step: 3,
      title: 'Humectación y Automasaje',
      description: 'Aplicá el aceite corporal tibio en tus sienes y muñecas haciendo pequeños masajes circulares mientras agradecés el día que concluye.',
      duration: '3 minutos'
    }
  ];

  // Helper to add entire Kit to Cart
  const handleAddKitToCart = async () => {
    // In our mocks, let's find matching products or mock products to represent the kit
    try {
      const allProducts = await apiRepository.getProducts();
      // Add first 2 products as sample items from the kit to showcase reactive cart action
      const itemsToAdd = allProducts.slice(0, 2);
      itemsToAdd.forEach(p => onAddToCart(p));
      // Trigger user confirmation
      alert('¡Fantástico! Agregamos los productos del "Kit de Calma Nocturna" a tu altar de compras.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="home-silent-seller" style={{ color: 'var(--color-text-dark)', overflowX: 'hidden' }}>

      {/* 1. HERO SENSORIAL CON HUMO DE SAHUMERIO */}
      <section
        className="hero-container"
        style={{
          position: 'relative',
          padding: '60px 0',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: 'var(--color-tierra-profunda)',
          borderBottom: '1px solid rgba(197, 160, 89, 0.18)',
          borderRadius: '24px',
          marginBottom: '60px'
        }}
      >


        {/* Capas de Humo de Sahumerio de Alta Gama con micro-animaciones en 3D */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
          {/* Hebra de Humo 1 (Bronce Intenso) */}
          <div style={{
            position: 'absolute',
            bottom: '0px',
            left: '32%',
            width: '45px',
            height: '420px',
            background: 'linear-gradient(to top, transparent, rgba(163, 107, 78, 0.06) 45%, transparent)',
            borderRadius: '50%',
            animation: 'floatSmoke 13s infinite ease-in-out',
            filter: 'blur(9px)',
          }} />
          {/* Hebra de Humo 2 (Oro Sagrado) */}
          <div style={{
            position: 'absolute',
            bottom: '0px',
            left: '52%',
            width: '55px',
            height: '470px',
            background: 'linear-gradient(to top, transparent, rgba(197, 160, 89, 0.06) 35%, transparent)',
            borderRadius: '50%',
            animation: 'floatSmoke 17s infinite ease-in-out',
            animationDelay: '2.5s',
            filter: 'blur(13px)',
          }} />
          {/* Hebra de Humo 3 (Teja Silvestre) */}
          <div style={{
            position: 'absolute',
            bottom: '0px',
            left: '46%',
            width: '24px',
            height: '380px',
            background: 'linear-gradient(to top, transparent, rgba(163, 107, 78, 0.05) 55%, transparent)',
            borderRadius: '50%',
            animation: 'floatSmoke 10s infinite ease-in-out',
            animationDelay: '5s',
            filter: 'blur(7px)',
          }} />
          {/* Hebra de Humo 4 (Niebla Bronce Suave) */}
          <div style={{
            position: 'absolute',
            bottom: '0px',
            left: '40%',
            width: '35px',
            height: '440px',
            background: 'linear-gradient(to top, transparent, rgba(163, 107, 78, 0.04) 50%, transparent)',
            borderRadius: '50%',
            animation: 'floatSmoke 21s infinite ease-in-out',
            animationDelay: '8.5s',
            filter: 'blur(11px)',
          }} />
        </div>

        {/* Gradiente de fondo sensorial */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 75% 35%, rgba(163, 107, 78, 0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 3, padding: '40px 24px' }}>

          {/* Contenedor del Hero Centrado de Lujo */}
          <div
            className="reveal-on-scroll active"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '20px',
              width: '100%',
              maxWidth: '820px',
              margin: '0 auto',
              zIndex: 10,
              position: 'relative'
            }}
          >
            {/* Contenedor del Círculo y del Logotipo + Tag */}
            <div style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 0',
              zIndex: 1
            }}>
              {/* Geometría Sagrada Orbital de Fondo */}
              <div style={{
                position: 'absolute',
                top: '60%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(95vw, 600px)',
                height: 'min(95vw, 600px)',
                borderRadius: '50%',
                border: '1px dashed rgba(197, 160, 89, 0.16)',
                animation: 'spin 180s linear infinite',
                pointerEvents: 'none',
                zIndex: 0
              }} />

              {/* Tag superior minimalista */}
              <span style={{
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                color: 'var(--color-magenta-oscuro)',
                fontWeight: '600',
                marginBottom: '10px',
                zIndex: 1,
                position: 'relative'
              }}>
                — Ritual y Pausa —
              </span>

              {/* Logo de la Marca en Gran Formato Amplio (Completo de Assets) */}
              <img
                src={logoAureaImg}
                alt="Aurea Elizabeth Logo Completo"
                style={{
                  width: '100%',
                  maxWidth: 'min(85vw, 380px)',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 24px rgba(44, 36, 32, 0.06))',
                  animation: 'pulseLogo 8s ease-in-out infinite',
                  margin: '10px 0',
                  zIndex: 1,
                  position: 'relative'
                }}
              />

            </div>

            {/* El Texto Poético Solicitado en Gran Formato Serif */}
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)',
              fontWeight: 300,
              lineHeight: '1.7',
              color: 'var(--color-text-dark)',
              fontStyle: 'italic',
              maxWidth: '760px',
              marginTop: '12px',
              letterSpacing: '0.02em'
            }}>
              “No vendemos objetos; te invitamos a fundar un oasis en tu cotidianidad. Nuestras alquimias están diseñadas con materias primas nobles y puras para desacelerar tu sistema nervioso y reconectarte con tu eje.”
            </p>

            {/* Los Botones Interactivos */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="magenta"
                size="lg"
                onClick={() => onNavigate('rituals')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span>Explorar rituales</span>
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="terracota-outline"
                size="lg"
                onClick={() => onNavigate('catalog')}
              >
                Ver colección
              </Button>
            </div>

            <style>{`
              @keyframes pulseLogo {
                0%, 100% { transform: scale(1); opacity: 0.95; }
                50% { transform: scale(1.02); opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* 2. FAJA DE CONFIANZA POÉTICA */}
      <section
        className="reveal-on-scroll"
        ref={addToRevealRefs}
        style={{
          padding: '24px 0',
          background: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid rgba(197, 168, 128, 0.1)',
          borderBottom: '1px solid rgba(197, 168, 128, 0.1)',
          marginBottom: '80px'
        }}
      >
        <div className="container" style={{ padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px' }}>
              <ShieldCheck size={26} color="var(--color-oliva-salvia)" />
              <Typography variant="body" weight="semibold" style={{ fontSize: '0.95rem' }}>Compra Segura e Intuitiva</Typography>
              <Typography variant="body-sm" color="muted" style={{ fontSize: '0.82rem', maxWidth: '250px' }}>
                Pagos encriptados a través de canales protegidos para resguardar tu paz.
              </Typography>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px' }}>
              <HeartHandshake size={26} color="var(--color-terracota-suave)" />
              <Typography variant="body" weight="semibold" style={{ fontSize: '0.95rem' }}>Envíos con Cuidado Amoroso</Typography>
              <Typography variant="body-sm" color="muted" style={{ fontSize: '0.82rem', maxWidth: '250px' }}>
                Cada paquete se prepara artesanalmente, aromatizado con intenciones de bienestar.
              </Typography>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px' }}>
              <Compass size={26} color="var(--color-dorado-mate)" />
              <Typography variant="body" weight="semibold" style={{ fontSize: '0.95rem' }}>Almas Amigas</Typography>
              <Typography variant="body-sm" color="muted" style={{ fontSize: '0.82rem', maxWidth: '250px' }}>
                Atención humanizada y sensible para guiarte en la elección de tu ritual perfecto.
              </Typography>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORÍAS VISUALES GRANDES DE ALTA GAMA */}
      <section className="reveal-on-scroll" ref={addToRevealRefs} style={{ marginBottom: '80px' }}>
        <div className="container" style={{ padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Typography variant="caption" color="gold">Las Líneas de Calma</Typography>
            <Typography variant="h2" style={{ marginTop: '8px' }}>Explorá por Universo Sensorial</Typography>
            <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-dorado-mate)', margin: '16px auto' }} />
          </div>

          <div className="categories-grid-container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '20px',
            minHeight: '480px'
          }}>
            {/* 1. Aromaterapia (Col: 3, Row: 1) */}
            <div
              className="card-premium card-premium-hover"
              onClick={() => onNavigate('catalog', 'Aromaterapia')}
              style={{
                gridColumn: 'span 3',
                backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.4), rgba(35, 31, 28, 0.85)), url(https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=600&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                minHeight: '280px',
                cursor: 'pointer',
                borderRadius: '20px',
                border: '1px solid rgba(197, 168, 128, 0.15)',
                padding: '24px'
              }}
            >
              <Typography variant="caption" color="gold">Óleos & Brumas</Typography>
              <Typography variant="h2" color="light" style={{ fontSize: '1.8rem', margin: '4px 0 8px' }}>Aromaterapia</Typography>
              <Typography variant="body-sm" color="light" style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                Esencias puras prensadas en frío y brumas áuricas destiladas a mano.
              </Typography>
            </div>

            {/* 2. Bienestar y Spa (Col: 3, Row: 1) */}
            <div
              className="card-premium card-premium-hover"
              onClick={() => onNavigate('catalog', 'Spa')}
              style={{
                gridColumn: 'span 3',
                backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.4), rgba(35, 31, 28, 0.85)), url(https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                minHeight: '280px',
                cursor: 'pointer',
                borderRadius: '20px',
                border: '1px solid rgba(197, 168, 128, 0.15)',
                padding: '24px'
              }}
            >
              <Typography variant="caption" color="gold">Cuidado de Sí</Typography>
              <Typography variant="h2" color="light" style={{ fontSize: '1.8rem', margin: '4px 0 8px' }}>Bienestar y Spa</Typography>
              <Typography variant="body-sm" color="light" style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                Sales minerales, aceites de automasaje y arcillas purificadoras.
              </Typography>
            </div>

            {/* 3. Hogar con Intención (Col: 2) */}
            <div
              className="card-premium card-premium-hover"
              onClick={() => onNavigate('catalog', 'Hogar')}
              style={{
                gridColumn: 'span 2',
                backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.5), rgba(35, 31, 28, 0.9)), url(https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                minHeight: '220px',
                cursor: 'pointer',
                borderRadius: '20px',
                border: '1px solid rgba(197, 168, 128, 0.15)',
                padding: '20px'
              }}
            >
              <Typography variant="caption" color="gold">Altares de Calma</Typography>
              <Typography variant="h3" color="light" style={{ fontSize: '1.4rem', margin: '4px 0' }}>Hogar con Intención</Typography>
              <Typography variant="body-sm" color="light" style={{ fontSize: '0.78rem' }}>
                Velas de soja, cerámicas y sahumerios de combustión lenta.
              </Typography>
            </div>

            {/* 4. Moda Consciente (Col: 2) */}
            <div
              className="card-premium card-premium-hover"
              onClick={() => onNavigate('catalog', 'Moda')}
              style={{
                gridColumn: 'span 2',
                backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.5), rgba(35, 31, 28, 0.9)), url(https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                minHeight: '220px',
                cursor: 'pointer',
                borderRadius: '20px',
                border: '1px solid rgba(197, 168, 128, 0.15)',
                padding: '20px'
              }}
            >
              <Typography variant="caption" color="gold">Lino & Algodón Orgánico</Typography>
              <Typography variant="h3" color="light" style={{ fontSize: '1.4rem', margin: '4px 0' }}>Moda Consciente</Typography>
              <Typography variant="body-sm" color="light" style={{ fontSize: '0.78rem' }}>
                Prendas holgadas tejidas con amor para habitar tu cuerpo en libertad.
              </Typography>
            </div>

            {/* 5. Kits y Regalos (Col: 2) */}
            <div
              className="card-premium card-premium-hover"
              onClick={() => onNavigate('catalog', 'Kits')}
              style={{
                gridColumn: 'span 2',
                backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.5), rgba(35, 31, 28, 0.9)), url(https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                minHeight: '220px',
                cursor: 'pointer',
                borderRadius: '20px',
                border: '1px solid rgba(197, 168, 128, 0.15)',
                padding: '20px'
              }}
            >
              <Typography variant="caption" color="gold">Cofres Sagrados</Typography>
              <Typography variant="h3" color="light" style={{ fontSize: '1.4rem', margin: '4px 0' }}>Kits y Regalos</Typography>
              <Typography variant="body-sm" color="light" style={{ fontSize: '0.78rem' }}>
                Combinaciones curadas para obsequiar calma, luz y sanación.
              </Typography>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCTOS DESTACADOS DIVERSIFICADOS (6 a 8) */}
      <section className="reveal-on-scroll" ref={addToRevealRefs} style={{ marginBottom: '80px' }}>
        <div className="container" style={{ padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Typography variant="caption" color="gold">Nuestras Alquimias</Typography>
            <Typography variant="h2" style={{ marginTop: '8px' }}>Destacados de la Temporada</Typography>
            <Typography variant="body" color="muted" style={{ maxWidth: '600px', margin: '8px auto 0', fontSize: '0.9rem' }}>
              Una selección artesanal de nuestros sahumerios, óleos y cerámicas más amados.
            </Typography>
            <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-dorado-mate)', margin: '16px auto' }} />
          </div>

          {loadingProducts ? (
            <div className="grid-3">
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '380px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px' }} />
              ))}
            </div>
          ) : (
            <div className="grid-3" style={{ gap: '28px' }}>
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="card-premium card-premium-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '430px',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.48)',
                    borderColor: 'rgba(210, 180, 140, 0.18)'
                  }}
                >
                  <div>
                    {/* Imagen del producto */}
                    <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', position: 'relative' }}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* Badges */}
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '4px' }}>
                        {product.isNew && (
                          <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', padding: '3px 8px', backgroundColor: 'var(--color-oliva-salvia)', color: 'var(--color-text-light)', borderRadius: '4px', fontWeight: 'bold' }}>Nuevo</span>
                        )}
                        {product.isFeatured && (
                          <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', padding: '3px 8px', backgroundColor: 'var(--color-dorado-mate)', color: 'var(--color-text-dark)', borderRadius: '4px', fontWeight: 'bold' }}>Destacado</span>
                        )}
                      </div>
                    </div>

                    <Typography variant="caption" color="gold" style={{ fontSize: '0.7rem' }}>{product.category}</Typography>
                    <Typography variant="h3" style={{ fontSize: '1.2rem', margin: '4px 0 8px' }}>{product.name}</Typography>
                    <Typography variant="body-sm" color="muted" style={{ fontSize: '0.85rem', height: '40px', overflow: 'hidden' }}>{product.description}</Typography>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Inversión en calma</span>
                      <Typography variant="h3" color="gold" style={{ fontSize: '1.15rem' }}>${product.price.toLocaleString('es-AR')}</Typography>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onAddToCart(product)}
                      style={{ borderRadius: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ShoppingBag size={13} />
                      <span>Llevar</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Button variant="magenta" onClick={() => onNavigate('catalog')}>
              Ver toda la colección botánica
            </Button>
          </div>
        </div>
      </section>

      {/* 5. BLOQUE DE MANIFIESTO EMOCIONAL (ESCUDO CIRCULAR ZEN - VERDE BOTÁNICO Y ORO) */}
      <section
        className="reveal-on-scroll"
        ref={addToRevealRefs}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '100px auto',
          position: 'relative',
          width: '100%'
        }}
      >
        <div
          className="manifesto-circle"
          style={{
            width: 'min(90vw, 640px)',
            height: 'min(90vw, 640px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 30%, rgba(61, 46, 40, 0.9) 0%, rgba(36, 28, 24, 0.98) 100%)',
            border: '2px solid var(--color-dorado-mate)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(197, 160, 89, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'min(8vw, 65px)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 3,
            overflow: 'hidden'
          }}
        >
          {/* Brillos orbitales decorativos minimalistas */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '120%',
            height: '120%',
            background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(197, 160, 89, 0.03) 65%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'spin 120s linear infinite'
          }} />

          <Typography
            variant="caption"
            className="manifesto-tag"
            style={{
              color: 'var(--color-dorado-mate)',
              fontWeight: 'bold',
              letterSpacing: '0.25em',
              fontSize: 'clamp(0.6rem, 2vw, 0.75rem)',
              marginBottom: '16px'
            }}
          >
            El Manifiesto Áurea
          </Typography>

          <h2
            className="manifesto-title"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.1rem, 3.2vw, 1.85rem)',
              fontWeight: 300,
              lineHeight: '1.35',
              margin: '0 0 20px',
              color: '#F4DFB8', /* Oro champagne cálido y vibrante */
              letterSpacing: '0.04em',
              textShadow: '0 2px 10px rgba(210, 180, 140, 0.15)'
            }}
          >
            “Vivimos a una velocidad que no le pertenece al alma. <br className="hide-on-mobile" />
            Nuestra sagrada intención es invitarte a frenar, <br className="hide-on-mobile" />
            encender un sahumerio y fundar tu espacio de paz.”
          </h2>

          <div
            className="manifesto-divider"
            style={{
              width: '40px',
              height: '1px',
              backgroundColor: 'var(--color-dorado-mate)',
              opacity: 0.5,
              margin: '0 auto 20px'
            }}
          />

          <p
            className="manifesto-text"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(0.75rem, 2vw, 0.95rem)',
              lineHeight: '1.65',
              color: '#E5DFD9', /* Crema lino pulido de alta legibilidad */
              maxWidth: '480px',
              margin: '0 auto',
              fontWeight: 300
            }}
          >
            Aurea Elizabeth nació de la búsqueda honesta de calma y texturas nobles en un mundo ruidoso. Elegimos conscientemente cada extracto herbáceo, cada veta de lino y cada trazo de arcilla cocida a horno de leña. La compra no es el fin, es la puerta de entrada a tu ritual sagrado.
          </p>
        </div>
      </section>

      {/* 6. LOS RITUALES MÁS ELEGIDOS (CARRUSEL MANUAL) */}
      <section className="reveal-on-scroll" ref={addToRevealRefs} style={{ marginBottom: '80px' }}>
        <div className="container" style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <Typography variant="caption" color="gold">Testimoniales Sensoriales</Typography>
              <Typography variant="h2" style={{ marginTop: '8px' }}>Los Rituales más Elegidos</Typography>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handlePrevCarousel}
                style={{
                  background: 'rgba(44, 36, 32, 0.04)',
                  border: '1px solid rgba(176, 142, 98, 0.35)',
                  color: 'var(--color-text-dark)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
                  e.currentTarget.style.background = 'rgba(44, 36, 32, 0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.35)';
                  e.currentTarget.style.background = 'rgba(44, 36, 32, 0.04)';
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextCarousel}
                style={{
                  background: 'rgba(44, 36, 32, 0.04)',
                  border: '1px solid rgba(176, 142, 98, 0.35)',
                  color: 'var(--color-text-dark)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-dorado-mate)';
                  e.currentTarget.style.background = 'rgba(44, 36, 32, 0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(176, 142, 98, 0.35)';
                  e.currentTarget.style.background = 'rgba(44, 36, 32, 0.04)';
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Item de Carrusel Activo */}
          <div
            className="glass-panel testimonial-carousel-panel"
            style={{
              padding: '40px',
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '32px',
              alignItems: 'center',
              border: '1px solid rgba(176, 142, 98, 0.22)',
              position: 'relative'
            }}
          >
            <div className="grid-2" style={{ alignItems: 'center', gap: '32px' }}>
              <div style={{ height: '280px', borderRadius: '16px', overflow: 'hidden' }}>
                <img
                  src={bestSellers[activeCarouselIndex].imageUrl}
                  alt={bestSellers[activeCarouselIndex].name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      color="var(--color-dorado-mate)"
                      fill={i < bestSellers[activeCarouselIndex].rating ? 'var(--color-dorado-mate)' : 'none'}
                    />
                  ))}
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                    ({bestSellers[activeCarouselIndex].sales} almas conformes)
                  </span>
                </div>

                <Typography variant="caption" color="gold">{bestSellers[activeCarouselIndex].category}</Typography>
                <Typography variant="h2" style={{ fontSize: '1.8rem', color: 'var(--color-text-dark)' }}>{bestSellers[activeCarouselIndex].name}</Typography>

                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  lineHeight: '1.6',
                  fontStyle: 'italic',
                  color: 'var(--color-text-dark)'
                }}>
                  {bestSellers[activeCarouselIndex].review}
                </p>

                <div>
                  <Typography variant="body" weight="semibold" style={{ display: 'block', fontSize: '0.9rem' }}>{bestSellers[activeCarouselIndex].author}</Typography>
                  <Typography variant="body-sm" color="gold" style={{ fontSize: '0.8rem' }}>Comprador verificado</Typography>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      try {
                        const allProducts = await apiRepository.getProducts();
                        const prod = allProducts.find(p => p.name.includes(bestSellers[activeCarouselIndex].name.split(' ')[0]));
                        if (prod) {
                          onAddToCart(prod);
                        } else {
                          // Fallback to adding catalog
                          onNavigate('catalog');
                        }
                      } catch (e) {
                        onNavigate('catalog');
                      }
                    }}
                  >
                    Llevar este elemento — ${bestSellers[activeCarouselIndex].price.toLocaleString('es-AR')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Paginador visual de puntitos (ubicado abajo de la presentación) */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '24px'
          }}>
            {bestSellers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCarouselIndex(idx)}
                style={{
                  width: idx === activeCarouselIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: idx === activeCarouselIndex ? 'var(--color-dorado-mate)' : 'rgba(61, 46, 40, 0.25)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. KIT DESTACADO: KIT DE CALMA NOCTURNA */}
      <section className="reveal-on-scroll" ref={addToRevealRefs} style={{ marginBottom: '80px' }}>
        <div className="container" style={{ padding: '0 24px' }}>
          <div className="glass-panel kit-nocturno-panel" style={{ padding: '48px', border: '1px solid rgba(197,168,128,0.25)', position: 'relative' }}>
            <div className="grid-2" style={{ alignItems: 'center', gap: '48px' }}>

              {/* Lado izquierdo: Info del Kit e Interactividad de pasos */}
              <div>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: 'var(--color-dorado-mate)',
                  fontWeight: 'bold',
                  letterSpacing: '0.15em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sparkles size={14} />
                  Ritual Destacado del Mes
                </span>

                <Typography variant="h2" style={{ fontSize: '2.4rem', marginTop: '12px', marginBottom: '16px' }}>
                  Kit de Calma Nocturna
                </Typography>

                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.95rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: '1.6',
                  marginBottom: '28px'
                }}>
                  Una tríada sagrada compuesta por Bruma Sahasrara, Vela de Copal y Aceite Corporal de Eucalipto. Hacé click en cada paso de abajo para entender cómo se integran en una noche de introspección reparadora.
                </p>

                {/* Steps Accordion / Tabs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {kitSteps.map((step, idx) => (
                    <div
                      key={step.step}
                      onClick={() => setActiveKitStep(idx)}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        backgroundColor: idx === activeKitStep ? 'rgba(79, 94, 76, 0.09)' : 'rgba(44, 36, 32, 0.04)',
                        border: '1px solid',
                        borderColor: idx === activeKitStep ? 'var(--color-oliva-salvia)' : 'rgba(176, 142, 98, 0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          color: idx === activeKitStep ? 'var(--color-accent)' : 'var(--color-text-dark)'
                        }}>
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: idx === activeKitStep ? 'var(--color-oliva-salvia)' : 'rgba(44, 36, 32, 0.08)',
                            color: idx === activeKitStep ? 'var(--color-crema-calido)' : 'var(--color-text-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem'
                          }}>
                            {step.step}
                          </span>
                          {step.title}
                        </span>

                        <span style={{ fontSize: '0.75rem', color: 'var(--color-dorado-mate)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {step.duration}
                        </span>
                      </div>

                      {idx === activeKitStep && (
                        <p style={{
                          fontSize: '0.82rem',
                          color: 'var(--color-text-dark)',
                          marginTop: '12px',
                          lineHeight: '1.5',
                          animation: 'fadeIn 0.3s ease-out'
                        }}>
                          {step.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <Button variant="primary" size="lg" onClick={handleAddKitToCart}>
                  Llevar Kit Completo — $19.800
                </Button>
              </div>

              {/* Lado derecho: Imagen Editorial de Calma Nocturna */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-10px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, var(--color-dorado-mate) 0%, var(--color-terracota-suave) 100%)',
                  opacity: 0.1,
                  zIndex: 0,
                  filter: 'blur(15px)'
                }} />

                <div style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop"
                    alt="Kit de Calma Nocturna Aurea Elizabeth"
                    style={{
                      width: '100%',
                      height: '420px',
                      objectFit: 'cover'
                    }}
                  />

                  {/* Floating Info Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    background: 'rgba(35, 31, 28, 0.85)',
                    backdropFilter: 'blur(10px)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(197, 168, 128, 0.2)'
                  }}>
                    <Typography variant="body" weight="semibold" style={{ fontSize: '0.9rem', color: 'var(--color-dorado-mate)' }}>
                      ¿Qué incluye tu cofre?
                    </Typography>
                    <Typography variant="body-sm" color="light" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                      Bruma Sahasrara (125ml) + Vela Sahumerio Copal Puro + Aceite Concentrado de Eucalipto y Menta.
                    </Typography>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 8. WIDGETS DE BIENESTAR INMERSIVO (RESPIRACIÓN CIRCULAR + INVITE QUIZ) */}
      <section className="reveal-on-scroll" ref={addToRevealRefs} style={{ marginBottom: '80px' }}>
        <div className="container" style={{ padding: '0 24px' }}>
          <div className="grid-2" style={{ gap: '32px' }}>

            {/* Widget A: Guía Interactiva de Respiración Circular */}
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                border: '1px solid rgba(197, 168, 128, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'space-between',
                minHeight: '440px'
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
                className={`breathing-circle ${breathActive && (breathPhase === 'Inhalá' || breathPhase === 'Retené') ? 'inhale' : ''
                  } ${breathActive && breathPhase === 'Exhalá' ? 'exhale' : ''
                  }`}
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
                  variant={breathActive ? 'secondary' : 'primary'}
                  onClick={() => {
                    setBreathActive(!breathActive);
                    setBreathPhase(breathActive ? 'Pausa' : 'Inhalá');
                    setBreathSeconds(4);
                  }}
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

            {/* Widget B: Tarjeta Editorial de Invitación al Quiz */}
            <div
              className="glass-panel"
              style={{
                padding: '36px',
                border: '1px solid rgba(197, 168, 128, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundImage: 'linear-gradient(to bottom, rgba(35, 31, 28, 0.6), rgba(35, 31, 28, 0.95)), url(https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '440px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-dorado-mate)', fontWeight: 'bold', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={14} />
                  Filtro Sensorial
                </span>

                <Typography variant="h3" style={{ fontSize: '1.6rem', marginTop: '12px', marginBottom: '14px', color: 'var(--color-arena-tostada)' }}>
                  Encuentra tu ritual de calma
                </Typography>

                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: 'rgba(234, 222, 201, 0.8)',
                  marginBottom: '20px'
                }}>
                  ¿Te sentís abrumado por la inmediatez? ¿Buscás purificar tu espacio o restaurar tu balance interno? Respondé un cuestionario místico de 4 preguntas y dejá que nuestro algoritmo holístico elija las alquimias perfectas para vos.
                </p>
              </div>

              {/* Graphic element representing Quiz states */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '16px',
                background: 'rgba(35, 31, 28, 0.6)',
                borderRadius: '16px',
                border: '1px solid rgba(197, 168, 128, 0.1)',
                margin: '10px 0'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(234, 222, 201, 0.55)' }}>Paso 1</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-arena-tostada)' }}>Sentir</span>
                </div>
                <div style={{ width: '20px', height: '1px', backgroundColor: 'var(--color-dorado-mate)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(234, 222, 201, 0.55)' }}>Paso 2</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-arena-tostada)' }}>Aroma</span>
                </div>
                <div style={{ width: '20px', height: '1px', backgroundColor: 'var(--color-dorado-mate)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(234, 222, 201, 0.55)' }}>Paso 3</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-arena-tostada)' }}>Ritual</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => onNavigate('rituals')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '16px'
                }}
              >
                <span>Descubrir mi Ritual</span>
                <ArrowRight size={14} />
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Vela CSS Flicker Animation Style Tag */}
      <style>{`
        @keyframes candleFlicker {
          0% {
            transform: scaleX(1) scaleY(1) rotate(-1deg);
            opacity: 0.95;
            filter: brightness(1) blur(0.5px);
          }
          20% {
            transform: scaleX(0.96) scaleY(1.04) rotate(1deg);
            opacity: 0.97;
          }
          40% {
            transform: scaleX(1.04) scaleY(0.96) rotate(-0.5deg);
            opacity: 1;
            filter: brightness(1.1) blur(0.5px);
          }
          60% {
            transform: scaleX(0.98) scaleY(1.02) rotate(1.5deg);
            opacity: 0.96;
          }
          80% {
            transform: scaleX(1.02) scaleY(0.98) rotate(-1.5deg);
            opacity: 0.99;
          }
          100% {
            transform: scaleX(1.01) scaleY(1.01) rotate(0.5deg);
            opacity: 0.98;
            filter: brightness(1.15) blur(0.5px) drop-shadow(0 0 12px rgba(255, 159, 28, 0.5));
          }
        }
        @keyframes candleFlickerInner {
          0% {
            transform: scaleX(1) scaleY(1) rotate(0.5deg);
            opacity: 0.9;
          }
          30% {
            transform: scaleX(1.03) scaleY(0.97) rotate(-1deg);
            opacity: 0.95;
          }
          70% {
            transform: scaleX(0.97) scaleY(1.03) rotate(1deg);
            opacity: 0.88;
          }
          100% {
            transform: scaleX(1.01) scaleY(1.01) rotate(-0.5deg);
            opacity: 0.94;
          }
        }

        /* Responsive Overrides for Templo Home */
        @media (max-width: 767px) {
          .hero-container {
            padding: 30px 10px !important;
            min-height: auto !important;
            margin-bottom: 30px !important;
          }
          .hero-container .container {
            padding: 10px !important;
          }
          .categories-grid-container {
            display: flex !important;
            flex-direction: column !important;
            min-height: auto !important;
            gap: 16px !important;
          }
          .categories-grid-container > div {
            grid-column: span 6 !important;
            min-height: 220px !important;
            padding: 20px !important;
          }
          .manifesto-circle {
            width: min(92vw, 500px) !important;
            height: min(92vw, 500px) !important;
            border-radius: 50% !important;
            padding: 24px 20px !important;
            margin: 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .manifesto-tag {
            font-size: 0.6rem !important;
            margin-bottom: 8px !important;
          }
          .manifesto-title {
            font-size: clamp(0.9rem, 3.8vw, 1.25rem) !important;
            margin-bottom: 12px !important;
            line-height: 1.3 !important;
          }
          .manifesto-divider {
            margin-bottom: 12px !important;
          }
          .manifesto-text {
            font-size: clamp(0.68rem, 2.8vw, 0.8rem) !important;
            line-height: 1.45 !important;
            max-width: 88% !important;
          }
          .testimonial-carousel-panel {
            padding: 20px !important;
          }
          .testimonial-carousel-panel .grid-2 {
            gap: 20px !important;
          }
          .kit-nocturno-panel {
            padding: 24px !important;
          }
          .kit-nocturno-panel .grid-2 {
            gap: 24px !important;
          }
        }
      `}</style>

    </div>
  );
};

export default HomePage;
