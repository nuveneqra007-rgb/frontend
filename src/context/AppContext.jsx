import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { TAX_RATE, DEMO_USERS } from '../data/datos.js'
import {
  hasRemoteBackend,
  authApi,
  productsApi,
  ordersApi,
  getSeededProducts,
  getSeededOrders,
  normalizeProduct,
  normalizeOrder,
  appendInventoryMovement,
} from '../services/api.js'

const AppContext = createContext(null)

function getRegisteredUsers() {
  try { return JSON.parse(localStorage.getItem('tf_users') || '[]') } catch { return [] }
}
function saveRegisteredUsers(users) {
  localStorage.setItem('tf_users', JSON.stringify(users))
}

export function AppProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tf_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  useEffect(() => {
    const onForceLogout = () => setUser(null)
    window.addEventListener('auth:logout', onForceLogout)
    return () => window.removeEventListener('auth:logout', onForceLogout)
  }, [])

  // ── Products ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState(() => getSeededProducts())

  useEffect(() => {
    localStorage.setItem('tf_products', JSON.stringify(products))
  }, [products])

  // Sincronizar si InventoryPanel actualiza el stock vía API/localStorage
  useEffect(() => {
    const syncProducts = () => setProducts(getSeededProducts())
    window.addEventListener('tf:products-updated', syncProducts)
    return () => window.removeEventListener('tf:products-updated', syncProducts)
  }, [])

  // Si existe backend remoto (VITE_API_URL), hidratar catálogo real
  useEffect(() => {
    if (!hasRemoteBackend) return
    productsApi.getAll()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.data || [])
        if (list.length) setProducts(list.map(normalizeProduct))
      })
      .catch(() => {})
  }, [])

  const addProduct = useCallback(async (product) => {
    if (hasRemoteBackend) {
      try {
        const created = await productsApi.create(product)
        const normalized = normalizeProduct(created?.data || created)
        setProducts(prev => [...prev, normalized])
        return normalized
      } catch {
        // Fallback local si el endpoint falla
      }
    }
    let createdItem = null
    setProducts(prev => {
      const newId = prev.length ? Math.max(...prev.map(p => Number(p.id) || 0)) + 1 : 1
      createdItem = normalizeProduct({ ...product, id: newId })
      return [...prev, createdItem]
    })
    return createdItem
  }, [])

  const updateProduct = useCallback(async (id, data) => {
    if (hasRemoteBackend) {
      try {
        await productsApi.update(id, data)
      } catch {
        // continuar con actualización de estado local
      }
    }
    setProducts(prev => prev.map(p => (p.id === id ? normalizeProduct({ ...p, ...data }) : p)))
  }, [])

  const deleteProduct = useCallback(async (id) => {
    if (hasRemoteBackend) {
      try {
        await productsApi.delete(id)
      } catch {
        // continuar con actualización local
      }
    }
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 15))
  const outOfStockProducts = products.filter(p => p.stock === 0)

  // ── Cart ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('tf_cart')
      return saved ? JSON.parse(saved).map(i => normalizeProduct(i)) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('tf_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = useCallback((product, qtyToAdd = 1) => {
    if (product.stock === 0) return false
    let added = false
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        if (existing.qty + qtyToAdd > product.stock) return prev
        added = true
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qtyToAdd } : i)
      }
      if (qtyToAdd > product.stock) return prev
      added = true
      return [...prev, { ...normalizeProduct(product), qty: qtyToAdd }]
    })
    return added
  }, [])

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }, [])

  const changeQty = useCallback((id, delta) => {
    setCart(prev => {
      const updated = prev.map(i => {
        if (i.id !== id) return i
        const product = products.find(p => p.id === id)
        const maxStock = product ? product.stock : 999
        const newQty = Math.min(Math.max(0, i.qty + delta), maxStock)
        return { ...i, qty: newQty }
      })
      return updated.filter(i => i.qty > 0)
    })
  }, [products])

  const clearCart = useCallback(() => setCart([]), [])

  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartTax = cartSubtotal * TAX_RATE
  const cartTotal = cartSubtotal + cartTax
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  // ── Orders ────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState(() => getSeededOrders())

  useEffect(() => {
    localStorage.setItem('tf_orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    const syncOrders = () => setOrders(getSeededOrders())
    window.addEventListener('tf:orders-updated', syncOrders)
    return () => window.removeEventListener('tf:orders-updated', syncOrders)
  }, [])

  useEffect(() => {
    if (!hasRemoteBackend || !user) return
    ordersApi.getMyOrders()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.data || [])
        if (list.length) setOrders(list.map(normalizeOrder))
      })
      .catch(() => {})
  }, [user])

  const placeOrder = useCallback(async (orderData) => {
    if (hasRemoteBackend) {
      try {
        const res = await ordersApi.create(orderData)
        const remoteOrder = normalizeOrder(res?.data || res)
        setOrders(prev => [remoteOrder, ...prev])
        setProducts(prev => prev.map(p => {
          const item = orderData.items.find(i => i.id === p.id)
          return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p
        }))
        return remoteOrder
      } catch {
        // Continuar con registro local si falla
      }
    }

    const orderNum = `#TF-${String(Date.now()).slice(-4)}`
    const order = normalizeOrder({
      id: orderNum,
      order_number: orderNum,
      ...orderData,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: 'Pendiente',
    })
    setOrders(prev => [order, ...prev])
    setProducts(prev => prev.map(p => {
      const item = orderData.items.find(i => i.id === p.id)
      if (!item) return p
      const nextStock = Math.max(0, p.stock - item.qty)
      appendInventoryMovement({
        id: `mov_${Date.now()}_${p.id}`,
        product_id: p.id,
        product_name: p.name,
        type: 'sale',
        quantity: -item.qty,
        stock_before: p.stock,
        stock_after: nextStock,
        notes: `Orden ${orderNum}${orderData.prescriptionRef ? ` · Rx ${orderData.prescriptionRef}` : ''}`,
        created_at: new Date().toISOString(),
      })
      return { ...p, stock: nextStock }
    }))
    return order
  }, [])

  const updateOrderStatus = useCallback((id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }, [])

  // ── Auth actions ──────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    if (hasRemoteBackend) {
      try {
        const res = await authApi.login(email, password)
        if (res?.token && res?.user) {
          localStorage.setItem('tf_token', res.token)
          localStorage.setItem('tf_user', JSON.stringify(res.user))
          setUser(res.user)
          return { success: true, user: res.user }
        }
      } catch (err) {
        return { success: false, error: err.message || 'Credenciales incorrectas' }
      }
    }

    const demo = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (demo) {
      const userData = { id: `demo_${demo.role}`, name: demo.name, email: demo.email, role: demo.role, joinedAt: new Date().toISOString() }
      localStorage.setItem('tf_user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    }
    const registered = getRegisteredUsers()
    const found = registered.find(u => u.email === email && u.password === password)
    if (found) {
      const userData = { id: found.id, name: found.name, email: found.email, role: found.role, joinedAt: found.joinedAt }
      localStorage.setItem('tf_user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    }
    return { success: false, error: 'Credenciales incorrectas' }
  }, [])

  const register = useCallback(async (name, email, password) => {
    if (hasRemoteBackend) {
      try {
        const res = await authApi.register(name, email, password)
        if (res?.token && res?.user) {
          localStorage.setItem('tf_token', res.token)
          localStorage.setItem('tf_user', JSON.stringify(res.user))
          setUser(res.user)
          return { success: true, user: res.user }
        }
      } catch (err) {
        return { success: false, error: err.message || 'No se pudo crear la cuenta' }
      }
    }

    const registered = getRegisteredUsers()
    if (registered.find(u => u.email === email) || DEMO_USERS.find(u => u.email === email)) {
      return { success: false, error: 'Este correo ya está registrado' }
    }
    const newUser = {
      id: `user_${Date.now()}`,
      name, email, password, role: 'user',
      joinedAt: new Date().toISOString(),
    }
    saveRegisteredUsers([...registered, newUser])
    const userData = { id: newUser.id, name, email, role: 'user', joinedAt: newUser.joinedAt }
    localStorage.setItem('tf_user', JSON.stringify(userData))
    setUser(userData)
    return { success: true, user: userData }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('tf_token')
    localStorage.removeItem('tf_user')
    setUser(null)
  }, [])

  // ── Registered users list (for admin) ─────────────────────────────────────
  const [registeredUsers, setRegisteredUsers] = useState(() => getRegisteredUsers())

  const refreshUsers = useCallback(() => {
    setRegisteredUsers(getRegisteredUsers())
  }, [])

  // ── Product clinical detail drawer state ──────────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState(null)

  // ── Toasts ────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'green') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <AppContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct,
      lowStockProducts, outOfStockProducts,
      selectedProduct, setSelectedProduct,
      cart, addToCart, removeFromCart, changeQty, clearCart,
      cartSubtotal, cartTax, cartTotal, cartCount, TAX_RATE,
      orders, placeOrder, updateOrderStatus,
      user, login, register, logout, registeredUsers, refreshUsers,
      toasts, showToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
