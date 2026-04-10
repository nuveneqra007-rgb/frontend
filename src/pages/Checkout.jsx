import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import styles from './Checkout.module.css'

const STEPS = [
  { id: 0, label: 'Dirección', icon: '📍' },
  { id: 1, label: 'Pago',      icon: '💳' },
  { id: 2, label: 'Revisar',   icon: '📋' },
]

function StepIndicator({ current }) {
  return (
    <div className={styles.stepsWrap}>
      {STEPS.map((s, i) => (
        <div key={s.id} className={styles.step}>
          <div className={`${styles.stepInner} ${i === current ? styles.stepActive : ''} ${i < current ? styles.stepDone : ''}`}>
            <div className={styles.stepNum}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={styles.stepLabel}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`${styles.stepLine} ${i < current ? styles.stepLineDone : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function OrderSidebar({ cart, cartSubtotal, cartTax, shipping, grandTotal }) {
  return (
    <div className={`card ${styles.orderSummary}`}>
      <div className={styles.summaryTitle}>📦 Tu Pedido</div>
      {cart.map(i => (
        <div key={i.id} className={styles.summaryItem}>
          <span>{i.emoji} {i.name} <span style={{ color: 'var(--text4)' }}>×{i.qty}</span></span>
          <span>RD${(i.price * i.qty).toFixed(2)}</span>
        </div>
      ))}
      <div className={styles.summaryDivider} />
      <div className={styles.summaryItem}><span>Subtotal</span><span>RD${cartSubtotal.toFixed(2)}</span></div>
      <div className={styles.summaryItem}><span>ITBIS (18%)</span><span>RD${cartTax.toFixed(2)}</span></div>
      <div className={styles.summaryItem}>
        <span>Envío</span>
        <span style={{ color: shipping === 0 ? 'var(--green)' : 'inherit' }}>
          {shipping === 0 ? '🎁 Gratis' : `RD${shipping.toFixed(2)}`}
        </span>
      </div>
      <div className={styles.summaryDivider} />
      <div className={styles.summaryTotal}>
        <span>Total</span>
        <span className={styles.summaryTotalAmt}>RD${grandTotal.toFixed(2)}</span>
      </div>
    </div>
  )
}

export default function Checkout() {
  const { cart, cartSubtotal, cartTax, cartTotal, placeOrder, clearCart, showToast, user } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)

  const shipping = cartSubtotal > 500 ? 0 : 150
  const grandTotal = cartTotal + shipping

  const [address, setAddress] = useState({
    name: user?.name || '', phone: '', address: '', city: 'Santo Domingo', sector: '',
  })
  const [payment, setPayment] = useState({
    method: 'card', cardNumber: '', cardName: '', expiry: '', cvv: '',
  })
  const [errors, setErrors] = useState({})

  const setAddr = f => e => { setAddress(a => ({ ...a, [f]: e.target.value })); if (errors[f]) setErrors(er => ({ ...er, [f]: null })) }
  const setPay  = f => e => { setPayment(p => ({ ...p, [f]: e.target.value }));  if (errors[f]) setErrors(er => ({ ...er, [f]: null })) }

  const validateAddress = () => {
    const errs = {}
    if (!address.name.trim())   errs.name    = 'Requerido'
    if (!address.phone.trim() || address.phone.length < 7) errs.phone = 'Número inválido'
    if (!address.address.trim()) errs.address = 'Requerido'
    if (!address.sector.trim()) errs.sector  = 'Requerido'
    setErrors(errs); return Object.keys(errs).length === 0
  }

  const validatePayment = () => {
    if (payment.method === 'cash') return true
    const errs = {}
    const raw = payment.cardNumber.replace(/\s/g,'')
    if (raw.length < 16)              errs.cardNumber = 'Número de tarjeta inválido'
    if (!payment.cardName.trim())     errs.cardName   = 'Requerido'
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) errs.expiry = 'Formato MM/AA'
    if (payment.cvv.length < 3)       errs.cvv        = 'CVV inválido'
    setErrors(errs); return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validateAddress()) return
    if (step === 1 && !validatePayment()) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => { setStep(s => s - 1); setErrors({}) }

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1600))
    const order = placeOrder({
      userId: user.id, userName: user.name, userEmail: user.email,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, emoji: i.emoji, cat: i.cat })),
      subtotal: cartSubtotal, tax: cartTax, shipping, total: grandTotal,
      address, paymentMethod: payment.method,
    })
    clearCart()
    setCompletedOrder(order)
    showToast('¡Pedido confirmado! 🎉', 'green')
    setLoading(false)
  }

  const formatCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()

  /* ── Empty cart guard ── */
  if (!completedOrder && cart.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="card empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Carrito vacío</h3>
          <p>Agrega productos antes de hacer checkout</p>
          <Link to="/products" className="btn-primary">Ver productos</Link>
        </div>
      </div>
    )
  }

  /* ── Success screen ── */
  if (completedOrder) {
    return (
      <div className="page-wrapper">
        <div className={styles.successWrap}>
          <div className={`card ${styles.successCard}`}>
            <span className={styles.successAnim}>🎉</span>
            <h2 className={styles.successTitle}>¡Pedido Confirmado!</h2>
            <div className={styles.successOrderId}>
              📋 Orden {completedOrder.id}
            </div>
            <p className={styles.successMsg}>
              Recibimos tu pedido. Nos comunicaremos al <strong>{address.phone}</strong> para coordinar la entrega en <strong>{address.sector}, {address.city}</strong>.
            </p>
            <div className={styles.successDetails}>
              {[
                ['💰 Total pagado',       `RD${grandTotal.toFixed(2)}`],
                ['💳 Método de pago',     payment.method === 'card' ? `Tarjeta ****${payment.cardNumber.replace(/\s/g,'').slice(-4)}` : 'Efectivo contra entrega'],
                ['📍 Dirección',          `${address.address}, ${address.sector}`],
                ['⏱️ Tiempo estimado',    'Hoy · 2–4 horas'],
                ['📌 Estado',             'Pendiente de confirmación'],
              ].map(([k, v]) => (
                <div key={k} className={styles.successDetailRow}>
                  <span>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            <div className={styles.successBtns}>
              <Link to="/orders"   className="btn-primary">Ver mis pedidos</Link>
              <Link to="/products" className="btn-outline">Seguir comprando</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: 32 }}>
        <h2 className="section-title">Checkout</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginTop: 4 }}>
          {cart.length} {cart.length === 1 ? 'producto' : 'productos'} · RD${grandTotal.toFixed(2)} total
        </p>
      </div>

      <StepIndicator current={step} />

      <div className={styles.layout}>
        {/* Form panel */}
        <div className={`card ${styles.formCard}`}>

          {/* ── STEP 0: ADDRESS ── */}
          {step === 0 && (
            <div>
              <h3>📍 Dirección de Entrega</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Nombre completo *</label>
                  <input className={`form-input ${errors.name ? 'error' : ''}`} value={address.name} onChange={setAddr('name')} placeholder="Juan García" />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono *</label>
                  <input className={`form-input ${errors.phone ? 'error' : ''}`} value={address.phone} onChange={setAddr('phone')} placeholder="809-555-0000" />
                  {errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <select className="form-input" value={address.city} onChange={setAddr('city')}>
                    {['Santo Domingo','Santiago','La Romana','Puerto Plata','San Pedro de Macorís','La Vega','Higüey','Baní'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Dirección *</label>
                  <input className={`form-input ${errors.address ? 'error' : ''}`} value={address.address} onChange={setAddr('address')} placeholder="Calle Principal #123, Apt 4B" />
                  {errors.address && <div className="form-error">{errors.address}</div>}
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Sector / Barrio *</label>
                  <input className={`form-input ${errors.sector ? 'error' : ''}`} value={address.sector} onChange={setAddr('sector')} placeholder="Piantini, Naco, Los Prados..." />
                  {errors.sector && <div className="form-error">{errors.sector}</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: PAYMENT ── */}
          {step === 1 && (
            <div>
              <h3>💳 Método de Pago</h3>
              <div className={styles.payMethods}>
                {[
                  { id: 'card',  label: 'Tarjeta de crédito / débito', icon: '💳', sub: 'Visa, Mastercard, AMEX' },
                  { id: 'cash',  label: 'Pago contra entrega',         icon: '💵', sub: 'Paga al recibir tu pedido' },
                ].map(m => (
                  <button
                    key={m.id}
                    className={`${styles.payMethod} ${payment.method === m.id ? styles.payMethodActive : ''}`}
                    onClick={() => setPayment(p => ({ ...p, method: m.id }))}
                  >
                    <div className={styles.payMethodRadio} />
                    <span style={{ fontSize: '1.3rem' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>{m.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 400 }}>{m.sub}</div>
                    </div>
                  </button>
                ))}
              </div>

              {payment.method === 'card' && (
                <div className={styles.cardFields}>
                  <div className="form-group">
                    <label className="form-label">Número de tarjeta</label>
                    <input className={`form-input ${errors.cardNumber ? 'error' : ''}`}
                      value={payment.cardNumber}
                      onChange={e => setPay('cardNumber')({ target: { value: formatCard(e.target.value) } })}
                      placeholder="0000 0000 0000 0000" maxLength={19}
                      style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
                    />
                    {errors.cardNumber && <div className="form-error">{errors.cardNumber}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nombre en la tarjeta</label>
                    <input className={`form-input ${errors.cardName ? 'error' : ''}`}
                      value={payment.cardName}
                      onChange={e => setPay('cardName')({ target: { value: e.target.value.toUpperCase() } })}
                      placeholder="JUAN GARCIA"
                    />
                    {errors.cardName && <div className="form-error">{errors.cardName}</div>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Vencimiento</label>
                      <input className={`form-input ${errors.expiry ? 'error' : ''}`}
                        value={payment.expiry}
                        onChange={e => { let v = e.target.value.replace(/\D/g,''); if (v.length >= 2) v = v.slice(0,2)+'/'+v.slice(2,4); setPay('expiry')({ target: { value: v } }) }}
                        placeholder="MM/AA" maxLength={5}
                      />
                      {errors.expiry && <div className="form-error">{errors.expiry}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input className={`form-input ${errors.cvv ? 'error' : ''}`}
                        value={payment.cvv}
                        onChange={e => setPay('cvv')({ target: { value: e.target.value.replace(/\D/g,'').slice(0,4) } })}
                        placeholder="•••" type="password" maxLength={4}
                      />
                      {errors.cvv && <div className="form-error">{errors.cvv}</div>}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    🔒 Datos protegidos con cifrado SSL de 256 bits
                  </p>
                </div>
              )}

              {payment.method === 'cash' && (
                <div className={styles.cashNote}>
                  <strong>💵 Pago en efectivo</strong><br />
                  Ten listo el monto exacto de <strong>RD${grandTotal.toFixed(2)}</strong> al momento de recibir tu pedido.
                  El repartidor no lleva cambio.
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: REVIEW ── */}
          {step === 2 && (
            <div>
              <h3>📋 Confirmar Pedido</h3>
              <div className={styles.reviewSection}>
                <div className={styles.reviewBlock}>
                  <h4>📍 Entrega</h4>
                  <p><strong>{address.name}</strong> · {address.phone}</p>
                  <p>{address.address}, {address.sector}, {address.city}</p>
                </div>
                <div className={styles.reviewBlock}>
                  <h4>💳 Pago</h4>
                  <p>{payment.method === 'card'
                    ? `Tarjeta **** **** **** ${payment.cardNumber.replace(/\s/g,'').slice(-4) || '????'} (${payment.cardName || 'Sin nombre'})`
                    : '💵 Efectivo contra entrega'
                  }</p>
                </div>
                <div className={styles.reviewBlock}>
                  <h4>🛒 Productos ({cart.length})</h4>
                  <div className={styles.reviewItems}>
                    {cart.map(i => (
                      <div key={i.id} className={styles.reviewItem}>
                        <span>{i.emoji} {i.name} <span style={{ color: 'var(--text4)' }}>×{i.qty}</span></span>
                        <span>RD${(i.price * i.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={styles.navBtns}>
            {step > 0 && (
              <button className="btn-ghost" onClick={handleBack}>← Anterior</button>
            )}
            {step < 2 ? (
              <button className="btn-primary" onClick={handleNext} style={{ marginLeft: 'auto' }}>
                Siguiente →
              </button>
            ) : (
              <button
                className="btn-primary"
                style={{ minWidth: 190, marginLeft: 'auto' }}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Procesando...</> : '✅ Confirmar Pedido'}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <OrderSidebar
          cart={cart}
          cartSubtotal={cartSubtotal}
          cartTax={cartTax}
          shipping={shipping}
          grandTotal={grandTotal}
        />
      </div>
    </div>
  )
}
