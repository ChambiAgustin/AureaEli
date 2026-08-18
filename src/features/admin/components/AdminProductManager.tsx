import React, { useState } from 'react';
import type { Product, Category } from '../../../core/api/IRepository';
import { CanvasCropper } from '../../../shared/components/CanvasCropper';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import { Plus, Edit2, Trash2, Sparkles, Minus, X, Check, Image as ImageIcon } from 'lucide-react';

interface AdminProductManagerProps {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  onStockChange: (product: Product, delta: number) => Promise<void>;
  onSaveProduct: (productData: Product) => Promise<void>;
  onDeleteProduct: (id: string, name: string) => Promise<void>;
  triggerToast: (msg: string) => void;
}

export const AdminProductManager: React.FC<AdminProductManagerProps> = ({
  products,
  categories,
  isLoading,
  onStockChange,
  onSaveProduct,
  onDeleteProduct,
  triggerToast
}) => {
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

  const handleSave = async (e: React.FormEvent) => {
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
      await onSaveProduct(productData);
      setIsFormOpen(false);
    } catch {
      // Error handled by parent
    }
  };

  const subcategoriesForSelected = categories.find(c => c.name === formCategory)?.subcategories ?? [];

  return (
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
                const isCritical = product.stock < 5;
                const isLow = product.stock < 12;
                return (
                  <tr key={product.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.productCell}>
                        <img src={product.imageUrl} alt={product.name} style={styles.productThumb} />
                        <div>
                          <span style={styles.productName}>{product.name}</span>
                          <div style={styles.badgeRow}>
                            {isCritical && <span style={styles.criticalStockBadge}>Bajo Stock</span>}
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
                      <div style={styles.quickStockControls}>
                        <button
                          onClick={() => onStockChange(product, -1)}
                          style={styles.stockControlBtn}
                          title="Reducir stock (-1)"
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{
                          ...styles.stockText,
                          color: isCritical ? '#A34C37' : isLow ? '#B08E62' : 'inherit',
                          fontWeight: isLow || isCritical ? 'bold' : 'normal'
                        }}>
                          {product.stock} u.
                        </span>
                        <button
                          onClick={() => onStockChange(product, 1)}
                          style={styles.stockControlBtn}
                          title="Aumentar stock (+1)"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.actionsContainer}>
                        <button onClick={() => handleOpenEdit(product)} style={styles.actionBtnEdit} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => onDeleteProduct(product.id, product.name)} style={styles.actionBtnDelete} title="Eliminar">
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

            <form onSubmit={handleSave} style={styles.form}>
              {/* Imagen */}
              <div style={styles.imageSelectorSection}>
                <Typography variant="caption" color="gold" style={{ display: 'block', marginBottom: '8px' }}>
                  Imagen del Producto (1:1)
                </Typography>
                {isCropperOpen ? (
                  <div style={styles.cropperModalWrapper}>
                    <CanvasCropper
                      onCrop={(b64) => { setFormImageUrl(b64); setIsCropperOpen(false); }}
                      onCancel={() => setIsCropperOpen(false)}
                      initialImageSrc={formImageUrl}
                    />
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
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
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
  criticalStockBadge: { backgroundColor: 'rgba(163, 76, 55, 0.12)', color: '#A34C37', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(163, 76, 55, 0.3)', fontWeight: 'bold' },
  quickStockControls: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.5)', padding: '2px 6px', borderRadius: '8px', border: '1px solid rgba(176,142,98,0.2)' },
  stockControlBtn: { background: 'rgba(176, 142, 98, 0.15)', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-dark)' },
  categoryCell: { display: 'flex', flexDirection: 'column' },
  catText: { fontSize: '0.85rem', color: 'var(--color-text-dark)' },
  subcatText: { fontSize: '0.75rem', color: 'var(--color-text-muted)' },
  priceText: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-dark)' },
  stockText: { fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' },
  actionsContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  actionBtnEdit: { backgroundColor: 'rgba(163, 107, 78, 0.08)', border: '1px solid rgba(163, 107, 78, 0.22)', color: 'var(--color-oliva-salvia)', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
  actionBtnDelete: { backgroundColor: 'rgba(135, 84, 58, 0.08)', border: '1px solid rgba(135, 84, 58, 0.22)', color: 'var(--color-bosque-suave)', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
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
  input: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none' },
  select: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' },
  textarea: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', accentColor: 'var(--color-dorado-mate)', cursor: 'pointer' },
  checkboxText: { color: 'var(--color-text-dark)', fontSize: '0.85rem' },
  formActions: { display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid rgba(176, 142, 98, 0.18)', paddingTop: '20px' },
  saveBtn: { backgroundColor: 'var(--color-oliva-salvia)', color: 'var(--color-crema-calido)', fontWeight: 600 },
};

export default AdminProductManager;
