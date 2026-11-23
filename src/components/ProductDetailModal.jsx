import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { IconX, IconPlus, IconMinus, IconShield, IconPill } from './Icons.jsx'
import styles from './ProductDetailModal.module.css'

export default function ProductDetailModal() {
  const { selectedProduct, setSelectedProduct, addToCart, cart, showToast } = useApp()

  useEffect(() => {
    if (!selectedProduct) return
    const onKey = (e) => { if (e.key === 'Escape') setSelectedProduct(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedProduct, setSelectedProduct])

  if (!selectedProduct) return null

  return (
    <ProductDetailContent
      key={selectedProduct.id}
      p={selectedProduct}
      setSelectedProduct={setSelectedProduct}
      addToCart={addToCart}
      cart={cart}
      showToast={showToast}
    />
  )
}

function ProductDetailContent({ p, setSelectedProduct, addToCart, cart, showToast }) {
  const [qty, setQty] = useState(1)
  const [imgFailed, setImgFailed] = useState(false)
  const cartItem = cart.find(i => i.id === p.id)
  const alreadyInCart = cartItem ? cartItem.qty : 0
  const maxAddable = Math.max(0, p.stock - alreadyInCart)
  const outOfStock = p.stock === 0

  const handleAdd = () => {
    if (outOfStock || maxAddable === 0) return
    const ok = addToCart(p, Math.min(qty, maxAddable))
    if (ok) {
      showToast(`${p.name} (${qty}) agregado al carrito`, 'green')
      setSelectedProduct(null)
    } else {
      showToast('No hay suficiente stock disponible', 'orange')
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && setSelectedProduct(null)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className={styles.dialog}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setSelectedProduct(null)}
          aria-label="Cerrar ficha técnica"
        >
          <IconX size={18} />
        </button>

        <div className={styles.grid}>
          {/* Left: Studio Product Image */}
          <div className={styles.mediaCol}>
            <div className={styles.mediaBox}>
              {p.image && !imgFailed ? (
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div className={styles.mediaFallback}>
                  <IconPill size={40} />
                  <span>{p.name}</span>
                </div>
              )}
            </div>
            {p.requiresPrescription && (
              <div className={styles.rxNotice}>
                <IconShield size={16} />
                <div>
                  <strong>Dispensación bajo receta (Rx)</strong>
                  <span>Deberás confirmar tu número de prescripción en el checkout.</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Contiguous Clinical Purchase Module */}
          <div className={styles.infoCol}>
            <div className={styles.meta}>
              <span>{p.cat}</span>
              {p.sku && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="mono">{p.sku}</span>
                </>
              )}
            </div>

            <h2 id="product-modal-title" className={styles.title}>{p.name}</h2>
            <p className={styles.desc}>{p.desc}</p>

            <div className={styles.priceRow}>
              <span className={`${styles.price} tabular-nums`}>RD${p.price.toFixed(2)}</span>
              <span className={`badge ${outOfStock ? 'badge-red' : p.stock <= (p.lowStockThreshold || 15) ? 'badge-orange' : 'badge-green'}`}>
                {outOfStock ? 'Agotado' : `${p.stock} unidades disponibles`}
              </span>
            </div>

            {/* Clinical Spec Sheet */}
            <dl className={styles.specList}>
              <div className={styles.specRow}>
                <dt>Principio activo</dt>
                <dd>{p.activeIngredient || p.name}</dd>
              </div>
              <div className={styles.specRow}>
                <dt>Presentación</dt>
                <dd>{p.presentation || 'Empaque clínico sellado'}</dd>
              </div>
              <div className={styles.specRow}>
                <dt>Laboratorio</dt>
                <dd>{p.proveedor || 'Laboratorio certificado'}</dd>
              </div>
              <div className={styles.specRow}>
                <dt>Lote / Vencimiento</dt>
                <dd className="mono">{p.lote || 'N/A'} · {p.expiry || 'Vigente'}</dd>
              </div>
            </dl>

            {p.indications && (
              <div className={styles.indications}>
                <strong>Indicaciones y posología</strong>
                <p>{p.indications}</p>
              </div>
            )}

            {/* Purchase Controls */}
            <div className={styles.buyRow}>
              <div className={styles.qtyControl}>
                <button
                  type="button"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1 || outOfStock}
                  aria-label="Disminuir cantidad"
                >
                  <IconMinus size={14} />
                </button>
                <span className="tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(q => Math.min(Math.max(1, maxAddable), q + 1))}
                  disabled={qty >= maxAddable || outOfStock}
                  aria-label="Aumentar cantidad"
                >
                  <IconPlus size={14} />
                </button>
              </div>

              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, padding: '12px 20px' }}
                onClick={handleAdd}
                disabled={outOfStock || maxAddable === 0}
              >
                {outOfStock
                  ? 'Sin stock disponible'
                  : maxAddable === 0
                  ? 'Máximo en carrito'
                  : `Agregar al carrito · RD$${(p.price * qty).toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
