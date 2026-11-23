import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../data/datos.js'
import {
  IconCart,
  IconTrash,
  IconPlus,
  IconMinus,
  IconPill,
  IconAlert,
  IconArrowRight,
} from '../components/Icons.jsx'
import styles from './Cart.module.css'

export default function Cart() {
  const {
    cart, removeFromCart, changeQty, clearCart,
    cartSubtotal, cartTax, cartTotal, cartCount, user, showToast,
  } = useApp()
  const navigate = useNavigate()
  const [removingId, setRemovingId] = useState(null)

  const shipping = cartSubtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const grandTotal = cartTotal + shipping
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal)
  const hasRxItems = cart.some(i => i.requiresPrescription)

  const handleRemove = (item) => {
    setRemovingId(item.id)
    setTimeout(() => {
      removeFromCart(item.id)
      setRemovingId(null)
      showToast(`${item.name} eliminado del carrito`, 'red')
    }, 220)
  }

  const handleCheckout = () => {
    if (!user) {
      showToast('Inicia sesión para completar tu pedido', 'orange')
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="card empty-state">
          <div className="empty-icon">
            <IconCart size={26} />
          </div>
          <h3>Tu carrito está vacío</h3>
          <p>Explora nuestro catálogo certificado y agrega los medicamentos o suplementos que necesitas.</p>
          <Link to="/products" className="btn-primary">
            <span>Explorar catálogo</span>
            <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div className={styles.topRow}>
        <div>
          <h2 className="section-title">Carrito de compras</h2>
          <p className={`${styles.topSub} tabular-nums`}>
            {cartCount} {cartCount === 1 ? 'unidad seleccionada' : 'unidades seleccionadas'}
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          style={{ color: 'var(--red)', borderColor: 'rgba(220,38,38,.25)' }}
          onClick={() => { clearCart(); showToast('Carrito vaciado', 'orange') }}
        >
          <IconTrash size={15} />
          <span>Vaciar carrito</span>
        </button>
      </div>

      <div className={styles.layout}>
        <div className={`card ${styles.cartCard}`}>
          <div className={styles.cartHeader}>
            <h3>Productos seleccionados</h3>
            <span className="tabular-nums" style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>
              {cart.length} {cart.length === 1 ? 'línea' : 'líneas'}
            </span>
          </div>

          {cart.map(item => (
            <div
              key={item.id}
              className={`${styles.item} ${removingId === item.id ? styles.itemRemoving : ''}`}
            >
              <div className={styles.itemImg}>
                {item.image ? (
                  <img src={item.image} alt={item.name} referrerPolicy="no-referrer" />
                ) : (
                  <IconPill size={22} />
                )}
              </div>

              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemMeta}>
                  <span>{item.cat}</span>
                  {item.sku && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="mono">{item.sku}</span>
                    </>
                  )}
                  {item.requiresPrescription && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span style={{ color: 'var(--blue-dark)', fontWeight: 600 }}>Requiere receta Rx</span>
                    </>
                  )}
                </div>
                <div className={`${styles.itemPrice} tabular-nums`}>
                  RD${item.price.toFixed(2)} c/u
                </div>
              </div>

              <div className={styles.qtyControl}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => changeQty(item.id, -1)}
                  aria-label="Reducir cantidad"
                >
                  <IconMinus size={13} />
                </button>
                <span className={`${styles.qtyNum} tabular-nums`}>{item.qty}</span>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => {
                    if (item.qty >= (item.stock ?? 99)) {
                      showToast('Stock máximo alcanzado', 'orange')
                      return
                    }
                    changeQty(item.id, 1)
                  }}
                  disabled={item.qty >= (item.stock ?? 99)}
                  aria-label="Aumentar cantidad"
                >
                  <IconPlus size={13} />
                </button>
              </div>

              <div className={`${styles.itemTotal} tabular-nums`}>
                RD${(item.price * item.qty).toFixed(2)}
              </div>

              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemove(item)}
                aria-label={`Eliminar ${item.name}`}
              >
                <IconTrash size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary Sidebar */}
        <aside className={styles.summaryCol}>
          <div className={`card ${styles.summaryCard}`}>
            <h3 className={styles.summaryTitle}>Resumen del pedido</h3>

            <div className={styles.summaryRow}>
              <span>Subtotal ({cartCount} uds.)</span>
              <span className="tabular-nums">RD${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>ITBIS (18%)</span>
              <span className="tabular-nums">RD${cartTax.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Envío estándar</span>
              <span className="tabular-nums" style={{ color: shipping === 0 ? 'var(--green-dark)' : 'inherit', fontWeight: shipping === 0 ? 600 : 400 }}>
                {shipping === 0 ? 'Gratis' : `RD$${shipping.toFixed(2)}`}
              </span>
            </div>

            {remainingForFree > 0 && (
              <div className={styles.shippingHint}>
                Agrega <strong className="tabular-nums">RD${remainingForFree.toFixed(2)}</strong> más para envío sin costo.
              </div>
            )}

            {hasRxItems && (
              <div className={styles.rxHint}>
                <IconAlert size={15} />
                <span>Tu pedido incluye medicamentos Rx; se solicitará referencia de receta en el siguiente paso.</span>
              </div>
            )}

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span>Total</span>
              <span className="tabular-nums" style={{ color: 'var(--green-dark)' }}>
                RD${grandTotal.toFixed(2)}
              </span>
            </div>

            {!user && (
              <div className={styles.loginWarning}>
                <IconAlert size={15} />
                <span>
                  <Link to="/login" style={{ color: 'var(--blue-dark)', fontWeight: 600, textDecoration: 'underline' }}>
                    Inicia sesión
                  </Link>{' '}
                  para finalizar tu compra.
                </span>
              </div>
            )}

            <button type="button" className="btn-primary" style={{ width: '100%', marginTop: 18, padding: '12px 18px' }} onClick={handleCheckout}>
              <span>{user ? 'Continuar al checkout' : 'Iniciar sesión para comprar'}</span>
              <IconArrowRight size={15} />
            </button>

            <Link to="/products" className="btn-ghost" style={{ width: '100%', marginTop: 8 }}>
              Seguir comprando
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
