import React, { useState, useEffect } from 'react';
import { apiRepository } from '../../core/api';
import type { Product } from '../../core/api/IRepository';
import { CanvasCropper } from '../../shared/components/CanvasCropper';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { 
  Lock, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  Wind, 
  Package, 
  DollarSign,
  X,
  Check,
  LogOut,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';

interface AdminPageProps {
  onProductsChange?: () => void;
  triggerToast?: (msg: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ 
  onProductsChange,
  triggerToast = (msg) => console.log(msg)
}) => {
  // Autenticación
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('aurea_admin_authenticated') === 'true';
  });

  // Datos
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Formulario y Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Cropper
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropTargetField, setCropTargetField] = useState<'imageUrl'>('imageUrl');

  // Campos de formulario individuales
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formPromoPrice, setFormPromoPrice] = useState<number | ''>('');
  const [formStock, setFormStock] = useState(10);
  const [formDescription, setFormDescription] = useState('');
  const [formSensoryDescription, setFormSensoryDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Aromaterapia');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formAroma, setFormAroma] = useState('');
  const [formColor, setFormColor] = useState('');
  const [formMaterial, setFormMaterial] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNew, setFormIsNew] = useState(false);
  const [formIngredients, setFormIngredients] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Cargar productos
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await apiRepository.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products for admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  // Manejo de Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'aurea123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('aurea_admin_authenticated', 'true');
      triggerToast('Acceso sagrado concedido. Bienvenido, Dueño.');
    } else {
      triggerToast('Contraseña incorrecta. El silencio custodia el altar.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('aurea_admin_authenticated');
    triggerToast('Has cerrado sesión en el altar de autogestión.');
  };

  // Abrir formulario para Crear
  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setFormName('');
    setFormPrice(0);
    setFormPromoPrice('');
    setFormStock(15);
    setFormDescription('');
    setFormSensoryDescription('');
    setFormCategory('Aromaterapia');
    setFormSubcategory('');
    setFormAroma('');
    setFormColor('');
    setFormMaterial('');
    setFormIsFeatured(false);
    setFormIsNew(true);
    setFormIngredients('');
    setFormTags('');
    setFormImageUrl('');
    setIsFormOpen(true);
  };

  // Abrir formulario para Editar
  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormPrice(product.price);
    // Para promoPrice, revisamos si tiene tag de promoción o lo manejamos de forma simulada
    const hasPromoTag = product.tags.some(t => t.toLowerCase().includes('promo') || t.toLowerCase().includes('descuento'));
    setFormPromoPrice(hasPromoTag ? Math.round(product.price * 0.85) : '');
    setFormStock(product.stock);
    setFormDescription(product.description);
    setFormSensoryDescription(product.sensoryDescription || '');
    setFormCategory(product.category);
    setFormSubcategory(product.subcategory);
    setFormAroma(product.aroma || '');
    setFormColor(product.color || '');
    setFormMaterial(product.material || '');
    setFormIsFeatured(product.isFeatured || false);
    setFormIsNew(product.isNew || false);
    setFormIngredients(product.ingredients ? product.ingredients.join(', ') : '');
    setFormTags(product.tags ? product.tags.join(', ') : '');
    setFormImageUrl(product.imageUrl || '');
    setIsFormOpen(true);
  };

  // Guardar Producto
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      triggerToast('El nombre del producto es indispensable.');
      return;
    }

    if (!formImageUrl) {
      triggerToast('Por favor, selecciona y recorta una imagen para el producto.');
      return;
    }

    const cleanIngredients = formIngredients
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const cleanTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (formIsFeatured && !cleanTags.includes('Favorito')) {
      cleanTags.push('Favorito');
    }
    if (formIsNew && !cleanTags.includes('Nuevo')) {
      cleanTags.push('Nuevo');
    }

    const productData: Product = {
      id: selectedProduct?.id || `prod-${Math.random().toString(36).substr(2, 9)}`,
      name: formName,
      description: formDescription,
      sensoryDescription: formSensoryDescription,
      price: Number(formPrice),
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
      material: formMaterial
    };

    try {
      await apiRepository.saveProduct(productData);
      triggerToast(selectedProduct ? 'Alquimia actualizada con éxito.' : 'Nueva alquimia creada en el altar.');
      setIsFormOpen(false);
      loadProducts();
      if (onProductsChange) {
        onProductsChange();
      }
    } catch (err) {
      console.error('Error saving product:', err);
      triggerToast('Hubo un error al guardar el producto.');
    }
  };

  // Eliminar Producto
  const handleDeleteProduct = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas retirar "${name}" de los altares sagrados?`);
    if (!confirmDelete) return;

    try {
      const success = await apiRepository.deleteProduct(id);
      if (success) {
        triggerToast('Producto removido con éxito.');
        loadProducts();
        if (onProductsChange) {
          onProductsChange();
        }
      } else {
        triggerToast('No se pudo encontrar el producto en el altar.');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      triggerToast('Ocurrió un error al eliminar.');
    }
  };

  // Callback del cropper
  const handleCroppedImage = (base64: string) => {
    setFormImageUrl(base64);
    setIsCropperOpen(false);
    triggerToast('Imagen recortada con proporción de lujo 1:1.');
  };

  // Alertas de stock bajo
  const lowStockProducts = products.filter(p => p.stock < 12);

  // Render de Login
  if (!isAuthenticated) {
    return (
      <div className="login-screen-wrapper animate-reveal" style={styles.loginWrapper}>
        <div className="glass-panel" style={styles.loginCard}>
          <div style={styles.loginHeader}>
            <div style={styles.lockCircle}>
              <Lock size={22} color="#d4af37" />
            </div>
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
              <label style={styles.label}>Contraseña Sagrada de Acceso</label>
              <input
                type="password"
                placeholder="Escribe aurea123 para ingresar..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.passwordInput}
                autoFocus
              />
            </div>
            <Button variant="primary" type="submit" style={styles.loginBtn}>
              Desvelar Consola
            </Button>
          </form>

          <Typography variant="caption" color="muted" style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem' }}>
            La sabiduría se revela ante quienes respetan la pausa.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container fade-in" style={styles.container}>
      
      {/* Header con botón de cerrar sesión */}
      <div style={styles.header}>
        <div>
          <Typography variant="caption" color="gold" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Oasis de Autogestión
          </Typography>
          <Typography variant="h2" style={{ fontFamily: 'Playfair Display, serif', marginTop: '4px' }}>
            Consola del Altar
          </Typography>
        </div>
        <Button variant="secondary" onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={14} style={{ marginRight: '8px' }} />
          Cerrar Sesión
        </Button>
      </div>

      {/* Dashboard de métricas premium */}
      <div className="grid-3 admin-metrics-grid" style={styles.metricsGrid}>
        <Card style={{ ...styles.metricCard, background: 'rgba(110, 126, 107, 0.08)' }}>
          <div style={styles.metricHeader}>
            <Typography variant="caption" color="gold" style={styles.metricLabel}>Alquimias en Altar</Typography>
            <Package size={18} color="#6e7e6b" />
          </div>
          <Typography variant="h1" style={styles.metricValue}>{products.length}</Typography>
          <span style={styles.metricSub}>Catálogo activo en tiempo real</span>
        </Card>

        <Card style={{ ...styles.metricCard, background: 'rgba(197, 168, 128, 0.08)' }}>
          <div style={styles.metricHeader}>
            <Typography variant="caption" color="gold" style={styles.metricLabel}>Ventas Sagradas</Typography>
            <DollarSign size={18} color="#c5a880" />
          </div>
          <Typography variant="h1" style={styles.metricValue}>$142.800</Typography>
          <span style={styles.metricSub}>Sintonía de abundancia mensual</span>
        </Card>

        <Card style={{ ...styles.metricCard, background: 'rgba(194, 139, 120, 0.08)' }}>
          <div style={styles.metricHeader}>
            <Typography variant="caption" color="gold" style={styles.metricLabel}>Meditaciones Activas</Typography>
            <Wind size={18} color="#c28b78" />
          </div>
          <Typography variant="h1" style={styles.metricValue}>3</Typography>
          <span style={styles.metricSub}>Rituales guiados con audio</span>
        </Card>
      </div>

      {/* Alertas de Stock */}
      {lowStockProducts.length > 0 && (
        <div style={styles.alertBar}>
          <AlertTriangle size={18} color="#A34C37" style={{ marginRight: '12px', flexShrink: 0 }} />
          <Typography variant="body" style={{ fontSize: '0.88rem', color: '#A34C37' }}>
            <strong>Alerta de Altar:</strong> Hay {lowStockProducts.length} productos bajo stock ideal (&lt; 12 unidades). Recomendamos renovar insumos: {lowStockProducts.map(p => p.name).join(', ')}.
          </Typography>
        </div>
      )}

      {/* Panel Principal */}
      <div className="glass-panel" style={styles.mainPanel}>
        <div className="admin-panel-header" style={styles.panelHeader}>
          <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Inventario de Alquimias
          </Typography>
          <Button onClick={handleOpenCreate} style={styles.createBtn}>
            <Plus size={16} style={{ marginRight: '6px' }} />
            Agregar Producto Nuevo
          </Button>
        </div>

        {/* Grilla o tabla interactiva */}
        {isLoading ? (
          <div style={styles.loaderContainer}>
            <div className="spinner" style={styles.spinner}></div>
            <Typography variant="body" color="muted" style={{ marginTop: '16px' }}>
              Invocando lista de productos del altar...
            </Typography>
          </div>
        ) : products.length === 0 ? (
          <div style={styles.emptyState}>
            <Sparkles size={40} color="#c5a880" style={{ marginBottom: '16px' }} />
            <Typography variant="body" color="muted">
              No hay alquimias registradas en este altar. Crea tu primer producto divino.
            </Typography>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Categoría / Sub</th>
                  <th style={styles.th}>Precio</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Aroma / Detalles</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLow = product.stock < 12;
                  return (
                    <tr key={product.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.productCell}>
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            style={styles.productThumb} 
                          />
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
                        <span style={styles.priceText}>${product.price}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ 
                          ...styles.stockText,
                          color: isLow ? '#A34C37' : 'var(--color-text-dark)',
                          fontWeight: isLow ? 'bold' : 'normal'
                        }}>
                          {product.stock} u.
                          {isLow && <span style={styles.lowStockDot} />}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.detailsText}>
                          👃 {product.aroma || 'Neutro'} | {product.color || 'Sin color'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={styles.actionsContainer}>
                          <button 
                            onClick={() => handleOpenEdit(product)} 
                            style={styles.actionBtnEdit}
                            title="Editar Alquimia"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id, product.name)} 
                            style={styles.actionBtnDelete}
                            title="Eliminar del Altar"
                          >
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

      {/* FORMULARIO DE PRODUCTO (MODAL / SLIDE-IN) */}
      {isFormOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel slide-in-bottom" style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>
                {selectedProduct ? 'Editar Alquimia Sagrada' : 'Agregar Alquimia Sagrada'}
              </Typography>
              <button onClick={() => setIsFormOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={styles.form}>
              
              {/* Sección de Imagen & Cropper */}
              <div style={styles.imageSelectorSection}>
                <Typography variant="caption" color="gold" style={{ display: 'block', marginBottom: '8px' }}>
                  Fotografía de Altar (Formato 1:1 Premium)
                </Typography>
                
                {isCropperOpen ? (
                  <div style={styles.cropperModalWrapper}>
                    <CanvasCropper 
                      onCrop={handleCroppedImage}
                      onCancel={() => setIsCropperOpen(false)}
                      initialImageSrc={formImageUrl}
                    />
                  </div>
                ) : (
                  <div style={styles.imagePreviewRow}>
                    {formImageUrl ? (
                      <div style={styles.previewContainer}>
                        <img src={formImageUrl} alt="Preview" style={styles.previewImage} />
                        <button 
                          type="button" 
                          onClick={() => {
                            setCropTargetField('imageUrl');
                            setIsCropperOpen(true);
                          }}
                          style={styles.recortarBotonOverlay}
                        >
                          <Edit2 size={12} style={{ marginRight: '4px' }} />
                          Volver a Recortar
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => {
                          setCropTargetField('imageUrl');
                          setIsCropperOpen(true);
                        }}
                        style={styles.uploadPlaceholder}
                      >
                        <ImageIcon size={28} color="#c5a880" style={{ marginBottom: '8px' }} />
                        <span style={styles.uploadText}>Cargar & Recortar Imagen</span>
                        <span style={styles.uploadSub}>Estilo Facebook Canvas 1:1</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fila 1: Nombre y Precio */}
              <div style={styles.formRow}>
                <div style={{ ...styles.inputGroup, flex: 2 }}>
                  <label style={styles.label}>Nombre de la Alquimia</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Sahumerio Sagrado de Copal"
                    style={styles.input}
                    required
                  />
                </div>
                
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Precio ($)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    placeholder="4200"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Precio Promoción ($)</label>
                  <input
                    type="number"
                    value={formPromoPrice}
                    onChange={(e) => setFormPromoPrice(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="Opcional"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Fila 2: Categoría, Subcategoría y Stock */}
              <div style={styles.formRow}>
                <div style={{ ...styles.inputGroup, flex: 1.5 }}>
                  <label style={styles.label}>Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={styles.select}
                  >
                    <option value="Aromaterapia">Aromaterapia</option>
                    <option value="Bienestar y Spa">Bienestar y Spa</option>
                    <option value="Hogar con intención">Hogar con intención</option>
                    <option value="Kits">Kits de Regalo</option>
                    <option value="Moda Consciente">Moda Consciente</option>
                  </select>
                </div>

                <div style={{ ...styles.inputGroup, flex: 1.5 }}>
                  <label style={styles.label}>Subcategoría</label>
                  <input
                    type="text"
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    placeholder="Ej. Velas, Inciensos, Sales"
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Stock Inicial</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    placeholder="15"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Fila 3: Filtros (Aroma, Color, Material) */}
              <div style={styles.formRow}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Aroma (Para Filtro)</label>
                  <input
                    type="text"
                    value={formAroma}
                    onChange={(e) => setFormAroma(e.target.value)}
                    placeholder="Ej. Lavanda y Sándalo"
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Color</label>
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="Ej. Crema marfil"
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Material / Contenedor</label>
                  <input
                    type="text"
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    placeholder="Ej. Vidrio templado"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Fila 4: Banderas de Badge */}
              <div style={{ ...styles.formRow, alignItems: 'center', gap: '24px', padding: '10px 0' }}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>Destacar Alquimia (Showcase Principal)</span>
                </label>

                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formIsNew}
                    onChange={(e) => setFormIsNew(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxText}>Nueva Alquimia (Badge de Lanzamiento)</span>
                </label>
              </div>

              {/* Fila 5: Ingredientes y Tags (Separados por coma) */}
              <div style={styles.formRow}>
                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Ingredientes Botánicos (Separados por comas)</label>
                  <input
                    type="text"
                    value={formIngredients}
                    onChange={(e) => setFormIngredients(e.target.value)}
                    placeholder="Ej. Cera de soja natural, Aceite esencial de Lavanda, Pabilo ecológico"
                    style={styles.input}
                  />
                </div>

                <div style={{ ...styles.inputGroup, flex: 1 }}>
                  <label style={styles.label}>Etiquetas / Tags de Búsqueda (Separados por comas)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Ej. Relajación, Noche, Regalo"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Fila 6: Descripción Sensorial (Poética) */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Descripción Sensorial (El Poema del Producto)</label>
                <textarea
                  value={formSensoryDescription}
                  onChange={(e) => setFormSensoryDescription(e.target.value)}
                  placeholder="Una caricia templada de lavanda silvestre y sándalo sagrado..."
                  rows={3}
                  style={styles.textarea}
                />
              </div>

              {/* Fila 7: Descripción General */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Descripción Detallada (Características técnicas)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Vela de soja premium perfumada con aceites esenciales naturales..."
                  rows={2}
                  style={styles.textarea}
                  required
                />
              </div>

              <div style={styles.formActions}>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsFormOpen(false)}
                  style={{ marginRight: '12px' }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" style={styles.saveBtn}>
                  <Check size={16} style={{ marginRight: '6px' }} />
                  Guardar Alquimia
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .admin-page-container table {
            min-width: 750px !important;
          }
          .admin-metrics-grid {
            gap: 16px !important;
            margin-bottom: 24px !important;
          }
          .admin-panel-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
          }
          .admin-panel-header button {
            width: 100% !important;
          }
          .admin-page-container select,
          .admin-page-container input,
          .admin-page-container textarea {
            font-size: 16px !important; /* Prevents auto-zoom on iOS devices */
          }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px 0 60px',
  },
  loginWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '20px',
  },
  loginCard: {
    width: '100%',
    maxWidth: '420px',
    padding: '40px 32px',
    border: '1px solid rgba(176, 142, 98, 0.25)',
    boxShadow: '0 16px 40px rgba(44, 36, 32, 0.08)',
    borderRadius: '24px',
    background: 'rgba(250, 246, 238, 0.85)',
    backdropFilter: 'blur(20px)',
  },
  loginHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '28px',
  },
  lockCircle: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    backgroundColor: 'rgba(176, 142, 98, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    border: '1px solid rgba(176, 142, 98, 0.3)',
  },
  divider: {
    width: '40px',
    height: '1px',
    backgroundColor: 'rgba(176, 142, 98, 0.4)',
    marginTop: '16px',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  label: {
    color: 'var(--color-text-muted)',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 500,
  },
  passwordInput: {
    padding: '14px 16px',
    background: 'rgba(255, 255, 255, 0.6)',
    border: '1px solid rgba(176, 142, 98, 0.25)',
    borderRadius: '12px',
    color: 'var(--color-text-dark)',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-sans)',
    transition: 'all 0.3s ease',
    outline: 'none',
    textAlign: 'center',
    letterSpacing: '2px',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: 'var(--color-oliva-salvia)',
    color: 'var(--color-crema-calido)',
    padding: '14px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontFamily: 'var(--font-sans)',
    letterSpacing: '0.05em',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    borderBottom: '1px solid rgba(176, 142, 98, 0.15)',
    paddingBottom: '20px',
  },
  logoutBtn: {
    borderColor: 'rgba(135, 84, 58, 0.35)',
    color: 'var(--color-bosque-suave)',
    fontSize: '0.8rem',
  },
  metricsGrid: {
    marginBottom: '32px',
  },
  metricCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    border: '1px solid rgba(176, 142, 98, 0.12)',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  metricLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  metricValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    fontFamily: 'Playfair Display, serif',
    margin: '4px 0',
  },
  metricSub: {
    fontSize: '0.78rem',
    color: 'var(--color-text-muted)',
  },
  alertBar: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(163, 76, 55, 0.08)',
    border: '1px solid rgba(163, 76, 55, 0.25)',
    padding: '14px 20px',
    borderRadius: '12px',
    marginBottom: '32px',
  },
  mainPanel: {
    padding: '28px',
    borderRadius: '20px',
    border: '1px solid rgba(176, 142, 98, 0.18)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  createBtn: {
    backgroundColor: '#d4af37',
    color: '#120f15',
    fontWeight: 600,
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 0',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '2px solid rgba(212, 175, 55, 0.1)',
    borderTopColor: '#d4af37',
    borderRadius: '50%',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '1px solid rgba(61, 46, 40, 0.15)',
  },
  th: {
    padding: '12px 16px',
    color: 'var(--color-text-muted)',
    fontSize: '0.78rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  tableRow: {
    borderBottom: '1px solid rgba(61, 46, 40, 0.08)',
    transition: 'background 0.2s ease',
  },
  td: {
    padding: '16px',
    verticalAlign: 'middle',
  },
  productCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  productThumb: {
    width: '54px',
    height: '54px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid rgba(176, 142, 98, 0.25)',
    backgroundColor: '#1b171f',
  },
  productName: {
    fontWeight: 600,
    fontSize: '0.92rem',
    color: 'var(--color-text-dark)',
    display: 'block',
    marginBottom: '4px',
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
  },
  featuredBadge: {
    backgroundColor: 'rgba(163, 107, 78, 0.08)',
    color: 'var(--color-bosque-suave)',
    fontSize: '0.65rem',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(163, 107, 78, 0.25)',
  },
  newBadge: {
    backgroundColor: 'rgba(110, 126, 107, 0.12)',
    color: '#4E5E4C',
    fontSize: '0.65rem',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(110, 126, 107, 0.3)',
  },
  categoryCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  catText: {
    fontSize: '0.85rem',
    color: 'var(--color-text-dark)',
  },
  subcatText: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
  },
  priceText: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: 'var(--color-text-dark)',
  },
  stockText: {
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  lowStockDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#A34C37',
    boxShadow: '0 0 8px #A34C37',
  },
  detailsText: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
  },
  actionsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  actionBtnEdit: {
    backgroundColor: 'rgba(163, 107, 78, 0.08)',
    border: '1px solid rgba(163, 107, 78, 0.22)',
    color: 'var(--color-oliva-salvia)',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionBtnDelete: {
    backgroundColor: 'rgba(135, 84, 58, 0.08)',
    border: '1px solid rgba(135, 84, 58, 0.22)',
    color: 'var(--color-bosque-suave)',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 36, 32, 0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 20px',
    zIndex: 1200,
    overflowY: 'auto',
  },
  modalCard: {
    width: '100%',
    maxWidth: '780px',
    backgroundColor: 'rgba(250, 246, 238, 0.96)',
    border: '1px solid rgba(176, 142, 98, 0.25)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 20px 50px rgba(44, 36, 32, 0.12)',
    marginBottom: '40px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    borderBottom: '1px solid rgba(176, 142, 98, 0.18)',
    paddingBottom: '16px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    padding: '6px',
    transition: 'color 0.2s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  imageSelectorSection: {
    background: 'rgba(255, 255, 255, 0.3)',
    border: '1px dashed rgba(176, 142, 98, 0.3)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cropperModalWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  imagePreviewRow: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  previewContainer: {
    position: 'relative',
    width: '160px',
    height: '160px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(176, 142, 98, 0.3)',
    boxShadow: '0 6px 16px rgba(44, 36, 32, 0.08)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  recortarBotonOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(44, 36, 32, 0.85)',
    color: 'var(--color-crema-calido)',
    border: 'none',
    padding: '6px 0',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  uploadPlaceholder: {
    width: '100%',
    maxWidth: '340px',
    height: '140px',
    border: '1px dashed rgba(176, 142, 98, 0.3)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transition: 'all 0.3s ease',
  },
  uploadText: {
    color: 'var(--color-text-dark)',
    fontWeight: 600,
    fontSize: '0.9rem',
    fontFamily: 'var(--font-sans)',
  },
  uploadSub: {
    color: 'var(--color-text-muted)',
    fontSize: '0.75rem',
    marginTop: '2px',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  input: {
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.6)',
    border: '1px solid rgba(176, 142, 98, 0.22)',
    borderRadius: '10px',
    color: 'var(--color-text-dark)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.3s',
  },
  select: {
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.65)',
    border: '1px solid rgba(176, 142, 98, 0.22)',
    borderRadius: '10px',
    color: 'var(--color-text-dark)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.6)',
    border: '1px solid rgba(176, 142, 98, 0.22)',
    borderRadius: '10px',
    color: 'var(--color-text-dark)',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'var(--font-sans)',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: 'var(--color-dorado-mate)',
    cursor: 'pointer',
  },
  checkboxText: {
    color: 'var(--color-text-dark)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
    borderTop: '1px solid rgba(176, 142, 98, 0.18)',
    paddingTop: '20px',
  },
  saveBtn: {
    backgroundColor: 'var(--color-oliva-salvia)',
    color: 'var(--color-crema-calido)',
    fontWeight: 600,
  }
};
