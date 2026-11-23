import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { CATEGORIES } from '../data/datos.js'
import { IconSearch, IconX, IconAlert } from '../components/Icons.jsx'
import styles from './Products.module.css'

export default function Products() {
  const { products, lowStockProducts, outOfStockProducts } = useApp()
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('Todos')
  const [sortBy, setSortBy] = useState('default')
  const [hideOutOfStock, setHideOutOfStock] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = products.filter(p => {
      const matchCat = activeCat === 'Todos' || p.cat === activeCat
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.cat.toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.activeIngredient || '').toLowerCase().includes(q)
      const matchStock = !hideOutOfStock || p.stock > 0
      return matchCat && matchSearch && matchStock
    })
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === 'stock') list = [...list].sort((a, b) => b.stock - a.stock)
    return list
  }, [products, search, activeCat, sortBy, hideOutOfStock])

  const inStock = products.filter(p => p.stock > 0).length
  const hasFilter = search || activeCat !== 'Todos' || hideOutOfStock

  return (
    <div className="page-wrapper">
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className={styles.alertBanner}>
          <IconAlert size={16} />
          <span className="tabular-nums">
            Inventario activo: <strong>{outOfStockProducts.length}</strong> agotados ·{' '}
            <strong>{lowStockProducts.length}</strong> con reposición pendiente
          </span>
        </div>
      )}

      <div className={styles.pageHeader}>
        <div>
          <h2 className="section-title">Catálogo completo</h2>
          <p className={`${styles.headerSub} tabular-nums`}>
            {inStock} disponibles · {outOfStockProducts.length} sin existencias
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <IconSearch size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar nombre, SKU o principio activo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
              aria-label="Buscar en catálogo"
            />
            {search && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setSearch('')}
                aria-label="Borrar búsqueda"
              >
                <IconX size={14} />
              </button>
            )}
          </div>

          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Ordenar productos"
          >
            <option value="default">Orden predeterminado</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre A–Z</option>
            <option value="stock">Mayor stock</option>
          </select>
        </div>
      </div>

      {/* Category Filter Bar + Availability Toggle */}
      <div className={styles.filterToolbar}>
        <div className={styles.catTabs} role="tablist" aria-label="Filtrar por categoría">
          {CATEGORIES.map(cat => {
            const count = cat === 'Todos' ? products.length : products.filter(p => p.cat === cat).length
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCat === cat}
                className={`${styles.catTab} ${activeCat === cat ? styles.active : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                <span>{cat}</span>
                <span className={`${styles.catCount} tabular-nums`}>{count}</span>
              </button>
            )
          })}
        </div>

        <label className={styles.stockToggle}>
          <input
            type="checkbox"
            checked={hideOutOfStock}
            onChange={e => setHideOutOfStock(e.target.checked)}
          />
          <span>Ocultar agotados</span>
        </label>
      </div>

      {hasFilter && (
        <div className={styles.resultInfo}>
          <span className="tabular-nums">
            <strong>{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''}
          </span>
          {search && <span>para "{search}"</span>}
          {activeCat !== 'Todos' && <span>en {activeCat}</span>}
          <button
            type="button"
            className={styles.clearAll}
            onClick={() => { setSearch(''); setActiveCat('Todos'); setHideOutOfStock(false) }}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} animDelay={i * 20} />
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <div className="empty-icon">
            <IconSearch size={24} />
          </div>
          <h3>Sin resultados</h3>
          <p>No encontramos productos que coincidan con tu búsqueda actual.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => { setSearch(''); setActiveCat('Todos'); setHideOutOfStock(false) }}
          >
            Ver todos los productos
          </button>
        </div>
      )}
    </div>
  )
}
