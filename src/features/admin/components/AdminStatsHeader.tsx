import React from 'react';
import type { Product } from '../../../core/api/IRepository';
import Typography from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, LogOut, RefreshCw } from 'lucide-react';

interface AdminStatsHeaderProps {
  totalSales: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  averageTicket: number;
  criticalStockProducts: Product[];
  isSyncing?: boolean;
  onLogout: () => void;
}

export const AdminStatsHeader: React.FC<AdminStatsHeaderProps> = ({
  totalSales,
  totalOrdersCount,
  pendingOrdersCount,
  averageTicket,
  criticalStockProducts,
  isSyncing = false,
  onLogout,
}) => {
  return (
    <>
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
        <Button variant="secondary" onClick={onLogout} style={styles.logoutBtn}>
          <LogOut size={14} style={{ marginRight: '8px' }} /> Cerrar Sesión
        </Button>
      </div>

      {/* Métricas (4 KPIs) */}
      <div className="grid-4" style={styles.metricsGrid}>
        <Card style={{ ...styles.metricCard, background: 'rgba(110, 126, 107, 0.08)' }}>
          <div style={styles.metricHeader}>
            <Typography variant="caption" color="gold" style={styles.metricLabel}>Ventas Totales</Typography>
            <DollarSign size={18} color="#6e7e6b" />
          </div>
          <Typography variant="h1" style={styles.metricValue}>${totalSales.toLocaleString('es-AR')}</Typography>
          <span style={styles.metricSub}>Acumulado total</span>
        </Card>
        <Card style={{ ...styles.metricCard, background: 'rgba(197, 168, 128, 0.08)' }}>
          <div style={styles.metricHeader}>
            <Typography variant="caption" color="gold" style={styles.metricLabel}>Pedidos Totales</Typography>
            <ShoppingBag size={18} color="#c5a880" />
          </div>
          <Typography variant="h1" style={styles.metricValue}>{totalOrdersCount}</Typography>
          <span style={styles.metricSub}>{pendingOrdersCount} pendiente{pendingOrdersCount !== 1 ? 's' : ''}</span>
        </Card>
        <Card style={{ ...styles.metricCard, background: 'rgba(194, 139, 120, 0.08)' }}>
          <div style={styles.metricHeader}>
            <Typography variant="caption" color="gold" style={styles.metricLabel}>Ticket Promedio</Typography>
            <TrendingUp size={18} color="#c28b78" />
          </div>
          <Typography variant="h1" style={styles.metricValue}>${Math.round(averageTicket).toLocaleString('es-AR')}</Typography>
          <span style={styles.metricSub}>Por pedido realizado</span>
        </Card>
        <Card style={{ ...styles.metricCard, background: 'rgba(163, 76, 55, 0.08)' }}>
          <div style={styles.metricHeader}>
            <Typography variant="caption" color="gold" style={styles.metricLabel}>Bajo Stock (&lt; 5 u.)</Typography>
            <AlertTriangle size={18} color="#A34C37" />
          </div>
          <Typography variant="h1" style={{ ...styles.metricValue, color: criticalStockProducts.length > 0 ? '#A34C37' : 'inherit' }}>
            {criticalStockProducts.length}
          </Typography>
          <span style={styles.metricSub}>{criticalStockProducts.length === 1 ? 'Producto a reponer' : 'Productos a reponer'}</span>
        </Card>
      </div>

      {/* Alerta stock */}
      {criticalStockProducts.length > 0 && (
        <div style={styles.alertBar}>
          <AlertTriangle size={18} color="#A34C37" style={{ marginRight: '12px', flexShrink: 0 }} />
          <Typography variant="body" style={{ fontSize: '0.88rem', color: '#A34C37' }}>
            <strong>Stock Crítico (&lt; 5 u.):</strong> {criticalStockProducts.map(p => `${p.name} (${p.stock} u)`).join(', ')}
          </Typography>
        </div>
      )}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid rgba(176, 142, 98, 0.15)', paddingBottom: '20px' },
  syncBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#6e7e6b', background: 'rgba(110, 126, 107, 0.1)', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(110, 126, 107, 0.2)', fontFamily: 'var(--font-sans)' },
  logoutBtn: { borderColor: 'rgba(135, 84, 58, 0.35)', color: 'var(--color-bosque-suave)', fontSize: '0.8rem' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' },
  metricCard: { padding: '24px', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: '1px solid rgba(176, 142, 98, 0.12)' },
  metricHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  metricLabel: { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' },
  metricValue: { fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'Playfair Display, serif', margin: '4px 0' },
  metricSub: { fontSize: '0.78rem', color: 'var(--color-text-muted)' },
  alertBar: { display: 'flex', alignItems: 'center', background: 'rgba(163, 76, 55, 0.08)', border: '1px solid rgba(163, 76, 55, 0.25)', padding: '14px 20px', borderRadius: '12px', marginBottom: '24px' },
};

export default AdminStatsHeader;
