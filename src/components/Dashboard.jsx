import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useApp } from '../context/AppContext.jsx'
import { adminApi } from '../services/api.js'
import {
  IconTrending,
  IconClipboard,
  IconPackage,
  IconUsers,
  IconAlert,
  IconCheck,
  IconChart,
  IconPill,
} from './Icons.jsx'
import styles from './Dashboard.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const KPI_COLORS = ['var(--green)', 'var(--orange)', 'var(--blue)', '#6366F1']
const KPI_BG     = ['var(--green-light)', 'var(--orange-light)', 'var(--blue-light)', '#EEF2FF']

export default function Dashboard() {
  const { products, lowStockProducts, outOfStockProducts } = useApp()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalRevenue  = stats ? parseFloat(stats.revenue?.total_revenue || 0) : 0
  const monthRevenue  = stats ? parseFloat(stats.revenue?.monthly_revenue || 0) : 0
  const pendingOrders = stats ? parseInt(stats.orders?.pending || 0, 10) : 0
  const totalOrders   = stats ? parseInt(stats.orders?.total || 0, 10) : 0
  const totalUsers    = stats ? parseInt(stats.users?.total || 0, 10) : 0
  const newUsers      = stats ? parseInt(stats.users?.new_this_month || 0, 10) : 0
  const topProducts   = stats?.top_products || []
  const catRevenue    = stats?.category_revenue || {}

  const kpis = [
    {
      label: 'Ingresos Totales',
      value: `RD$${totalRevenue.toLocaleString('es-DO', { maximumFractionDigits: 0 })}`,
      sub: `RD$${monthRevenue.toLocaleString('es-DO', { maximumFractionDigits: 0 })} este mes`,
      Icon: IconTrending,
    },
    {
      label: 'Pedidos Pendientes',
      value: pendingOrders,
      sub: `${totalOrders} órdenes registradas`,
      Icon: IconClipboard,
    },
    {
      label: 'Catálogo Activo',
      value: products.length,
      sub: `${outOfStockProducts.length} agotados · ${lowStockProducts.length} stock bajo`,
      Icon: IconPackage,
    },
    {
      label: 'Clientes',
      value: totalUsers,
      sub: `${newUsers} nuevos este mes`,
      Icon: IconUsers,
    },
  ]

  const alerts = products.filter(p => p.stock === 0 || p.stock <= (p.lowStockThreshold || p.low_stock_threshold || 15))

  const barData = {
    labels: ['Pendientes', 'Enviados', 'Entregados', 'Cancelados'],
    datasets: [
      {
        label: 'Órdenes',
        data: [
          parseInt(stats?.orders?.pending || 0, 10),
          parseInt(stats?.orders?.shipped || 0, 10),
          parseInt(stats?.orders?.delivered || 0, 10),
          parseInt(stats?.orders?.cancelled || 0, 10),
        ],
        backgroundColor: ['#D97706', '#1D63DC', '#109A64', '#DC2626'],
        borderRadius: 6,
        barPercentage: 0.55,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 12 } } },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#64748B', font: { size: 11 } },
        grid: { color: '#F1F5F9' },
      },
    },
  }

  const catEntries = Object.entries(catRevenue)
  const doughnutData = {
    labels: catEntries.length ? catEntries.map(([k]) => k) : ['Sin datos'],
    datasets: [
      {
        data: catEntries.length ? catEntries.map(([, v]) => Number(v)) : [1],
        backgroundColor: catEntries.length
          ? ['#109A64', '#1D63DC', '#D97706', '#6366F1', '#0D9488']
          : ['#E2E8F0'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '64%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, padding: 14, color: '#334155', font: { size: 11.5 } },
      },
    },
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 56 }}>
        <div className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className={styles.kpiGrid}>
        {kpis.map((k, i) => {
          const KpiIcon = k.Icon
          return (
            <div key={k.label} className={`card ${styles.kpiCard}`}>
              <div className={styles.kpiTop}>
                <div className={styles.kpiLabel}>{k.label}</div>
                <div className={styles.kpiIconBox} style={{ background: KPI_BG[i], color: KPI_COLORS[i] }}>
                  <KpiIcon size={17} />
                </div>
              </div>
              <div className={`${styles.kpiValue} tabular-nums`} style={{ color: KPI_COLORS[i] }}>
                {k.value}
              </div>
              <div className={`${styles.kpiSub} tabular-nums`}>{k.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Charts Row (Chart.js) */}
      <div className={styles.chartsRow}>
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <IconChart size={16} />
            <span className={styles.chartTitle}>Distribución de órdenes</span>
          </div>
          <div className={styles.chartBox}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <IconTrending size={16} />
            <span className={styles.chartTitle}>Ingresos por categoría</span>
          </div>
          <div className={styles.chartBox}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Top Selling & Alerts */}
      <div className={styles.chartsRow}>
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <IconPackage size={16} />
            <span className={styles.chartTitle}>Productos más vendidos</span>
          </div>
          {topProducts.length === 0 ? (
            <p className={styles.noData}>Sin ventas registradas aún</p>
          ) : (
            <div className={styles.topList}>
              {topProducts.map((p, i) => {
                const matched = products.find(pr => pr.sku === p.sku || pr.name === p.name)
                return (
                  <div key={p.sku || p.name} className={styles.topItem}>
                    <div className={`${styles.topRank} tabular-nums ${i === 0 ? styles.gold : i === 1 ? styles.silver : ''}`}>
                      {i + 1}
                    </div>
                    <div className={styles.topThumb}>
                      {matched?.image ? (
                        <img src={matched.image} alt={p.name} referrerPolicy="no-referrer" />
                      ) : (
                        <IconPill size={13} />
                      )}
                    </div>
                    <div className={styles.topName}>{p.name}</div>
                    <div className={`${styles.topQty} tabular-nums`}>{p.units_sold} uds.</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <IconAlert size={16} />
            <span className={styles.chartTitle}>
              Alertas de inventario ({alerts.length})
            </span>
          </div>
          {alerts.length === 0 ? (
            <div className={styles.okMsg}>
              <IconCheck size={16} />
              <span>Todo el inventario se encuentra en niveles óptimos</span>
            </div>
          ) : (
            <div className={styles.alertsGrid}>
              {alerts.map(p => (
                <div key={p.id} className={styles.alertItem}>
                  <span className={styles.alertItemName}>{p.name}</span>
                  {p.stock === 0 ? (
                    <span className="badge badge-red">Agotado</span>
                  ) : (
                    <span className="badge badge-orange tabular-nums">{p.stock} uds.</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
