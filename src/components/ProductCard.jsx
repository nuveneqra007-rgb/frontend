import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { resolveProductImage } from '../services/api.js'
import { IconPlus, IconMinus, IconPill } from './Icons.jsx'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, animDelay = 0 }) {
  const { products, addToCart, changeQty, showToast, cart, setSelectedProduct } = useApp()
  const [failedSrc, setFailedSrc] = useState(null)

  const cartItem = cart.find(i => i.id === product.id)
  const inCart = cartItem ? cartItem.qty : 0
  const atMax = inCart >= product.stock
  const outOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 15)
  const imageSrc = product.image || resolveProductImage(product, products)
  const showImage = Boolean(imageSrc) && failedSrc !== imageSrc

  // At most 1 subtle contextual status tag on the product media frame
  let statusTag = null
  if (outOfStock) {
    statusTag = { label: 'Agotado', cls: styles.tagRed }
  } else if (product.requiresPrescription) {
    statusTag = { label: 'Requiere receta Rx', cls: styles.tagBlue }
  } else if (isLowStock) {
    statusTag = { label: 'Últimas unidades', cls: styles.tagAmber }
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    if (outOfStock || atMax) return
    const success = addToCart(product, 1)
    if (success) {
      showToast(`${product.name} agregado al carrito`, 'green')
    } else {
      showToast('Stock máximo alcanzado', 'orange')
    }
  }

  return (
    <article
      className={`${styles.card} ${outOfStock ? styles.outOfStock : ''}`}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* Product Studio Media (65-75% focal proportion, 4:3) */}
      <button
        type="button"
        className={styles.imgWrap}
        onClick={() => setSelectedProduct(product)}
        aria-label={`Ver ficha clínica de ${product.name}`}
      >
        {showImage ? (
          <img
            src={imageSrc}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setFailedSrc(imageSrc)}
          />
        ) : (
          <div className={styles.imgFallback}>
            <IconPill size={30} />
            <span>{product.name}</span>
            <span className={styles.pendingLabel}>Imagen pendiente</span>
          </div>
        )}

        {statusTag && (
          <span className={`${styles.cornerTag} ${statusTag.cls}`}>
            {statusTag.label}
          </span>
        )}
      </button>

      {/* Clean unboxed metadata separated by typographic dot */}
      <div className={styles.metaRow}>
        <span>{product.cat}</span>
        {product.sku && (
          <>
            <span aria-hidden="true">·</span>
            <span className="mono">{product.sku}</span>
          </>
        )}
      </div>

      <h3 className={styles.name}>
        <button
          type="button"
          className={styles.nameBtn}
          onClick={() => setSelectedProduct(product)}
        >
          {product.name}
        </button>
      </h3>

      <p className={styles.desc}>{product.desc}</p>

      {/* Footer: Tabular price + contiguous cart action */}
      <div className={styles.footer}>
        <div>
          <div className={`${styles.price} tabular-nums`}>
            RD${product.price.toFixed(2)}
          </div>
          <div className={`${styles.stockInfo} tabular-nums`}>
            {outOfStock ? 'Sin disponibilidad' : `${product.stock} disponibles`}
          </div>
        </div>

        {inCart > 0 && !outOfStock ? (
          <div className={styles.qtyRow}>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={() => changeQty(product.id, -1)}
              aria-label={`Reducir cantidad de ${product.name}`}
            >
              <IconMinus size={14} />
            </button>
            <span className={`${styles.qtyNum} tabular-nums`}>{inCart}</span>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={handleAdd}
              disabled={atMax}
              aria-label={`Aumentar cantidad de ${product.name}`}
            >
              <IconPlus size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={`${styles.addBtn} ${outOfStock || atMax ? styles.disabled : ''}`}
            onClick={handleAdd}
            disabled={outOfStock || atMax}
          >
            {outOfStock ? 'Agotado' : (
              <>
                <IconPlus size={14} />
                <span>Agregar</span>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  )
}
