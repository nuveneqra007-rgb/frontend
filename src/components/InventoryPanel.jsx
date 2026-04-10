import { useState, useEffect, useCallback } from 'react'
import { adminApi, api } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'

const TYPE_LABELS = {
  sale:       { label: 'Venta',      badge: 'badge-red',    symbol: '↓' },
  restock:    { label: 'Reposición', badge: 'badge-green',  symbol: '↑' },
  adjustment: { label: 'Ajuste',     badge: 'badge-blue',   symbol: '≈' },
  return:     { label: 'Devolución', badge: 'badge-orange', symbol: '↺' },
  expired:    { label: 'Vencido',    badge: 'badge-red',    symbol: '✕' },
}

export default function InventoryPanel() {
  const { products, showToast } = useApp()
  const [tab, setTab]         = useState('summary')
  const [summary, setSummary] = useState(null)
  const [movements, setMovements] = useState([])
  const [alerts, setAlerts]   = useState([])
  const [loading, setLoading] = useState(true)

  // Restock modal
  const [showRestock, setShowRestock] = useState(false)
  const [restockForm, setRestockForm] = useState({ productId: '', quantity: '', notes: '' })
  const [restocking, setRestocking]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sum, mov, al] = await Promise.all([
        api.get('/admin/inventory/summary'),
        api.get('/admin/inventory/movements?limit=40'),
        api.get('/admin/inventory/alerts'),
      ])
      setSummary(sum)
      setMovements(mov.data || [])
      setAlerts(al)
    } catch (err) { showToast(err.message, 'red') }
    finally { setLoading(false) }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const handleRestock = async () => {
    if (!restockForm.productId || !restockForm.quantity) return
    setRestocking(true)
    try {
      await api.post('/admin/inventory/restock', {
        productId: restockForm.productId,
        quantity: parseInt(restockForm.quantity),
        notes: restockForm.notes || 'Reposición manual',
      })
      showToast('Stock actualizado correctamente', 'green')
      setShowRestock(false)
      setRestockForm({ productId: '', quantity: '', notes: '' })
      load()
    } catch (err) { showToast(err.message, 'red') }
    finally { setRestocking(false) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 48 }}>Cargando inventario...</div>

  const s = summary?.summary || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Productos activos', value: s.total_products || 0, color: 'var(--green)' },
          { label: 'Sin stock',         value: s.out_of_stock   || 0, color: 'var(--red)' },
          { label: 'Stock bajo',        value: s.low_stock      || 0, color: 'var(--orange)' },
          { label: 'Valor inventario',  value: `RD$${parseFloat(s.inventory_value||0).toLocaleString('es',{maximumFractionDigits:0})}`, color: 'var(--blue)' },
        ].map(k => (
          <div key={k.label} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['summary', '📊 Alertas'], ['movements', '📋 Movimientos']].map(([id, label]) => (
            <button key={id} className={tab === id ? 'btn-primary' : 'btn-ghost'}
              style={{ fontSize: '0.82rem', padding: '7px 14px' }}
              onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
        <button className="btn-primary" style={{ fontSize: '0.82rem' }}
          onClick={() => setShowRestock(true)}>
          ➕ Reponer stock
        </button>
      </div>

      {/* TAB: Alertas */}
      {tab === 'summary' && (
        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 12 }}>
            ⚠️ Alertas de inventario activas ({alerts.length})
          </div>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)' }}>
              ✅ Todos los productos tienen stock óptimo
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Producto</th><th>SKU</th><th>Stock actual</th><th>Umbral</th><th>Alerta</th><th>Desde</th><th>Acción</th></tr>
                </thead>
                <tbody>
                  {alerts.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.emoji} {a.name}</td>
                      <td style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>{a.sku}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: a.stock === 0 ? 'var(--red)' : 'var(--orange)' }}>
                          {a.stock} uds.
                        </span>
                      </td>
                      <td style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{a.low_stock_threshold}</td>
                      <td>
                        <span className={`badge ${a.alert_type === 'out_of_stock' ? 'badge-red' : 'badge-orange'}`}>
                          {a.alert_type === 'out_of_stock' ? '⛔ Agotado' : '⚠️ Stock bajo'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                        {new Date(a.sent_at).toLocaleDateString('es-DO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                          onClick={() => { setRestockForm(f => ({ ...f, productId: a.product_id })); setShowRestock(true) }}>
                          Reponer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: Movimientos */}
      {tab === 'movements' && (
        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 12 }}>📋 Historial de movimientos</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Stock antes</th><th>Stock después</th><th>Referencia</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {movements.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>Sin movimientos registrados</td></tr>
                )}
                {movements.map(m => {
                  const cfg = TYPE_LABELS[m.type] || { label: m.type, badge: 'badge-blue', symbol: '·' }
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.emoji} {m.product_name}</td>
                      <td><span className={`badge ${cfg.badge}`}>{cfg.label}</span></td>
                      <td style={{ fontWeight: 700, color: m.quantity < 0 ? 'var(--red)' : 'var(--green)' }}>
                        {cfg.symbol} {Math.abs(m.quantity)}
                      </td>
                      <td style={{ color: 'var(--text3)' }}>{m.stock_before}</td>
                      <td style={{ fontWeight: 600 }}>{m.stock_after}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                        {m.notes ? m.notes.slice(0, 30) : '—'}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
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
            <h3 className="modal-title">➕ Reponer stock</h3>
            <div className="form-group">
              <label className="form-label">Producto</label>
              <select className="form-input" value={restockForm.productId}
                onChange={e => setRestockForm(f => ({ ...f, productId: e.target.value }))}>
                <option value="">Seleccionar producto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.emoji} {p.name} — Stock: {p.stock}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cantidad a agregar</label>
              <input className="form-input" type="number" min="1" placeholder="Ej: 50"
                value={restockForm.quantity}
                onChange={e => setRestockForm(f => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Notas (opcional)</label>
              <input className="form-input" placeholder="Ej: Recepción de pedido proveedor"
                value={restockForm.notes}
                onChange={e => setRestockForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-primary" style={{ flex: 1 }}
                onClick={handleRestock} disabled={restocking}>
                {restocking ? 'Guardando...' : '✅ Confirmar reposición'}
              </button>
              <button className="btn-ghost" onClick={() => setShowRestock(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
