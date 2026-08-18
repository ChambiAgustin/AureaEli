import React from 'react';
import type { Order } from '../../../core/api/IRepository';
import Typography from '../../../shared/components/Typography';
import { ShoppingBag, Save, Phone } from 'lucide-react';

interface AdminOrderManagerProps {
  orders: Order[];
  isLoading: boolean;
  orderStatusFilter: 'all' | 'pending' | 'shipped' | 'completed';
  setOrderStatusFilter: (filter: 'all' | 'pending' | 'shipped' | 'completed') => void;
  trackingDrafts: Record<string, string>;
  setTrackingDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  onUpdateOrderTracking: (orderId: string) => Promise<void>;
  onOpenWhatsApp: (order: Order) => void;
}

export const AdminOrderManager: React.FC<AdminOrderManagerProps> = ({
  orders,
  isLoading,
  orderStatusFilter,
  setOrderStatusFilter,
  trackingDrafts,
  setTrackingDrafts,
  onUpdateOrderStatus,
  onUpdateOrderTracking,
  onOpenWhatsApp
}) => {
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="glass-panel" style={styles.mainPanel}>
      <div style={styles.panelHeader}>
        <div>
          <Typography variant="h3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Gestión de Pedidos
          </Typography>
          <Typography variant="caption" color="muted" style={{ marginTop: '4px', display: 'block' }}>
            Administrá el estado de los envíos y la comunicación directa con tus clientes.
          </Typography>
        </div>

        {/* Filtros de estado */}
        <div style={styles.filterGroup}>
          {([
            { id: 'all', label: `Todas (${orders.length})` },
            { id: 'pending', label: `Pendientes (${orders.filter(o => o.status === 'pending').length})` },
            { id: 'shipped', label: `Enviadas (${orders.filter(o => o.status === 'shipped').length})` },
            { id: 'completed', label: `Completadas (${orders.filter(o => o.status === 'completed').length})` },
          ] as const).map(f => (
            <button
              key={f.id}
              onClick={() => setOrderStatusFilter(f.id)}
              style={{
                ...styles.filterBtn,
                ...(orderStatusFilter === f.id ? styles.filterBtnActive : {})
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={styles.loaderContainer}>
          <div className="spinner" style={styles.spinner} />
          <Typography variant="body" color="muted" style={{ marginTop: '16px' }}>Cargando órdenes desde Supabase...</Typography>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <ShoppingBag size={40} color="#c5a880" style={{ marginBottom: '16px' }} />
          <Typography variant="body" color="muted">No hay órdenes registradas con este filtro.</Typography>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredOrders.map(order => {
            const phone = order.customerPhone || (order.userProfile as any)?.phone || '';
            const statusColors = {
              pending: { bg: 'rgba(212, 175, 55, 0.15)', text: '#B08E62', label: 'Pendiente' },
              shipped: { bg: 'rgba(110, 126, 107, 0.18)', text: '#4E5E4C', label: 'Enviada' },
              completed: { bg: 'rgba(52, 120, 70, 0.15)', text: '#2E663B', label: 'Completada' },
            }[order.status] || { bg: 'rgba(0,0,0,0.05)', text: '#666', label: order.status };

            return (
              <div key={order.id} style={styles.orderCard}>
                {/* Header de la orden */}
                <div style={styles.orderCardHeader}>
                  <div>
                    <span style={styles.orderIdBadge}>ID: #{order.id.slice(0, 8)}...</span>
                    <span style={styles.orderDateText}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : 'Fecha no registrada'}
                    </span>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                  }}>
                    {statusColors.label}
                  </span>
                </div>

                {/* Detalle de la orden en grid 3 columnas */}
                <div style={styles.orderCardBody}>
                  {/* Columna 1: Cliente & Envío */}
                  <div style={styles.orderCol}>
                    <Typography variant="caption" color="gold" weight="bold" style={styles.colTitle}>
                      Cliente & Envío
                    </Typography>
                    <p style={styles.orderDetailText}><strong>Nombre:</strong> {order.userProfile?.name || 'Cliente'}</p>
                    <p style={styles.orderDetailText}><strong>Email:</strong> {order.userProfile?.email || 'No registrado'}</p>
                    <p style={styles.orderDetailText}><strong>Teléfono:</strong> {phone || 'Sin registrar'}</p>
                    <p style={{ ...styles.orderDetailText, marginTop: '8px' }}>
                      <strong>Dirección:</strong> {order.address || 'Retiro / Sin especificar'}
                    </p>
                  </div>

                  {/* Columna 2: Ítems y Total */}
                  <div style={styles.orderCol}>
                    <Typography variant="caption" color="gold" weight="bold" style={styles.colTitle}>
                      Productos ({order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0})
                    </Typography>
                    <div style={styles.orderItemsList}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={styles.orderItemRow}>
                          <span>{item.quantity}x {item.product?.name || 'Producto'}</span>
                          <span style={{ fontWeight: 600 }}>${((item.product?.price || 0) * item.quantity).toLocaleString('es-AR')}</span>
                        </div>
                      ))}
                    </div>
                    <div style={styles.orderTotalRow}>
                      <span>Total: <strong>${(order.total || 0).toLocaleString('es-AR')}</strong></span>
                      <span style={styles.paymentMethodTag}>
                        {order.paymentMethod === 'mercadopago' ? 'MercadoPago' : 'WhatsApp'}
                      </span>
                    </div>
                  </div>

                  {/* Columna 3: Gestión de Estado & Tracking */}
                  <div style={styles.orderColActions}>
                    <Typography variant="caption" color="gold" weight="bold" style={styles.colTitle}>
                      Acciones & Seguimiento
                    </Typography>

                    {/* Cambiar Estado */}
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Estado de la Orden</label>
                      <select
                        value={order.status}
                        onChange={e => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                        style={styles.select}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="shipped">Enviada</option>
                        <option value="completed">Completada</option>
                      </select>
                    </div>

                    {/* Tracking Input */}
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>N° de Seguimiento</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          value={trackingDrafts[order.id] ?? ''}
                          onChange={e => setTrackingDrafts({ ...trackingDrafts, [order.id]: e.target.value })}
                          placeholder="Ej: AR-123456789"
                          style={{ ...styles.input, flex: 1 }}
                        />
                        <button
                          onClick={() => onUpdateOrderTracking(order.id)}
                          style={styles.blockSaveBtn}
                          title="Guardar seguimiento"
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    </div>

                    {/* WhatsApp Button */}
                    <button
                      onClick={() => onOpenWhatsApp(order)}
                      style={styles.whatsAppBtn}
                    >
                      <Phone size={14} /> WhatsApp al Cliente
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  mainPanel: { padding: '28px', borderRadius: '20px', border: '1px solid rgba(176, 142, 98, 0.18)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' },
  spinner: { width: '40px', height: '40px', border: '2px solid rgba(212, 175, 55, 0.1)', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' },
  filterGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(176, 142, 98, 0.25)', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-text-muted)', transition: 'all 0.2s' },
  filterBtnActive: { background: 'var(--color-oliva-salvia)', color: 'white', borderColor: 'var(--color-oliva-salvia)', fontWeight: 600 },
  orderCard: { border: '1px solid rgba(176, 142, 98, 0.2)', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.45)', overflow: 'hidden' },
  orderCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(250, 246, 238, 0.7)', borderBottom: '1px solid rgba(176, 142, 98, 0.12)' },
  orderIdBadge: { fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-text-dark)', marginRight: '12px' },
  orderDateText: { fontSize: '0.78rem', color: 'var(--color-text-muted)' },
  statusBadge: { fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px' },
  orderCardBody: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', padding: '20px' },
  orderCol: { display: 'flex', flexDirection: 'column', gap: '6px' },
  orderColActions: { display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.4)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(176,142,98,0.15)' },
  colTitle: { textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' },
  orderDetailText: { fontSize: '0.84rem', color: 'var(--color-text-dark)', margin: 0 },
  orderItemsList: { display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.4)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(176,142,98,0.1)' },
  orderItemRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-dark)' },
  orderTotalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.88rem' },
  paymentMethodTag: { fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(176, 142, 98, 0.12)', borderRadius: '10px', color: 'var(--color-bosque-suave)', textTransform: 'uppercase', fontWeight: 600 },
  whatsAppBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 14px', background: '#25D366', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', marginTop: '6px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  label: { color: 'var(--color-text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 },
  input: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none' },
  select: { padding: '12px 14px', background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(176, 142, 98, 0.22)', borderRadius: '10px', color: 'var(--color-text-dark)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' },
  blockSaveBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: 'var(--color-oliva-salvia)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'white', fontWeight: 600 },
};

export default AdminOrderManager;
