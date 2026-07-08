import React, { useState, useEffect } from 'react';
import { 
  User, 
  Heart, 
  ShoppingCart, 
  Bookmark, 
  Activity, 
  Leaf, 
  MapPin, 
  Trash2, 
  Plus, 
  Minus,
  Sparkles,
  CheckCircle,
  Clock
} from 'lucide-react';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { apiRepository } from '../../core/api';
import type { Product, UserProfile, Order } from '../../core/api';
import { supabase } from '../../core/supabase/client';

interface ProfilePageProps {
  userProfile: UserProfile | null;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onAddToCart: (product: Product) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  triggerToast: (msg: string) => void;
  orders: Order[];
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userProfile,
  onUpdateProfile,
  onAddToCart,
  favorites,
  onToggleFavorite,
  triggerToast,
  orders,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingName, setEditingName] = useState<string>(userProfile?.name || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedStress, setSelectedStress] = useState<string>(userProfile?.stressLevel || 'medium');
  const [selectedAromas, setSelectedAromas] = useState<string[]>(userProfile?.aromaPreferences || []);

  const allAromas = ['Lavanda', 'Sándalo', 'Eucalipto', 'Menta', 'Rosas', 'Salvia', 'Copal', 'Jazmín'];

  // Load all products to map favorite IDs
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiRepository.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products for profile favorites:', err);
      }
    };
    fetchProducts();
  }, []);

  if (!userProfile) return null;

  // Filter favorite products from all products
  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  // Handles updating stress level in profile and saves it
  const handleStressUpdate = async (level: string) => {
    setSelectedStress(level);
    const updatedProfile: UserProfile = {
      ...userProfile,
      stressLevel: level
    };
    onUpdateProfile(updatedProfile);
    
    try {
      await apiRepository.updateUserProfile(updatedProfile);
      triggerToast(`Bitácora: Tu estado de ánimo se registró como '${getStressLabel(level)}'.`);
    } catch (err) {
      console.error('Error updating stress level:', err);
    }
  };

  // Handles toggling aroma preference
  const handleAromaToggle = async (aroma: string) => {
    const updatedAromas = selectedAromas.includes(aroma)
      ? selectedAromas.filter(a => a !== aroma)
      : [...selectedAromas, aroma];
    
    setSelectedAromas(updatedAromas);
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      aromaPreferences: updatedAromas
    };
    onUpdateProfile(updatedProfile);

    try {
      await apiRepository.updateUserProfile(updatedProfile);
      triggerToast(`Preferencia actualizada: ${aroma}`);
    } catch (err) {
      console.error('Error updating aroma preference:', err);
    }
  };

  // Profile Save Action
  const handleSaveProfileName = async () => {
    if (!editingName.trim()) {
      triggerToast('El nombre no puede estar vacío.');
      return;
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      name: editingName
    };
    onUpdateProfile(updatedProfile);
    setIsEditing(false);

    try {
      await apiRepository.updateUserProfile(updatedProfile);
      triggerToast('Tu perfil de Alma ha sido guardado.');
    } catch (err) {
      console.error('Error saving profile name:', err);
    }
  };

  const getStressLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Calma Absoluta';
      case 'medium': return 'Armónico';
      case 'high': return 'Alta Sobrecarga';
      default: return level;
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }}>
      
      {/* Cabecera de la Bitácora */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Typography variant="caption" color="gold" weight="semibold">Tu Diario de Introspección</Typography>
        <Typography variant="h2" style={{ textTransform: 'uppercase', marginTop: '6px' }}>La Bitácora de Bienestar</Typography>
        <div style={{ width: '40px', height: '1px', backgroundColor: 'var(--color-dorado-mate)', margin: '12px auto' }} />
        <Typography variant="body-sm" color="muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Este diario registra tus estados sensoriales, preferencias aromáticas e intenciones sagradas de calma. Acompañá tu respiración y mantené tu paz interior.
        </Typography>
      </div>

      <div className="grid-responsive-profile" style={{ alignItems: 'start' }}>
        
        {/* PANEL IZQUIERDO: DETALLES PERSONALES Y PREFERENCIAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tarjeta de Perfil Básica */}
          <Card className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                backgroundColor: 'rgba(197, 168, 128, 0.1)',
                border: '2px solid var(--color-dorado-mate)',
                color: 'var(--color-dorado-mate)',
                fontSize: '2rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 4px 15px rgba(197, 168, 128, 0.2)'
              }}>
                {userProfile.name.charAt(0).toUpperCase()}
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(35, 31, 28, 0.8)',
                      border: '1px solid var(--color-dorado-mate)',
                      borderRadius: '10px',
                      color: 'var(--color-crema-calido)',
                      textAlign: 'center',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="primary" size="sm" onClick={handleSaveProfileName}>Guardar</Button>
                    <Button variant="secondary" size="sm" onClick={() => { setEditingName(userProfile.name); setIsEditing(false); }}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Typography variant="h3" style={{ fontSize: '1.4rem' }}>{userProfile.name}</Typography>
                  <Typography variant="body-sm" color="muted" style={{ display: 'block', marginBottom: '6px' }}>{userProfile.email}</Typography>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-dorado-mate)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Editar Nombre
                    </button>
                    <button
                      onClick={() => supabase.auth.signOut()}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sensibilidad */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Tipo de Sensibilidad:</span>
              <span style={{ fontWeight: '500' }}>Sensible Botánica Primaria</span>
            </div>
          </Card>

          {/* Diario de Bienestar / Stress Tracker */}
          <Card style={{ padding: '24px', backgroundColor: 'rgba(35, 31, 28, 0.65)', border: '1px solid rgba(197, 168, 128, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Activity size={16} color="var(--color-dorado-mate)" />
              <Typography variant="caption" color="gold" weight="bold">Estado Emocional Hoy</Typography>
            </div>

            <Typography variant="body-sm" color="muted" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
              ¿Cómo sentís tu nivel de estrés en este momento de tu práctica? Registrarlo ayuda a equilibrar tus rituales aromáticos.
            </Typography>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'low', label: 'Calma Absoluta (Relajado)', desc: 'Flujo de paz y tranquilidad plena', color: 'var(--color-oliva-salvia)', bg: 'rgba(110, 126, 107, 0.1)' },
                { id: 'medium', label: 'Armónico (Eje)', desc: 'Concentrado y estable ante el día', color: 'var(--color-dorado-mate)', bg: 'rgba(197, 168, 128, 0.1)' },
                { id: 'high', label: 'Alta Sobrecarga (Estrés)', desc: 'Tensión que requiere una pausa urgente', color: 'var(--color-terracota-suave)', bg: 'rgba(194, 139, 120, 0.1)' },
              ].map(st => (
                <div
                  key={st.id}
                  onClick={() => handleStressUpdate(st.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: selectedStress === st.id ? st.color : 'rgba(255,255,255,0.04)',
                    backgroundColor: selectedStress === st.id ? st.bg : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedStress !== st.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedStress !== st.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: selectedStress === st.id ? st.color : 'var(--color-crema-calido)' }}>{st.label}</span>
                    {selectedStress === st.id && <Leaf size={14} color={st.color} />}
                  </div>
                  <Typography variant="body-sm" color="muted" style={{ fontSize: '0.75rem', marginTop: '3px', display: 'block' }}>
                    {st.desc}
                  </Typography>
                </div>
              ))}
            </div>
          </Card>

          {/* Preferencias Olfativas */}
          <Card style={{ padding: '24px', backgroundColor: 'rgba(35, 31, 28, 0.65)', border: '1px solid rgba(197, 168, 128, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Leaf size={16} color="var(--color-dorado-mate)" />
              <Typography variant="caption" color="gold" weight="bold">Intenciones Aromáticas</Typography>
            </div>
            
            <Typography variant="body-sm" color="muted" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
              Seleccioná los aromas botánicos que mejor conectan con tu ser para recomendarte kits alineados:
            </Typography>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allAromas.map(aroma => {
                const isSelected = selectedAromas.includes(aroma);
                return (
                  <button
                    key={aroma}
                    onClick={() => handleAromaToggle(aroma)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--color-dorado-mate)' : 'rgba(255,255,255,0.06)',
                      backgroundColor: isSelected ? 'rgba(197, 168, 128, 0.12)' : 'transparent',
                      color: isSelected ? 'var(--color-dorado-mate)' : 'var(--color-text-muted)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: isSelected ? '600' : '400'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    }}
                  >
                    {aroma}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* PANEL DERECHO: HISTORIAL Y ELEMENTOS FAVORITOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Historial de Pedidos */}
          <Card style={{ padding: '24px', backgroundColor: 'rgba(35, 31, 28, 0.65)', border: '1px solid rgba(197, 168, 128, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Clock size={16} color="var(--color-dorado-mate)" />
              <Typography variant="caption" color="gold" weight="bold">Tus Altares Registrados ({orders.length})</Typography>
            </div>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <Typography variant="body-sm" color="muted">Ninguna orden registrada en esta encarnación.</Typography>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid rgba(197, 168, 128, 0.12)',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-dorado-mate)' }}>ORDEN: #{ord.id.substring(0, 8)}</span>
                      <span style={{
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(110, 126, 107, 0.15)',
                        color: 'var(--color-oliva-salvia)',
                        fontWeight: 'bold'
                      }}>
                        {ord.status === 'pending' ? 'Registrado' : ord.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                      Plegaria de Compra: {new Date(ord.createdAt).toLocaleDateString('es-AR')} | Vía: {ord.paymentMethod === 'whatsapp' ? 'WhatsApp' : 'MercadoPago'}
                    </div>

                    {/* Ítems comprados */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                      {ord.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--color-crema-calido)' }}>{item.quantity}x {item.product.name}</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>${(item.product.price * item.quantity).toLocaleString('es-AR')}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Aporte Total:</span>
                      <strong style={{ color: 'var(--color-dorado-mate)', fontSize: '0.95rem' }}>${ord.total.toLocaleString('es-AR')}</strong>
                    </div>

                    {ord.trackingNumber && (
                      <div style={{ marginTop: '8px', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Mensajero de Seguimiento:</span>
                        <code style={{ color: 'var(--color-dorado-mate)', fontWeight: 'bold' }}>{ord.trackingNumber}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Productos Favoritos / Intenciones Guardadas */}
          <Card style={{ padding: '24px', backgroundColor: 'rgba(35, 31, 28, 0.65)', border: '1px solid rgba(197, 168, 128, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Bookmark size={16} color="var(--color-dorado-mate)" />
              <Typography variant="caption" color="gold" weight="bold">Tus Elementos Guardados ({favorites.length})</Typography>
            </div>

            {favorites.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <Typography variant="body-sm" color="muted">No tenés guardado ningún elemento para tu altar aromático.</Typography>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {favoriteProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.03)',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <Typography variant="body" weight="medium" style={{ fontSize: '0.85rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </Typography>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-dorado-mate)' }}>
                        ${product.price.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAddToCart(product)}
                        style={{ padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                      >
                        <ShoppingCart size={12} />
                      </Button>
                      <button
                        onClick={() => onToggleFavorite(product.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-terracota-suave)',
                          padding: '6px'
                        }}
                      >
                        <Heart size={14} fill="var(--color-terracota-suave)" color="var(--color-terracota-suave)" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
