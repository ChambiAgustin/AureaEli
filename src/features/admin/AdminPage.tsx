import React, { useState, useEffect, useCallback } from 'react';
import { apiRepository } from '../../core/api';
import { supabase } from '../../core/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { Product, Category, ContentBlock, Ritual } from '../../core/api/IRepository';
import { CanvasCropper } from '../../shared/components/CanvasCropper';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import {
  Lock, Plus, Edit2, Trash2, TrendingUp, Sparkles, AlertTriangle,
  Wind, Package, DollarSign, X, Check, LogOut, Image as ImageIcon,
  FileText, Tag, ChevronDown, ChevronUp, Save, RefreshCw, Shuffle
} from 'lucide-react';

interface AdminPageProps {
  onProductsChange?: () => void;
  triggerToast?: (msg: string) => void;
}

type AdminTab = 'products' | 'content' | 'categories' | 'rituals';

// ── Borrador editable de los campos de un ritual ────────────────────────────
type RitualFieldDraft = {
  title: string;
  description: string;
  durationMinutes: number;
  steps: string;    // un paso por línea (textarea)
  audioUrl: string;
};

const ritualToDraft = (r: Ritual): RitualFieldDraft => ({
  title: r.title,
  description: r.description,
  durationMinutes: r.durationMinutes,
  steps: r.steps.join('\n'),
  audioUrl: r.audioUrl ?? '',
});

// ── Sube un MP3 a Supabase Storage y retorna URL pública ────────────────────
const MAX_AUDIO_MB = 10;

async function uploadRitualAudio(file: File): Promise<string> {
  const isMp3 = file.name.toLowerCase().endsWith('.mp3') || file.type === 'audio/mpeg' || file.type === 'audio/mp3';
  if (!isMp3) throw new Error('El archivo debe ser un MP3.');
  if (file.size > MAX_AUDIO_MB * 1024 * 1024) throw new Error(`El audio supera el máximo de ${MAX_AUDIO_MB} MB.`);

  const filename = `ritual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
  const { error } = await supabase.storage
    .from('ritual-audio')
    .upload(filename, file, { contentType: 'audio/mpeg', upsert: false });

  if (error) throw new Error(`Storage upload: ${error.message}`);

  return supabase.storage.from('ritual-audio').getPublicUrl(filename).data.publicUrl;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onProductsChange,
  triggerToast = (msg) => console.log(msg)
}) => {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // ── Navegación ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // ── Datos ─────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Estado del editor de rituales ────────────────────────────────────────
  const [expandedRitualId, setExpandedRitualId] = useState<string | null>(null);
  const [ritualDraftIds, setRitualDraftIds] = useState<Record<string, string[]>>({});
  const [ritualFieldDrafts, setRitualFieldDrafts] = useState<Record<string, RitualFieldDraft>>({});
  const [savingRitualId, setSavingRitualId] = useState<string | null>(null);
  const [uploadingAudioId, setUploadingAudioId] = useState<string | null>(null);

  // ── Formulario Producto ───────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formPromoPrice, setFormPromoPrice] = useState<number | ''>('');
  const [formStock, setFormStock] = useState(10);
  const [formDescription, setFormDescription] = useState('');
  const [formSensoryDescription, setFormSensoryDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formAroma, setFormAroma] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formMaterial, setFormMaterial] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNew, setFormIsNew] = useState(false);
  const [formIngredients, setFormIngredients] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // ── Formulario Categoría ──────────────────────────────────────────────────
  const [isCatFormOpen, setIsCatFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormSubcategories, setCatFormSubcategories] = useState('');
  const [catFormSortOrder, setCatFormSortOrder] = useState(0);

  // ── Edición de Content Blocks ─────────────────────────────────────────────
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [blockDraft, setBlockDraft] = useState('');

  // ── Carga de datos ────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      const data = await apiRepository.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prods, cats, blocks, rits] = await Promise.all([
        apiRepository.getProducts(),
        apiRepository.getCategories(true),
        apiRepository.getContentBlocks(),
        apiRepository.getRituals(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setContentBlocks(blocks);
      setRituals(rits);
      // Inicializar drafts con los IDs y campos actuales de cada ritual
      const drafts: Record<string, string[]> = {};
      const fieldDrafts: Record<string, RitualFieldDraft> = {};
      rits.forEach(r => {
        drafts[r.id] = [...r.productIds];
        fieldDrafts[r.id] = ritualToDraft(r);
      });
      setRitualDraftIds(drafts);
      setRitualFieldDrafts(fieldDrafts);
      if (prods.length > 0 && cats.length > 0) {
        setFormCategory(cats[0]?.name ?? '');
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Verificar sesión activa Y permiso de admin al montar ─────────────────
  // Tener sesión no alcanza: solo cuentas en `admin_users` (otorgadas por
  // scripts/setup-customer-auth.mjs con la Service Role Key) entran acá.
  // Sin esto, cualquier cliente que se registre en la web entraría al admin.
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

  // ── Realtime subscription ─────────────────────────────────────────────────
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
  }, [isAuthenticated, loadAll, loadProducts, onProductsChange]);

  // ── Auth ──────────────────────────────────────────────────────────────────
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

  // ── Productos: abrir formulario ───────────────────────────────────────────
  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setFormName(''); setFormPrice(0); setFormPromoPrice(''); setFormStock(15);
    setFormDescription(''); setFormSensoryDescription('');
    setFormCategory(categories[0]?.name ?? ''); setFormSubcategory('');
    setFormAroma(''); setFormColor(''); setFormMaterial('');
    setFormIsFeatured(false); setFormIsNew(true);
    setFormIngredients(''); setFormTags(''); setFormImageUrl('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormPromoPrice(product.promoPrice ?? '');
    setFormStock(product.stock);
    setFormDescription(product.description);
    setFormSensoryDescription(product.sensoryDescription ?? '');
    setFormCategory(product.category);
    setFormSubcategory(product.subcategory);
    setFormAroma(product.aroma ?? '');
    setFormColor(product.color ?? '');
    setFormMaterial(product.material ?? '');
    setFormIsFeatured(product.isFeatured ?? false);
    setFormIsNew(product.isNew ?? false);
    setFormIngredients(product.ingredients?.join(', ') ?? '');
    setFormTags(product.tags?.join(', ') ?? '');
    setFormImageUrl(product.imageUrl ?? '');
    setIsFormOpen(true);
  };

  // ── Productos: guardar ────────────────────────────────────────────────────
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { triggerToast('El nombre del producto es indispensable.'); return; }
    if (!formImageUrl) { triggerToast('Por favor, cargá una imagen para el producto.'); return; }

    const cleanIngredients = formIngredients.split(',').map(i => i.trim()).filter(Boolean);
    const cleanTags = formTags.split(',').map(t => t.trim()).filter(Boolean);
    if (formIsFeatured && !cleanTags.includes('Favorito')) cleanTags.push('Favorito');
    if (formIsNew && !cleanTags.includes('Nuevo')) cleanTags.push('Nuevo');

    const productData: Product = {
      id: selectedProduct?.id ?? 'new-' + Date.now(),
      name: formName,
      description: formDescription,
      sensoryDescription: formSensoryDescription,
      price: Number(formPrice),
      promoPrice: formPromoPrice !== '' ? Number(formPromoPrice) : undefined,
      stock: Number(formStock),
      imageUrl: formImageUrl,
      category: formCategory,
      subcategory: formSubcategory,
      ingredients: cleanIngredients,
      tags: cleanTags,
      isFeatured: formIsFeatured,
      isNew: formIsNew,
      aroma: formAroma,
      color: formColor,
      material: formMaterial,
    };

    try {
      await apiRepository.saveProduct(productData);
      triggerToast(selectedProduct ? 'Alquimia actualizada con éxito.' : 'Nueva alquimia creada en el altar.');
      setIsFormOpen(false);
      loadProducts();
      if (onProductsChange) onProductsChange();
    } catch (err) {
      console.error('Error saving product:', err);
      const msg = err instanceof Error ? ` ${err.message}` : '';
      triggerToast(`Hubo un error al guardar el producto.${msg}`);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`¿Retirás "${name}" del catálogo?`)) return;
    try {
      await apiRepository.deleteProduct(id);
      triggerToast('Producto removido.');
      loadProducts();
      if (onProductsChange) onProductsChange();
    } catch (err) {
      triggerToast('Error al eliminar.');
    }
  };

  // ── Categorías ────────────────────────────────────────────────────────────
  const handleOpenCatCreate = () => {
    setSelectedCategory(null);
    setCatFormName(''); setCatFormSubcategories(''); setCatFormSortOrder(categories.length + 1);
    setIsCatFormOpen(true);
  };

  const handleOpenCatEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setCatFormName(cat.name);
    setCatFormSubcategories(cat.subcategories.join(', '));
    setCatFormSortOrder(cat.sortOrder);
    setIsCatFormOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) { triggerToast('El nombre de categoría es requerido.'); return; }
    const catData: Category = {
      id: selectedCategory?.id ?? '',
      name: catFormName,
      subcategories: catFormSubcategories.split(',').map(s => s.trim()).filter(Boolean),
      sortOrder: Number(catFormSortOrder),
      isVisible: true,
    };
    try {
      await apiRepository.saveCategory(catData);
      triggerToast(selectedCategory ? 'Categoría actualizada.' : 'Categoría creada.');
      setIsCatFormOpen(false);
      const cats = await apiRepository.getCategories(true);
      setCategories(cats);
    } catch (err) {
      triggerToast('Error al guardar categoría.');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminás la categoría "${name}"?`)) return;
    try {
      await apiRepository.deleteCategory(id);
      const cats = await apiRepository.getCategories(true);
      setCategories(cats);
      triggerToast('Categoría eliminada.');
    } catch (err) {
      triggerToast('Error al eliminar categoría.');
    }
  };

  // ── Content Blocks ────────────────────────────────────────────────────────
  const handleStartEdit = (block: ContentBlock) => {
    setEditingBlock(block.key);
    setBlockDraft(block.value.text);
  };

  const handleSaveBlock = async (key: string) => {
    try {
      await apiRepository.updateContentBlock(key, { text: blockDraft });
      setContentBlocks(prev =>
        prev.map(b => b.key === key ? { ...b, value: { text: blockDraft } } : b)
      );
      setEditingBlock(null);
      triggerToast('Texto actualizado en tiempo real ✓');
      if (onProductsChange) onProductsChange();
    } catch (err) {
      triggerToast('Error al actualizar texto.');
    }
  };

  // ── Rituales ──────────────────────────────────────────────────────────────
  const toggleProductInRitual = (ritualId: string, productId: string) => {
    setRitualDraftIds(prev => {
      const current = prev[ritualId] ?? [];
      const next = current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId];
      return { ...prev, [ritualId]: next };
    });
  };

  const handleSaveRitual = async (ritual: Ritual) => {
    const fields = ritualFieldDrafts[ritual.id];
    if (fields && !fields.title.trim()) { triggerToast('El título del ritual es indispensable.'); return; }

    setSavingRitualId(ritual.id);
    try {
      const updated: Ritual = {
        ...ritual,
        ...(fields ? {
          title: fields.title.trim(),
          description: fields.description,
          durationMinutes: Number(fields.durationMinutes) || 0,
          steps: fields.steps.split('\n').map(s => s.trim()).filter(Boolean),
          audioUrl: fields.audioUrl.trim(),
        } : {}),
        productIds: ritualDraftIds[ritual.id] ?? ritual.productIds,
      };
      await apiRepository.saveRitual(updated);
      setRituals(prev => prev.map(r => r.id === ritual.id ? updated : r));
      triggerToast(`Ritual "${updated.title}" actualizado.`);
      setExpandedRitualId(null);
    } catch (err) {
      console.error('Error saving ritual:', err);
      const msg = err instanceof Error ? ` ${err.message}` : '';
      triggerToast(`Error al guardar el ritual.${msg}`);
    } finally {
      setSavingRitualId(null);
    }
  };

  const updateRitualField = (ritualId: string, patch: Partial<RitualFieldDraft>) => {
    setRitualFieldDrafts(prev => ({ ...prev, [ritualId]: { ...prev[ritualId], ...patch } }));
  };

  const handleAudioFileChange = async (ritualId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite re-seleccionar el mismo archivo
    if (!file) return;

    setUploadingAudioId(ritualId);
    try {
      const url = await uploadRitualAudio(file);
      updateRitualField(ritualId, { audioUrl: url });
      triggerToast('Audio subido ✓ No olvides guardar el ritual.');
    } catch (err) {
      console.error('Error uploading audio:', err);
      triggerToast(err instanceof Error ? err.message : 'Error al subir el audio.');
    } finally {
      setUploadingAudioId(null);
    }
  };

  const subcategoriesForSelected = categories.find(c => c.name === formCategory)?.subcategories ?? [];
  const lowStockProducts = products.filter(p => p.stock < 12);

  // ── Login ─────────────────────────────────────────────────────────────────
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

  // ── Admin ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <Typography variant="caption" color="gold" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Panel de Gestión
          </Typography>
          <Typography variant="h2" style={{ fontFamily: 'Playfair Display, serif', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Consola del Altar
            {isSyncing && (
              <span style={styles.syncBadge}>
                <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Sincronizando
              </span>
            )}
          </Typography>
        </div>
        <Button variant="secondary" onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={14} style={{ marginRight: '8px' }} /> Cerrar Sesión
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid-3" style={styles.metricsGrid}>
        <Card style={{ ...styles.metricCard, background: 'rgba(110, 126, 107, 0.08)' }}>
          <div style={styles.metricHeader}>
            <Typography variant="caption" color="gold" style={styles.metricLabel}>Productos</Typography>
            <Package size={18} color="#6e7e6b" />
          </div>
          <Typography variant="h1" style={styles.metricValue}>{products.length}</Typography>
          <span style={styles.metricSub}>En catálogo activo</span>
        </Card>
        <Card style={{ ...styles.metricCard, background: 'rgba(197, 168, 128, 0.08)' }}>
          <div style={styles.metricHeader}>
            <Typography variant="caption" color="gold" style={styles.metricLabel}>Categorías</Typography>
            <Tag size={18} color="#c5a880" />
          </div>
          <Typography variant="h1" style={styles.metricValue}>{categories.length}</Typography>
          <span style={styles.metricSub}>Categorías dinámicas</span>
        </Card>
        <Card style={{ ...styles.metricCard, background: 'rgba(194, 139, 120, 0.08)' }}>
          <div style={styles.metricHeader}>
            <Typography variant="caption" color="gold" style={styles.metricLabel}>Textos Editables</Typography>
            <FileText size={18} color="#c28b78" />
          </div>
          <Typography variant="h1" style={styles.metricValue}>{contentBlocks.length}</Typography>
          <span style={styles.metricSub}>Bloques de contenido</span>
        </Card>
      </div>

      {/* Alerta stock */}
      {lowStockProducts.length > 0 && (
        <div style={styles.alertBar}>
          <AlertTriangle size={18} color="#A34C37" style={{ marginRight: '12px', flexShrink: 0 }} />
          <Typography variant="body" style={{ fontSize: '0.88rem', color: '#A34C37' }}>
            <strong>Stock bajo:</strong> {lowStockProducts.map(p => p.name).join(', ')} (&lt; 12 u.)
          </Typography>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {([
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

      {/* ── TAB: PRODUCTOS ─────────────────────────────────────────────────── */}
      {activeTab === 'products' && (
        <div className="glass-panel" style={styles.mainPanel}>
          <div style={styles.panelHeader}>
            <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Inventario de Alquimias
            </Typography>
            <Button onClick={handleOpenCreate} style={styles.createBtn}>
              <Plus size={16} style={{ marginRight: '6px' }} /> Agregar Producto
            </Button>
          </div>

          {isLoading ? (
            <div style={styles.loaderContainer}>
              <div className="spinner" style={styles.spinner} />
              <Typography variant="body" color="muted" style={{ marginTop: '16px' }}>Cargando catálogo desde Supabase...</Typography>
            </div>
          ) : products.length === 0 ? (
            <div style={styles.emptyState}>
              <Sparkles size={40} color="#c5a880" style={{ marginBottom: '16px' }} />
              <Typography variant="body" color="muted">No hay productos. Creá el primero.</Typography>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Producto</th>
                    <th style={styles.th}>Categoría</th>
                    <th style={styles.th}>Precio</th>
                    <th style={styles.th}>Promo</th>
                    <th style={styles.th}>Stock</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => {
                    const isLow = product.stock < 12;
                    return (
                      <tr key={product.id} style={styles.tableRow}>
                        <td style={styles.td}>
                          <div style={styles.productCell}>
                            <img src={product.imageUrl} alt={product.name} style={styles.productThumb} />
                            <div>
                              <span style={styles.productName}>{product.name}</span>
                              <div style={styles.badgeRow}>
                                {product.isFeatured && <span style={styles.featuredBadge}>Destacado</span>}
                                {product.isNew && <span style={styles.newBadge}>Nuevo</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.categoryCell}>
                            <span style={styles.catText}>{product.category}</span>
                            <span style={styles.subcatText}>{product.subcategory}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.priceText}>${product.price.toLocaleString('es-AR')}</span>
                        </td>
                        <td style={styles.td}>
                          {product.promoPrice
                            ? <span style={{ ...styles.priceText, color: '#A34C37' }}>${product.promoPrice.toLocaleString('es-AR')}</span>
                            : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>
                          }
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.stockText, color: isLow ? '#A34C37' : 'inherit', fontWeight: isLow ? 'bold' : 'normal' }}>
                            {product.stock} u.{isLow && <span style={styles.lowStockDot} />}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.actionsContainer}>
                            <button onClick={() => handleOpenEdit(product)} style={styles.actionBtnEdit} title="Editar">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id, product.name)} style={styles.actionBtnDelete} title="Eliminar">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: TEXTOS ────────────────────────────────────────────────────── */}
      {activeTab === 'content' && (
        <div className="glass-panel" style={styles.mainPanel}>
          <div style={styles.panelHeader}>
            <div>
              <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>Textos de la Página</Typography>
              <Typography variant="caption" color="muted" style={{ marginTop: '4px', display: 'block' }}>
                Los cambios se aplican en tiempo real en la web del cliente.
              </Typography>
            </div>
          </div>

          {isLoading ? (
            <div style={styles.loaderContainer}><div className="spinner" style={styles.spinner} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contentBlocks.map(block => (
                <div key={block.key} style={styles.blockRow}>
                  <div style={{ flex: 1 }}>
                    <span style={styles.blockLabel}>{block.label}</span>
                    <span style={styles.blockKey}>{block.key}</span>
                  </div>

                  {editingBlock === block.key ? (
                    <div style={styles.blockEditArea}>
                      <textarea
                        value={blockDraft}
                        onChange={e => setBlockDraft(e.target.value)}
                        style={styles.blockTextarea}
                        rows={3}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                        <button style={styles.blockCancelBtn} onClick={() => setEditingBlock(null)}>
                          <X size={13} /> Cancelar
                        </button>
                        <button style={styles.blockSaveBtn} onClick={() => handleSaveBlock(block.key)}>
                          <Save size={13} /> Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.blockValueArea}>
                      <span style={styles.blockValue}>"{block.value.text}"</span>
                      <button style={styles.blockEditBtn} onClick={() => handleStartEdit(block)}>
                        <Edit2 size={13} /> Editar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CATEGORÍAS ────────────────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <div className="glass-panel" style={styles.mainPanel}>
          <div style={styles.panelHeader}>
            <div>
              <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>Categorías del Catálogo</Typography>
              <Typography variant="caption" color="muted" style={{ marginTop: '4px', display: 'block' }}>
                Las categorías y sus filtros se actualizan en toda la web.
              </Typography>
            </div>
            <Button onClick={handleOpenCatCreate} style={styles.createBtn}>
              <Plus size={16} style={{ marginRight: '6px' }} /> Nueva Categoría
            </Button>
          </div>

          {isLoading ? (
            <div style={styles.loaderContainer}><div className="spinner" style={styles.spinner} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.map(cat => (
                <div key={cat.id} style={styles.catRow}>
                  <div style={{ flex: 1 }}>
                    <span style={styles.catRowName}>{cat.name}</span>
                    <div style={styles.subcatTagsRow}>
                      {cat.subcategories.map(sub => (
                        <span key={sub} style={styles.subcatTag}>{sub}</span>
                      ))}
                    </div>
                  </div>
                  <div style={styles.actionsContainer}>
                    <button onClick={() => handleOpenCatEdit(cat)} style={styles.actionBtnEdit}><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)} style={styles.actionBtnDelete}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: PRODUCTO ────────────────────────────────────────────────── */}
      {isFormOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>
                {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </Typography>
              <button onClick={() => setIsFormOpen(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveProduct} style={styles.form}>

              {/* Imagen */}
              <div style={styles.imageSelectorSection}>
                <Typography variant="caption" color="gold" style={{ display: 'block', marginBottom: '8px' }}>
                  Imagen del Producto (1:1)
                </Typography>
                {isCropperOpen ? (
                  <div style={styles.cropperModalWrapper}>
                    <CanvasCropper onCrop={(b64) => { setFormImageUrl(b64); setIsCropperOpen(false); }} onCancel={() => setIsCropperOpen(false)} initialImageSrc={formImageUrl} />
                  </div>
                ) : (
                  <div style={styles.imagePreviewRow}>
                    {formImageUrl ? (
                      <div style={styles.previewContainer}>
                        <img src={formImageUrl} alt="Preview" style={styles.previewImage} />
                        <button type="button" onClick={() => setIsCropperOpen(true)} style={styles.recortarBotonOverlay}>
                          <Edit2 size={12} style={{ marginRight: '4px' }} /> Recortar
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => setIsCropperOpen(true)} style={styles.uploadPlaceholder}>
                        <ImageIcon size={28} color="#c5a880" style={{ marginBottom: '8px' }} />
                        <span style={styles.uploadText}>Cargar & Recortar</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Nombre, Precio, Promo */}
              <div style={styles.formRow}>
                <div style={{ ...styles.inputGroup, flex: 2 }}>
                  <label style={styles.label}>Nombre</label>
                  <input type="text" value={formName} onChange={e => setFormName(e.target.value)} style={styles.input} required />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Precio ($)</label>
                  <input type="number" value={formPrice} onChange={e => setFormPrice(Number(e.target.value))} style={styles.input} required />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Precio Promo ($)</label>
                  <input type="number" value={formPromoPrice} onChange={e => setFormPromoPrice(e.target.value !== '' ? Number(e.target.value) : '')} placeholder="Opcional" style={styles.input} />
                </div>
              </div>

              {/* Categoría, Subcategoría, Stock */}
              <div style={styles.formRow}>
                <div style={{ ...styles.inputGroup, flex: 1.5 }}>
                  <label style={styles.label}>Categoría</label>
                  <select value={formCategory} onChange={e => { setFormCategory(e.target.value); setFormSubcategory(''); }} style={styles.select}>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ ...styles.inputGroup, flex: 1.5 }}>
                  <label style={styles.label}>Subcategoría</label>
                  {subcategoriesForSelected.length > 0 ? (
                    <select value={formSubcategory} onChange={e => setFormSubcategory(e.target.value)} style={styles.select}>
                      <option value="">— Seleccionar —</option>
                      {subcategoriesForSelected.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" value={formSubcategory} onChange={e => setFormSubcategory(e.target.value)} placeholder="Ej. Velas" style={styles.input} />
                  )}
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Stock</label>
                  <input type="number" value={formStock} onChange={e => setFormStock(Number(e.target.value))} style={styles.input} required />
                </div>
              </div>

              {/* Aroma, Color, Material */}
              <div style={styles.formRow}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Aroma (filtro)</label>
                  <input type="text" value={formAroma} onChange={e => setFormAroma(e.target.value)} placeholder="Ej. Lavanda" style={styles.input} />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Color</label>
                  <input type="text" value={formColor} onChange={e => setFormColor(e.target.value)} placeholder="Ej. Crema marfil" style={styles.input} />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Material</label>
                  <input type="text" value={formMaterial} onChange={e => setFormMaterial(e.target.value)} placeholder="Ej. Vidrio" style={styles.input} />
                </div>
              </div>

              {/* Badges */}
              <div style={{ ...styles.formRow, alignItems: 'center', gap: '24px', padding: '6px 0' }}>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={formIsFeatured} onChange={e => setFormIsFeatured(e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkboxText}>Destacado</span>
                </label>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={formIsNew} onChange={e => setFormIsNew(e.target.checked)} style={styles.checkbox} />
                  <span style={styles.checkboxText}>Nuevo</span>
                </label>
              </div>

              {/* Ingredientes y Tags */}
              <div style={styles.formRow}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Ingredientes (separados por coma)</label>
                  <input type="text" value={formIngredients} onChange={e => setFormIngredients(e.target.value)} placeholder="Cera de soja, Lavanda..." style={styles.input} />
                </div>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Tags (separados por coma)</label>
                  <input type="text" value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="Relajación, Regalo..." style={styles.input} />
                </div>
              </div>

              {/* Descripción sensorial */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Descripción Sensorial (poética)</label>
                <textarea value={formSensoryDescription} onChange={e => setFormSensoryDescription(e.target.value)} rows={3} style={styles.textarea} />
              </div>

              {/* Descripción general */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Descripción Técnica</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2} style={styles.textarea} />
              </div>

              <div style={styles.formActions}>
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)} style={{ marginRight: '12px' }}>Cancelar</Button>
                <Button type="submit" variant="primary" style={styles.saveBtn}>
                  <Check size={16} style={{ marginRight: '6px' }} /> Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB: RITUALES ──────────────────────────────────────────────────── */}
      {activeTab === 'rituals' && (
        <div className="glass-panel" style={styles.mainPanel}>
          <div style={styles.panelHeader}>
            <div>
              <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>Pool de Productos por Ritual</Typography>
              <Typography variant="caption" color="muted" style={{ marginTop: '4px', display: 'block' }}>
                Cada vez que un cliente completa el quiz, se eligen 3 productos al azar del pool. Cuantos más productos agregues, más variedad.
              </Typography>
            </div>
          </div>

          {isLoading ? (
            <div style={styles.loaderContainer}><div className="spinner" style={styles.spinner} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {rituals.map(ritual => {
                const isExpanded = expandedRitualId === ritual.id;
                const draftIds = ritualDraftIds[ritual.id] ?? ritual.productIds;
                const fieldDraft = ritualFieldDrafts[ritual.id] ?? ritualToDraft(ritual);
                const linkedProducts = products.filter(p => draftIds.includes(p.id));
                const unlinkedProducts = products.filter(p => !draftIds.includes(p.id));

                return (
                  <div key={ritual.id} style={{ border: '1px solid rgba(176,142,98,0.18)', borderRadius: 16, overflow: 'hidden' }}>

                    {/* Cabecera del ritual */}
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                      onClick={() => setExpandedRitualId(isExpanded ? null : ritual.id)}
                    >
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-dark)', display: 'block' }}>{ritual.title}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {ritual.durationMinutes} min · <strong>{draftIds.length}</strong> productos en el pool · se muestran 3 al azar
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 300 }}>
                        {linkedProducts.slice(0, 3).map(p => (
                          <span key={p.id} style={styles.subcatTag}>{p.name.split('—')[0].trim()}</span>
                        ))}
                        {linkedProducts.length > 3 && (
                          <span style={{ ...styles.subcatTag, background: 'rgba(212,175,55,0.12)', color: '#b08e62' }}>+{linkedProducts.length - 3} más</span>
                        )}
                      </div>
                      <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>

                    {/* Editor expandido */}
                    {isExpanded && (
                      <div style={{ padding: '20px', background: 'rgba(250,246,238,0.5)', borderTop: '1px solid rgba(176,142,98,0.12)' }}>

                        {/* Campos del ritual */}
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 10 }}>
                          Datos del ritual
                        </p>
                        <div style={styles.formRow}>
                          <div style={{ ...styles.inputGroup, flex: 2, minWidth: 200 }}>
                            <label style={styles.label}>Título</label>
                            <input type="text" value={fieldDraft.title} onChange={e => updateRitualField(ritual.id, { title: e.target.value })} style={styles.input} />
                          </div>
                          <div style={{ ...styles.inputGroup, flex: 1, minWidth: 120 }}>
                            <label style={styles.label}>Duración (min)</label>
                            <input type="number" min="0" value={fieldDraft.durationMinutes} onChange={e => updateRitualField(ritual.id, { durationMinutes: Number(e.target.value) })} style={styles.input} />
                          </div>
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Descripción</label>
                          <textarea rows={2} value={fieldDraft.description} onChange={e => updateRitualField(ritual.id, { description: e.target.value })} style={styles.textarea} />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Pasos (uno por línea)</label>
                          <textarea rows={4} value={fieldDraft.steps} onChange={e => updateRitualField(ritual.id, { steps: e.target.value })} style={styles.textarea} />
                        </div>
                        <div style={{ ...styles.inputGroup, marginBottom: 20 }}>
                          <label style={styles.label}>Audio del ritual (MP3)</label>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              value={fieldDraft.audioUrl}
                              onChange={e => updateRitualField(ritual.id, { audioUrl: e.target.value })}
                              placeholder="URL del audio (o subí un MP3 →)"
                              style={{ ...styles.input, flex: 1, minWidth: 220 }}
                            />
                            <input
                              type="file"
                              accept="audio/mpeg,.mp3"
                              id={`ritual-audio-file-${ritual.id}`}
                              style={{ display: 'none' }}
                              onChange={e => handleAudioFileChange(ritual.id, e)}
                            />
                            <label
                              htmlFor={`ritual-audio-file-${ritual.id}`}
                              style={{ ...styles.blockEditBtn, opacity: uploadingAudioId === ritual.id ? 0.6 : 1, pointerEvents: uploadingAudioId === ritual.id ? 'none' : 'auto' }}
                            >
                              {uploadingAudioId === ritual.id ? 'Subiendo audio...' : '♪ Subir MP3'}
                            </label>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Máximo {MAX_AUDIO_MB} MB. Se reproduce en la página de Rituales.</span>
                          {fieldDraft.audioUrl && (
                            <audio controls src={fieldDraft.audioUrl} style={{ width: '100%', marginTop: 4 }} />
                          )}
                        </div>

                        {/* Productos EN el pool */}
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 10 }}>
                          En el pool ({linkedProducts.length})
                        </p>
                        {linkedProducts.length === 0 ? (
                          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 16, fontStyle: 'italic' }}>Ningún producto en el pool todavía.</p>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                            {linkedProducts.map(p => (
                              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(110,126,107,0.12)', border: '1px solid rgba(110,126,107,0.25)', borderRadius: 20, padding: '5px 10px 5px 6px' }}>
                                <img src={p.imageUrl} alt={p.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                                <span style={{ fontSize: '0.78rem', color: 'var(--color-bosque-suave)', fontWeight: 600 }}>{p.name.split('—')[0].trim()}</span>
                                <button
                                  onClick={() => toggleProductInRitual(ritual.id, p.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A34C37', padding: '0 2px', fontSize: '0.75rem', lineHeight: 1 }}
                                  title="Quitar del pool"
                                >✕</button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Productos para AGREGAR */}
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: 10 }}>
                          Agregar al pool
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                          {unlinkedProducts.map(p => (
                            <div
                              key={p.id}
                              onClick={() => toggleProductInRitual(ritual.id, p.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.5)', border: '1px dashed rgba(176,142,98,0.3)', borderRadius: 20, padding: '5px 12px 5px 6px', cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-dorado-mate)'; e.currentTarget.style.background = 'rgba(212,175,55,0.06)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(176,142,98,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }}
                            >
                              <img src={p.imageUrl} alt={p.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', opacity: 0.7 }} />
                              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>+ {p.name.split('—')[0].trim()}</span>
                            </div>
                          ))}
                        </div>

                        {/* Acciones */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid rgba(176,142,98,0.15)', paddingTop: 16 }}>
                          <button
                            style={styles.blockCancelBtn}
                            onClick={() => {
                              setRitualDraftIds(prev => ({ ...prev, [ritual.id]: [...ritual.productIds] }));
                              setRitualFieldDrafts(prev => ({ ...prev, [ritual.id]: ritualToDraft(ritual) }));
                              setExpandedRitualId(null);
                            }}
                          >
                            Cancelar
                          </button>
                          <button
                            style={{ ...styles.blockSaveBtn, opacity: savingRitualId === ritual.id ? 0.7 : 1 }}
                            onClick={() => handleSaveRitual(ritual)}
                            disabled={savingRitualId === ritual.id}
                          >
                            <Save size={13} /> {savingRitualId === ritual.id ? 'Guardando...' : 'Guardar ritual'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: CATEGORÍA ───────────────────────────────────────────────── */}
      {isCatFormOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={{ ...styles.modalCard, maxWidth: '500px' }}>
            <div style={styles.modalHeader}>
              <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>
                {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </Typography>
              <button onClick={() => setIsCatFormOpen(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategory} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nombre de la Categoría</label>
                <input type="text" value={catFormName} onChange={e => setCatFormName(e.target.value)} placeholder="Ej. Aromaterapia" style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Subcategorías (separadas por coma)</label>
                <input type="text" value={catFormSubcategories} onChange={e => setCatFormSubcategories(e.target.value)} placeholder="Ej. Velas, Inciensos, Brumas" style={styles.input} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Orden de aparición</label>
                <input type="number" value={catFormSortOrder} onChange={e => setCatFormSortOrder(Number(e.target.value))} style={styles.input} />
              </div>
              <div style={styles.formActions}>
                <Button type="button" variant="secondary" onClick={() => setIsCatFormOpen(false)} style={{ marginRight: '12px' }}>Cancelar</Button>
                <Button type="submit" variant="primary" style={styles.saveBtn}>
                  <Check size={16} style={{ marginRight: '6px' }} /> Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) {
          table { min-width: 650px !important; }
          .grid-3 { gap: 12px !important; }
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid rgba(176, 142, 98, 0.15)', paddingBottom: '20px' },
  syncBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#6e7e6b', background: 'rgba(110, 126, 107, 0.1)', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(110, 126, 107, 0.2)', fontFamily: 'var(--font-sans)' },
  logoutBtn: { borderColor: 'rgba(135, 84, 58, 0.35)', color: 'var(--color-bosque-suave)', fontSize: '0.8rem' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' },
  metricCard: { padding: '24px', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: '1px solid rgba(176, 142, 98, 0.12)' },
  metricHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  metricLabel: { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' },
  metricValue: { fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', margin: '4px 0' },
  metricSub: { fontSize: '0.78rem', color: 'var(--color-text-muted)' },
  alertBar: { display: 'flex', alignItems: 'center', background: 'rgba(163, 76, 55, 0.08)', border: '1px solid rgba(163, 76, 55, 0.25)', padding: '14px 20px', borderRadius: '12px', marginBottom: '24px' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(255,255,255,0.4)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(176, 142, 98, 0.15)', width: 'fit-content' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', transition: 'all 0.2s' },
  tabActive: { background: 'white', color: 'var(--color-text-dark)', fontWeight: 600, boxShadow: '0 2px 8px rgba(44,36,32,0.08)' },
  mainPanel: { padding: '28px', borderRadius: '20px', border: '1px solid rgba(176, 142, 98, 0.18)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  createBtn: { backgroundColor: '#d4af37', color: '#120f15', fontWeight: 600 },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' },
  spinner: { width: '40px', height: '40px', border: '2px solid rgba(212, 175, 55, 0.1)', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' },
  tableWrapper: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeadRow: { borderBottom: '1px solid rgba(61, 46, 40, 0.15)' },
  th: { padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' },
  tableRow: { borderBottom: '1px solid rgba(61, 46, 40, 0.08)' },
  td: { padding: '14px 16px', verticalAlign: 'middle' },
  productCell: { display: 'flex', alignItems: 'center', gap: '14px' },
  productThumb: { width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(176, 142, 98, 0.25)' },
  productName: { fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-dark)', display: 'block', marginBottom: '4px' },
  badgeRow: { display: 'flex', gap: '6px' },
  featuredBadge: { backgroundColor: 'rgba(163, 107, 78, 0.08)', color: 'var(--color-bosque-suave)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(163, 107, 78, 0.25)' },
  newBadge: { backgroundColor: 'rgba(110, 126, 107, 0.12)', color: '#4E5E4C', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(110, 126, 107, 0.3)' },
  categoryCell: { display: 'flex', flexDirection: 'column' },
  catText: { fontSize: '0.85rem', color: 'var(--color-text-dark)' },
  subcatText: { fontSize: '0.75rem', color: 'var(--color-text-muted)' },
  priceText: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-dark)' },
  stockText: { fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  lowStockDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#A34C37', boxShadow: '0 0 8px #A34C37' },
  actionsContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  actionBtnEdit: { backgroundColor: 'rgba(163, 107, 78, 0.08)', border: '1px solid rgba(163, 107, 78, 0.22)', color: 'var(--color-oliva-salvia)', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
  actionBtnDelete: { backgroundColor: 'rgba(135, 84, 58, 0.08)', border: '1px solid rgba(135, 84, 58, 0.22)', color: 'var(--color-bosque-suave)', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
  // Content blocks
  blockRow: { display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid rgba(176, 142, 98, 0.12)', flexWrap: 'wrap' },
  blockLabel: { display: 'block', fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-dark)', marginBottom: '2px' },
  blockKey: { display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' },
  blockValueArea: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' },
  blockValue: { fontSize: '0.88rem', color: 'var(--color-text-muted)', fontStyle: 'italic', flex: 1 },
  blockEditBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'rgba(176, 142, 98, 0.1)', border: '1px solid rgba(176, 142, 98, 0.25)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--color-bosque-suave)', whiteSpace: 'nowrap' },
  blockEditArea: { flex: 1, minWidth: '250px' },
  blockTextarea: { width: '100%', padding: '10px 12px', background: 'white', border: '1px solid rgba(176, 142, 98, 0.3)', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' },
  blockSaveBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: 'var(--color-oliva-salvia)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'white', fontWeight: 600 },
  blockCancelBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: 'transparent', border: '1px solid rgba(61,46,40,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-text-muted)' },
  // Categorías
  catRow: { display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid rgba(176, 142, 98, 0.12)' },
  catRowName: { display: 'block', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-dark)', marginBottom: '8px' },
  subcatTagsRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  subcatTag: { fontSize: '0.72rem', padding: '3px 8px', background: 'rgba(176, 142, 98, 0.1)', border: '1px solid rgba(176, 142, 98, 0.2)', borderRadius: '20px', color: 'var(--color-bosque-suave)' },
  // Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(44, 36, 32, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', zIndex: 1200, overflowY: 'auto' },
  modalCard: { width: '100%', maxWidth: '780px', backgroundColor: 'rgba(250, 246, 238, 0.96)', border: '1px solid rgba(176, 142, 98, 0.25)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 50px rgba(44, 36, 32, 0.12)', marginBottom: '40px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid rgba(176, 142, 98, 0.18)', paddingBottom: '16px' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '6px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  imageSelectorSection: { background: 'rgba(255, 255, 255, 0.3)', border: '1px dashed rgba(176, 142, 98, 0.3)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  cropperModalWrapper: { width: '100%', display: 'flex', justifyContent: 'center' },
  imagePreviewRow: { display: 'flex', justifyContent: 'center', width: '100%' },
  previewContainer: { position: 'relative', width: '160px', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(176, 142, 98, 0.3)' },
  previewImage: { width: '100%', height: '100%', objectFit: 'cover' },
  recortarBotonOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(44, 36, 32, 0.85)', color: 'var(--color-crema-calido)', border: 'none', padding: '6px 0', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  uploadPlaceholder: { width: '100%', maxWidth: '340px', height: '140px', border: '1px dashed rgba(176, 142, 98, 0.3)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'rgba(255, 255, 255, 0.4)' },
  uploadText: { color: 'var(--color-text-dark)', fontWeight: 600, fontSize: '0.9rem' },
  formRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  label: { color: 'var(--color-text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 },
  passwordInput: { padding: '14px 16px', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(176, 142, 98, 0.25)', borderRadius: '12px', color: 'var(--color-text-dark)', fontSize: '0.95rem', outline: 'none', textAlign: 'center', letterSpacing: '2px' },
  input: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none' },
  select: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' },
  textarea: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', accentColor: 'var(--color-dorado-mate)', cursor: 'pointer' },
  checkboxText: { color: 'var(--color-text-dark)', fontSize: '0.85rem' },
  formActions: { display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid rgba(176, 142, 98, 0.18)', paddingTop: '20px' },
  saveBtn: { backgroundColor: 'var(--color-oliva-salvia)', color: 'var(--color-crema-calido)', fontWeight: 600 },
};
