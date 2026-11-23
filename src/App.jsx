import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useApp } from './context/AppContext.jsx'
import Navbar from './components/Navbar.jsx'
import ProductDetailModal from './components/ProductDetailModal.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import Admin from './pages/Admin.jsx'
import Cart from './components/Cart.jsx'
import Login from './components/Login.jsx'
import Contact from './pages/Contact.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderHistory from './pages/OrderHistory.jsx'
import {
  IconCheck,
  IconAlert,
  IconX,
  IconCrossBrand,
  IconMapPin,
  IconPhone,
  IconMail,
  IconClock,
  IconShield,
} from './components/Icons.jsx'

// ── Protected routes ──────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

// ── Toast renderer ────────────────────────────────────────────────────────────
function ToastContainer() {
  const { toasts } = useApp()
  const renderIcon = (type) => {
    if (type === 'red') return <IconX size={15} />
    if (type === 'orange') return <IconAlert size={15} />
    if (type === 'blue') return <IconShield size={15} />
    return <IconCheck size={15} />
  }

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span style={{ display: 'inline-flex', flexShrink: 0 }}>{renderIcon(t.type)}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        background: 'var(--white)',
        borderTop: '1px solid var(--border)',
        marginTop: 72,
        padding: '44px 24px 32px',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 32,
            marginBottom: 32,
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.08rem',
                color: 'var(--text)',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: 'var(--green-light)',
                  color: 'var(--green-dark)',
                  border: '1px solid rgba(16, 154, 100, 0.22)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconCrossBrand size={16} />
              </div>
              <span>TuFarmacia</span>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text3)', lineHeight: 1.65, maxWidth: 250 }}>
              Farmacia clínica digital en República Dominicana. Trazabilidad farmacéutica, despacho certificado y atención profesional.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.76rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text3)',
                marginBottom: 12,
              }}
            >
              Navegación
            </div>
            {[
              { to: '/', label: 'Inicio' },
              { to: '/products', label: 'Catálogo de productos' },
              { to: '/orders', label: 'Mis pedidos' },
              { to: '/contact', label: 'Atención farmacéutica' },
            ].map(l => (
              <div key={l.to} style={{ marginBottom: 8 }}>
                <Link
                  to={l.to}
                  style={{ fontSize: '0.85rem', color: 'var(--text2)', fontWeight: 500 }}
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.76rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text3)',
                marginBottom: 12,
              }}
            >
              Contacto
            </div>
            {[
              { Icon: IconMapPin, text: 'Av. Independencia 123, Santo Domingo' },
              { Icon: IconPhone, text: '(809) 555-0100' },
              { Icon: IconMail, text: 'hola@tufarmacia.com' },
              { Icon: IconClock, text: 'Lun–Sáb 8am–8pm · Dom 10am–6pm' },
            ].map(({ Icon, text }) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 9,
                  fontSize: '0.83rem',
                  color: 'var(--text3)',
                }}
              >
                <Icon size={14} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
            © {new Date().getFullYear()} TuFarmacia · Dispensación farmacéutica certificada en República Dominicana
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--green-dark)', fontWeight: 600 }}>
            <IconShield size={14} />
            <span>Control sanitario y trazabilidad por lote</span>
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
      <ProductDetailModal />
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
