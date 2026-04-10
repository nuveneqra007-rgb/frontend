import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES } from '../data/datos.js'
import styles from './Home.module.css'

export default function Home() {
  const { products, orders } = useApp()
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('Todos')

  const filtered = useMemo(() => products.filter(p => {
    const matchCat    = activeCat === 'Todos' || p.cat === activeCat
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.cat.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  }), [products, search, activeCat])

  const totalOrders = orders.length
  const inStockCount = products.filter(p => p.stock > 0).length

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <div className={styles.heroBadgeDot} />
              Farmacia certificada · Santo Domingo
            </div>

            <h1 className={styles.heroTitle}>
              Tu medicamento,
              <span className={styles.heroAccent}>en minutos</span>
            </h1>

            <p className={styles.heroDesc}>
              Compra medicamentos, vitaminas y más desde la comodidad de tu hogar.
              Entrega rápida, precios justos y atención farmacéutica 24/7.
            </p>

            <div className={styles.heroCta}>
              <Link to="/products" className={styles.heroBtnMain}>
                Ver catálogo →
              </Link>
              <Link to="/contact" className={styles.heroBtnSecondary}>
                📞 Consultarnos
              </Link>
            </div>
          </div>

          {/* Visual card */}
          <div className={styles.heroVisual}>
            <div className={styles.heroCard} style={{ position: 'relative' }}>
<img
  src="https://www.pmfarma.com/articulos/contenido/4331/image/farmaceutica-joven-hispana-sonriendo-segura-de-pie-con-gesto-de-brazos-cruzados-en-la-farmacia.jpg"
  alt="Farmacéutica"
  style={{
    width: '100%',
    height: 'clamp(180px, 25vw, 320px)',
    objectFit: 'cover',
    objectPosition: 'top center',
    borderRadius: '12px',
    display: 'block',
  }}
/>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatVal} style={{ color: 'var(--green)' }}>{inStockCount}+</div>
                  <div className={styles.heroStatLabel}>Productos disponibles</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatVal} style={{ color: 'var(--blue)' }}>24h</div>
                  <div className={styles.heroStatLabel}>Entrega garantizada</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatVal} style={{ color: 'var(--orange)' }}>{totalOrders || '0'}</div>
                  <div className={styles.heroStatLabel}>Pedidos procesados</div>
                </div>
                <div className={styles.heroStat}>
                  <div className={styles.heroStatVal} style={{ color: 'var(--green)' }}>4.9★</div>
                  <div className={styles.heroStatLabel}>Calificación clientes</div>
                </div>
              </div>

              {/* Floating tags */}
              <div className={`${styles.heroFloat} ${styles.heroFloat1}`}>
                <div className={styles.floatDot} style={{ background: 'var(--green)' }} />
                Envío gratis +RD$500
              </div>
              <div className={`${styles.heroFloat} ${styles.heroFloat2}`}>
                <div className={styles.floatDot} style={{ background: 'var(--blue)' }} />
                Pago seguro SSL
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-wrapper">

        {/* ── TRUST BAR ───────────────────────────────────────────────────── */}
        <div className={styles.trustBar}>
          {[
            { icon: '🔒', title: 'Pago 100% Seguro', desc: 'Transacciones protegidas con cifrado SSL', color: 'green' },
            { icon: '🚀', title: 'Envío el mismo día', desc: 'Pedidos antes de las 3pm llegan hoy', color: 'blue' },
            { icon: '💬', title: 'Farmacéutico 24/7', desc: 'Atención y asesoría en cualquier momento', color: 'green' },
          ].map(item => (
            <div key={item.title} className={`card ${styles.trustItem}`}>
              <div className={`${styles.trustIcon} ${item.color === 'green' ? styles.trustIconGreen : styles.trustIconBlue}`}>
                {item.icon}
              </div>
              <div>
                <h4 className={styles.trustTitle}>{item.title}</h4>
                <p className={styles.trustDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── CATALOGUE ───────────────────────────────────────────────────── */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <h2 className="section-title">Nuestro Catálogo</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginTop: 4 }}>
              {products.length} productos · {products.filter(p => p.stock > 0).length} disponibles
            </p>
          </div>
          <div className={styles.searchBox}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" placeholder="Buscar producto..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className={styles.catTabs}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.catTab} ${activeCat === cat ? styles.catTabActive : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} animDelay={i * 45} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>Sin resultados</h3>
            <p>No encontramos productos con ese criterio</p>
            <button className="btn-primary" onClick={() => { setSearch(''); setActiveCat('Todos') }}>
              Limpiar filtros
            </button>
          </div>
        )}

        {/* CTA bottom */}
        <div style={{
          marginTop: 56, padding: '40px 32px', borderRadius: 'var(--r-xl)',
          background: 'linear-gradient(135deg, var(--green-light), var(--blue-light))',
          border: '1px solid var(--border)', textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 10 }}>
            ¿Necesitas una receta? 👨‍⚕️
          </h3>
          <p style={{ color: 'var(--text2)', marginBottom: 22, maxWidth: 480, margin: '0 auto 22px' }}>
            Consulta con nuestros farmacéuticos certificados sin costo adicional.
            Atención personalizada para toda la familia.
          </p>
          <Link to="/contact" className="btn-primary" style={{ fontSize: '0.95rem', padding: '12px 28px' }}>
            Contactar farmacéutico →
          </Link>
        </div>
      </div>
    </div>
  )
}
