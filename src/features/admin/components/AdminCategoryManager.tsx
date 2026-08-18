import React, { useState } from 'react';
import type { Category } from '../../../core/api/IRepository';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface AdminCategoryManagerProps {
  categories: Category[];
  isLoading: boolean;
  onSaveCategory: (categoryData: Category) => Promise<void>;
  onDeleteCategory: (id: string, name: string) => Promise<void>;
  triggerToast: (msg: string) => void;
}

export const AdminCategoryManager: React.FC<AdminCategoryManagerProps> = ({
  categories,
  isLoading,
  onSaveCategory,
  onDeleteCategory,
  triggerToast
}) => {
  const [isCatFormOpen, setIsCatFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [catFormName, setCatFormName] = useState('');
  const [catFormSubcategories, setCatFormSubcategories] = useState('');
  const [catFormSortOrder, setCatFormSortOrder] = useState(0);

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setCatFormName('');
    setCatFormSubcategories('');
    setCatFormSortOrder(categories.length + 1);
    setIsCatFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setCatFormName(cat.name);
    setCatFormSubcategories(cat.subcategories.join(', '));
    setCatFormSortOrder(cat.sortOrder);
    setIsCatFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) {
      triggerToast('El nombre de categoría es requerido.');
      return;
    }
    const catData: Category = {
      id: selectedCategory?.id ?? '',
      name: catFormName,
      subcategories: catFormSubcategories.split(',').map(s => s.trim()).filter(Boolean),
      sortOrder: Number(catFormSortOrder),
      isVisible: true,
    };
    try {
      await onSaveCategory(catData);
      setIsCatFormOpen(false);
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className="glass-panel" style={styles.mainPanel}>
      <div style={styles.panelHeader}>
        <div>
          <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>Categorías del Catálogo</Typography>
          <Typography variant="caption" color="muted" style={{ marginTop: '4px', display: 'block' }}>
            Las categorías y sus filtros se actualizan en toda la web.
          </Typography>
        </div>
        <Button onClick={handleOpenCreate} style={styles.createBtn}>
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
                <button onClick={() => handleOpenEdit(cat)} style={styles.actionBtnEdit} title="Editar categoría">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => onDeleteCategory(cat.id, cat.name)} style={styles.actionBtnDelete} title="Eliminar categoría">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
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
            <form onSubmit={handleSave} style={styles.form}>
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
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  mainPanel: { padding: '28px', borderRadius: '20px', border: '1px solid rgba(176, 142, 98, 0.18)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  createBtn: { backgroundColor: '#d4af37', color: '#120f15', fontWeight: 600 },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' },
  spinner: { width: '40px', height: '40px', border: '2px solid rgba(212, 175, 55, 0.1)', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  catRow: { display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', border: '1px solid rgba(176, 142, 98, 0.12)' },
  catRowName: { display: 'block', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-dark)', marginBottom: '8px' },
  subcatTagsRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  subcatTag: { fontSize: '0.72rem', padding: '3px 8px', background: 'rgba(176, 142, 98, 0.1)', border: '1px solid rgba(176, 142, 98, 0.2)', borderRadius: '20px', color: 'var(--color-bosque-suave)' },
  actionsContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  actionBtnEdit: { backgroundColor: 'rgba(163, 107, 78, 0.08)', border: '1px solid rgba(163, 107, 78, 0.22)', color: 'var(--color-oliva-salvia)', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
  actionBtnDelete: { backgroundColor: 'rgba(135, 84, 58, 0.08)', border: '1px solid rgba(135, 84, 58, 0.22)', color: 'var(--color-bosque-suave)', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(44, 36, 32, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', zIndex: 1200, overflowY: 'auto' },
  modalCard: { width: '100%', maxWidth: '780px', backgroundColor: 'rgba(250, 246, 238, 0.96)', border: '1px solid rgba(176, 142, 98, 0.25)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 50px rgba(44, 36, 32, 0.12)', marginBottom: '40px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid rgba(176, 142, 98, 0.18)', paddingBottom: '16px' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '6px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  label: { color: 'var(--color-text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 },
  input: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none' },
  formActions: { display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid rgba(176, 142, 98, 0.18)', paddingTop: '20px' },
  saveBtn: { backgroundColor: 'var(--color-oliva-salvia)', color: 'var(--color-crema-calido)', fontWeight: 600 },
};

export default AdminCategoryManager;
