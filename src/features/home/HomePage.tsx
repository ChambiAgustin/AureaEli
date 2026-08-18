import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../core/api/IRepository';
import { useProducts } from '../../core/hooks/useProducts';
import { useCart } from '../../core/context/CartContext';
import { useSEO } from '../../core/seo/useSEO';

import HeroSection from './components/HeroSection';
import FeaturedCategories from './components/FeaturedCategories';
import FeaturedProducts from './components/FeaturedProducts';
import ManifestoSection from './components/ManifestoSection';
import TestimonialsSection from './components/TestimonialsSection';
import NightCalmKit from './components/NightCalmKit';
import BreathingSimulator from './components/BreathingSimulator';
import AlchemyExperienceBanner from './components/AlchemyExperienceBanner';

interface HomePageProps {
  onNavigate?: (tab: 'home' | 'catalog' | 'rituals' | 'profile' | 'admin', category?: string) => void;
  onAddToCart?: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onAddToCart: propOnAddToCart }) => {
  useSEO({
    title: 'Aurea Elizabeth — Alquimia Botánica & Ritualidad',
    description: 'Descubrí elementos botánicos y rituales conscientes para nutrir tu bienestar diario. Aceites esenciales, sahumerios y alquimias de autor.',
    image: '/corazon.png',
  });

  const navigate = useNavigate();
  const { addItem } = useCart();
  const onAddToCart = propOnAddToCart || ((p: Product) => addItem(p));

  const handleNavigate = (tab: 'home' | 'catalog' | 'rituals' | 'profile' | 'admin', category?: string) => {
    if (onNavigate) {
      onNavigate(tab, category);
      return;
    }
    if (tab === 'home') navigate('/');
    else if (tab === 'catalog') navigate(category ? `/catalogo?categoria=${encodeURIComponent(category)}` : '/catalogo');
    else if (tab === 'rituals') navigate('/rituales');
    else if (tab === 'profile') navigate('/perfil');
    else if (tab === 'admin') navigate('/admin');
  };

  const { products: allProducts, loading: loadingProducts } = useProducts();
  const featuredProducts = allProducts.filter(p => p.isFeatured || p.isNew).slice(0, 8);

  const revealRefs = useRef<HTMLDivElement[]>([]);

  const addToRevealRefs = (el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };


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

  return (
    <div className="home-silent-seller" style={{ color: 'var(--color-text-dark)', overflowX: 'hidden' }}>
      {/* 1. Hero Sensorial & Faja de Confianza */}
      <HeroSection onNavigate={handleNavigate} addToRevealRefs={addToRevealRefs} />

      {/* 2. Productos Destacados (Primer Plano de Alta Conversión) */}
      <FeaturedProducts
        products={featuredProducts}
        loading={loadingProducts}
        onAddToCart={onAddToCart}
        onNavigate={handleNavigate}
        addToRevealRefs={addToRevealRefs}
      />

      {/* 3. Categorías Principales */}
      <FeaturedCategories onNavigate={handleNavigate} addToRevealRefs={addToRevealRefs} />

      {/* 4. Manifiesto Áurea */}
      <ManifestoSection addToRevealRefs={addToRevealRefs} />

      {/* 5. Testimoniales y Rituales más Elegidos */}
      <TestimonialsSection
        products={allProducts}
        onAddToCart={onAddToCart}
        addToRevealRefs={addToRevealRefs}
      />

      {/* 6. Kit de Calma Nocturna */}
      <NightCalmKit
        products={allProducts}
        onAddToCart={onAddToCart}
        addToRevealRefs={addToRevealRefs}
      />

      {/* 7. Widgets Inmersivos: Respirador Consciente y Quiz */}
      <section className="reveal-on-scroll" ref={addToRevealRefs} style={{ marginBottom: '80px' }}>
        <div className="container" style={{ padding: '0 24px' }}>
          <div className="grid-2" style={{ gap: '32px' }}>
            <BreathingSimulator />
            <AlchemyExperienceBanner onNavigate={handleNavigate} />
          </div>
        </div>
      </section>

      {/* Responsive Styles for Home */}
      <style>{`
        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.02); opacity: 1; }
        }
        @media (max-width: 767px) {
          .hero-container {
            padding: 10px 12px !important;
            min-height: auto !important;
            margin-bottom: 24px !important;
          }
          .hero-container .container {
            padding: 8px !important;
          }
          .hero-orbit-container {
            padding: 4px 0 !important;
          }
          .hero-orbit-circle {
            width: min(80vw, 300px) !important;
            height: min(80vw, 300px) !important;
          }
          .hero-brand-logo {
            max-width: 220px !important;
          }
          .hero-slogan {
            font-size: 1rem !important;
            line-height: 1.5 !important;
            margin-top: 8px !important;
          }
          .hero-buttons-container {
            flex-direction: column !important;
            width: 100% !important;
            gap: 12px !important;
          }
          .hero-buttons-container button {
            width: 100% !important;
            padding: 14px !important;
            font-size: 0.85rem !important;
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
