import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, animDelay = 0 }) {
  const { addToCart, removeFromCart, changeQty, showToast, cart } = useApp()
  const [adding, setAdding] = useState(false)

  const cartItem = cart.find(i => i.id === product.id)
  const inCart   = cartItem ? cartItem.qty : 0
  const atMax    = inCart >= product.stock
  const outOfStock = product.stock === 0

  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 15)
  const isExpiringSoon = product.expiry && (() => {
    const days = Math.floor((new Date(product.expiry) - new Date()) / 86400000)
    return days <= 90 && days > 0
  })()

  const handleAdd = async () => {
    if (outOfStock || atMax || adding) return
    setAdding(true)
    const success = addToCart(product)
    if (success) {
      showToast(`${product.name} agregado 🛒`, 'green')
    } else {
      showToast('Stock insuficiente', 'red')
    }
    await new Promise(r => setTimeout(r, 600))
    setAdding(false)
  }

  return (
    <div
      className={`${styles.card} ${outOfStock ? styles.outOfStock : ''}`}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* Badges */}
      <div className={styles.badges}>
        {outOfStock      && <span className="badge badge-red">Agotado</span>}
        {isLowStock      && <span className="badge badge-orange">⚠️ Bajo stock</span>}
        {product.requiresPrescription && <span className="badge badge-blue">Rx</span>}
        {isExpiringSoon  && <span className="badge badge-orange">⏳ Vence pronto</span>}
      </div>

     
{/* Imagen producto */}
<div className={styles.imgWrap}>
  {product.image ? (
    <img
      src={product.image}
      alt={product.name}
      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
    />
  ) : null}
  <span style={{ display: product.image ? 'none' : 'flex', fontSize:'2.2rem', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
    {product.emoji}
  </span>
</div>
      {/* Body */}
      <div className={styles.cat}>{product.cat}</div>
      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.desc}>{product.desc}</p>
      {product.sku && <div className={styles.sku}>SKU: {product.sku}</div>}

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.priceBlock}>
          <div className={styles.price}>RD${product.price.toFixed(2)}</div>
          <div className={styles.stockInfo}>
            {outOfStock ? 'Sin disponibilidad' : `${product.stock} disponibles`}
          </div>
        </div>

        {/* If already in cart, show qty controls */}
        {inCart > 0 && !outOfStock ? (
          <div className={styles.qtyRow}>
            <button className={styles.qtyBtn} onClick={() => changeQty(product.id, -1)}>−</button>
            <span className={styles.qtyNum}>{inCart}</span>
            <button
              className={styles.qtyBtn}
              onClick={handleAdd}
              disabled={atMax}
              title={atMax ? 'Límite de stock alcanzado' : 'Agregar más'}
            >+</button>
          </div>
        ) : (
          <button
            className={`${styles.addBtn} ${outOfStock || atMax ? styles.disabled : ''} ${adding ? styles.addBtnIn : ''}`}
            onClick={handleAdd}
            disabled={outOfStock || atMax}
          >
            {adding ? <span className="spinner" /> : null}
            {outOfStock ? 'Agotado' : atMax ? 'Máx.' : adding ? '' : '+ Carrito'}
          </button>
        )}
      </div>
    </div>
  )
}
