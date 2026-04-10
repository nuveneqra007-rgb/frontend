import { useState, useMemo, useEffect } from 'react'
import InventoryPanel from '../components/InventoryPanel.jsx'
import { adminApi } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'
import Dashboard from '../components/Dashboard.jsx'
import { CAT_EMOJIS, CATEGORIES } from '../data/datos.js'
import styles from './Admin.module.css'

const SIDEBAR_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',   icon: '📊' },
  { id: 'inventory',  label: 'Inventario',  icon: '📦' },
  { id: 'stock',      label: 'Stock & Mov', icon: '🔄' },
  { id: 'orders',     label: 'Pedidos',     icon: '📋' },
  { id: 'users',      label: 'Usuarios',    icon: '👥' },
  { id: 'reports',    label: 'Reportes',    icon: '📈' },
]

// ── Product Modal (campos profesionales) ─────────────────────────────────────
function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product
      ? { ...product }
      : { name: '', cat: 'Analgésicos', price: '', stock: '', desc: '',
          lote: '', expiry: '', proveedor: '', sku: '', lowStockThreshold: 15,
          requiresPrescription: false }
  )
  const [errors, setErrors] = useState({})
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  const setCheck = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.checked }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Requerido'
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) errs.price = 'Precio inválido'
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) errs.stock = 'Stock inválido'
    if (!form.proveedor.trim()) errs.proveedor = 'Requerido'
    if (!form.lote.trim()) errs.lote = 'Requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      lowStockThreshold: parseInt(form.lowStockThreshold) || 15,
      emoji: CAT_EMOJIS[form.cat] || '💊',
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 className="modal-title">{product ? '✏️ Editar Producto' : '➕ Agregar Producto'}</h3>

        <div className="form-group">
          <label className="form-label">Nombre del producto *</label>
          <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Ej: Paracetamol 500mg" value={form.name} onChange={set('name')} />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select className="form-input" value={form.cat} onChange={set('cat')}>
              {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">SKU</label>
            <input className="form-input" placeholder="ANA-001" value={form.sku || ''} onChange={set('sku')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Precio (RD$) *</label>
            <input className={`form-input ${errors.price ? 'error' : ''}`} type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={set('price')} />
            {errors.price && <div className="form-error">{errors.price}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Stock (unidades) *</label>
            <input className={`form-input ${errors.stock ? 'error' : ''}`} type="number" min="0" placeholder="0" value={form.stock} onChange={set('stock')} />
            {errors.stock && <div className="form-error">{errors.stock}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Alerta bajo stock</label>
            <input className="form-input" type="number" min="1" value={form.lowStockThreshold || 15} onChange={set('lowStockThreshold')} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha expiración</label>
            <input className="form-input" type="date" value={form.expiry || ''} onChange={set('expiry')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Lote *</label>
            <input className={`form-input ${errors.lote ? 'error' : ''}`} placeholder="LOT-2024-001" value={form.lote || ''} onChange={set('lote')} />
            {errors.lote && <div className="form-error">{errors.lote}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Proveedor *</label>
            <input className={`form-input ${errors.proveedor ? 'error' : ''}`} placeholder="Laboratorios Rowe" value={form.proveedor || ''} onChange={set('proveedor')} />
            {errors.proveedor && <div className="form-error">{errors.proveedor}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea className="form-input" style={{ minHeight: 70, resize: 'vertical' }} placeholder="Descripción breve..." value={form.desc} onChange={set('desc')} />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="rx" checked={!!form.requiresPrescription} onChange={setCheck('requiresPrescription')} style={{ width: 16, height: 16, accentColor: 'var(--green)' }} />
          <label htmlFor="rx" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Requiere prescripción médica (Rx)</label>
        </div>

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>
            {product ? 'Guardar cambios' : 'Agregar producto'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Inventory Section ─────────────────────────────────────────────────────────
function InventorySection() {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useApp()
  const [modal, setModal] = useState(null)
  const [searchProd, setSearchProd] = useState('')
  const [catFilter, setCatFilter] = useState('Todos')
  const [stockFilter, setStockFilter] = useState('all')

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = !searchProd || p.name.toLowerCase().includes(searchProd.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchProd.toLowerCase())
    const matchCat = catFilter === 'Todos' || p.cat === catFilter
    const matchStock = stockFilter === 'all' || (stockFilter === 'out' && p.stock === 0) || (stockFilter === 'low' && p.stock > 0 && p.stock <= (p.lowStockThreshold || 15)) || (stockFilter === 'ok' && p.stock > (p.lowStockThreshold || 15))
    return matchSearch && matchCat && matchStock
  }), [products, searchProd, catFilter, stockFilter])

  const handleSave = (data) => {
    if (modal === 'add') { addProduct(data); showToast('Producto agregado ✅', 'green') }
    else { updateProduct(modal.id, data); showToast('Producto actualizado', 'blue') }
    setModal(null)
  }

  const handleDelete = (product) => {
    if (window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
      deleteProduct(product.id)
      showToast(`${product.name} eliminado`, 'red')
    }
  }

  const getStockBadge = (p) => {
    if (p.stock === 0) return <span className="badge badge-red">Sin stock</span>
    if (p.stock <= (p.lowStockThreshold || 15)) return <span className="badge badge-orange">Bajo ({p.stock})</span>
    return <span className="badge badge-green">OK ({p.stock})</span>
  }

  const isExpiringSoon = (expiry) => {
    if (!expiry) return false
    const days = Math.floor((new Date(expiry) - new Date()) / 86400000)
    return days <= 90 && days > 0
  }
  const isExpired = (expiry) => {
    if (!expiry) return false
    return new Date(expiry) < new Date()
  }

  return (
    <>
      {modal && <ProductModal product={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      <div className="card">
        <div className={styles.invHeader}>
          <div>
            <h3 style={{ fontWeight: 800 }}>📦 Inventario</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>
              {products.length} productos · {products.filter(p => p.stock === 0).length} sin stock · {products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 15)).length} bajo stock
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className={styles.invSearch}>
              <span>🔍</span>
              <input placeholder="Buscar nombre o SKU..." value={searchProd} onChange={e => setSearchProd(e.target.value)} />
            </div>
            <select className={styles.filterSelect} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className={styles.filterSelect} value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="ok">Stock OK</option>
              <option value="low">Bajo stock</option>
              <option value="out">Sin stock</option>
            </select>
            <button className="btn-primary" onClick={() => setModal('add')}>+ Agregar</button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th><th>SKU</th><th>Precio</th><th>Stock</th>
                <th>Lote</th><th>Expira</th><th>Proveedor</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.3rem' }}>{p.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{p.cat}
                          {p.requiresPrescription && <span style={{ color: 'var(--blue)', marginLeft: 6 }}>Rx</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text3)', fontSize: '0.82rem', fontFamily: 'monospace' }}>{p.sku || '—'}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 700 }}>RD${p.price.toFixed(2)}</td>
                  <td>{getStockBadge(p)}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{p.lote || '—'}</td>
                  <td>
                    {p.expiry
                      ? <span style={{ fontSize: '0.8rem', color: isExpired(p.expiry) ? '#e53e3e' : isExpiringSoon(p.expiry) ? '#d97706' : 'var(--text2)' }}>
                          {isExpired(p.expiry) ? '❌ ' : isExpiringSoon(p.expiry) ? '⚠️ ' : ''}{p.expiry}
                        </span>
                      : <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>—</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>{p.proveedor || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className={styles.actionBtn} onClick={() => setModal(p)}>✏️</button>
                      <button className={`${styles.actionBtn} ${styles.actionDel}`} onClick={() => handleDelete(p)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px' }}>Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ── Orders Section ────────────────────────────────────────────────────────────
function OrdersSection() {
  const { showToast } = useApp()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = (status) => {
    setLoading(true)
    adminApi.getOrders(status && status !== 'all' ? { status } : {})
      .then(res => setOrders(res.data || []))
      .catch(err => showToast(err.message, 'red'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  const [filter, setFilter] = useState('all')

  const filtered = orders.filter(o => filter === 'all' || o.status === filter)
  const statusClass = { Pendiente: 'badge-orange', Enviado: 'badge-blue', Entregado: 'badge-green', Cancelado: 'badge-red' }

  const handleStatus = async (id, status) => {
    try {
      await adminApi.updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      showToast(`Orden actualizada a: ${status}`, 'blue')
    } catch (err) { showToast(err.message, 'red') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'Pendiente', 'Enviado', 'Entregado', 'Cancelado'].map(s => (
          <button key={s} className={filter === s ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            onClick={() => setFilter(s)}>
            {s === 'all' ? `Todos (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Orden</th><th>Cliente</th><th>Productos</th><th>Total</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr></thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>No hay órdenes</td></tr>
              )}
              {filtered.map(o => (
                <tr key={o.order_number || o.id}>
                  <td style={{ fontWeight: 700 }}>{o.order_number || o.id}</td>
                  <td>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{o.user_name || "—"}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{o.user_email || ""}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>{o.items?.length || 0} items</td>
                  <td style={{ color: 'var(--green)', fontWeight: 700 }}>RD${o.total.toFixed(2)}</td>
                  <td><span className={`badge ${statusClass[o.status] || 'badge-green'}`}>{o.status}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
                    {new Date(o.created_at).toLocaleDateString('es-DO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <select className={styles.filterSelect} style={{ fontSize: '0.78rem' }}
                      value={o.status}
                      onChange={e => handleStatus(o.id, e.target.value)}>
                      {['Pendiente', 'Enviado', 'Entregado', 'Cancelado'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Users Section (API real) ──────────────────────────────────────────────────
function UsersSection() {
  const { showToast } = useApp()
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminApi.getUsers({ limit: 100 })
      .then(res => setUsers(res.data || []))
      .catch(err => showToast(err.message, 'red'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (id, isActive) => {
    try {
      await adminApi.toggleUser(id)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u))
      showToast(isActive ? 'Usuario suspendido' : 'Usuario reactivado', 'blue')
    } catch (err) { showToast(err.message, 'red') }
  }

  return (
    <div className="card">
      <div className={styles.invHeader}>
        <div>
          <h3 style={{ fontWeight: 800 }}>👥 Usuarios Registrados</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>{users.length} clientes</p>
        </div>
        <button className="btn-ghost" style={{ fontSize: '0.8rem' }} onClick={load}>🔄 Actualizar</button>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 24 }}>Cargando...</div> : (
      <div className="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Pedidos</th><th>Total gastado</th><th>Estado</th><th>Registro</th><th>Acción</th></tr></thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>Sin clientes aún</td></tr>}
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{u.email}</td>
                <td>{u.total_orders}</td>
                <td style={{ color: 'var(--green)', fontWeight: 600 }}>RD${parseFloat(u.total_spent || 0).toFixed(2)}</td>
                <td><span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Activo' : 'Suspendido'}</span></td>
                <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                </td>
                <td>
                  <button className={u.is_active ? 'btn-ghost' : 'btn-primary'} style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                    onClick={() => handleToggle(u.id, u.is_active)}>
                    {u.is_active ? '🚫 Suspender' : '✅ Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}

// ── Reports Section ───────────────────────────────────────────────────────────
function ReportsSection() {
  const { orders, products } = useApp()
  const [period, setPeriod] = useState('month')

  const now = new Date()
  const filtered = orders.filter(o => {
    const d = new Date(o.created_at)
    if (period === 'today') return d.toDateString() === now.toDateString()
    if (period === 'week') return (now - d) / 86400000 <= 7
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return true
  })

  const totalRevenue = filtered.reduce((s, o) => s + (o.total || 0), 0)
  const totalOrders = filtered.length
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0
  const totalItems = filtered.reduce((s, o) => s + (o.items?.reduce((a, i) => a + i.qty, 0) || 0), 0)

  // Sales by category
  const catSales = {}
  filtered.forEach(o => o.items?.forEach(i => {
    const p = products.find(pr => pr.id === i.id)
    const cat = p?.cat || i.cat || 'Otro'
    catSales[cat] = (catSales[cat] || 0) + (i.price * i.qty)
  }))
  const catTotal = Object.values(catSales).reduce((s, v) => s + v, 0)
  const catColors = { Analgésicos: '#1BB87A', Vitaminas: '#2980d9', Antibióticos: '#f6a623', 'Cuidado Personal': '#9b59b6' }

  const stats = [
    { label: 'Ingresos', value: `RD$${totalRevenue.toFixed(0)}`, sub: `${period === 'today' ? 'hoy' : period === 'week' ? 'esta semana' : 'este mes'}`, color: 'var(--green)' },
    { label: 'Pedidos', value: totalOrders, sub: 'órdenes procesadas', color: 'var(--blue)' },
    { label: 'Items vendidos', value: totalItems, sub: 'unidades', color: 'var(--green)' },
    { label: 'Ticket promedio', value: `RD$${avgOrder.toFixed(0)}`, sub: 'por orden', color: '#9b59b6' },
  ]

  // Products with low stock alerts
  const alerts = products.filter(p => p.stock === 0 || p.stock <= (p.lowStockThreshold || 15))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[['today', 'Hoy'], ['week', 'Esta semana'], ['month', 'Este mes'], ['all', 'Histórico']].map(([v, l]) => (
          <button key={v} className={period === v ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.8rem', padding: '7px 14px' }} onClick={() => setPeriod(v)}>{l}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Sales by category */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>📊 Ventas por Categoría</h3>
          {Object.keys(catSales).length === 0
            ? <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Sin ventas en este período</p>
            : Object.entries(catSales).sort(([,a],[,b]) => b - a).map(([cat, amt]) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.84rem' }}>
                  <span style={{ fontWeight: 600 }}>{cat}</span>
                  <span style={{ color: 'var(--text3)' }}>RD${amt.toFixed(0)} ({catTotal ? ((amt/catTotal)*100).toFixed(0) : 0}%)</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${catTotal ? (amt/catTotal)*100 : 0}%`, background: catColors[cat] || 'var(--green)', borderRadius: 4, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))
          }
        </div>

        {/* Stock alerts */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>⚠️ Alertas de Stock ({alerts.length})</h3>
          {alerts.length === 0
            ? <div style={{ color: 'var(--green)', fontSize: '0.88rem' }}>✅ Todo el inventario está en niveles óptimos</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {alerts.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.emoji} {p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Proveedor: {p.proveedor || '—'}</div>
                    </div>
                    {p.stock === 0
                      ? <span className="badge badge-red">AGOTADO</span>
                      : <span className="badge badge-orange">{p.stock} uds.</span>
                    }
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 800 }}>📋 Últimas Órdenes del Período ({filtered.length})</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Orden</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>Sin órdenes en este período</td></tr>}
              {filtered.slice(0, 10).map(o => (
                <tr key={o.order_number || o.id}>
                  <td style={{ fontWeight: 700 }}>{o.order_number || o.id}</td>
                  <td>{o.user_name || "—"}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 700 }}>RD${o.total.toFixed(2)}</td>
                  <td><span className={`badge ${{ Pendiente: 'badge-orange', Enviado: 'badge-blue', Entregado: 'badge-green', Cancelado: 'badge-red' }[o.status] || 'badge-green'}`}>{o.status}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>{new Date(o.created_at).toLocaleDateString('es-DO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Admin Page ────────────────────────────────────────────────────────────────
export default function Admin() {
  const { user, lowStockProducts, outOfStockProducts } = useApp()
  const [activeSection, setActiveSection] = useState('dashboard')
  const alertCount = lowStockProducts.length + outOfStockProducts.length

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />
      case 'inventory': return <InventorySection />
      case 'orders':    return <OrdersSection />
      case 'stock':     return <InventoryPanel />
      case 'users':     return <UsersSection />
      case 'reports':   return <ReportsSection />
      default:          return <Dashboard />
    }
  }

  return (
    <div className="page-wrapper">
      {alertCount > 0 && (
        <div className={styles.adminBanner} onClick={() => setActiveSection('reports')} style={{ cursor: 'pointer' }}>
          ⚠️ <strong>{alertCount} productos</strong> con stock crítico o agotado. Click para ver reportes →
        </div>
      )}

      <div className={styles.layout}>
        <aside className={`card ${styles.sidebar}`}>
          <div className={styles.sidebarTitle}>Panel Admin</div>
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              className={`${styles.sidebarItem} ${activeSection === item.id ? styles.sidebarActive : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.id === 'reports' && alertCount > 0 && (
                <span style={{ marginLeft: 'auto', background: '#e53e3e', color: '#fff', borderRadius: 10, fontSize: '0.7rem', padding: '2px 7px', fontWeight: 700 }}>{alertCount}</span>
              )}
            </button>
          ))}
          <div className={styles.sidebarDivider} />
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarUserAvatar}>🛡️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{user?.name ?? 'Admin'}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>Administrador</div>
            </div>
          </div>
        </aside>

        <main className={styles.content}>
          {renderSection()}
        </main>
      </div>
    </div>
  )
}
