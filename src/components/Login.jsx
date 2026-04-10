import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { DEMO_USERS } from '../data/datos.js'
import styles from './Login.module.css'

export default function Login({ mode = 'login' }) {
  const { login, register, showToast } = useApp()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(mode === 'login')

  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [alertMsg, setAlertMsg] = useState(null)
  const [showPass, setShowPass] = useState(false)

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }))
  }

  const validate = () => {
    const errs = {}
    if (!isLogin && !form.name.trim()) errs.name = 'Ingresa tu nombre'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo inválido'
    if (!form.password || form.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    setAlertMsg(null)
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))

    if (isLogin) {
      const result = login(form.email, form.password)
      if (result.success) {
        showToast(`Bienvenido/a, ${result.user.name.split(' ')[0]}! 👋`, 'green')
        navigate(result.user.role === 'admin' ? '/admin' : '/')
      } else {
        setAlertMsg({ type: 'error', text: result.error })
      }
    } else {
      const fullName = `${form.name.trim()} ${form.lastName.trim()}`.trim()
      const result = register(fullName, form.email, form.password)
      if (result.success) {
        showToast(`¡Cuenta creada! Bienvenido/a, ${result.user.name.split(' ')[0]}! 🎉`, 'green')
        navigate('/')
      } else {
        setAlertMsg({ type: 'error', text: result.error })
      }
    }
    setLoading(false)
  }

  const fillDemo = (demo) => {
    setForm(f => ({ ...f, email: demo.email, password: demo.password }))
    setAlertMsg(null)
    setErrors({})
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M10 16h12M16 10v12" stroke="#18b876" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="9" cy="9" r="3.5" fill="#2172e5" opacity=".7"/>
              <circle cx="23" cy="23" r="3.5" fill="#18b876" opacity=".8"/>
            </svg>
          </div>
          TuFarmacia
        </div>

        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${isLogin ? styles.tabActive : ''}`} onClick={() => { setIsLogin(true); setAlertMsg(null); setErrors({}) }}>
            Iniciar Sesión
          </button>
          <button className={`${styles.tab} ${!isLogin ? styles.tabActive : ''}`} onClick={() => { setIsLogin(false); setAlertMsg(null); setErrors({}) }}>
            Crear Cuenta
          </button>
        </div>

        <h2 className={styles.title}>{isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h2>
        <p className={styles.sub}>
          {isLogin ? 'Ingresa tus credenciales para acceder' : 'Regístrate gratis y empieza a comprar'}
        </p>

        {/* Alert */}
        {alertMsg && (
          <div className={`${styles.alert} ${alertMsg.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
            <span>{alertMsg.type === 'error' ? '❌' : '✅'}</span>
            {alertMsg.text}
          </div>
        )}

        {/* Name fields (register) */}
        {!isLogin && (
          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Juan" value={form.name} onChange={set('name')} onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Apellido</label>
              <input className="form-input" placeholder="García" value={form.lastName} onChange={set('lastName')} onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Correo electrónico</label>
          <input
            className={`form-input ${errors.email ? 'error' : ''}`}
            type="email" placeholder="tu@correo.com"
            value={form.email} onChange={set('email')}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password} onChange={set('password')}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Procesando...' : isLogin ? 'Ingresar →' : 'Crear Cuenta →'}
        </button>

        {/* Demo credentials (only on login) */}
        {isLogin && (
          <div className={styles.demo}>
            <div className={styles.demoTitle}>🔑 Credenciales de demo — click para usar</div>
            {DEMO_USERS.map(d => (
              <div key={d.email} className={styles.demoRow} onClick={() => fillDemo(d)}>
                <div className={styles.demoRowIcon}>{d.role === 'admin' ? '🛡️' : '👤'}</div>
                <div className={styles.demoRowInfo}>
                  <div className={styles.demoRowLabel}>{d.role === 'admin' ? 'Administrador' : 'Cliente'}</div>
                  <div className={styles.demoRowCreds}>{d.email}</div>
                </div>
                <span className={styles.demoUseTip}>Usar →</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          {isLogin
            ? <>¿No tienes cuenta? <button className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }} onClick={() => { setIsLogin(false); setAlertMsg(null) }}>Crear cuenta gratis</button></>
            : <>¿Ya tienes cuenta? <button className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }} onClick={() => { setIsLogin(true); setAlertMsg(null) }}>Iniciar sesión</button></>
          }
        </div>
      </div>
    </div>
  )
}
