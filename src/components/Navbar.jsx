import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import NotificationBell from './NotificationBell.jsx'
import { IconCart, IconCrossBrand, IconUser } from './Icons.jsx'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { cartCount, user, logout, showToast, lowStockProducts, outOfStockProducts } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [openPath, setOpenPath] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const menuOpen = openPath === location.pathname

  const alertCount = lowStockProducts.length + outOfStockProducts.length

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenPath(null) }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    showToast('Sesión cerrada correctamente', 'blue')
    navigate('/')
    setOpenPath(null)
  }

  const navLinks = [
    { to: '/',         label: 'Inicio',      end: true },
    { to: '/products', label: 'Catálogo' },
    { to: '/contact',  label: 'Contacto' },
  ]
  if (user)                   navLinks.push({ to: '/orders', label: 'Mis Pedidos' })
  if (user?.role === 'admin') navLinks.push({ to: '/admin',  label: 'Admin', badge: alertCount })

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`} ref={menuRef}>
      <div className={styles.inner}>
        {/* Zone 1: Brand Wordmark */}
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoMark}>
            <IconCrossBrand size={16} />
          </span>
          <span className={styles.logoText}>TuFarmacia</span>
        </NavLink>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav className={styles.links} aria-label="Navegación principal">
          {navLinks.map(({ to, label, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <span>{label}</span>
              {badge > 0 && <span className={`${styles.navAlert} tabular-nums`}>{badge}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Primary Action Cluster */}
        <div className={styles.actions}>
          {user && <NotificationBell />}

          <NavLink
            to="/cart"
            className={({ isActive }) => `${styles.cartBtn} ${isActive ? styles.cartBtnActive : ''}`}
            aria-label={`Carrito con ${cartCount} productos`}
          >
            <IconCart size={16} />
            <span>Carrito</span>
            {cartCount > 0 && (
              <span className={`${styles.badge} tabular-nums`}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </NavLink>

          {user ? (
            <div className={styles.accountCluster}>
              <span className={styles.accountName} title={user.email}>
                <IconUser size={14} />
                <span>{user.name.split(' ')[0]}</span>
              </span>
              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                Salir
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
              Iniciar Sesión
            </NavLink>
          )}

          {/* Mobile Hamburger */}
          <button
            type="button"
            className={`${styles.menuBtn} ${menuOpen ? styles.open : ''}`}
            onClick={() => setOpenPath(p => (p === location.pathname ? null : location.pathname))}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            <span><i /><i /><i /></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
        {navLinks.map(({ to, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`}
          >
            <span>{label}</span>
            {badge > 0 && <span className={`${styles.navAlert} tabular-nums`}>{badge}</span>}
          </NavLink>
        ))}

        <div className={styles.mobileFooter}>
          {user ? (
            <>
              <div className={styles.mobileUserMeta}>
                <strong>{user.name}</strong>
                <span>{user.email} · {user.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
              </div>
              <button type="button" className="btn-ghost" style={{ width: '100%' }} onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <div className={styles.mobileAuthRow}>
              <NavLink to="/login" className="btn-outline" style={{ flex: 1 }}>Iniciar Sesión</NavLink>
              <NavLink to="/register" className="btn-primary" style={{ flex: 1 }}>Crear Cuenta</NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
