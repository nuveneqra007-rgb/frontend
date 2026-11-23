import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES, HERO_IMAGE } from '../data/datos.js'
import {
  IconSearch,
  IconArrowRight,
  IconShield,
  IconTruck,
  IconStethoscope,
  IconLock,
} from '../components/Icons.jsx'
import styles from './Home.module.css'

export default function Home() {
  const { products, orders } = useApp()
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('Todos')

  const filtered = useMemo(() => products.filter(p => {
    const matchCat = activeCat === 'Todos' || p.cat === activeCat
    const q = search.trim().toLowerCase()
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.cat.toLowerCase().includes(q) ||
      (p.activeIngredient || '').toLowerCase().includes(q)
    return matchCat && matchSearch
  }), [products, search, activeCat])

  const visibleProducts = search || activeCat !== 'Todos' ? filtered : filtered.slice(0, 8)
  const inStockCount = products.filter(p => p.stock > 0).length
  const totalOrders = orders.length

  return (
    <div>
      {/* ── HERO SPLIT ──────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Tu medicamento,
              <br />
              <span className={styles.heroTitleAccent}>en minutos</span>
            </h1>

            <p className={styles.heroDesc}>
              Compra medicamentos, vitaminas y más desde la comodidad de tu hogar. Entrega rápida, precios justos y atención farmacéutica 24/7.
            </p>

            <div className={styles.heroCta}>
              <Link to="/products" className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.94rem' }}>
                <span>Explorar catálogo</span>
                <IconArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn-outline" style={{ padding: '12px 22px', fontSize: '0.94rem' }}>
                Consultar farmacéutico
              </Link>
            </div>
          </div>

          <div className={styles.heroMedia}>
            <img
              src={HERO_IMAGE}
              alt="Farmacéutica clínica revisando inventario en TuFarmacia"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Full-width 4-column metric & trust strip below the hero split */}
        <div className={styles.metricsBand}>
          <div className={styles.metricsGrid}>
            <div className={styles.metricItem}>
              <IconShield size={18} className={styles.metricIcon} />
              <div>
                <div className={`${styles.metricValue} tabular-nums`}>{inStockCount} referencias</div>
                <div className={styles.metricLabel}>Stock verificado con control de lote</div>
              </div>
            </div>
            <div className={styles.metricItem}>
              <IconTruck size={18} className={styles.metricIcon} />
              <div>
                <div className={styles.metricValue}>Entrega hoy mismo</div>
                <div className={styles.metricLabel}>Gratis en pedidos sobre RD$500</div>
              </div>
            </div>
            <div className={styles.metricItem}>
              <IconStethoscope size={18} className={styles.metricIcon} />
              <div>
                <div className={styles.metricValue}>Validación clínica Rx</div>
                <div className={styles.metricLabel}>Dispensación responsable y asesoría</div>
              </div>
            </div>
            <div className={styles.metricItem}>
              <IconLock size={18} className={styles.metricIcon} />
              <div>
                <div className={`${styles.metricValue} tabular-nums`}>{totalOrders}+ órdenes</div>
                <div className={styles.metricLabel}>Facturación con ITBIS 18% transparente</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED CATALOGUE ──────────────────────────────────────────── */}
      <div className="page-wrapper">
        <div className={styles.sectionHeader}>
          <div>
            <h2 className="section-title">Catálogo farmacéutico</h2>
            <p className={`${styles.sectionSub} tabular-nums`}>
              {products.length} productos registrados · {inStockCount} con disponibilidad inmediata
            </p>
          </div>

          <div className={styles.searchBox}>
            <IconSearch size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar medicamento o principio activo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Buscar producto"
            />
          </div>
        </div>

        {/* Segmented Category Filter Controls */}
        <div className={styles.catTabs} role="tablist" aria-label="Categorías de productos">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCat === cat}
              className={`${styles.catTab} ${activeCat === cat ? styles.catTabActive : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {visibleProducts.length > 0 ? (
          <>
            <div className={styles.grid}>
              {visibleProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} animDelay={i * 25} />
              ))}
            </div>

            {!search && activeCat === 'Todos' && filtered.length > 8 && (
              <div className={styles.viewAllWrap}>
                <Link to="/products" className="btn-outline">
                  <span>Ver los {filtered.length} productos del catálogo</span>
                  <IconArrowRight size={15} />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="card empty-state">
            <div className="empty-icon">
              <IconSearch size={24} />
            </div>
            <h3>Sin resultados</h3>
            <p>No encontramos productos que coincidan con "{search}".</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => { setSearch(''); setActiveCat('Todos') }}
            >
              Restablecer filtros
            </button>
          </div>
        )}

        {/* ── CLINICAL ASSISTANCE CALLOUT ───────────────────────────────── */}
        <section className={styles.consultCard}>
          <div className={styles.consultText}>
            <h3>¿Necesitas orientación sobre dosis o recetas?</h3>
            <p>
              Nuestro equipo de farmacéuticos colegiados responde consultas sobre interacciones,
              equivalencias genéricas y disponibilidad de antibióticos bajo receta.
            </p>
          </div>
          <Link to="/contact" className="btn-primary">
            <span>Contactar al equipo clínico</span>
            <IconArrowRight size={15} />
          </Link>
        </section>
      </div>
    </div>
  )
}
