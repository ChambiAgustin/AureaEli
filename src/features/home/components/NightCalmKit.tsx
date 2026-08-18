import React, { useState } from 'react';
import type { Product } from '../../../core/api/IRepository';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import { Sparkles, Clock } from 'lucide-react';

interface NightCalmKitProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  addToRevealRefs?: (el: HTMLDivElement | null) => void;
}

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

export const NightCalmKit: React.FC<NightCalmKitProps> = ({
  products,
  onAddToCart,
  addToRevealRefs
}) => {
  const [activeKitStep, setActiveKitStep] = useState<number>(0);

  const kitProducts = products.slice(0, 3);
  const kitTotal = kitProducts.reduce((acc, p) => acc + (p.promoPrice ?? p.price), 0);

  const handleAddKitToCart = () => {
    if (kitProducts.length === 0) return;
    kitProducts.forEach(p => onAddToCart(p));
    alert('¡Fantástico! Agregamos los productos del "Kit de Calma Nocturna" a tu altar de compras.');
  };

  return (
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

              {kitProducts.length > 0 && (
                <Button variant="primary" size="lg" onClick={handleAddKitToCart}>
                  Llevar Kit Completo — ${kitTotal.toLocaleString('es-AR')}
                </Button>
              )}
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
  );
};

export default NightCalmKit;
