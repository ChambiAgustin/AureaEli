import React, { useState, useEffect, useCallback } from 'react';
import { apiRepository } from '../../core/api';
import { supabase } from '../../core/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { Product, Category, ContentBlock, Ritual, Order } from '../../core/api/IRepository';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import {
  Lock, ShoppingBag, Package, FileText, Tag, Shuffle
} from 'lucide-react';
import { useToast } from '../../core/context/ToastContext';

import AdminStatsHeader from './components/AdminStatsHeader';
import AdminProductManager from './components/AdminProductManager';
import AdminCategoryManager from './components/AdminCategoryManager';
import AdminOrderManager from './components/AdminOrderManager';
import AdminContentManager, { ritualToDraft, type RitualFieldDraft } from './components/AdminContentManager';

interface AdminPageProps {
  onProductsChange?: () => void;
  triggerToast?: (msg: string) => void;
}

export type AdminTab = 'orders' | 'products' | 'content' | 'categories' | 'rituals';

export const AdminPage: React.FC<AdminPageProps> = ({
  onProductsChange,
  triggerToast: propTriggerToast,
}) => {
  const { triggerToast: contextTriggerToast } = useToast();
  const triggerToast = propTriggerToast || contextTriggerToast;

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // ── Navegación ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // ── Datos ─────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'shipped' | 'completed'>('all');
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Estado del editor de rituales ────────────────────────────────────────
  const [ritualDraftIds, setRitualDraftIds] = useState<Record<string, string[]>>({});
  const [ritualFieldDrafts, setRitualFieldDrafts] = useState<Record<string, RitualFieldDraft>>({});

  // ── Carga de datos ────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      const data = await apiRepository.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const ords = await apiRepository.getOrders();
      setOrders(ords);
      const drafts: Record<string, string> = {};
      ords.forEach(o => {
        drafts[o.id] = o.trackingNumber || '';
      });
      setTrackingDrafts(drafts);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prods, cats, blocks, rits, ords] = await Promise.all([
        apiRepository.getProducts(),
        apiRepository.getCategories(true),
        apiRepository.getContentBlocks(),
        apiRepository.getRituals(),
        apiRepository.getOrders(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setContentBlocks(blocks);
      setRituals(rits);
      setOrders(ords);

      const tDrafts: Record<string, string> = {};
      ords.forEach(o => {
        tDrafts[o.id] = o.trackingNumber || '';
      });
      setTrackingDrafts(tDrafts);

      const drafts: Record<string, string[]> = {};
      const fieldDrafts: Record<string, RitualFieldDraft> = {};
      rits.forEach(r => {
        drafts[r.id] = [...r.productIds];
        fieldDrafts[r.id] = ritualToDraft(r);
      });
      setRitualDraftIds(drafts);
      setRitualFieldDrafts(fieldDrafts);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Acciones de Órdenes ───────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updated = await apiRepository.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      triggerToast(`Estado de la orden actualizado a "${status === 'pending' ? 'Pendiente' : status === 'shipped' ? 'Enviada' : 'Completada'}".`);
    } catch (err) {
      console.error('Error updating order status:', err);
      triggerToast('Error al actualizar el estado de la orden.');
    }
  };

  const handleUpdateOrderTracking = async (orderId: string) => {
    const trackingNumber = trackingDrafts[orderId] ?? '';
    try {
      const updated = await apiRepository.updateOrderTracking(orderId, trackingNumber);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      triggerToast('Número de seguimiento guardado.');
    } catch (err) {
      console.error('Error updating tracking number:', err);
      triggerToast('Error al guardar el seguimiento.');
    }
  };

  const handleOpenWhatsApp = (order: Order) => {
    const phone = order.customerPhone || (order.userProfile as any)?.phone || '';
    if (!phone) {
      triggerToast('El cliente no registró un número de teléfono.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const clientName = order.userProfile?.name || 'Cliente';
    const orderIdShort = order.id.startsWith('order-') ? order.id.slice(6) : order.id.slice(0, 8);
    const tracking = order.trackingNumber ? ` Tu código de seguimiento es ${order.trackingNumber}.` : '';
    const message = `Hola ${clientName}, te contactamos de AUREA sobre tu pedido #${orderIdShort}.${tracking}`;
    const url = `https://wa.me/${cleanPhone.startsWith('54') ? cleanPhone : '54' + cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // ── Acciones de Productos ─────────────────────────────────────────────────
  const handleStockChange = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    if (newStock === product.stock) return;
    try {
      const updated = { ...product, stock: newStock };
      await apiRepository.saveProduct(updated);
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
      triggerToast(`Stock de "${product.name}" actualizado a ${newStock} u.`);
      if (onProductsChange) onProductsChange();
    } catch {
      triggerToast('Error al actualizar el stock.');
    }
  };

  const handleSaveProduct = async (productData: Product) => {
    try {
      await apiRepository.saveProduct(productData);
      triggerToast('Alquimia guardada con éxito.');
      loadProducts();
      if (onProductsChange) onProductsChange();
    } catch (err) {
      console.error('Error saving product:', err);
      const msg = err instanceof Error ? ` ${err.message}` : '';
      triggerToast(`Hubo un error al guardar el producto.${msg}`);
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`¿Retirás "${name}" del catálogo?`)) return;
    try {
      await apiRepository.deleteProduct(id);
      triggerToast('Producto removido.');
      loadProducts();
      if (onProductsChange) onProductsChange();
    } catch {
      triggerToast('Error al eliminar.');
    }
  };

  // ── Acciones de Categorías ────────────────────────────────────────────────
  const handleSaveCategory = async (categoryData: Category) => {
    try {
      await apiRepository.saveCategory(categoryData);
      triggerToast('Categoría guardada.');
      const cats = await apiRepository.getCategories(true);
      setCategories(cats);
    } catch {
      triggerToast('Error al guardar categoría.');
      throw new Error('Error al guardar categoría');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminás la categoría "${name}"?`)) return;
    try {
      await apiRepository.deleteCategory(id);
      const cats = await apiRepository.getCategories(true);
      setCategories(cats);
      triggerToast('Categoría eliminada.');
    } catch {
      triggerToast('Error al eliminar categoría.');
    }
  };

  // ── Auth Verification & Realtime ──────────────────────────────────────────
  const verifyAdminAccess = useCallback(async (session: Session | null): Promise<boolean> => {
    if (!session) { setIsAuthenticated(false); return false; }

    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error || !data) {
      await supabase.auth.signOut();
      setAuthError('Esta cuenta no tiene acceso al Altar Administrativo.');
      setIsAuthenticated(false);
      return false;
    }
    setIsAuthenticated(true);
    return true;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      verifyAdminAccess(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      verifyAdminAccess(session);
    });

    return () => subscription.unsubscribe();
  }, [verifyAdminAccess]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadAll();

    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        setIsSyncing(true);
        loadProducts().finally(() => setIsSyncing(false));
        if (onProductsChange) onProductsChange();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        setIsSyncing(true);
        loadOrders().finally(() => setIsSyncing(false));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_blocks' }, async () => {
        const blocks = await apiRepository.getContentBlocks();
        setContentBlocks(blocks);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => {
        const cats = await apiRepository.getCategories(true);
        setCategories(cats);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, loadAll, loadProducts, loadOrders, onProductsChange]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthLoading(false);
      setAuthError('Credenciales incorrectas. Verificá tu email y contraseña.');
      return;
    }
    const isAdmin = await verifyAdminAccess(data.session);
    setAuthLoading(false);
    if (isAdmin) triggerToast('Acceso concedido. Bienvenido al altar.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    triggerToast('Sesión cerrada.');
  };

  // ── Cálculos de KPIs ──────────────────────────────────────────────────────
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const averageTicket = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;
  const criticalStockProducts = products.filter(p => p.stock < 5);

  // ── Vista Login (si no está autenticado) ──────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={styles.loginWrapper}>
        <div className="glass-panel" style={styles.loginCard}>
          <div style={styles.loginHeader}>
            <div style={styles.lockCircle}><Lock size={22} color="#d4af37" /></div>
            <Typography variant="caption" color="gold" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>
              Acceso Restringido
            </Typography>
            <Typography variant="h2" style={{ fontFamily: 'Playfair Display, serif', marginTop: '10px', fontSize: '1.7rem' }}>
              Altar Administrativo
            </Typography>
            <div style={styles.divider} />
          </div>
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@aureaeli.com"
                style={styles.passwordInput}
                autoFocus
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.passwordInput}
                required
              />
            </div>
            {authError && (
              <p style={{ color: '#A34C37', fontSize: '0.82rem', textAlign: 'center', margin: '0' }}>
                {authError}
              </p>
            )}
            <Button
              variant="primary"
              type="submit"
              style={{ ...styles.loginBtn, opacity: authLoading ? 0.7 : 1 }}
            >
              {authLoading ? 'Verificando...' : 'Ingresar al Altar'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ── Vista Admin Principal ─────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {/* Header & KPIs */}
      <AdminStatsHeader
        totalSales={totalSales}
        totalOrdersCount={totalOrdersCount}
        pendingOrdersCount={pendingOrdersCount}
        averageTicket={averageTicket}
        criticalStockProducts={criticalStockProducts}
        isSyncing={isSyncing}
        onLogout={handleLogout}
      />

      {/* Tabs */}
      <div style={styles.tabs}>
        {([
          { id: 'orders', label: 'Órdenes', icon: <ShoppingBag size={15} /> },
          { id: 'products', label: 'Productos', icon: <Package size={15} /> },
          { id: 'content', label: 'Textos de la Página', icon: <FileText size={15} /> },
          { id: 'categories', label: 'Categorías', icon: <Tag size={15} /> },
          { id: 'rituals', label: 'Rituales', icon: <Shuffle size={15} /> },
        ] as { id: AdminTab; label: string; icon: React.ReactNode }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Órdenes */}
      {activeTab === 'orders' && (
        <AdminOrderManager
          orders={orders}
          isLoading={isLoading}
          orderStatusFilter={orderStatusFilter}
          setOrderStatusFilter={setOrderStatusFilter}
          trackingDrafts={trackingDrafts}
          setTrackingDrafts={setTrackingDrafts}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateOrderTracking={handleUpdateOrderTracking}
          onOpenWhatsApp={handleOpenWhatsApp}
        />
      )}

      {/* Tab: Productos */}
      {activeTab === 'products' && (
        <AdminProductManager
          products={products}
          categories={categories}
          isLoading={isLoading}
          onStockChange={handleStockChange}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          triggerToast={triggerToast}
        />
      )}

      {/* Tab: Textos de la página */}
      {activeTab === 'content' && (
        <AdminContentManager
          contentBlocks={contentBlocks}
          rituals={rituals}
          products={products}
          isLoading={isLoading}
          viewMode="content"
          onContentBlocksChange={onProductsChange}
          triggerToast={triggerToast}
          setRituals={setRituals}
          setContentBlocks={setContentBlocks}
          ritualDraftIds={ritualDraftIds}
          setRitualDraftIds={setRitualDraftIds}
          ritualFieldDrafts={ritualFieldDrafts}
          setRitualFieldDrafts={setRitualFieldDrafts}
        />
      )}

      {/* Tab: Categorías */}
      {activeTab === 'categories' && (
        <AdminCategoryManager
          categories={categories}
          isLoading={isLoading}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          triggerToast={triggerToast}
        />
      )}

      {/* Tab: Rituales */}
      {activeTab === 'rituals' && (
        <AdminContentManager
          contentBlocks={contentBlocks}
          rituals={rituals}
          products={products}
          isLoading={isLoading}
          viewMode="rituals"
          onContentBlocksChange={onProductsChange}
          triggerToast={triggerToast}
          setRituals={setRituals}
          setContentBlocks={setContentBlocks}
          ritualDraftIds={ritualDraftIds}
          setRitualDraftIds={setRitualDraftIds}
          ritualFieldDrafts={ritualFieldDrafts}
          setRitualFieldDrafts={setRitualFieldDrafts}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 767px) {
          table { min-width: 650px !important; }
          .grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '20px 0 60px' },
  loginWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '20px' },
  loginCard: { width: '100%', maxWidth: '420px', padding: '40px 32px', border: '1px solid rgba(176, 142, 98, 0.25)', borderRadius: '24px', background: 'rgba(250, 246, 238, 0.85)', backdropFilter: 'blur(20px)' },
  loginHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' },
  lockCircle: { width: '54px', height: '54px', borderRadius: '50%', backgroundColor: 'rgba(176, 142, 98, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid rgba(176, 142, 98, 0.3)' },
  divider: { width: '40px', height: '1px', backgroundColor: 'rgba(176, 142, 98, 0.4)', marginTop: '16px' },
  loginForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
  loginBtn: { width: '100%', backgroundColor: 'var(--color-oliva-salvia)', color: 'var(--color-crema-calido)', padding: '14px', borderRadius: '12px', fontWeight: 'bold', letterSpacing: '0.05em' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  label: { color: 'var(--color-text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 },
  passwordInput: { padding: '14px 16px', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(176, 142, 98, 0.25)', borderRadius: '12px', color: 'var(--color-text-dark)', fontSize: '0.95rem', outline: 'none', textAlign: 'center', letterSpacing: '2px' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(255,255,255,0.4)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(176, 142, 98, 0.15)', width: 'fit-content' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', transition: 'all 0.2s' },
  tabActive: { background: 'white', color: 'var(--color-text-dark)', fontWeight: 600, boxShadow: '0 2px 8px rgba(44,36,32,0.08)' },
};

export default AdminPage;
