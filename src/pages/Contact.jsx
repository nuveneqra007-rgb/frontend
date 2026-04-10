import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import styles from './Contact.module.css'

const INFO_ITEMS = [
  { icon: '📍', label: 'Ubicación',  value: 'Av. Independencia 123, Santo Domingo', color: 'green' },
  { icon: '📞', label: 'Teléfono',   value: '(809) 555-0100',                        color: 'blue' },
  { icon: '✉️', label: 'Correo',     value: 'hola@tufarmacia.com',                   color: 'green' },
  { icon: '🕐', label: 'Horario',    value: 'Lun–Sáb 8am–8pm · Dom 10am–6pm',       color: 'blue' },
]

const SUBJECTS = [
  'Consulta sobre medicamento',
  'Estado de mi pedido',
  'Problema con producto',
  'Facturación',
  'Trabajo con nosotros',
  'Otro',
]

export default function Contact() {
  const { showToast } = useApp()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const set = field => e => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(er => ({ ...er, [field]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Requerido'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo inválido'
    if (!form.message.trim() || form.message.length < 10) errs.message = 'Mínimo 10 caracteres'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSend = async () => {
    if (!validate()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 900))
    setForm({ name: '', email: '', subject: '', message: '' })
    setSent(true)
    setSending(false)
    showToast('¡Mensaje enviado! Te responderemos pronto ✉️', 'green')
    setTimeout(() => setSent(false), 6000)
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: 32 }}>
        <h2 className="section-title">📞 Contáctanos</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text3)', marginTop: 6 }}>
          Estamos aquí para ayudarte — tiempo de respuesta promedio: menos de 1 hora
        </p>
      </div>

      <div className={styles.layout}>
        {/* Info column */}
        <div className={styles.infoCol}>
          <div className={`card ${styles.infoIntro}`}>
            <h3 className={styles.infoTitle}>¿Cómo podemos ayudarte?</h3>
            <p className={styles.infoDesc}>
              Nuestro equipo de farmacéuticos certificados está disponible para atender tus consultas
              sobre medicamentos, dosis, interacciones y más.
            </p>
            <div className={styles.tagRow}>
              <span className="badge badge-green">🟢 En línea ahora</span>
              <span className="badge badge-blue">⚡ Resp. &lt; 1 hora</span>
            </div>
          </div>

          <div className={`card ${styles.infoItemsCard}`}>
            {INFO_ITEMS.map(item => (
              <div key={item.label} className={styles.infoItem}>
                <div className={`${styles.infoIcon} ${item.color === 'green' ? styles.infoIconGreen : styles.infoIconBlue}`}>
                  {item.icon}
                </div>
                <div>
                  <div className={styles.infoLabel}>{item.label}</div>
                  <div className={styles.infoValue}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={`card ${styles.mapCard}`}>
            <div className={styles.mapPlaceholder} onClick={() => showToast('Mapa próximamente disponible 🗺️', 'blue')}>
              <span style={{ fontSize: '2.8rem' }}>🗺️</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text2)', fontWeight: 600 }}>
                Ver en Google Maps →
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Envíanos un mensaje</h3>
          <p className={styles.formSub}>Completa el formulario y te responderemos a la brevedad</p>

          {sent && (
            <div className={styles.successAlert}>
              <span>✅</span>
              <span>¡Mensaje enviado correctamente! Revisa tu correo en las próximas horas.</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Tu nombre completo"
                value={form.name} onChange={set('name')}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Correo *</label>
              <input
                className={`form-input ${errors.email ? 'error' : ''}`}
                type="email" placeholder="tu@correo.com"
                value={form.email} onChange={set('email')}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Asunto</label>
            <select className="form-input" value={form.subject} onChange={set('subject')}>
              <option value="">Selecciona un asunto...</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mensaje *</label>
            <textarea
              className={`form-input ${errors.message ? 'error' : ''}`}
              style={{ minHeight: 140, resize: 'vertical' }}
              placeholder="Escribe tu consulta aquí... (mínimo 10 caracteres)"
              value={form.message} onChange={set('message')}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {errors.message
                ? <div className="form-error">{errors.message}</div>
                : <div />
              }
              <span style={{ fontSize: '0.72rem', color: 'var(--text4)' }}>{form.message.length} caracteres</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
            <p style={{ fontSize: '0.76rem', color: 'var(--text4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              🔒 Tu información está protegida
            </p>
            <button className={styles.sendBtn} onClick={handleSend} disabled={sending}>
              {sending ? <span className="spinner" /> : '✈️'}
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className={styles.faqSection}>
        <h3 className={styles.faqTitle}>Preguntas frecuentes</h3>
        <div className={styles.faqGrid}>
          {[
            { q: '¿Necesito receta para comprar?', a: 'Solo para antibióticos y medicamentos controlados. La gran mayoría de nuestro catálogo está disponible sin receta.' },
            { q: '¿Cuánto tarda la entrega?', a: 'Entregamos el mismo día para pedidos antes de las 3pm en Santo Domingo. Otras ciudades: 24–48 horas.' },
            { q: '¿Cómo funciona la devolución?', a: 'Tienes 7 días para devolver productos sin abrir en su empaque original. Reembolso en 3–5 días hábiles.' },
            { q: '¿Los precios incluyen impuestos?', a: 'Sí, todos los precios mostrados incluyen el ITBIS del 18% según la legislación dominicana.' },
            { q: '¿Puedo cancelar mi pedido?', a: 'Puedes cancelar dentro de los 30 minutos posteriores al pedido contactándonos por WhatsApp o teléfono.' },
            { q: '¿Tienen servicio de emergencias?', a: 'Sí. Para medicamentos urgentes, llámanos directamente y gestionamos entregas prioritarias 24/7.' },
          ].map(item => (
            <div key={item.q} className={`card ${styles.faqCard}`}>
              <h4 className={styles.faqQ}>{item.q}</h4>
              <p className={styles.faqA}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
