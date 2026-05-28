import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  Wind, 
  Heart, 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { apiRepository } from '../../core/api';
import type { Product, Order, UserProfile } from '../../core/api';

interface CheckoutFlowProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { product: Product; quantity: number }[];
  userProfile: UserProfile | null;
  onOrderComplete: (order: Order) => void;
  triggerToast: (msg: string) => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  isOpen,
  onClose,
  cartItems,
  userProfile,
  onOrderComplete,
  triggerToast,
}) => {
  // Steps: 'breath' | 'shipping' | 'payment' | 'success'
  const [step, setStep] = useState<'breath' | 'shipping' | 'payment' | 'success'>('breath');
  const [breathPhase, setBreathPhase] = useState<'Inhalá' | 'Retené' | 'Exhalá' | 'Conectá'>('Inhalá');
  const [countdown, setCountdown] = useState<number>(10);
  const [isBreathDone, setIsBreathDone] = useState<boolean>(false);

  // Form States - Shipping
  const [fullName, setFullName] = useState<string>(userProfile?.name || '');
  const [email, setEmail] = useState<string>(userProfile?.email || '');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>('');

  // Form States - Payment
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'mercadopago'>('whatsapp');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const totalCart = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  // Breath Pause Logic (Step 1)
  useEffect(() => {
    if (!isOpen || step !== 'breath' || isBreathDone) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsBreathDone(true);
          setBreathPhase('Conectá');
          triggerToast('Respiración completada. Tu sistema nervioso está listo.');
          return 0;
        }

        // Cycle breathing phases every 3 seconds roughly
        const remaining = prev - 1;
        if (remaining > 6) {
          setBreathPhase('Inhalá');
        } else if (remaining > 3) {
          setBreathPhase('Retené');
        } else {
          setBreathPhase('Exhalá');
        }
        return remaining;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, step, isBreathDone]);

  if (!isOpen) return null;

  // Formatting utility for credit card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    setCardNumber(formatted);
  };

  // Formatting utility for expiry date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setCardExpiry(value.substring(0, 5));
  };

  // Formatting utility for CVV
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardCvv(value);
  };

  // Step 2 Submission (Shipping details validated)
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !address.trim() || !city.trim() || !phone.trim()) {
      triggerToast('Por favor completá los datos obligatorios.');
      return;
    }
    setStep('payment');
  };

  // Step 3 Submission (Process WhatsApp or simulation MercadoPago)
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'mercadopago') {
      if (cardNumber.length < 19 || !cardName.trim() || cardExpiry.length < 5 || cardCvv.length < 3) {
        triggerToast('Por favor completá los datos de tu tarjeta.');
        return;
      }
    }

    setIsSubmitting(true);

    const orderData = {
      userProfile: userProfile || {
        id: 'guest',
        name: fullName,
        email: email,
        stressLevel: 'medium',
        aromaPreferences: [],
        skinType: 'normal',
        completedRituals: [],
        favorites: [],
      },
      items: cartItems.map(item => ({ product: item.product, quantity: item.quantity })),
      total: totalCart,
      paymentMethod,
      address: `${address}, ${city} (CP ${zipCode})`,
    };

    try {
      const order = await apiRepository.createOrder(orderData);
      setCreatedOrder(order);
      
      if (paymentMethod === 'whatsapp') {
        const itemsList = cartItems.map(i => `- ${i.quantity}x ${i.product.name}`).join('\n');
        const waMsg = `Hola Aurea Elizabeth. Quiero coordinar mi pedido Ritual (Orden: ${order.id}):\n\n${itemsList}\n\nEnvío a: ${order.address}\nTotal: $${totalCart.toLocaleString('es-AR')}`;
        const encodedMsg = encodeURIComponent(waMsg);
        
        triggerToast('Redirigiendo a Asistencia por WhatsApp...');
        setTimeout(() => {
          window.open(`https://wa.me/5491100000000?text=${encodedMsg}`, '_blank');
          setStep('success');
          onOrderComplete(order);
        }, 1500);
      } else {
        // Simular canalización de MercadoPago
        triggerToast('Conectando con pasarela segura de MercadoPago...');
        setTimeout(() => {
          setStep('success');
          onOrderComplete(order);
        }, 2500);
      }
    } catch (err) {
      console.error('Error creating order in checkout:', err);
      triggerToast('Hubo un inconveniente al registrar tu altar de compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--color-bg-main)',
        zIndex: 1000,
        overflowY: 'auto',
        animation: 'fadeInCheckout 0.5s ease-out',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Fijo Premium */}
      <header
        style={{
          borderBottom: '1px solid rgba(197, 168, 128, 0.15)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(35, 31, 28, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {step !== 'success' && (
            <button
              onClick={() => {
                if (step === 'payment') setStep('shipping');
                else if (step === 'shipping') setStep('breath');
                else onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-crema-calido)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <Typography variant="h3" style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>
            Ritual de Compra Consciente
          </Typography>
        </div>

        {step !== 'success' && (
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}>
            <span style={{ color: step === 'breath' ? 'var(--color-dorado-mate)' : 'inherit', fontWeight: step === 'breath' ? 'bold' : 'normal' }}>1. Pausa</span>
            <span>•</span>
            <span style={{ color: step === 'shipping' ? 'var(--color-dorado-mate)' : 'inherit', fontWeight: step === 'shipping' ? 'bold' : 'normal' }}>2. Envío</span>
            <span>•</span>
            <span style={{ color: step === 'payment' ? 'var(--color-dorado-mate)' : 'inherit', fontWeight: step === 'payment' ? 'bold' : 'normal' }}>3. Pago</span>
          </div>
        )}
      </header>

      {/* Contenido Principal con Centrado */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          
          {/* ================= STEP 1: RESPIRACIÓN SAGRADA ================= */}
          {step === 'breath' && (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
              <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                <Typography variant="caption" color="gold" weight="semibold">Fase 1: Conexión Inmersiva</Typography>
                <Typography variant="h2" style={{ marginTop: '12px', marginBottom: '16px' }}>Pausa Consciente</Typography>
                <Typography variant="body" color="muted" style={{ fontSize: '0.95rem', marginBottom: '40px', lineHeight: '1.8' }}>
                  En Aurea Elizabeth creemos en la compra consciente. Te invitamos a tomar una pausa de 10 segundos para centrarte, calmar tu sistema nervioso y alinear esta compra con tu propósito de bienestar.
                </Typography>

                {/* Círculo de respiración */}
                <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 40px' }}>
                  {/* Círculo Pulsante Externo CSS */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '2px solid var(--color-dorado-mate)',
                      animation: isBreathDone ? 'none' : 'checkoutPulse 3s infinite ease-in-out',
                      opacity: 0.3,
                    }}
                  />
                  
                  {/* Círculo Principal */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      width: '170px',
                      height: '170px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, var(--color-oliva-salvia) 0%, var(--color-bosque-suave) 100%)',
                      boxShadow: '0 0 30px rgba(110, 126, 107, 0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-crema-calido)',
                      transition: 'all 0.5s ease',
                      border: isBreathDone ? '2px solid var(--color-dorado-mate)' : 'none',
                    }}
                  >
                    <Wind size={28} style={{ marginBottom: '6px', opacity: 0.8 }} />
                    <Typography variant="h3" style={{ fontSize: '1.2rem', letterSpacing: '0.05em' }}>
                      {breathPhase}
                    </Typography>
                    {!isBreathDone && (
                      <span style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
                        {countdown}s
                      </span>
                    )}
                  </div>
                </div>

                {isBreathDone ? (
                  <div style={{ animation: 'fadeIn 0.5s ease' }}>
                    <Typography variant="body-sm" color="gold" weight="semibold" style={{ display: 'block', marginBottom: '24px' }}>
                      ✓ Energía integrada. Tu altar está listo para continuar.
                    </Typography>
                    <Button
                      variant="primary"
                      onClick={() => setStep('shipping')}
                      style={{ width: '100%', padding: '16px', borderRadius: '16px' }}
                    >
                      Continuar al Envío
                    </Button>
                  </div>
                ) : (
                  <Typography variant="body-sm" color="muted" italic>
                    Respirá hondo... seguí el ritmo del círculo...
                  </Typography>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 2: DATOS DE ENVÍO ================= */}
          {step === 'shipping' && (
            <Card className="glass-panel" style={{ padding: '32px', border: '1px solid rgba(197, 168, 128, 0.2)', animation: 'fadeIn 0.6s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <MapPin size={18} color="var(--color-dorado-mate)" />
                <Typography variant="h2" style={{ fontSize: '1.5rem' }}>Detalles de Entrega</Typography>
              </div>

              <form onSubmit={handleShippingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej: Alma Aurea"
                    style={inputStyle}
                  />
                </div>

                <div className="grid-responsive-half" style={{ gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alma@aurea.com"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                      Teléfono de Contacto *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="11 3456-7890"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                    Dirección de Envío *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, Número, Depto, Barrio..."
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                      Ciudad / Provincia *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Buenos Aires"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                      Cód. Postal
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="1425"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', marginTop: '12px' }}
                >
                  Continuar al Método de Pago
                </Button>
              </form>
            </Card>
          )}

          {/* ================= STEP 3: MÉTODOS DE PAGO ================= */}
          {step === 'payment' && (
            <div style={{ animation: 'fadeIn 0.6s ease' }}>
              
              {/* Tarjeta de Crédito Premium Interactiva (solo si MercadoPago está seleccionado) */}
              {paymentMethod === 'mercadopago' && (
                <div style={{ perspective: '1000px', marginBottom: '32px' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      position: 'relative',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* FRENTE DE LA TARJETA (Glassmorphism de Lujo) */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(197, 168, 128, 0.35) 0%, rgba(140, 122, 107, 0.15) 100%)',
                        border: '1px solid rgba(197, 168, 128, 0.4)',
                        backdropFilter: 'blur(20px)',
                        padding: '24px',
                        color: 'var(--color-crema-calido)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Typography variant="caption" color="gold" style={{ fontSize: '0.65rem' }}>Alma Aurea</Typography>
                          <Typography variant="body" weight="semibold" style={{ fontSize: '1.1rem', letterSpacing: '0.08em', marginTop: '4px' }}>
                            AUREA ELIZABETH
                          </Typography>
                        </div>
                        {/* Chip simulado */}
                        <div style={{ width: '40px', height: '30px', borderRadius: '6px', background: 'linear-gradient(135deg, #c5a880 0%, #e5d1b7 100%)', border: '1px solid rgba(255,255,255,0.2)' }} />
                      </div>

                      {/* Card Number */}
                      <Typography
                        variant="h3"
                        style={{
                          fontSize: '1.4rem',
                          letterSpacing: '0.15em',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          margin: '16px 0',
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        {cardNumber || '•••• •••• •••• ••••'}
                      </Typography>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <div>
                          <span style={{ opacity: 0.6, fontSize: '0.55rem', display: 'block', textTransform: 'uppercase' }}>Titular</span>
                          <span style={{ letterSpacing: '0.05em' }}>{cardName.toUpperCase() || 'ALMA EN CALMA'}</span>
                        </div>
                        <div>
                          <span style={{ opacity: 0.6, fontSize: '0.55rem', display: 'block', textTransform: 'uppercase' }}>Vence</span>
                          <span style={{ fontFamily: 'monospace' }}>{cardExpiry || 'MM/AA'}</span>
                        </div>
                      </div>
                    </div>

                    {/* DORSO DE LA TARJETA */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, rgba(35, 31, 28, 0.95) 0%, rgba(140, 122, 107, 0.8) 100%)',
                        border: '1px solid rgba(197, 168, 128, 0.3)',
                        transform: 'rotateY(180deg)',
                        padding: '24px 0',
                        color: 'var(--color-crema-calido)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                      }}
                    >
                      {/* Banda Magnética */}
                      <div style={{ width: '100%', height: '40px', backgroundColor: 'var(--color-tierra-profunda)', marginTop: '8px' }} />
                      
                      {/* CVV Panel */}
                      <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', marginRight: '10px', opacity: 0.6 }}>CVV</span>
                        <div style={{
                          backgroundColor: 'var(--color-crema-calido)',
                          color: 'var(--color-tierra-profunda)',
                          fontFamily: 'monospace',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          letterSpacing: '0.1em',
                          minWidth: '50px',
                          textAlign: 'center',
                          fontStyle: 'italic',
                        }}>
                          {cardCvv || '•••'}
                        </div>
                      </div>
                      
                      {/* Disclaimer sutil */}
                      <p style={{ fontSize: '0.55rem', opacity: 0.4, padding: '0 24px', textAlign: 'center' }}>
                        Esta tarjeta se procesa en el entorno simulado y seguro del templo Aurea Elizabeth.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulario e Interrupción de Pago */}
              <Card className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(197, 168, 128, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <CreditCard size={18} color="var(--color-dorado-mate)" />
                  <Typography variant="h2" style={{ fontSize: '1.4rem' }}>Forma de Pago</Typography>
                </div>

                {/* Métodos de Pago Toggle */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'whatsapp' ? 'var(--color-oliva-salvia)' : 'rgba(255,255,255,0.06)',
                    backgroundColor: paymentMethod === 'whatsapp' ? 'rgba(110, 126, 107, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="radio"
                        name="paymentFlow"
                        value="whatsapp"
                        checked={paymentMethod === 'whatsapp'}
                        onChange={() => setPaymentMethod('whatsapp')}
                        style={{ accentColor: 'var(--color-oliva-salvia)', cursor: 'pointer' }}
                      />
                      <MessageSquare size={16} color="#25D366" />
                      <div>
                        <Typography variant="body" weight="medium" style={{ fontSize: '0.9rem' }}>Coordinar Pago por WhatsApp</Typography>
                        <Typography variant="body-sm" color="muted" style={{ fontSize: '0.75rem', display: 'block' }}>Asistencia personalizada de Alma a Alma</Typography>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-oliva-salvia)', fontWeight: 'bold' }}>Recomendado</span>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'mercadopago' ? 'var(--color-dorado-mate)' : 'rgba(255,255,255,0.06)',
                    backgroundColor: paymentMethod === 'mercadopago' ? 'rgba(197, 168, 128, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}>
                    <input
                      type="radio"
                      name="paymentFlow"
                      value="mercadopago"
                      checked={paymentMethod === 'mercadopago'}
                      onChange={() => setPaymentMethod('mercadopago')}
                      style={{ accentColor: 'var(--color-dorado-mate)', marginRight: '10px', cursor: 'pointer' }}
                    />
                    <Sparkles size={16} color="var(--color-dorado-mate)" style={{ marginRight: '8px' }} />
                    <div>
                      <Typography variant="body" weight="medium" style={{ fontSize: '0.9rem' }}>MercadoPago (Simulación de Tarjeta)</Typography>
                      <Typography variant="body-sm" color="muted" style={{ fontSize: '0.75rem', display: 'block' }}>Acreditación instantánea y pasarela estética</Typography>
                    </div>
                  </label>
                </div>

                <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Inputs específicos para MercadoPago simulado */}
                  {paymentMethod === 'mercadopago' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeIn 0.4s ease' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                          Número de Tarjeta *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4517 8400 1234 5678"
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                          Nombre del Titular (como figura en tarjeta) *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="ALMA RITUAL"
                          style={inputStyle}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                            Fecha de Vto *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                            Código de Seg. (CVV) *
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="•••"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            onFocus={() => setIsCardFlipped(true)}
                            onBlur={() => setIsCardFlipped(false)}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', justifyContent: 'center', marginTop: '6px' }}>
                        <Lock size={12} color="var(--color-oliva-salvia)" />
                        <span>Encriptación y pasarela segura en modo integrador</span>
                      </div>
                    </div>
                  )}

                  {/* Resumen del Aporte */}
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(197, 168, 128, 0.1)',
                    marginTop: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Monto Total a Aportar:</span>
                      <span style={{ color: 'var(--color-dorado-mate)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        ${totalCart.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>

                  {/* CTA Final */}
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>
                      {isSubmitting 
                        ? 'Canalizando energía de pago...' 
                        : paymentMethod === 'whatsapp' 
                          ? 'Completar y Abrir WhatsApp' 
                          : 'Confirmar y Abonar Altar'}
                    </span>
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {/* ================= STEP 4: SUCCESS PAGE ================= */}
          {step === 'success' && createdOrder && (
            <Card className="glass-panel" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--color-dorado-mate)', animation: 'scaleUpIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(110, 126, 107, 0.15)',
                border: '2px solid var(--color-oliva-salvia)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                animation: 'successIconPulse 2s infinite ease'
              }}>
                <CheckCircle size={36} color="var(--color-oliva-salvia)" />
              </div>

              <Typography variant="caption" color="gold" weight="bold">✓ Ritual Completado</Typography>
              <Typography variant="h2" style={{ marginTop: '12px', marginBottom: '20px' }}>¡Tu compra ha sido bendecida!</Typography>
              
              <Typography variant="body" color="light" style={{ fontSize: '0.95rem', marginBottom: '28px', lineHeight: '1.8' }}>
                Registramos tu orden <strong style={{ color: 'var(--color-dorado-mate)' }}>#{createdOrder.id}</strong> con total éxito. <br />
                Hemos despachado un mensajero botánico hacia tu dirección. <br />
                Código de Correo: <code style={{ color: 'var(--color-dorado-mate)', fontWeight: 'bold' }}>{createdOrder.trackingNumber}</code>.
              </Typography>

              <div style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(197, 168, 128, 0.1)',
                marginBottom: '32px',
                textAlign: 'left'
              }}>
                <Typography variant="body-sm" color="muted" style={{ display: 'block', lineHeight: '1.7' }}>
                  <strong>Pausa de Integración sugerida:</strong> Disfrutá el trayecto. Agradecé a tu cuerpo y alma por este instante de cuidado propio. Hacé 3 respiraciones profundas y sonreí.
                </Typography>
              </div>

              <Button
                variant="primary"
                onClick={onClose}
                style={{ width: '100%', padding: '14px', borderRadius: '14px' }}
              >
                Volver a la Galería
              </Button>
            </Card>
          )}

        </div>
      </main>

      {/* Estilos locales para las animaciones y el credit card flip */}
      <style>{`
        @keyframes fadeInCheckout {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes checkoutPulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        @keyframes scaleUpIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes successIconPulse {
          0% { box-shadow: 0 0 0 0 rgba(110, 126, 107, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(110, 126, 107, 0); }
          100% { box-shadow: 0 0 0 0 rgba(110, 126, 107, 0); }
        }
      `}</style>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  backgroundColor: 'rgba(35, 31, 28, 0.65)',
  border: '1px solid rgba(197, 168, 128, 0.22)',
  borderRadius: '12px',
  color: 'var(--color-crema-calido)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.85rem',
  outline: 'none',
  transition: 'all 0.3s ease',
};

export default CheckoutFlow;
