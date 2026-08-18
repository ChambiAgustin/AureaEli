import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  Wind,
  ExternalLink,
  ShoppingBag,
  Truck
} from 'lucide-react';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { apiRepository } from '../../core/api';
import type { Product, Order, UserProfile } from '../../core/api';
import { MercadoPagoService, type MercadoPagoPreferenceResponse } from '../../core/services/MercadoPagoService';
import { WHATSAPP_URL } from '../../shared/constants';
import { useCart } from '../../core/context/CartContext';
import { useAuth } from '../../core/context/AuthContext';
import { useToast } from '../../core/context/ToastContext';
import { useSEO } from '../../core/seo/useSEO';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface CheckoutFlowProps {
  isOpen?: boolean;
  onClose?: () => void;
  cartItems?: { product: Product; quantity: number }[];
  userProfile?: UserProfile | null;
  onOrderComplete?: (order: Order) => void;
  triggerToast?: (msg: string) => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  cartItems: propCartItems,
  userProfile: propUserProfile,
  onOrderComplete: propOnOrderComplete,
  triggerToast: propTriggerToast,
}) => {
  useSEO({
    title: 'Finalizar Compra Consciente | Aurea Elizabeth',
    description: 'Completá tu compra de elementos botánicos y rituales conscientes en Aurea Elizabeth con pasarela segura.',
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items: contextCartItems, clearCart } = useCart();
  const { userProfile: contextUserProfile } = useAuth();
  const { triggerToast: contextTriggerToast } = useToast();

  const urlStatus = searchParams.get('status') || searchParams.get('collection_status');
  const urlOrderId = searchParams.get('order_id') || searchParams.get('external_reference');

  const isOpen = propIsOpen !== undefined ? propIsOpen : true;
  const onClose = propOnClose || (() => navigate('/catalogo'));
  const cartItems = propCartItems || contextCartItems;
  const userProfile = propUserProfile !== undefined ? propUserProfile : contextUserProfile;
  const triggerToast = propTriggerToast || contextTriggerToast;
  const onOrderComplete = propOnOrderComplete || ((_order: Order) => {
    clearCart();
    localStorage.removeItem('aurea_cart_v2');
    localStorage.removeItem('aurea_cart_v1');
  });
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
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'whatsapp'>('mercadopago');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [mpPreference, setMpPreference] = useState<MercadoPagoPreferenceResponse | null>(null);

  const totalCart = cartItems.reduce((acc, curr) => acc + (curr.product.promoPrice ?? curr.product.price) * curr.quantity, 0);

  // Detección de Retorno de Mercado Pago vía URL params (?status=success&order_id=...)
  useEffect(() => {
    if (!urlStatus) return;

    if (urlStatus === 'success' || urlStatus === 'approved') {
      clearCart();
      localStorage.removeItem('aurea_cart_v2');
      localStorage.removeItem('aurea_cart_v1');

      if (urlOrderId) {
        apiRepository.getOrderById(urlOrderId).then((foundOrder) => {
          if (foundOrder) {
            setCreatedOrder(foundOrder);
          } else {
            setCreatedOrder({
              id: urlOrderId,
              userProfile: userProfile || {
                id: 'guest',
                name: fullName || 'Cliente Aurea',
                email: email || '',
                stressLevel: 'medium',
                aromaPreferences: [],
                skinType: 'normal',
                completedRituals: [],
                favorites: [],
              },
              items: [],
              status: 'completed',
              total: 0,
              paymentMethod: 'mercadopago',
              address: 'Registrada en Mercado Pago',
              createdAt: new Date().toISOString(),
              paymentStatus: 'approved',
            });
          }
          setStep('success');
          triggerToast('¡Pago acreditado con éxito! Tu ritual ya está en preparación.');
        }).catch(() => {
          setStep('success');
          triggerToast('¡Pago acreditado con éxito! Tu ritual ya está en preparación.');
        });
      } else {
        setStep('success');
        triggerToast('¡Pago acreditado con éxito! Tu ritual ya está en preparación.');
      }
    } else if (urlStatus === 'failure' || urlStatus === 'rejected') {
      triggerToast('El pago no pudo completarse. Podés intentar nuevamente o elegir WhatsApp.');
      setStep('payment');
    } else if (urlStatus === 'pending') {
      triggerToast('Tu pago se encuentra en proceso de acreditación en Mercado Pago.');
      setStep('payment');
    }
  }, [urlStatus, urlOrderId, clearCart, triggerToast, userProfile, fullName, email]);

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
  }, [isOpen, step, isBreathDone, triggerToast]);

  if (!isOpen) return null;

  // Step 2 Submission (Shipping details validated)
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !address.trim() || !city.trim() || !phone.trim()) {
      triggerToast('Por favor completá los datos obligatorios.');
      return;
    }
    setStep('payment');
  };

  // Step 3 Submission (Process MercadoPago Checkout Pro or WhatsApp)
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      customerPhone: phone,
    };

    try {
      const order = await apiRepository.createOrder(orderData);
      setCreatedOrder(order);

      // Limpiar carrito unificado
      clearCart();
      localStorage.removeItem('aurea_cart_v2');
      localStorage.removeItem('aurea_cart_v1');

      if (paymentMethod === 'whatsapp') {
        const itemsList = cartItems
          .map(
            (i) =>
              `• ${i.quantity}x *${i.product.name}* — $${((i.product.promoPrice ?? i.product.price) * i.quantity).toLocaleString('es-AR')}`
          )
          .join('\n');

        const orderIdDisplay = order.id.startsWith('order-') ? order.id.slice(6) : order.id.slice(0, 8);

        const waMsg = [
          '🌿 *ÁUREA ELIZABETH* • _Altar & Ritual Botánico_',
          '━━━━━━━━━━━━━━━━━━━━━',
          '✨ *NUEVA ORDEN DE COMPRA CONSCIENTE*',
          `📋 *N° de Pedido:* #${orderIdDisplay.toUpperCase()}`,
          `📅 *Fecha:* ${new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          '',
          `👤 *Cliente:* ${fullName}`,
          `📧 *Email:* ${email}`,
          `📱 *Teléfono:* ${phone}`,
          '',
          '📦 *ELEMENTOS SELECCIONADOS:*',
          itemsList,
          '',
          `💰 *Total de Productos:* $${totalCart.toLocaleString('es-AR')}`,
          `📍 *Dirección de Entrega:* ${address}, ${city} (CP ${zipCode})`,
          '🚚 *Envío:* A coordinar según localidad / correo',
          '',
          '💳 *Forma de Pago:* Transferencia Bancaria / Efectivo',
          '━━━━━━━━━━━━━━━━━━━━━',
          '🕯️ _Aguardamos los datos de la cuenta bancaria para concretar la transferencia y dar inicio a la preparación artesanal de nuestro ritual. ¡Muchas gracias!_'
        ].join('\n');

        const encodedMsg = encodeURIComponent(waMsg);
        const whatsappUrl = `${WHATSAPP_URL}?text=${encodedMsg}`;

        triggerToast('Orden registrada. Redirigiendo a Asistencia por WhatsApp...');
        window.open(whatsappUrl, '_blank');
        onOrderComplete(order);
        setStep('success');
      } else {
        // Mercado Pago Checkout Pro
        triggerToast('Generando pasarela de pago segura...');
        const preference = await MercadoPagoService.createPreference(order, cartItems);
        setMpPreference(preference);
        order.mercadopagoPreferenceId = preference.id;
        order.paymentStatus = 'pending';

        triggerToast('¡Preferencia de Mercado Pago lista!');
        onOrderComplete(order);
        setStep('success');
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
              <Card className="glass-panel" style={{ padding: '32px', border: '1px solid rgba(197, 168, 128, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                  <CreditCard size={20} color="var(--color-dorado-mate)" />
                  <Typography variant="h2" style={{ fontSize: '1.4rem' }}>Seleccioná tu Forma de Pago</Typography>
                </div>

                {/* Métodos de Pago Toggle Elegantes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 20px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'mercadopago' ? 'var(--color-dorado-mate)' : 'rgba(255,255,255,0.08)',
                    backgroundColor: paymentMethod === 'mercadopago' ? 'rgba(197, 168, 128, 0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <input
                        type="radio"
                        name="paymentFlow"
                        value="mercadopago"
                        checked={paymentMethod === 'mercadopago'}
                        onChange={() => setPaymentMethod('mercadopago')}
                        style={{ accentColor: 'var(--color-dorado-mate)', cursor: 'pointer', width: '18px', height: '18px' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Sparkles size={20} color="var(--color-dorado-mate)" />
                        <div>
                          <Typography variant="body" weight="semibold" style={{ fontSize: '0.95rem' }}>
                            Pagar con Mercado Pago
                          </Typography>
                          <Typography variant="body-sm" color="muted" style={{ fontSize: '0.78rem', display: 'block' }}>
                            Checkout Pro oficial (Tarjetas, Débito, Efectivo)
                          </Typography>
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-dorado-mate)', fontWeight: 'bold', background: 'rgba(197,168,128,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
                      Recomendado
                    </span>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 20px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'whatsapp' ? 'var(--color-oliva-salvia)' : 'rgba(255,255,255,0.08)',
                    backgroundColor: paymentMethod === 'whatsapp' ? 'rgba(110, 126, 107, 0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <input
                        type="radio"
                        name="paymentFlow"
                        value="whatsapp"
                        checked={paymentMethod === 'whatsapp'}
                        onChange={() => setPaymentMethod('whatsapp')}
                        style={{ accentColor: 'var(--color-oliva-salvia)', cursor: 'pointer', width: '18px', height: '18px' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageSquare size={20} color="#25D366" />
                        <div>
                          <Typography variant="body" weight="semibold" style={{ fontSize: '0.95rem' }}>
                            Asistencia por WhatsApp
                          </Typography>
                          <Typography variant="body-sm" color="muted" style={{ fontSize: '0.78rem', display: 'block' }}>
                            Coordinación personalizada y transferencia bancaria
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Resumen del Aporte */}
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    padding: '18px',
                    borderRadius: '14px',
                    border: '1px solid rgba(197, 168, 128, 0.15)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Monto Total a Abonar:</span>
                      <span style={{ color: 'var(--color-dorado-mate)', fontSize: '1.3rem', fontWeight: 'bold' }}>
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
                      gap: '8px',
                      fontSize: '1rem',
                    }}
                  >
                    <span>
                      {isSubmitting 
                        ? 'Procesando orden...' 
                        : paymentMethod === 'whatsapp' 
                          ? 'Completar y Abrir WhatsApp' 
                          : 'Procesar Pago con Mercado Pago'}
                    </span>
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {/* ================= STEP 4: SUCCESS PAGE (Glassmorphic Botánica Crema/Dorada) ================= */}
          {step === 'success' && createdOrder && (
            <div style={{
              backgroundColor: '#f5efe4',
              color: '#231f1c',
              borderRadius: '24px',
              padding: '40px 32px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(197, 168, 128, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #c5a880',
              animation: 'scaleUpIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(110, 126, 107, 0.15)',
                border: '2px solid #6e7e6b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                animation: 'successIconPulse 2s infinite ease'
              }}>
                <CheckCircle size={32} color="#6e7e6b" />
              </div>

              <Typography variant="caption" style={{ color: '#8c7a6b', letterSpacing: '0.1em', fontWeight: 'bold', textTransform: 'uppercase' }}>
                ✓ Ritual Completado con Éxito
              </Typography>
              
              <Typography variant="h2" style={{ color: '#231f1c', marginTop: '8px', marginBottom: '16px', fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>
                ¡Tu pedido ha sido registrado!
              </Typography>

              <p style={{ fontSize: '0.9rem', color: '#554f47', marginBottom: '24px', lineHeight: '1.6' }}>
                Orden <strong style={{ color: '#8c7a6b' }}>#{createdOrder.id}</strong> • Transacción confirmada
              </p>

              {/* Resumen de Productos */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(197, 168, 128, 0.25)',
                marginBottom: '20px',
                textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid rgba(197, 168, 128, 0.2)', paddingBottom: '8px' }}>
                  <ShoppingBag size={18} color="#8c7a6b" />
                  <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#231f1c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Resumen de la Colección
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(createdOrder.items && createdOrder.items.length > 0) ? (
                    createdOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#3a3530' }}>
                        <span>{item.quantity}x {item.product?.name || 'Producto'}</span>
                        <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>
                          ${(((item.product?.promoPrice ?? item.product?.price) || 0) * item.quantity).toLocaleString('es-AR')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#554f47', fontStyle: 'italic' }}>
                      Transacción confirmada. Tu selección está en proceso de armado.
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid rgba(197, 168, 128, 0.2)', marginTop: '14px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#231f1c' }}>
                  <span>Total</span>
                  <span style={{ color: '#8c7a6b', fontSize: '1.05rem' }}>${(createdOrder.total || totalCart || 0).toLocaleString('es-AR')}</span>
                </div>

              </div>

              {/* Detalle de Envío */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '1px solid rgba(197, 168, 128, 0.25)',
                marginBottom: '28px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <Truck size={20} color="#6e7e6b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#8c7a6b', fontWeight: 'bold' }}>
                    Dirección de Envío
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#3a3530', lineHeight: '1.4' }}>
                    {createdOrder.address}
                  </span>
                  {createdOrder.trackingNumber && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#6e7e6b', marginTop: '4px' }}>
                      Código de seguimiento: <strong>{createdOrder.trackingNumber}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {paymentMethod === 'mercadopago' && mpPreference && (
                  <a
                    href={mpPreference.init_point}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: '#009EE3',
                      color: '#ffffff',
                      padding: '14px 24px',
                      borderRadius: '14px',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(0, 158, 227, 0.25)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span>Ir a Mercado Pago</span>
                    <ExternalLink size={18} />
                  </a>
                )}

                <Button
                  variant="secondary"
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(35, 31, 28, 0.06)',
                    color: '#231f1c',
                    border: '1px solid rgba(35, 31, 28, 0.15)',
                    fontWeight: '500'
                  }}
                >
                  Seguir Explorando la Colección
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Estilos locales para las animaciones */}
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
