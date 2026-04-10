import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { initialProducts, TAX_RATE, DEMO_USERS } from '../data/datos'

const AppContext = createContext(null)

// ── Auth helpers (localStorage-based "backend" simulation) ────────────────────
function getRegisteredUsers() {
  try { return JSON.parse(localStorage.getItem('tf_users') || '[]') } catch { return [] }
}
function saveRegisteredUsers(users) {
  localStorage.setItem('tf_users', JSON.stringify(users))
}

export function AppProvider({ children }) {

  // ── Products ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('tf_products')
      return saved ? JSON.parse(saved) : initialProducts
    } catch { return initialProducts }
  })

  useEffect(() => {
    localStorage.setItem('tf_products', JSON.stringify(products))
  }, [products])

  const addProduct = useCallback((product) => {
    setProducts(prev => {
      const newId = prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1
      return [...prev, { ...product, id: newId }]
    })
  }, [])

  const updateProduct = useCallback((id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  // Low stock products
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 15))
  const outOfStockProducts = products.filter(p => p.stock === 0)

  // ── Cart ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('tf_cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('tf_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = useCallback((product) => {
    if (product.stock === 0) return false
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        // Check stock limit
        const currentQty = existing.qty
        if (currentQty >= product.stock) return prev
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...product, qty: 1 }]
    })
    return true
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
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('tf_orders')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('tf_orders', JSON.stringify(orders))
  }, [orders])

  const placeOrder = useCallback((orderData) => {
    const order = {
      id: `#${String(Date.now()).slice(-6)}`,
      ...orderData,
      date: new Date().toISOString(),
      status: 'Pendiente',
    }
    setOrders(prev => [order, ...prev])
    // Decrease stock
    setProducts(prev => prev.map(p => {
      const item = orderData.items.find(i => i.id === p.id)
      return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p
    }))
    return order
  }, [])

  const updateOrderStatus = useCallback((id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }, [])

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tf_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const login = useCallback((email, password) => {
    // Check demo users first
    const demo = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (demo) {
      const userData = { id: `demo_${demo.role}`, name: demo.name, email: demo.email, role: demo.role, joinedAt: new Date().toISOString() }
      localStorage.setItem('tf_user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    }
    // Check registered users
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

  const register = useCallback((name, email, password) => {
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
    localStorage.removeItem('tf_user')
    setUser(null)
  }, [])

  // ── Registered users list (for admin) ─────────────────────────────────────
  const [registeredUsers, setRegisteredUsers] = useState(() => getRegisteredUsers())

  const refreshUsers = useCallback(() => {
    setRegisteredUsers(getRegisteredUsers())
  }, [])

  // ── Toasts ────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'green') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <AppContext.Provider value={{
      // Products
      products, addProduct, updateProduct, deleteProduct,
      lowStockProducts, outOfStockProducts,
      // Cart
      cart, addToCart, removeFromCart, changeQty, clearCart,
      cartSubtotal, cartTax, cartTotal, cartCount, TAX_RATE,
      // Orders
      orders, placeOrder, updateOrderStatus,
      // Auth
      user, login, register, logout, registeredUsers, refreshUsers,
      // UI
      toasts, showToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
