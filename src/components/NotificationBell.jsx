import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'

export default function NotificationBell() {
  const { user } = useApp()
  const [count, setCount]   = useState(0)
  const [open, setOpen]     = useState(false)
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Polling cada 30s para el badge
  const fetchCount = () => {
    if (!user) return
    api.get('/notifications/unread-count')
      .then(d => setCount(d.count))
      .catch(() => {})
  }

  useEffect(() => {
    fetchCount()
    const id = setInterval(fetchCount, 30000)
    return () => clearInterval(id)
  }, [user])

  const handleOpen = async () => {
    setOpen(o => !o)
    if (!open) {
      setLoading(true)
      try {
        const res = await api.get('/notifications?limit=10')
        setNotifs(res.data || [])
        setCount(0) // marcar como visto visualmente
      } catch (_) {}
      finally { setLoading(false) }
    }
  }

  const handleMarkAll = async () => {
    await api.patch('/notifications/read-all')
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setCount(0)
  }

  const TYPE_ICONS = {
    low_stock: '⚠️', out_of_stock: '⛔',
    order_created: '🛒', order_updated: '📦',
  }

  if (!user) return null

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        onClick={handleOpen}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: '6px 8px', borderRadius: 8,
          color: 'var(--text2)', fontSize: '1.1rem',
          transition: 'background .15s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'var(--bg2)'}
        onMouseOut={e => e.currentTarget.style.background = 'none'}
        title="Notificaciones"
      >
        🔔
        {count > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: 'var(--red)', color: 'white',
            fontSize: '0.65rem', fontWeight: 800,
            borderRadius: '50%', minWidth: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 1000,
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.12)',
          width: 340, maxHeight: 420, display: 'flex', flexDirection: 'column',
          marginTop: 6,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px 10px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>🔔 Notificaciones</span>
            {notifs.some(n => !n.is_read) && (
              <button onClick={handleMarkAll}
                style={{ fontSize: '0.75rem', color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Marcar todo leído
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>Cargando...</div>
            ) : notifs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🎉</div>
                Sin notificaciones nuevas
              </div>
            ) : notifs.map(n => (
              <div key={n.id} style={{
                padding: '10px 16px', borderBottom: '1px solid var(--border)',
                background: n.is_read ? 'transparent' : 'var(--green-light)',
                transition: 'background .15s',
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1rem', marginTop: 1 }}>
                    {TYPE_ICONS[n.type] || '📢'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: '0.83rem' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 2 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text4)', marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleDateString('es-DO', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {!n.is_read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', marginTop: 4, flexShrink: 0 }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
