import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { DEMO_USERS } from '../data/datos.js'
import {
  IconCrossBrand,
  IconAlert,
  IconCheck,
  IconEye,
  IconShield,
  IconUser,
  IconLock,
  IconArrowRight,
} from './Icons.jsx'
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setAlertMsg(null)
    if (!validate()) return
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 450))
      if (isLogin) {
        const result = await login(form.email.trim(), form.password)
        if (result?.success) {
          showToast(`Bienvenido/a, ${result.user.name.split(' ')[0]}`, 'green')
          navigate(result.user.role === 'admin' ? '/admin' : '/')
        } else {
          setAlertMsg({ type: 'error', text: result?.error || 'Credenciales incorrectas' })
        }
      } else {
        const fullName = `${form.name.trim()} ${form.lastName.trim()}`.trim()
        const result = await register(fullName, form.email.trim(), form.password)
        if (result?.success) {
          showToast(`Cuenta creada. Bienvenido/a, ${result.user.name.split(' ')[0]}`, 'green')
          navigate('/')
        } else {
          setAlertMsg({ type: 'error', text: result?.error || 'No se pudo crear la cuenta' })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demo) => {
    setForm(f => ({ ...f, email: demo.email, password: demo.password }))
    setAlertMsg(null)
    setErrors({})
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <IconCrossBrand size={18} />
          </div>
          <span>TuFarmacia</span>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${isLogin ? styles.tabActive : ''}`}
            onClick={() => { setIsLogin(true); setAlertMsg(null); setErrors({}) }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`${styles.tab} ${!isLogin ? styles.tabActive : ''}`}
            onClick={() => { setIsLogin(false); setAlertMsg(null); setErrors({}) }}
          >
            Crear cuenta
          </button>
        </div>

        <h2 className={styles.title}>{isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h2>
        <p className={styles.sub}>
          {isLogin
            ? 'Ingresa tus credenciales para gestionar tus pedidos y recetas.'
            : 'Regístrate para comprar con despacho rápido y seguimiento clínico.'}
        </p>

        {alertMsg && (
          <div className={`${styles.alert} ${alertMsg.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
            {alertMsg.type === 'error' ? <IconAlert size={16} /> : <IconCheck size={16} />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className={styles.grid2}>
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="María"
                  value={form.name}
                  onChange={set('name')}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input
                  className="form-input"
                  placeholder="García"
                  value={form.lastName}
                  onChange={set('lastName')}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
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
                value={form.password}
                onChange={set('password')}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className={styles.eyeBtn}
              >
                <IconEye size={16} off={showPass} />
              </button>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            <span>{loading ? 'Procesando...' : isLogin ? 'Ingresar' : 'Crear cuenta'}</span>
            {!loading && <IconArrowRight size={15} />}
          </button>
        </form>

        {isLogin && (
          <div className={styles.demo}>
            <div className={styles.demoTitle}>
              <IconLock size={12} />
              <span>Accesos de demostración (clic para autocompletar)</span>
            </div>
            {DEMO_USERS.map(d => (
              <button
                key={d.email}
                type="button"
                className={styles.demoRow}
                onClick={() => fillDemo(d)}
              >
                <div className={styles.demoRowIcon}>
                  {d.role === 'admin' ? <IconShield size={15} /> : <IconUser size={15} />}
                </div>
                <div className={styles.demoRowInfo}>
                  <div className={styles.demoRowLabel}>
                    {d.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </div>
                  <div className={`${styles.demoRowCreds} mono`}>{d.email}</div>
                </div>
                <span className={styles.demoUseTip}>Usar</span>
              </button>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          {isLogin ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                className={styles.link}
                onClick={() => { setIsLogin(false); setAlertMsg(null) }}
              >
                Crear cuenta gratis
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                className={styles.link}
                onClick={() => { setIsLogin(true); setAlertMsg(null) }}
              >
                Iniciar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
