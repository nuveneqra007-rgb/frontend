import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import styles from './Cart.module.css'

export default function Cart() {
  const { cart, removeFromCart, changeQty, clearCart, cartSubtotal, cartTax, cartTotal, cartCount, user, showToast } = useApp()
  const navigate = useNavigate()
  const [removingId, setRemovingId] = useState(null)

  const shipping = cartSubtotal > 500 ? 0 : 150
  const grandTotal = cartTotal + shipping
  const remainingForFree = Math.max(0, 500 - cartSubtotal)

  const handleRemove = (item) => {
    setRemovingId(item.id)
    setTimeout(() => {
      removeFromCart(item.id)
      setRemovingId(null)
      showToast(`${item.name} eliminado`, 'red')
    }, 280)
  }

  const handleCheckout = () => {
    if (!user) {
      showToast('Inicia sesión para continuar con la compra', 'orange')
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="page-wrapper">
        <div className={`card ${styles.emptyCart}`}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2 className={styles.emptyTitle}>Tu carrito está vacío</h2>
          <p className={styles.emptyDesc}>
            Explora nuestro catálogo y agrega los productos que necesitas.
          </p>
          <Link to="/products" className="btn-primary" style={{ fontSize: '0.95rem', padding: '12px 28px' }}>
            Ver productos →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 className="section-title">🛒 Carrito</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginTop: 4 }}>
            {cartCount} {cartCount === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <button
          className="btn-ghost"
          style={{ fontSize: '0.8rem', color: 'var(--red)', borderColor: '#fecaca' }}
          onClick={() => { clearCart(); showToast('Carrito vaciado', 'orange') }}
        >
          🗑️ Vaciar todo
        </button>
      </div>

      <div className={styles.layout}>
        {/* Items list */}
        <div className={`card ${styles.cartCard}`}>
          <div className={styles.cartHeader}>
            <h3>Mis Productos</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 500 }}>
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          {cart.map((item, idx) => (
            <div
              key={item.id}
              className={`${styles.item} ${removingId === item.id ? styles.itemRemoving : ''}`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={styles.itemImg}>{item.emoji}</div>

              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemCat}>{item.cat}
                  {item.requiresPrescription && (
                    <span className="badge badge-orange" style={{ marginLeft: 6, fontSize: '0.62rem' }}>Rx</span>
                  )}
                </div>
                <div className={styles.itemPrice}>RD${item.price.toFixed(2)} c/u</div>
              </div>

              <div className={styles.qtyControl}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => changeQty(item.id, -1)}
                  disabled={item.qty <= 1}
                  title="Reducir cantidad"
                >−</button>
                <span className={styles.qtyNum}>{item.qty}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => {
                    const prod = { stock: item.stock ?? 99 }
                    if (item.qty >= (item.stock ?? 99)) {
                      showToast('Stock máximo alcanzado', 'orange')
                      return
                    }
                    changeQty(item.id, 1)
                  }}
                  disabled={item.qty >= (item.stock ?? 99)}
                  title="Aumentar cantidad"
                >+</button>
              </div>

              <div className={styles.itemTotal}>
                RD${(item.price * item.qty).toFixed(2)}
              </div>

              <button
                className={styles.removeBtn}
                onClick={() => handleRemove(item)}
                title="Eliminar del carrito"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <div className={styles.summaryCol}>
          <div className={`card ${styles.summaryCard}`}>
            <h3 className={styles.summaryTitle}>Resumen de compra</h3>

            <div className={styles.summaryRow}>
              <span>Subtotal ({cartCount} items)</span>
              <span>RD${cartSubtotal.toFixed(2)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>ITBIS (18%)</span>
              <span>RD${cartTax.toFixed(2)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Envío</span>
              {shipping === 0
                ? <span className={styles.freeShip}>🎁 Gratis</span>
                : <span>RD${shipping.toFixed(2)}</span>
              }
            </div>

            {remainingForFree > 0 && (
              <div className={styles.shippingHint}>
                Agrega <strong>RD${remainingForFree.toFixed(0)}</strong> más para obtener envío gratis
              </div>
            )}

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span>Total</span>
              <span style={{ color: 'var(--green)' }}>RD${grandTotal.toFixed(2)}</span>
            </div>

            <div className={styles.taxNote}>
              <span>Impuestos incluidos (ITBIS 18%)</span>
              <span>RD${cartTax.toFixed(2)}</span>
            </div>

            {!user && (
              <div className={styles.loginWarning}>
                <span>⚠️</span>
                <span>
                  <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 700 }}>Inicia sesión</Link>
                  {' '}para finalizar tu compra
                </span>
              </div>
            )}

            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              {user
                ? <><span>💳</span> Ir al Checkout</>
                : <><span>🔒</span> Login para Comprar</>
              }
            </button>

            <Link to="/products" className={styles.continueBtn}>
              ← Seguir comprando
            </Link>
          </div>

          {/* Trust badges */}
          <div className={`card ${styles.trustBox}`}>
            <div className={styles.trustItems}>
              {[
                '🔒 Pago 100% seguro con SSL',
                '🚚 Envío protegido a tu puerta',
                '↩️ Devolución garantizada 30 días',
                '💬 Soporte farmacéutico 24/7',
              ].map(t => (
                <div key={t} className={styles.trustItem}>
                  <div className={styles.trustDot} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
