import { useState, useMemo, useEffect, useCallback } from 'react'
import InventoryPanel from '../components/InventoryPanel.jsx'
import Dashboard from '../components/Dashboard.jsx'
import { adminApi } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES } from '../data/datos.js'
import {
  IconChart,
  IconPackage,
  IconRefresh,
  IconClipboard,
  IconUsers,
  IconTrending,
  IconEdit,
  IconTrash,
  IconSearch,
  IconAlert,
  IconShield,
  IconPlus,
  IconX,
  IconCheck,
  IconPill,
} from '../components/Icons.jsx'
import styles from './Admin.module.css'

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    Icon: IconChart },
  { id: 'inventory', label: 'Inventario',   Icon: IconPackage },
  { id: 'stock',     label: 'Stock & Mov.', Icon: IconRefresh },
  { id: 'orders',    label: 'Pedidos',      Icon: IconClipboard },
  { id: 'users',     label: 'Usuarios',     Icon: IconUsers },
  { id: 'reports',   label: 'Reportes',     Icon: IconTrending },
]

// ── Product Modal ────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product
      ? { ...product }
      : {
          name: '',
          cat: 'Analgésicos',
          price: '',
          stock: '',
          desc: '',
          activeIngredient: '',
          presentation: '',
          lote: '',
          expiry: '',
          proveedor: '',
          sku: '',
          lowStockThreshold: 15,
          requiresPrescription: false,
        }
  )
  const [errors, setErrors] = useState({})
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  const setCheck = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.checked }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Requerido'
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) errs.price = 'Precio inválido'
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) errs.stock = 'Stock inválido'
    if (!form.proveedor?.trim()) errs.proveedor = 'Requerido'
    if (!form.lote?.trim()) errs.lote = 'Requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      lowStockThreshold: parseInt(form.lowStockThreshold, 10) || 15,
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 className="modal-title" style={{ marginBottom: 0 }}>
            {product ? 'Editar producto' : 'Agregar producto'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Nombre comercial *</label>
          <input
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="Ej: Paracetamol 500mg"
            value={form.name}
            onChange={set('name')}
          />
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
            <input className="form-input mono" placeholder="ANA-001" value={form.sku || ''} onChange={set('sku')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Principio activo</label>
            <input className="form-input" placeholder="Ej: Acetaminofén 500 mg" value={form.activeIngredient || ''} onChange={set('activeIngredient')} />
          </div>
          <div className="form-group">
            <label className="form-label">Presentación</label>
            <input className="form-input" placeholder="Ej: Caja × 20 tabletas" value={form.presentation || ''} onChange={set('presentation')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Precio (RD$) *</label>
            <input
              className={`form-input tabular-nums ${errors.price ? 'error' : ''}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={set('price')}
            />
            {errors.price && <div className="form-error">{errors.price}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Stock (unidades) *</label>
            <input
              className={`form-input tabular-nums ${errors.stock ? 'error' : ''}`}
              type="number"
              min="0"
              placeholder="0"
              value={form.stock}
              onChange={set('stock')}
            />
            {errors.stock && <div className="form-error">{errors.stock}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Alerta bajo stock</label>
            <input
              className="form-input tabular-nums"
              type="number"
              min="1"
              value={form.lowStockThreshold || 15}
              onChange={set('lowStockThreshold')}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de vencimiento</label>
            <input className="form-input mono" type="date" value={form.expiry || ''} onChange={set('expiry')} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Lote *</label>
            <input
              className={`form-input mono ${errors.lote ? 'error' : ''}`}
              placeholder="LOT-2026-001"
              value={form.lote || ''}
              onChange={set('lote')}
            />
            {errors.lote && <div className="form-error">{errors.lote}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Proveedor / Laboratorio *</label>
            <input
              className={`form-input ${errors.proveedor ? 'error' : ''}`}
              placeholder="Laboratorios Rowe"
              value={form.proveedor || ''}
              onChange={set('proveedor')}
            />
            {errors.proveedor && <div className="form-error">{errors.proveedor}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Descripción clínica breve</label>
          <textarea
            className="form-input"
            style={{ minHeight: 70, resize: 'vertical' }}
            placeholder="Indicaciones principales..."
            value={form.desc || ''}
            onChange={set('desc')}
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            id="rx"
            checked={!!form.requiresPrescription}
            onChange={setCheck('requiresPrescription')}
            style={{ width: 16, height: 16, accentColor: 'var(--green)' }}
          />
          <label htmlFor="rx" style={{ fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text2)' }}>
            Requiere prescripción médica (Rx)
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            {product ? 'Guardar cambios' : 'Agregar producto'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Confirm Delete Modal (sin window.confirm) ────────────────────────────────
function ConfirmDeleteModal({ product, onCancel, onConfirm }) {
  if (!product) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <h3 className="modal-title" style={{ marginBottom: 10 }}>Eliminar producto</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.55 }}>
          ¿Confirmas eliminar <strong>{product.name}</strong> (<span className="mono">{product.sku || 'S/SKU'}</span>) del catálogo? Esta acción no se puede deshacer.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
            onClick={onConfirm}
          >
            Eliminar producto
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Inventory Section ────────────────────────────────────────────────────────
function InventorySection() {
  const { products, addProduct, updateProduct, deleteProduct, showToast } = useApp()
  const [modal, setModal]             = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [searchProd, setSearchProd]   = useState('')
  const [catFilter, setCatFilter]     = useState('Todos')
  const [stockFilter, setStockFilter] = useState('all')

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = !searchProd ||
      p.name.toLowerCase().includes(searchProd.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchProd.toLowerCase())
    const matchCat = catFilter === 'Todos' || p.cat === catFilter
    const threshold = p.lowStockThreshold || 15
    const matchStock =
      stockFilter === 'all' ||
      (stockFilter === 'out' && p.stock === 0) ||
      (stockFilter === 'low' && p.stock > 0 && p.stock <= threshold) ||
      (stockFilter === 'ok' && p.stock > threshold)
    return matchSearch && matchCat && matchStock
  }), [products, searchProd, catFilter, stockFilter])

  const handleSave = async (data) => {
    if (modal === 'add') {
      await addProduct(data)
      showToast('Producto agregado al catálogo', 'green')
    } else {
      await updateProduct(modal.id, data)
      showToast('Producto actualizado', 'blue')
    }
    setModal(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await deleteProduct(deleteTarget.id)
    showToast(`${deleteTarget.name} eliminado`, 'red')
    setDeleteTarget(null)
  }

  const getStockBadge = (p) => {
    if (p.stock === 0) return <span className="badge badge-red">Sin stock</span>
    if (p.stock <= (p.lowStockThreshold || 15)) return <span className="badge badge-orange tabular-nums">Bajo ({p.stock})</span>
    return <span className="badge badge-green tabular-nums">OK ({p.stock})</span>
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
      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      <ConfirmDeleteModal
        product={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className={styles.invHeader}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconPackage size={17} />
              <span>Catálogo e Inventario</span>
            </h3>
            <p className="tabular-nums" style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>
              {products.length} productos · {products.filter(p => p.stock === 0).length} sin stock ·{' '}
              {products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 15)).length} stock bajo
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className={styles.invSearch}>
              <IconSearch size={14} />
              <input
                placeholder="Buscar nombre o SKU..."
                value={searchProd}
                onChange={e => setSearchProd(e.target.value)}
              />
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
            <button type="button" className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.83rem' }} onClick={() => setModal('add')}>
              <IconPlus size={14} />
              <span>Agregar</span>
            </button>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Lote</th>
                <th>Vencimiento</th>
                <th>Proveedor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={styles.prodThumb}>
                        {p.image ? (
                          <img src={p.image} alt={p.name} referrerPolicy="no-referrer" />
                        ) : (
                          <IconPill size={14} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{p.cat}</span>
                          {p.requiresPrescription && (
                            <span className="badge badge-blue" style={{ padding: '0px 5px', fontSize: '0.66rem' }}>Rx</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="mono" style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{p.sku || '—'}</td>
                  <td className="tabular-nums" style={{ color: 'var(--green-dark)', fontWeight: 700 }}>
                    RD${p.price.toFixed(2)}
                  </td>
                  <td>{getStockBadge(p)}</td>
                  <td className="mono" style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{p.lote || '—'}</td>
                  <td className="mono" style={{ fontSize: '0.79rem' }}>
                    {p.expiry ? (
                      <span style={{ color: isExpired(p.expiry) ? 'var(--red)' : isExpiringSoon(p.expiry) ? 'var(--orange)' : 'var(--text2)', fontWeight: isExpired(p.expiry) || isExpiringSoon(p.expiry) ? 600 : 400 }}>
                        {p.expiry}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text4)' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.81rem', color: 'var(--text2)' }}>{p.proveedor || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => setModal(p)}
                        aria-label={`Editar ${p.name}`}
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionDel}`}
                        onClick={() => setDeleteTarget(p)}
                        aria-label={`Eliminar ${p.name}`}
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text3)', padding: 28 }}>
                    No se encontraron productos con los filtros actuales
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ── Orders Section ───────────────────────────────────────────────────────────
function OrdersSection() {
  const { showToast } = useApp()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  const fetchOrders = useCallback((status) => {
    return adminApi.getOrders(status && status !== 'all' ? { status } : {})
      .then(res => setOrders(res.data || []))
      .catch(err => showToast(err?.message || 'Error al cargar órdenes', 'red'))
      .finally(() => setLoading(false))
  }, [showToast])

  const load = (status) => {
    setLoading(true)
    return fetchOrders(status)
  }

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filtered = orders.filter(o => filter === 'all' || o.status === filter)
  const statusClass = {
    Pendiente: 'badge-orange',
    Enviado:   'badge-blue',
    Entregado: 'badge-green',
    Cancelado: 'badge-red',
  }

  const handleStatus = async (id, status) => {
    try {
      await adminApi.updateOrderStatus(id, status)
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)))
      showToast(`Estado de orden actualizado a ${status}`, 'blue')
    } catch (err) {
      showToast(err?.message || 'No se pudo actualizar', 'red')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'Pendiente', 'Enviado', 'Entregado', 'Cancelado'].map(s => (
            <button
              key={s}
              type="button"
              className={filter === s ? 'btn-primary' : 'btn-ghost'}
              style={{ fontSize: '0.8rem', padding: '7px 14px' }}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? `Todos (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>
        <button type="button" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '7px 12px' }} onClick={() => load()}>
          <IconRefresh size={14} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div className="spinner spinner-dark" style={{ width: 24, height: 24 }} />
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: 28 }}>
                      No hay órdenes en esta categoría
                    </td>
                  </tr>
                )}
                {filtered.map(o => (
                  <tr key={o.order_number || o.id}>
                    <td>
                      <div className="mono" style={{ fontWeight: 700, color: 'var(--text)' }}>
                        {o.order_number || o.id}
                      </div>
                      {o.prescriptionRef && (
                        <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--blue-dark)' }}>
                          Rx: {o.prescriptionRef}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text)' }}>
                        {o.user_name || '—'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
                        {o.user_email || ''}
                      </div>
                    </td>
                    <td className="tabular-nums" style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>
                      {o.items?.length || 0} items
                    </td>
                    <td className="tabular-nums" style={{ color: 'var(--green-dark)', fontWeight: 700 }}>
                      RD${Number(o.total || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${statusClass[o.status] || 'badge-green'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="tabular-nums" style={{ fontSize: '0.79rem', color: 'var(--text3)' }}>
                      {new Date(o.created_at || o.date).toLocaleDateString('es-DO', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <select
                        className={styles.filterSelect}
                        style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                        value={o.status}
                        onChange={e => handleStatus(o.id, e.target.value)}
                      >
                        {['Pendiente', 'Enviado', 'Entregado', 'Cancelado'].map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Users Section ────────────────────────────────────────────────────────────
function UsersSection() {
  const { showToast } = useApp()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(() => {
    return adminApi.getUsers({ limit: 100 })
      .then(res => setUsers(res.data || []))
      .catch(err => showToast(err?.message || 'Error al cargar usuarios', 'red'))
      .finally(() => setLoading(false))
  }, [showToast])

  const load = () => {
    setLoading(true)
    return fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggle = async (id, isActive) => {
    try {
      await adminApi.toggleUser(id)
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, is_active: !u.is_active } : u)))
      showToast(isActive ? 'Usuario suspendido' : 'Usuario reactivado', 'blue')
    } catch (err) {
      showToast(err?.message || 'No se pudo actualizar el usuario', 'red')
    }
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className={styles.invHeader}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconUsers size={17} />
            <span>Usuarios registrados</span>
          </h3>
          <p className="tabular-nums" style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>
            {users.length} cuentas activas e inactivas
          </p>
        </div>
        <button type="button" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '7px 12px' }} onClick={load}>
          <IconRefresh size={14} />
          <span>Actualizar</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div className="spinner spinner-dark" style={{ width: 24, height: 24 }} />
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Pedidos</th>
                <th>Total facturado</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: 28 }}>
                    Sin usuarios registrados aún
                  </td>
                </tr>
              )}
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name}</td>
                  <td style={{ color: 'var(--text3)', fontSize: '0.84rem' }}>{u.email}</td>
                  <td className="tabular-nums">{u.total_orders}</td>
                  <td className="tabular-nums" style={{ color: 'var(--green-dark)', fontWeight: 600 }}>
                    RD${parseFloat(u.total_spent || 0).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="tabular-nums" style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={u.is_active ? 'btn-ghost' : 'btn-primary'}
                      style={{ fontSize: '0.76rem', padding: '5px 11px' }}
                      onClick={() => handleToggle(u.id, u.is_active)}
                    >
                      {u.is_active ? 'Suspender' : 'Activar'}
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

// ── Reports Section ──────────────────────────────────────────────────────────
function ReportsSection() {
  const { orders, products } = useApp()
  const [period, setPeriod] = useState('month')

  const now = new Date()
  const filtered = orders.filter(o => {
    const d = new Date(o.created_at || o.date)
    if (period === 'today') return d.toDateString() === now.toDateString()
    if (period === 'week') return (now - d) / 86400000 <= 7
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return true
  })

  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total || 0), 0)
  const totalOrders = filtered.length
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0
  const totalItems = filtered.reduce((s, o) => s + (o.items?.reduce((a, i) => a + i.qty, 0) || 0), 0)

  const catSales = {}
  filtered.forEach(o => o.items?.forEach(i => {
    const p = products.find(pr => pr.id === i.id)
    const cat = p?.cat || i.cat || 'General'
    catSales[cat] = (catSales[cat] || 0) + i.price * i.qty
  }))
  const catTotal = Object.values(catSales).reduce((s, v) => s + v, 0)
  const catColors = {
    Analgésicos: '#109A64',
    Vitaminas: '#1D63DC',
    Antibióticos: '#D97706',
    'Cuidado Personal': '#6366F1',
  }

  const stats = [
    { label: 'Ingresos', value: `RD$${totalRevenue.toFixed(0)}`, sub: period === 'today' ? 'hoy' : period === 'week' ? 'esta semana' : period === 'month' ? 'este mes' : 'histórico', color: 'var(--green-dark)' },
    { label: 'Pedidos', value: totalOrders, sub: 'órdenes procesadas', color: 'var(--blue-dark)' },
    { label: 'Unidades vendidas', value: totalItems, sub: 'en el período', color: 'var(--green-dark)' },
    { label: 'Ticket promedio', value: `RD$${avgOrder.toFixed(0)}`, sub: 'por orden', color: '#4F46E5' },
  ]

  const alerts = products.filter(p => p.stock === 0 || p.stock <= (p.lowStockThreshold || 15))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['today', 'Hoy'], ['week', 'Esta semana'], ['month', 'Este mes'], ['all', 'Histórico']].map(([v, l]) => (
          <button
            key={v}
            type="button"
            className={period === v ? 'btn-primary' : 'btn-ghost'}
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
            onClick={() => setPeriod(v)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className={styles.reportKpiGrid}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text3)', fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div className="tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text3)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className={styles.reportCols}>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconChart size={16} />
            <span>Ventas por categoría</span>
          </h3>
          {Object.keys(catSales).length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Sin ventas registradas en este período</p>
          ) : (
            Object.entries(catSales)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amt]) => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.84rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{cat}</span>
                    <span className="tabular-nums" style={{ color: 'var(--text3)' }}>
                      RD${amt.toFixed(0)} ({catTotal ? ((amt / catTotal) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${catTotal ? (amt / catTotal) * 100 : 0}%`,
                        background: catColors[cat] || 'var(--green)',
                        borderRadius: 4,
                        transition: 'width 500ms var(--ease)',
                      }}
                    />
                  </div>
                </div>
              ))
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlert size={16} />
            <span>Alertas de stock ({alerts.length})</span>
          </h3>
          {alerts.length === 0 ? (
            <div style={{ color: 'var(--green-dark)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconCheck size={16} />
              <span>Todo el inventario está en niveles óptimos</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alerts.map(p => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '9px 12px',
                    background: 'var(--bg)',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text3)' }}>Proveedor: {p.proveedor || '—'}</div>
                  </div>
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

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconClipboard size={16} />
          <span>Últimas órdenes del período ({filtered.length})</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Orden</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>
                    Sin órdenes en este período
                  </td>
                </tr>
              )}
              {filtered.slice(0, 10).map(o => (
                <tr key={o.order_number || o.id}>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--text)' }}>{o.order_number || o.id}</td>
                  <td>{o.user_name || '—'}</td>
                  <td className="tabular-nums" style={{ color: 'var(--green-dark)', fontWeight: 700 }}>
                    RD${Number(o.total || 0).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        {
                          Pendiente: 'badge-orange',
                          Enviado: 'badge-blue',
                          Entregado: 'badge-green',
                          Cancelado: 'badge-red',
                        }[o.status] || 'badge-green'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="tabular-nums" style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
                    {new Date(o.created_at || o.date).toLocaleDateString('es-DO', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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

// ── Admin Page ───────────────────────────────────────────────────────────────
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
        <button
          type="button"
          className={styles.adminBanner}
          onClick={() => setActiveSection('reports')}
        >
          <IconAlert size={16} />
          <span>
            <strong className="tabular-nums">{alertCount} productos</strong> con stock crítico o agotado. Ver reportes de reposición
          </span>
        </button>
      )}

      <div className={styles.layout}>
        <aside className={`card ${styles.sidebar}`}>
          <div className={styles.sidebarTitle}>Panel Clínico</div>
          {SIDEBAR_ITEMS.map(item => {
            const NavIcon = item.Icon
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.sidebarItem} ${activeSection === item.id ? styles.sidebarActive : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <NavIcon size={16} />
                <span>{item.label}</span>
                {item.id === 'reports' && alertCount > 0 && (
                  <span className={`${styles.sidebarBadge} tabular-nums`}>{alertCount}</span>
                )}
              </button>
            )
          })}
          <div className={styles.sidebarDivider} />
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarUserAvatar}>
              <IconShield size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)' }}>
                {user?.name ?? 'Admin'}
              </div>
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
