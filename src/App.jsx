import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useApp } from './context/AppContext.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import Admin from './pages/Admin.jsx'
import Cart from './components/Cart.jsx'
import Login from './components/Login.jsx'
import Contact from './pages/Contact.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderHistory from './pages/OrderHistory.jsx'

// ── Protected routes ──────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { user } = useApp()
  if (!user)                  return <Navigate to="/login" replace />
  if (user.role !== 'admin')  return <Navigate to="/" replace />
  return children
}
function PrivateRoute({ children }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  return children
}

// ── Scroll to top on route change ─────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [pathname])
  return null
}

// ── Toast renderer ────────────────────────────────────────────────────────────
function ToastContainer() {
  const { toasts } = useApp()
  const icons = { green: '✅', blue: 'ℹ️', red: '❌', orange: '⚠️' }
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{icons[t.type] ?? '✅'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: 'var(--white)', borderTop: '1px solid var(--border)',
      marginTop: 72, padding: '40px 24px 32px',
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--green)', marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, background: 'var(--green-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <path d="M10 16h12M16 10v12" stroke="#18b876" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              TuFarmacia
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text3)', lineHeight: 1.65, maxWidth: 220 }}>
              Tu farmacia de confianza en República Dominicana. Salud accesible para todos.
            </p>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 12 }}>Empresa</div>
            {['Inicio', 'Productos', 'Contacto', 'Políticas de privacidad'].map(l => (
              <div key={l} style={{ marginBottom: 8 }}>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text2)', transition: 'color .15s' }}
                   onMouseOver={e => e.target.style.color = 'var(--green)'}
                   onMouseOut={e => e.target.style.color = 'var(--text2)'}>{l}</a>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 12 }}>Contacto</div>
            {[
              { icon: '📍', text: 'Santo Domingo, República Dominicana' },
              { icon: '📞', text: '(809) 555-0100' },
              { icon: '✉️', text: 'hola@tufarmacia.com' },
              { icon: '🕐', text: 'Lun–Sáb 8am–8pm · Dom 10am–6pm' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: '0.82rem', color: 'var(--text3)' }}>
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text4)' }}>
            © 2025 TuFarmacia · Todos los derechos reservados
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['📘', '📸', '🐦', '📱'].map((icon, i) => (
              <button key={i} style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'var(--bg)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', cursor: 'pointer', transition: 'all .2s',
              }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--green-light)'; e.currentTarget.style.borderColor = 'rgba(24,184,118,.3)' }}
                onMouseOut={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >{icon}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <ToastContainer />
      <ScrollToTop />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart"     element={<Cart />} />
        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/orders"   element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
        <Route path="/admin"    element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/login"    element={<Login mode="login" />} />
        <Route path="/register" element={<Login mode="register" />} />
        <Route path="/contact"  element={<Contact />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}
