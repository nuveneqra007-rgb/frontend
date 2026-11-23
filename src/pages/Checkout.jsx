import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../data/datos.js'
import {
  IconMapPin,
  IconCreditCard,
  IconBanknote,
  IconClipboard,
  IconCheck,
  IconShield,
  IconLock,
  IconPackage,
  IconCart,
  IconPill,
  IconArrowRight,
} from '../components/Icons.jsx'
import styles from './Checkout.module.css'

const STEPS = [
  { id: 0, label: 'Entrega' },
  { id: 1, label: 'Pago' },
  { id: 2, label: 'Confirmación' },
]

function StepIndicator({ current }) {
  return (
    <div className={styles.stepsWrap} aria-label="Progreso del checkout">
      {STEPS.map((s, i) => (
        <div key={s.id} className={styles.step}>
          <div className={`${styles.stepInner} ${i === current ? styles.stepActive : ''} ${i < current ? styles.stepDone : ''}`}>
            <div className={styles.stepNum}>
              {i < current ? <IconCheck size={14} /> : <span className="tabular-nums">{i + 1}</span>}
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
    <aside className={`card ${styles.orderSummary}`}>
      <div className={styles.summaryTitle}>
        <IconPackage size={16} />
        <span>Resumen del pedido</span>
      </div>

      <div className={styles.summaryItemsList}>
        {cart.map(i => (
          <div key={i.id} className={styles.summaryItem}>
            <div className={styles.summaryThumb}>
              {i.image ? (
                <img src={i.image} alt={i.name} referrerPolicy="no-referrer" />
              ) : (
                <IconPill size={14} />
              )}
            </div>
            <div className={styles.summaryItemName}>
              <span>{i.name}</span>
              <span className={`${styles.summaryItemQty} tabular-nums`}>× {i.qty}</span>
            </div>
            <span className={`${styles.summaryItemPrice} tabular-nums`}>
              RD${(i.price * i.qty).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.summaryDivider} />

      <div className={styles.summaryRow}>
        <span>Subtotal</span>
        <span className="tabular-nums">RD${cartSubtotal.toFixed(2)}</span>
      </div>
      <div className={styles.summaryRow}>
        <span>ITBIS (18%)</span>
        <span className="tabular-nums">RD${cartTax.toFixed(2)}</span>
      </div>
      <div className={styles.summaryRow}>
        <span>Envío</span>
        <span className="tabular-nums" style={{ color: shipping === 0 ? 'var(--green-dark)' : 'inherit', fontWeight: shipping === 0 ? 600 : 500 }}>
          {shipping === 0 ? 'Gratis' : `RD$${shipping.toFixed(2)}`}
        </span>
      </div>

      <div className={styles.summaryDivider} />

      <div className={styles.summaryTotal}>
        <span>Total</span>
        <span className={`${styles.summaryTotalAmt} tabular-nums`}>RD${grandTotal.toFixed(2)}</span>
      </div>
    </aside>
  )
}

export default function Checkout() {
  const { cart, cartSubtotal, cartTax, cartTotal, placeOrder, clearCart, showToast, user } = useApp()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)

  const shipping = cartSubtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const grandTotal = cartTotal + shipping
  const rxItems = cart.filter(i => i.requiresPrescription)
  const hasRxItems = rxItems.length > 0

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: 'Santo Domingo',
    sector: '',
    prescriptionRef: '',
    rxConfirmed: false,
  })
  const [payment, setPayment] = useState({
    method: 'card',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  })
  const [errors, setErrors] = useState({})

  const setAddr = f => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setAddress(a => ({ ...a, [f]: val }))
    if (errors[f]) setErrors(er => ({ ...er, [f]: null }))
  }
  const setPay = f => e => {
    setPayment(p => ({ ...p, [f]: e.target.value }))
    if (errors[f]) setErrors(er => ({ ...er, [f]: null }))
  }

  const validateAddress = () => {
    const errs = {}
    if (!address.name.trim()) errs.name = 'Requerido'
    if (!address.phone.trim() || address.phone.replace(/\D/g, '').length < 7) errs.phone = 'Número de teléfono inválido'
    if (!address.address.trim()) errs.address = 'Requerido'
    if (!address.sector.trim()) errs.sector = 'Requerido'
    if (hasRxItems) {
      if (!address.prescriptionRef.trim() || address.prescriptionRef.trim().length < 4) {
        errs.prescriptionRef = 'Ingresa el código o referencia de tu receta médica (ej. RX-2026-4102)'
      }
      if (!address.rxConfirmed) {
        errs.rxConfirmed = 'Debes confirmar que presentaras la receta médica original al recibir el pedido'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validatePayment = () => {
    if (payment.method === 'cash') return true
    const errs = {}
    const raw = payment.cardNumber.replace(/\s/g, '')
    if (raw.length < 16) errs.cardNumber = 'Número de tarjeta inválido'
    if (!payment.cardName.trim()) errs.cardName = 'Requerido'
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) errs.expiry = 'Formato MM/AA'
    if (payment.cvv.length < 3) errs.cvv = 'CVV inválido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (step === 0 && !validateAddress()) return
    if (step === 1 && !validatePayment()) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setStep(s => s - 1)
    setErrors({})
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 900))
      const order = await placeOrder({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        items: cart.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          cat: i.cat,
          image: i.image,
        })),
        subtotal: cartSubtotal,
        tax: cartTax,
        shipping,
        total: grandTotal,
        address: {
          name: address.name,
          phone: address.phone,
          address: address.address,
          city: address.city,
          sector: address.sector,
        },
        prescriptionRef: hasRxItems ? address.prescriptionRef.trim() : undefined,
        paymentMethod: payment.method,
      })
      clearCart()
      setCompletedOrder(order)
      showToast('Pedido confirmado correctamente', 'green')
    } catch (err) {
      showToast(err?.message || 'No se pudo procesar el pedido', 'red')
    } finally {
      setLoading(false)
    }
  }

  const formatCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  if (!completedOrder && cart.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="card empty-state">
          <div className="empty-icon">
            <IconCart size={26} />
          </div>
          <h3>Tu carrito está vacío</h3>
          <p>Agrega medicamentos o suplementos antes de continuar con el checkout.</p>
          <Link to="/products" className="btn-primary">
            <span>Ver catálogo</span>
            <IconArrowRight size={15} />
          </Link>
        </div>
      </div>
    )
  }

  if (completedOrder) {
    const orderCode = completedOrder.order_number || completedOrder.id
    return (
      <div className="page-wrapper">
        <div className={styles.successWrap}>
          <div className={`card ${styles.successCard}`}>
            <div className={styles.successIcon}>
              <IconCheck size={28} />
            </div>
            <h2 className={styles.successTitle}>Pedido confirmado</h2>
            <div className={`${styles.successOrderId} mono`}>
              <IconClipboard size={15} />
              <span>Orden {orderCode}</span>
            </div>
            <p className={styles.successMsg}>
              Recibimos tu solicitud. Nuestro equipo farmacéutico verificará el despacho y se comunicará al{' '}
              <strong className="tabular-nums">{address.phone}</strong> para coordinar la entrega en{' '}
              <strong>{address.sector}, {address.city}</strong>.
            </p>
            <div className={styles.successDetails}>
              {[
                ['Total pagado', `RD$${grandTotal.toFixed(2)}`],
                ['Método de pago', payment.method === 'card' ? `Tarjeta ****${payment.cardNumber.replace(/\s/g, '').slice(-4)}` : 'Efectivo contra entrega'],
                ['Dirección', `${address.address}, ${address.sector}`],
                ...(completedOrder.prescriptionRef ? [['Receta médica (Rx)', completedOrder.prescriptionRef]] : []),
                ['Tiempo estimado', 'Hoy · 2–4 horas'],
                ['Estado', completedOrder.status || 'Pendiente'],
              ].map(([k, v]) => (
                <div key={k} className={styles.successDetailRow}>
                  <span>{k}</span>
                  <strong className="tabular-nums">{v}</strong>
                </div>
              ))}
            </div>
            <div className={styles.successBtns}>
              <Link to="/orders" className="btn-primary">Ver mis pedidos</Link>
              <Link to="/products" className="btn-outline">Seguir comprando</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-title">Checkout</h2>
        <p className="tabular-nums" style={{ fontSize: '0.86rem', color: 'var(--text3)', marginTop: 4 }}>
          {cart.length} {cart.length === 1 ? 'producto' : 'productos'} · RD${grandTotal.toFixed(2)} total
        </p>
      </div>

      <StepIndicator current={step} />

      <div className={styles.layout}>
        <div className={`card ${styles.formCard}`}>
          {step === 0 && (
            <div>
              <h3 className={styles.stepTitle}>
                <IconMapPin size={18} />
                <span>Dirección de entrega</span>
              </h3>
              <div className={styles.grid2}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Nombre completo *</label>
                  <input
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={address.name}
                    onChange={setAddr('name')}
                    placeholder="María García"
                  />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono *</label>
                  <input
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    value={address.phone}
                    onChange={setAddr('phone')}
                    placeholder="809-555-0000"
                  />
                  {errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Ciudad</label>
                  <select className="form-input" value={address.city} onChange={setAddr('city')}>
                    {['Santo Domingo', 'Santiago', 'La Romana', 'Puerto Plata', 'San Pedro de Macorís', 'La Vega', 'Higüey', 'Baní'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Dirección exacta *</label>
                  <input
                    className={`form-input ${errors.address ? 'error' : ''}`}
                    value={address.address}
                    onChange={setAddr('address')}
                    placeholder="Av. Winston Churchill #48, Torre A, Apto. 4B"
                  />
                  {errors.address && <div className="form-error">{errors.address}</div>}
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Sector / Barrio *</label>
                  <input
                    className={`form-input ${errors.sector ? 'error' : ''}`}
                    value={address.sector}
                    onChange={setAddr('sector')}
                    placeholder="Piantini, Naco, Bella Vista..."
                  />
                  {errors.sector && <div className="form-error">{errors.sector}</div>}
                </div>
              </div>

              {hasRxItems && (
                <div className={styles.rxBox}>
                  <div className={styles.rxBoxHeader}>
                    <IconShield size={17} />
                    <div>
                      <strong>Validación de receta médica (Rx)</strong>
                      <span>
                        Requerida para: {rxItems.map(r => r.name).join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 10 }}>
                    <label className="form-label">Número o referencia de receta *</label>
                    <input
                      className={`form-input mono ${errors.prescriptionRef ? 'error' : ''}`}
                      value={address.prescriptionRef}
                      onChange={setAddr('prescriptionRef')}
                      placeholder="Ej: RX-2026-4102"
                    />
                    {errors.prescriptionRef && <div className="form-error">{errors.prescriptionRef}</div>}
                  </div>
                  <label className={styles.rxCheck}>
                    <input
                      type="checkbox"
                      checked={address.rxConfirmed}
                      onChange={setAddr('rxConfirmed')}
                    />
                    <span>Confirmo contar con receta médica vigente para entregarla o mostrarla al recibir el pedido.</span>
                  </label>
                  {errors.rxConfirmed && <div className="form-error">{errors.rxConfirmed}</div>}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className={styles.stepTitle}>
                <IconCreditCard size={18} />
                <span>Método de pago</span>
              </h3>
              <div className={styles.payMethods}>
                {[
                  { id: 'card', label: 'Tarjeta de crédito o débito', Icon: IconCreditCard, sub: 'Visa, Mastercard, AMEX' },
                  { id: 'cash', label: 'Pago contra entrega', Icon: IconBanknote, sub: 'Paga en efectivo al recibir tu pedido' },
                ].map(m => {
                  const IconComp = m.Icon
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`${styles.payMethod} ${payment.method === m.id ? styles.payMethodActive : ''}`}
                      onClick={() => setPayment(p => ({ ...p, method: m.id }))}
                    >
                      <div className={styles.payMethodRadio} />
                      <div className={styles.payMethodIcon}>
                        <IconComp size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{m.label}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text3)', fontWeight: 400 }}>{m.sub}</div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {payment.method === 'card' && (
                <div className={styles.cardFields}>
                  <div className="form-group">
                    <label className="form-label">Número de tarjeta</label>
                    <input
                      className={`form-input mono ${errors.cardNumber ? 'error' : ''}`}
                      value={payment.cardNumber}
                      onChange={e => setPay('cardNumber')({ target: { value: formatCard(e.target.value) } })}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                    {errors.cardNumber && <div className="form-error">{errors.cardNumber}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nombre en la tarjeta</label>
                    <input
                      className={`form-input ${errors.cardName ? 'error' : ''}`}
                      value={payment.cardName}
                      onChange={e => setPay('cardName')({ target: { value: e.target.value.toUpperCase() } })}
                      placeholder="MARIA GARCIA"
                    />
                    {errors.cardName && <div className="form-error">{errors.cardName}</div>}
                  </div>
                  <div className={styles.grid2}>
                    <div className="form-group">
                      <label className="form-label">Vencimiento</label>
                      <input
                        className={`form-input mono ${errors.expiry ? 'error' : ''}`}
                        value={payment.expiry}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g, '')
                          if (v.length >= 2) v = `${v.slice(0, 2)}/${v.slice(2, 4)}`
                          setPay('expiry')({ target: { value: v } })
                        }}
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                      {errors.expiry && <div className="form-error">{errors.expiry}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input
                        className={`form-input mono ${errors.cvv ? 'error' : ''}`}
                        value={payment.cvv}
                        onChange={e => setPay('cvv')({ target: { value: e.target.value.replace(/\D/g, '').slice(0, 4) } })}
                        placeholder="•••"
                        type="password"
                        maxLength={4}
                      />
                      {errors.cvv && <div className="form-error">{errors.cvv}</div>}
                    </div>
                  </div>
                  <p className={styles.sslNote}>
                    <IconLock size={14} />
                    <span>Transacción protegida con cifrado TLS de 256 bits</span>
                  </p>
                </div>
              )}

              {payment.method === 'cash' && (
                <div className={styles.cashNote}>
                  <IconBanknote size={18} />
                  <div>
                    <strong>Pago en efectivo contra entrega</strong>
                    <p>
                      Prepara el monto exacto de <strong className="tabular-nums">RD${grandTotal.toFixed(2)}</strong> al momento de recibir tu pedido.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className={styles.stepTitle}>
                <IconClipboard size={18} />
                <span>Confirmar pedido</span>
              </h3>
              <div className={styles.reviewSection}>
                <div className={styles.reviewBlock}>
                  <h4>Entrega</h4>
                  <p>
                    <strong>{address.name}</strong> · <span className="tabular-nums">{address.phone}</span>
                  </p>
                  <p>{address.address}, {address.sector}, {address.city}</p>
                  {hasRxItems && (
                    <p style={{ marginTop: 6, color: 'var(--blue-dark)', fontWeight: 600 }}>
                      Receta Rx verificada: <span className="mono">{address.prescriptionRef}</span>
                    </p>
                  )}
                </div>

                <div className={styles.reviewBlock}>
                  <h4>Método de pago</h4>
                  <p>
                    {payment.method === 'card'
                      ? `Tarjeta **** **** **** ${payment.cardNumber.replace(/\s/g, '').slice(-4) || '????'} (${payment.cardName || 'Titular'})`
                      : 'Efectivo contra entrega'}
                  </p>
                </div>

                <div className={styles.reviewBlock}>
                  <h4>Productos ({cart.length})</h4>
                  <div className={styles.reviewItems}>
                    {cart.map(i => (
                      <div key={i.id} className={styles.reviewItem}>
                        <span>
                          {i.name}{' '}
                          <span className="tabular-nums" style={{ color: 'var(--text4)' }}>× {i.qty}</span>
                        </span>
                        <span className="tabular-nums">RD${(i.price * i.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.navBtns}>
            {step > 0 && (
              <button type="button" className="btn-ghost" onClick={handleBack}>
                Anterior
              </button>
            )}
            {step < 2 ? (
              <button type="button" className="btn-primary" onClick={handleNext} style={{ marginLeft: 'auto' }}>
                <span>Siguiente</span>
                <IconArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                style={{ minWidth: 196, marginLeft: 'auto' }}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <IconCheck size={15} />
                    <span>Confirmar pedido</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

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
