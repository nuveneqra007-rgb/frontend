import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { getInvoiceUrl } from '../services/api.js'
import {
  IconPackage,
  IconClock,
  IconTruck,
  IconCheck,
  IconX,
  IconCreditCard,
  IconBanknote,
  IconFileText,
  IconMapPin,
  IconShield,
  IconArrowRight,
  IconPill,
} from '../components/Icons.jsx'
import styles from './OrderHistory.module.css'

const API_URL = import.meta.env.VITE_API_URL || ''

const STATUS_CONFIG = {
  Pendiente: { cls: 'badge-orange', Icon: IconClock },
  Enviado:   { cls: 'badge-blue',   Icon: IconTruck },
  Entregado: { cls: 'badge-green',  Icon: IconCheck },
  Cancelado: { cls: 'badge-red',    Icon: IconX },
}

export default function OrderHistory() {
  const { orders, products, showToast } = useApp()
  const myOrders = orders

  if (myOrders.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="card empty-state">
          <div className="empty-icon">
            <IconPackage size={26} />
          </div>
          <h3>Sin pedidos registrados</h3>
          <p>Tus pedidos aparecerán aquí en cuanto completes tu primera compra en TuFarmacia.</p>
          <Link to="/products" className="btn-primary">
            <span>Explorar productos</span>
            <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className={styles.header}>
        <h2 className="section-title">Mis pedidos</h2>
        <p className={`${styles.headerSub} tabular-nums`}>
          {myOrders.length} {myOrders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
        </p>
      </div>

      <div className={styles.list}>
        {myOrders.map((order, idx) => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pendiente
          const StatusIcon = cfg.Icon
          const visibleItems = order.items?.slice(0, 3) || []
          const hiddenCount = (order.items?.length || 0) - 3
          const paymentMethod = order.payment_method || order.paymentMethod

          return (
            <div
              key={order.order_number || order.id}
              className={`card ${styles.orderCard}`}
              style={{ animationDelay: `${idx * 45}ms` }}
            >
              <div className={styles.orderTop}>
                <div>
                  <div className={`${styles.orderId} mono`}>{order.order_number || order.id}</div>
                  <div className={styles.orderDate}>
                    {new Date(order.date || order.created_at).toLocaleDateString('es-DO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className={styles.orderRight}>
                  <span className={`badge ${cfg.cls}`}>
                    <StatusIcon size={12} />
                    <span>{order.status}</span>
                  </span>

                  <span className={styles.paymentChip}>
                    {paymentMethod === 'card' ? <IconCreditCard size={13} /> : <IconBanknote size={13} />}
                    <span>{paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}</span>
                  </span>

                  {API_URL ? (
                    <a
                      href={getInvoiceUrl(order.id)}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.invoiceBtn}
                    >
                      <IconFileText size={13} />
                      <span>Factura PDF</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Preparando comprobante para impresión...', 'blue')
                        window.print()
                      }}
                      className={styles.invoiceBtn}
                    >
                      <IconFileText size={13} />
                      <span>Comprobante</span>
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.orderBody}>
                {order.prescriptionRef && (
                  <div className={styles.rxBanner}>
                    <IconShield size={14} />
                    <span>
                      Receta médica verificada: <strong className="mono">{order.prescriptionRef}</strong>
                    </span>
                  </div>
                )}

                <div className={styles.itemsGrid}>
                  {visibleItems.map((item, i) => {
                    const matchedProd = products.find(p => p.id === item.id || p.name === item.name)
                    const thumb = item.image || matchedProd?.image
                    return (
                      <div key={i} className={styles.itemRow}>
                        <div className={styles.itemLeft}>
                          <div className={styles.itemThumb}>
                            {thumb ? (
                              <img src={thumb} alt={item.name} referrerPolicy="no-referrer" />
                            ) : (
                              <IconPill size={13} />
                            )}
                          </div>
                          <span>
                            {item.name}{' '}
                            <span className="tabular-nums" style={{ color: 'var(--text4)', fontSize: '0.8rem' }}>
                              × {item.qty}
                            </span>
                          </span>
                        </div>
                        <span className="tabular-nums">RD${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    )
                  })}
                  {hiddenCount > 0 && (
                    <div className={styles.moreItems}>
                      +{hiddenCount} producto{hiddenCount > 1 ? 's' : ''} adicional{hiddenCount > 1 ? 'es' : ''}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.deliveryInfo}>
                  <IconMapPin size={14} />
                  <span>
                    {order.delivery_address || order.address?.address || '—'},{' '}
                    {order.delivery_sector || order.address?.sector || '—'},{' '}
                    {order.delivery_city || order.address?.city || '—'}
                  </span>
                </div>
                <div className={styles.totalBlock}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={`${styles.totalAmt} tabular-nums`}>
                    RD${Number(order.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
