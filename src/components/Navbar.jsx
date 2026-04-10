import { useState, useEffect, useRef } from 'react'
import NotificationBell from './NotificationBell.jsx'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { cartCount, user, logout, showToast, lowStockProducts, outOfStockProducts } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)

  const alertCount = lowStockProducts.length + outOfStockProducts.length

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    showToast('Sesión cerrada', 'blue')
    navigate('/')
    setMenuOpen(false)
  }

  const navLinks = [
    { to: '/',         label: 'Inicio',    icon: '🏠', end: true },
    { to: '/products', label: 'Productos', icon: '💊' },
    { to: '/contact',  label: 'Contacto',  icon: '📞' },
  ]
  if (user?.role === 'admin') navLinks.push({ to: '/admin', label: 'Admin', icon: '🛡️', badge: alertCount })
  if (user)                   navLinks.push({ to: '/orders', label: 'Mis Pedidos', icon: '📦' })

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`} ref={menuRef}>
      <div className={styles.inner}>

        {/* Logo */}
        <NavLink to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M10 16h12M16 10v12" stroke="#18b876" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="9" cy="9" r="3.5" fill="#2172e5" opacity=".7"/>
              <circle cx="23" cy="23" r="3.5" fill="#18b876" opacity=".8"/>
            </svg>
          </div>
          <span>TuFarmacia</span>
        </NavLink>

        {/* Desktop links */}
        <div className={styles.links}>
          {navLinks.map(({ to, label, end, badge }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {label}
              {badge > 0 && <span className={styles.alertDot}>{badge}</span>}
            </NavLink>
          ))}
        </div>

        {/* Desktop actions */}
        <div className={styles.actions}>
          <NotificationBell />
          <NavLink to="/cart"
            className={({ isActive }) => `${styles.cartBtn} ${isActive ? styles.cartBtnActive : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Carrito
            {cartCount > 0 && <span className={styles.badge}>{cartCount > 99 ? '99+' : cartCount}</span>}
          </NavLink>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={styles.userPill}>
                <div className={`${styles.userAvatar} ${user.role === 'admin' ? styles.admin : ''}`}>
                  {user.role === 'admin' ? '🛡️' : user.name[0].toUpperCase()}
                </div>
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                <span className={`${styles.userRole} ${user.role === 'admin' ? styles.admin : ''}`}>
                  {user.role === 'admin' ? 'Admin' : 'Cliente'}
                </span>
              </div>
              <button className="btn-ghost" style={{ fontSize: '0.82rem', padding: '7px 14px' }} onClick={handleLogout}>
                Salir
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className="btn-outline" style={{ fontSize: '0.83rem', padding: '8px 16px' }}>
                Iniciar Sesión
              </NavLink>
              <NavLink to="/register" className="btn-primary" style={{ fontSize: '0.83rem', padding: '8px 16px' }}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`${styles.menuBtn} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menú"
        >
          <span>
            <i /><i /><i />
          </span>
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        {navLinks.map(({ to, label, icon, end, badge }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`}
          >
            {icon} {label}
            {badge > 0 && <span className={styles.alertDot} style={{ position: 'static', marginLeft: 4 }}>{badge}</span>}
          </NavLink>
        ))}

        <div className={styles.mobileCartRow}>
          <NavLink to="/cart" className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
            🛒 Carrito {cartCount > 0 && `(${cartCount})`}
          </NavLink>
        </div>

        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <div className={`${styles.userAvatar} ${user.role === 'admin' ? styles.admin : ''}`} style={{ width: 32, height: 32 }}>
                {user.role === 'admin' ? '🛡️' : user.name[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{user.email}</div>
              </div>
            </div>
            <button className="btn-ghost" style={{ justifyContent: 'center' }} onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className={styles.mobileAuthRow}>
            <NavLink to="/login" className="btn-outline">Iniciar Sesión</NavLink>
            <NavLink to="/register" className="btn-primary">Registrarse</NavLink>
          </div>
        )}
      </div>
    </nav>
  )
}
