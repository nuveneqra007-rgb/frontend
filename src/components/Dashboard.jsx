import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { adminApi } from '../services/api.js'
import styles from './Dashboard.module.css'

const KPI_COLORS = ['var(--green)', 'var(--orange)', 'var(--blue)', '#7c3aed']
const KPI_BG     = ['var(--green-light)', 'var(--orange-light)', 'var(--blue-light)', '#f3e8ff']

export default function Dashboard() {
  const { products, lowStockProducts, outOfStockProducts } = useApp()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalRevenue  = stats ? parseFloat(stats.revenue?.total_revenue  || 0) : 0
  const monthRevenue  = stats ? parseFloat(stats.revenue?.monthly_revenue || 0) : 0
  const pendingOrders = stats ? parseInt(stats.orders?.pending  || 0) : 0
  const totalOrders   = stats ? parseInt(stats.orders?.total    || 0) : 0
  const totalUsers    = stats ? parseInt(stats.users?.total     || 0) : 0
  const newUsers      = stats ? parseInt(stats.users?.new_this_month || 0) : 0
  const topProducts   = stats?.top_products || []
  const maxUnits      = topProducts.length ? Math.max(...topProducts.map(p => parseInt(p.units_sold))) : 1

  const kpis = [
    { label: 'Ingresos Totales',   value: `RD$${totalRevenue.toLocaleString('es', { maximumFractionDigits: 0 })}`, sub: `RD$${monthRevenue.toLocaleString('es', { maximumFractionDigits: 0 })} este mes`, icon: '💰' },
    { label: 'Pedidos Pendientes', value: pendingOrders, sub: `${totalOrders} en total`, icon: '📋' },
    { label: 'Inventario',         value: products.length, sub: `${outOfStockProducts.length} agotados · ${lowStockProducts.length} bajos`, icon: '📦' },
    { label: 'Clientes',           value: totalUsers, sub: `${newUsers} nuevos este mes`, icon: '👥' },
  ]

  const alerts = products.filter(p => p.stock === 0 || p.stock <= (p.low_stock_threshold || 15))

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className={styles.kpiGrid}>
        {kpis.map((k, i) => (
          <div key={k.label} className={`card ${styles.kpiCard}`}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiLabel}>{k.label}</div>
              <div className={styles.kpiIconBox} style={{ background: KPI_BG[i] }}>{k.icon}</div>
            </div>
            <div className={styles.kpiValue} style={{ color: KPI_COLORS[i] }}>{k.value}</div>
            <div className={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className={styles.chartsRow}>
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartTitle}>🏆 Más vendidos</div>
          {topProducts.length === 0 ? <p className={styles.noData}>Sin ventas aún</p> : (
            <div className={styles.topList}>
              {topProducts.map((p, i) => (
                <div key={p.sku} className={styles.topItem}>
                  <div className={`${styles.topRank} ${i === 0 ? styles.gold : i === 1 ? styles.silver : ''}`}>{i + 1}</div>
                  <div className={styles.topName}>{p.emoji} {p.name}</div>
                  <div className={styles.topQty}>{p.units_sold} uds.</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartTitle}>📊 Estado de pedidos</div>
          {totalOrders === 0 ? <p className={styles.noData}>Sin pedidos aún</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
              {[
                { label: 'Pendientes',  count: stats?.orders?.pending,   color: 'var(--orange)' },
                { label: 'Enviados',    count: stats?.orders?.shipped,    color: '#7c3aed' },
                { label: 'Entregados',  count: stats?.orders?.delivered,  color: 'var(--green)' },
                { label: 'Cancelados',  count: stats?.orders?.cancelled,  color: 'var(--red)' },
              ].map(({ label, count, color }) => {
                const n = parseInt(count || 0)
                const pct = totalOrders ? Math.round((n / totalOrders) * 100) : 0
                return (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text2)' }}>{label}</span>
                      <span style={{ fontWeight: 700, color }}>{n} ({pct}%)</span>
                    </div>
                    <div style={{ background: 'var(--bg2)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, minWidth: n > 0 ? 8 : 0, transition: 'width .5s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className={`card ${styles.alertsCard}`}>
          <div className={styles.alertsTitle}>⚠️ Alertas de inventario · {alerts.length} productos</div>
          <div className={styles.alertsGrid}>
            {alerts.map(p => (
              <div key={p.id} className={styles.alertItem}>
                <span className={styles.alertItemName}>{p.emoji} {p.name}</span>
                {p.stock === 0 ? <span className="badge badge-red">Agotado</span> : <span className="badge badge-orange">{p.stock} uds.</span>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={`card ${styles.alertsCard}`} style={{ border: '1.5px solid rgba(24,184,118,.2)' }}>
          <div className={styles.okMsg}><span>✅</span> Todo el inventario está en niveles óptimos</div>
        </div>
      )}
    </div>
  )
}
