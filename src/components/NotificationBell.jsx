import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api.js'
import { useApp } from '../context/AppContext.jsx'
import { IconBell, IconAlert, IconPackage, IconCheck } from './Icons.jsx'

export default function NotificationBell() {
  const { user } = useApp()
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!user) return undefined
    const fetchCount = () => {
      api.get('/notifications/unread-count')
        .then(d => setCount(d.count || 0))
        .catch(() => {})
    }
    fetchCount()
    const id = setInterval(fetchCount, 30000)
    return () => clearInterval(id)
  }, [user])

  const handleOpen = async () => {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) {
      setLoading(true)
      try {
        const res = await api.get('/notifications?limit=10')
        setNotifs(res.data || [])
      } catch {
        // silent fallback
      } finally {
        setLoading(false)
      }
    }
  }

  const handleMarkAll = async () => {
    await api.patch('/notifications/read-all').catch(() => {})
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setCount(0)
  }

  const renderIcon = (type) => {
    if (type === 'low_stock' || type === 'out_of_stock') {
      return <IconAlert size={15} />
    }
    return <IconPackage size={15} />
  }

  if (!user) return null

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notificaciones"
        style={{
          position: 'relative',
          background: open ? 'var(--bg2)' : 'var(--white)',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          width: 38,
          height: 38,
          borderRadius: 'var(--r-sm)',
          color: 'var(--text2)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 150ms, border-color 150ms',
        }}
      >
        <IconBell size={17} />
        {count > 0 && (
          <span
            className="tabular-nums"
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
              background: 'var(--red)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              borderRadius: 4,
              minWidth: 17,
              height: 17,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--white)',
            }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            zIndex: 1000,
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r)',
            boxShadow: 'var(--shadow-lg)',
            width: 340,
            maxHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg)',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text)' }}>
              Notificaciones
            </span>
            {notifs.some(n => !n.is_read) && (
              <button
                type="button"
                onClick={handleMarkAll}
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--green-dark)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <IconCheck size={13} />
                Marcar todo leído
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: '0.84rem' }}>
                Cargando alertas...
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 28, color: 'var(--text3)', fontSize: '0.84rem' }}>
                Sin notificaciones pendientes
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: n.is_read ? 'var(--white)' : 'var(--green-light)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span
                      style={{
                        color: n.type === 'out_of_stock' ? 'var(--red)' : n.type === 'low_stock' ? 'var(--orange)' : 'var(--green)',
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    >
                      {renderIcon(n.type)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: '0.83rem', color: 'var(--text)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 2, lineHeight: 1.45 }}>
                        {n.message}
                      </div>
                      <div className="tabular-nums" style={{ fontSize: '0.72rem', color: 'var(--text4)', marginTop: 4 }}>
                        {new Date(n.created_at).toLocaleDateString('es-DO', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
