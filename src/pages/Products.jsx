import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES } from '../data/datos.js'
import styles from './Products.module.css'

export default function Products() {
  const { products, lowStockProducts, outOfStockProducts } = useApp()
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('Todos')
  const [sortBy, setSortBy] = useState('default')
  const [hideOutOfStock, setHideOutOfStock] = useState(false)

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchCat  = activeCat === 'Todos' || p.cat === activeCat
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.cat.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase())
      const matchStock  = !hideOutOfStock || p.stock > 0
      return matchCat && matchSearch && matchStock
    })
    if (sortBy === 'price-asc')  list = [...list].sort((a,b) => a.price - b.price)
    if (sortBy === 'price-desc') list = [...list].sort((a,b) => b.price - a.price)
    if (sortBy === 'name')       list = [...list].sort((a,b) => a.name.localeCompare(b.name))
    if (sortBy === 'stock')      list = [...list].sort((a,b) => b.stock - a.stock)
    return list
  }, [products, search, activeCat, sortBy, hideOutOfStock])

  const inStock  = products.filter(p => p.stock > 0).length
  const hasFilter = search || activeCat !== 'Todos'

  return (
    <div className="page-wrapper">

      {/* Stock alert banner */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className={styles.alertBanner}>
          ⚠️
          <span>
            <strong>{outOfStockProducts.length}</strong> productos agotados ·
            <strong> {lowStockProducts.length}</strong> con stock bajo
          </span>
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className="section-title">💊 Catálogo</h2>
          <p className={styles.headerSub}>
            {inStock} disponibles · <span style={{ color: 'var(--red)' }}>{outOfStockProducts.length} sin stock</span>
          </p>
        </div>
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" placeholder="Buscar nombre, SKU..."
              value={search} onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch('')} aria-label="Borrar búsqueda">✕</button>
            )}
          </div>
          <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="default">Ordenar</option>
            <option value="price-asc">Precio ↑</option>
            <option value="price-desc">Precio ↓</option>
            <option value="name">Nombre A–Z</option>
            <option value="stock">Mayor stock</option>
          </select>
        </div>
      </div>

      {/* Category tabs + stock toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <div className={styles.catTabs} style={{ margin: 0, flex: 1 }}>
          {CATEGORIES.map(cat => {
            const count = cat === 'Todos' ? products.length : products.filter(p => p.cat === cat).length
            return (
              <button
                key={cat}
                className={`${styles.catTab} ${activeCat === cat ? styles.active : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat}
                <span className={styles.catCount}>{count}</span>
              </button>
            )
          })}
        </div>
        <label className={styles.stockToggle}>
          <input
            type="checkbox" checked={hideOutOfStock}
            onChange={e => setHideOutOfStock(e.target.checked)}
            style={{ accentColor: 'var(--green)' }}
          />
          Ocultar agotados
        </label>
      </div>

      {/* Result info */}
      {hasFilter && (
        <div className={styles.resultInfo}>
          <strong>{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''}
          {search && <span>para "<strong>{search}</strong>"</span>}
          {activeCat !== 'Todos' && <span>en <strong>{activeCat}</strong></span>}
          <button className={styles.clearAll} onClick={() => { setSearch(''); setActiveCat('Todos') }}>
            Limpiar filtros ✕
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((p, i) => <ProductCard key={p.id} product={p} animDelay={i * 40} />)}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Sin resultados</h3>
          <p>No encontramos productos con ese criterio de búsqueda</p>
          <button className="btn-primary" onClick={() => { setSearch(''); setActiveCat('Todos'); setHideOutOfStock(false) }}>
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  )
}
