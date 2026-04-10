import { useApp } from '../context/AppContext.jsx'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
import { Link } from 'react-router-dom'
import styles from './OrderHistory.module.css'

const STATUS_CONFIG = {
  Pendiente:  { cls: 'badge-orange', icon: '🕐' },
  Enviado:    { cls: 'badge-blue',   icon: '🚚' },
  Entregado:  { cls: 'badge-green',  icon: '✅' },
  Cancelado:  { cls: 'badge-red',    icon: '❌' },
}

export default function OrderHistory() {
  const { orders, user } = useApp()
  const myOrders = orders

  if (myOrders.length === 0) {
    return (
      <div className="page-wrapper">
        <div className={`card ${styles.emptyOrders}`}>
          <div className={styles.emptyIcon}>📦</div>
          <h2 className={styles.emptyTitle}>Sin pedidos aún</h2>
          <p className={styles.emptyDesc}>
            Tus pedidos aparecerán aquí una vez que completes una compra en nuestra tienda.
          </p>
          <Link to="/products" className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
            Explorar productos →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className={styles.header}>
        <h2 className="section-title">📦 Mis Pedidos</h2>
        <p className={styles.headerSub}>
          {myOrders.length} {myOrders.length === 1 ? 'pedido' : 'pedidos'} en total
        </p>
      </div>

      <div className={styles.list}>
        {myOrders.map((order, idx) => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pendiente
          const visibleItems = order.items?.slice(0, 3) || []
          const hiddenCount  = (order.items?.length || 0) - 3

          return (
            <div key={order.order_number || order.id} className={`card ${styles.orderCard}`} style={{ animationDelay: `${idx * 60}ms` }}>
              {/* Top bar */}
              <div className={styles.orderTop}>
                <div className={styles.orderMeta}>
                  <div className={styles.orderId}>{order.order_number || order.id}</div>
                  <div className={styles.orderDate}>
                    {new Date(order.date).toLocaleDateString('es-DO', {
                      weekday: 'long', year: 'numeric', month: 'long',
                      day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className={styles.orderRight}>
                  <span className={`badge ${cfg.cls}`}>
                    {cfg.icon} {order.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text4)' }}>
                    {order.payment_method === 'card' ? '💳 Tarjeta' : '💵 Efectivo'}
                  </span>
                  <a
                    href={`${API_URL}/orders/${order.id}/invoice`}
                    target="_blank" rel="noreferrer"
                    style={{
                      fontSize: '0.75rem', padding: '4px 10px',
                      background: 'var(--green-light)', color: 'var(--green)',
                      borderRadius: 6, fontWeight: 700, textDecoration: 'none',
                      border: '1px solid rgba(24,184,118,.3)',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    📄 Factura PDF
                  </a>
                </div>
              </div>

              {/* Items */}
              <div className={styles.orderBody}>
                <div className={styles.itemsGrid}>
                  {visibleItems.map((item, i) => (
                    <div key={i} className={styles.itemRow}>
                      <span>{item.emoji} {item.name} <span style={{ color: 'var(--text4)', fontSize: '0.82rem' }}>× {item.qty}</span></span>
                      <span>RD${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  {hiddenCount > 0 && (
                    <div className={styles.moreItems}>+{hiddenCount} producto{hiddenCount > 1 ? 's' : ''} más</div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className={styles.orderFooter}>
                <div className={styles.deliveryInfo}>
                  📍 {order.delivery_address}, {order.delivery_sector}, {order.delivery_city}
                </div>
                <div className={styles.totalBlock}>
                  <span className={styles.totalLabel}>Total:</span>
                  <span className={styles.totalAmt}>RD${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
