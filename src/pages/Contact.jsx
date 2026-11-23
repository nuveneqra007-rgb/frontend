import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconClock,
  IconStethoscope,
  IconLock,
  IconCheck,
  IconArrowRight,
  IconShield,
} from '../components/Icons.jsx'
import styles from './Contact.module.css'

const INFO_ITEMS = [
  { Icon: IconMapPin, label: 'Sede principal', value: 'Av. Independencia 123, Santo Domingo', color: 'green' },
  { Icon: IconPhone,  label: 'Atención farmacéutica', value: '(809) 555-0100', color: 'blue' },
  { Icon: IconMail,   label: 'Correo clínico', value: 'hola@tufarmacia.com', color: 'green' },
  { Icon: IconClock,  label: 'Horario de despacho', value: 'Lun–Sáb 8am–8pm · Dom 10am–6pm', color: 'blue' },
]

const SUBJECTS = [
  'Consulta farmacológica sobre medicamento',
  'Estado y seguimiento de mi pedido',
  'Validación de receta médica (Rx)',
  'Facturación y comprobantes',
  'Inconveniente con producto recibido',
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

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!validate()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 700))
    setForm({ name: '', email: '', subject: '', message: '' })
    setSent(true)
    setSending(false)
    showToast('Consulta enviada. Nuestro equipo farmacéutico responderá pronto.', 'green')
    setTimeout(() => setSent(false), 6000)
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-title">Atención Farmacéutica y Contacto</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text3)', marginTop: 6 }}>
          Resolvemos dudas sobre dosificación, interacciones, recetas médicas y entregas en menos de 1 hora.
        </p>
      </div>

      <div className={styles.layout}>
        {/* Info column */}
        <div className={styles.infoCol}>
          <div className={`card ${styles.infoIntro}`}>
            <div className={styles.introHeader}>
              <div className={styles.introIcon}>
                <IconStethoscope size={20} />
              </div>
              <h3 className={styles.infoTitle}>Orientación farmacéutica</h3>
            </div>
            <p className={styles.infoDesc}>
              Nuestro equipo de farmacéuticos colegiados está disponible para asesorarte sobre medicamentos,
              presentaciones, conservación y validación de prescripciones.
            </p>
            <div className={styles.tagRow}>
              <span className="badge badge-green">
                <IconCheck size={12} />
                <span>Farmacia autorizada</span>
              </span>
              <span className="badge badge-blue">
                <IconClock size={12} />
                <span>Respuesta &lt; 1 h</span>
              </span>
            </div>
          </div>

          <div className={`card ${styles.infoItemsCard}`}>
            {INFO_ITEMS.map(item => {
              const ItemIcon = item.Icon
              return (
                <div key={item.label} className={styles.infoItem}>
                  <div className={`${styles.infoIcon} ${item.color === 'green' ? styles.infoIconGreen : styles.infoIconBlue}`}>
                    <ItemIcon size={17} />
                  </div>
                  <div>
                    <div className={styles.infoLabel}>{item.label}</div>
                    <div className={styles.infoValue}>{item.value}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={`card ${styles.coverageCard}`}>
            <div className={styles.coverageHeader}>
              <IconShield size={16} />
              <span>Cobertura de entregas</span>
            </div>
            <p className={styles.coverageDesc}>
              Despacho express el mismo día en Gran Santo Domingo (Piantini, Naco, Bella Vista, Gazcue y zonas aledañas).
              Envíos nacionales en 24–48 h.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className={`card ${styles.formCard}`}>
          <h3 className={styles.formTitle}>Envíanos tu consulta</h3>
          <p className={styles.formSub}>Completa el formulario y te responderemos directamente a tu correo</p>

          {sent && (
            <div className={styles.successAlert}>
              <IconCheck size={16} />
              <span>Mensaje enviado correctamente. Revisa tu bandeja en las próximas horas.</span>
            </div>
          )}

          <form onSubmit={handleSend} noValidate>
            <div className={styles.formGrid2}>
              <div className="form-group">
                <label className="form-label">Nombre completo *</label>
                <input
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Tu nombre completo"
                  value={form.name}
                  onChange={set('name')}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico *</label>
                <input
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={set('email')}
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
                style={{ minHeight: 136, resize: 'vertical' }}
                placeholder="Describe tu consulta aquí (mínimo 10 caracteres)..."
                value={form.message}
                onChange={set('message')}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.message ? <div className="form-error">{errors.message}</div> : <div />}
                <span className="tabular-nums" style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>
                  {form.message.length} caracteres
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconLock size={14} />
                <span>Confidencialidad clínica garantizada</span>
              </p>
              <button type="submit" className={styles.sendBtn} disabled={sending}>
                {sending ? <span className="spinner" /> : null}
                <span>{sending ? 'Enviando...' : 'Enviar mensaje'}</span>
                {!sending && <IconArrowRight size={15} />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FAQ */}
      <div className={styles.faqSection}>
        <h3 className={styles.faqTitle}>Preguntas frecuentes</h3>
        <div className={styles.faqGrid}>
          {[
            { q: '¿Necesito receta médica para comprar?', a: 'Solo para antibióticos y medicamentos identificados con etiqueta Rx. El resto del catálogo OTC y suplementos se adquiere libremente.' },
            { q: '¿Cuánto tarda la entrega a domicilio?', a: 'Despachamos en 2 a 4 horas el mismo día para órdenes antes de las 3:00 p.m. en Santo Domingo. Otras provincias: 24–48 horas.' },
            { q: '¿Cómo funcionan las devoluciones?', a: 'Dispones de 7 días para devolver productos sellados en su empaque original. Reembolso procesado en 3–5 días hábiles.' },
            { q: '¿Los precios incluyen ITBIS?', a: 'Sí, todos los precios y cálculos de checkout desglosan e incluyen el 18% de ITBIS conforme a la normativa fiscal vigente.' },
            { q: '¿Puedo cancelar o modificar mi pedido?', a: 'Puedes solicitar cambios dentro de los 30 minutos posteriores a la confirmación llamando a nuestra línea de atención.' },
            { q: '¿Tienen envío gratuito?', a: 'Sí, todas las compras superiores a RD$500 califican automáticamente para entrega estándar sin costo adicional.' },
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
