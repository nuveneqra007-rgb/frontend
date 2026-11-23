import { useState, useEffect, useCallback } from 'react'
import { api, resolveProductImage } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'
import {
  IconAlert,
  IconClipboard,
  IconPlus,
  IconCheck,
  IconX,
  IconRefresh,
  IconPill,
} from './Icons.jsx'

const TYPE_LABELS = {
  sale:       { label: 'Venta',      badge: 'badge-red',    symbol: '-' },
  restock:    { label: 'Reposición', badge: 'badge-green',  symbol: '+' },
  adjustment: { label: 'Ajuste',     badge: 'badge-blue',   symbol: '±' },
  return:     { label: 'Devolución', badge: 'badge-orange', symbol: '+' },
  expired:    { label: 'Vencido',    badge: 'badge-red',    symbol: '-' },
}

export default function InventoryPanel() {
  const { products, showToast } = useApp()
  const [tab, setTab]             = useState('summary')
  const [summary, setSummary]     = useState(null)
  const [movements, setMovements] = useState([])
  const [alerts, setAlerts]       = useState([])
  const [loading, setLoading]     = useState(true)

  const [showRestock, setShowRestock] = useState(false)
  const [restockForm, setRestockForm] = useState({ productId: '', quantity: '', notes: '' })
  const [restocking, setRestocking]   = useState(false)

  const fetchInventory = useCallback(() => {
    return Promise.all([
      api.get('/admin/inventory/summary'),
      api.get('/admin/inventory/movements?limit=40'),
      api.get('/admin/inventory/alerts'),
    ])
      .then(([sum, mov, al]) => {
        setSummary(sum)
        setMovements(mov.data || [])
        setAlerts(Array.isArray(al) ? al : (al?.data || []))
      })
      .catch(err => {
        showToast(err?.message || 'Error cargando inventario', 'red')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [showToast])

  const load = useCallback(() => {
    setLoading(true)
    return fetchInventory()
  }, [fetchInventory])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const handleRestock = async () => {
    if (!restockForm.productId || !restockForm.quantity || parseInt(restockForm.quantity, 10) <= 0) {
      showToast('Selecciona un producto y una cantidad válida', 'orange')
      return
    }
    setRestocking(true)
    try {
      await api.post('/admin/inventory/restock', {
        productId: restockForm.productId,
        quantity: parseInt(restockForm.quantity, 10),
        notes: restockForm.notes || 'Reposición manual',
      })
      showToast('Stock actualizado correctamente', 'green')
      setShowRestock(false)
      setRestockForm({ productId: '', quantity: '', notes: '' })
      load()
    } catch (err) {
      showToast(err?.message || 'No se pudo reponer stock', 'red')
    } finally {
      setRestocking(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 56 }}>
        <div className="spinner spinner-dark" style={{ width: 26, height: 26 }} />
      </div>
    )
  }

  const s = summary?.summary || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Productos activos', value: s.total_products || 0, color: 'var(--green-dark)' },
          { label: 'Sin stock', value: s.out_of_stock || 0, color: 'var(--red)' },
          { label: 'Stock bajo', value: s.low_stock || 0, color: 'var(--orange)' },
          {
            label: 'Valor inventario',
            value: `RD$${parseFloat(s.inventory_value || 0).toLocaleString('es-DO', { maximumFractionDigits: 0 })}`,
            color: 'var(--blue-dark)',
          },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 18px' }}>
            <div className="tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 800, color: k.color, fontFamily: 'var(--font-display)' }}>
              {k.value}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text3)', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={tab === 'summary' ? 'btn-primary' : 'btn-ghost'}
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            onClick={() => setTab('summary')}
          >
            <IconAlert size={14} />
            <span>Alertas ({alerts.length})</span>
          </button>
          <button
            type="button"
            className={tab === 'movements' ? 'btn-primary' : 'btn-ghost'}
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            onClick={() => setTab('movements')}
          >
            <IconClipboard size={14} />
            <span>Movimientos ({movements.length})</span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-ghost" style={{ fontSize: '0.82rem', padding: '8px 12px' }} onClick={load}>
            <IconRefresh size={14} />
            <span>Actualizar</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            onClick={() => setShowRestock(true)}
          >
            <IconPlus size={14} />
            <span>Reponer stock</span>
          </button>
        </div>
      </div>

      {/* TAB: Alertas */}
      {tab === 'summary' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.94rem' }}>
            <IconAlert size={16} />
            <span>Alertas de inventario activas ({alerts.length})</span>
          </div>
          {alerts.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '32px 16px', color: 'var(--green-dark)', fontWeight: 500 }}>
              <IconCheck size={17} />
              <span>Todos los productos cuentan con stock óptimo</span>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Stock actual</th>
                    <th>Umbral</th>
                    <th>Estado</th>
                    <th>Detectado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(a => {
                    const thumb = resolveProductImage(a, products)
                    return (
                      <tr key={a.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text4)' }}>
                              {thumb ? <img src={thumb} alt={a.name} referrerPolicy="no-referrer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconPill size={13} />}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{a.name}</span>
                          </div>
                        </td>
                        <td className="mono" style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{a.sku}</td>
                        <td className="tabular-nums">
                          <span style={{ fontWeight: 700, color: a.stock === 0 ? 'var(--red)' : 'var(--orange)' }}>
                            {a.stock} uds.
                          </span>
                        </td>
                        <td className="tabular-nums" style={{ color: 'var(--text3)' }}>{a.low_stock_threshold}</td>
                        <td>
                          <span className={`badge ${a.alert_type === 'out_of_stock' ? 'badge-red' : 'badge-orange'}`}>
                            {a.alert_type === 'out_of_stock' ? 'Agotado' : 'Stock bajo'}
                          </span>
                        </td>
                        <td className="tabular-nums" style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                          {new Date(a.sent_at).toLocaleDateString('es-DO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ fontSize: '0.76rem', padding: '5px 11px' }}
                            onClick={() => {
                              setRestockForm(f => ({ ...f, productId: String(a.product_id) }))
                              setShowRestock(true)
                            }}
                          >
                            Reponer
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: Movimientos */}
      {tab === 'movements' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.94rem' }}>
            <IconClipboard size={16} />
            <span>Historial de movimientos (Kardex)</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Stock antes</th>
                  <th>Stock después</th>
                  <th>Referencia</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: 28 }}>
                      Sin movimientos registrados
                    </td>
                  </tr>
                )}
                {movements.map(m => {
                  const cfg = TYPE_LABELS[m.type] || { label: m.type, badge: 'badge-blue', symbol: '' }
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>{m.product_name}</td>
                      <td><span className={`badge ${cfg.badge}`}>{cfg.label}</span></td>
                      <td className="tabular-nums" style={{ fontWeight: 700, color: m.quantity < 0 ? 'var(--red)' : 'var(--green-dark)' }}>
                        {cfg.symbol}{Math.abs(m.quantity)}
                      </td>
                      <td className="tabular-nums" style={{ color: 'var(--text3)' }}>{m.stock_before}</td>
                      <td className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text)' }}>{m.stock_after}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                        {m.notes ? m.notes.slice(0, 42) : '—'}
                      </td>
                      <td className="tabular-nums" style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                        {new Date(m.created_at).toLocaleDateString('es-DO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Reponer stock */}
      {showRestock && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowRestock(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Reponer stock</h3>
              <button
                type="button"
                onClick={() => setShowRestock(false)}
                aria-label="Cerrar"
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Producto</label>
              <select
                className="form-input"
                value={restockForm.productId}
                onChange={e => setRestockForm(f => ({ ...f, productId: e.target.value }))}
              >
                <option value="">Seleccionar producto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku || 'S/SKU'}) — Stock: {p.stock}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cantidad a ingresar</label>
              <input
                className="form-input tabular-nums"
                type="number"
                min="1"
                placeholder="Ej: 50"
                value={restockForm.quantity}
                onChange={e => setRestockForm(f => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nota o factura de proveedor</label>
              <input
                className="form-input"
                placeholder="Ej: Recepción lote proveedor FAC-0821"
                value={restockForm.notes}
                onChange={e => setRestockForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowRestock(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleRestock}
                disabled={restocking}
              >
                {restocking ? 'Guardando...' : 'Confirmar reposición'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
