// ── Cliente API centralizado y Adaptador Dual ─────────────────────────────────
// Compatible 100% con el backend REST/JWT (VITE_API_URL).
// Cuando VITE_API_URL no está configurado, sincroniza con el store local para
// que toda la experiencia Full-Stack opere sin errores en demostración autónoma.

import {
  initialProducts,
  PRODUCT_IMAGES_BY_NAME,
  PRODUCT_IMAGE_ALIASES,
  PENDING_PRODUCT_IMAGES,
  DEMO_USERS,
} from '../data/datos.js'

const BASE_URL = import.meta.env.VITE_API_URL || ''
export const hasRemoteBackend = Boolean(BASE_URL)

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// ── Normalización Frontend ↔ Backend (snake_case <-> camelCase) ───────────────
export function normalizeProductNameKey(name) {
  if (typeof name !== 'string') return ''
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const NORMALIZED_IMAGE_MAP = Object.entries({
  ...PRODUCT_IMAGES_BY_NAME,
  ...PRODUCT_IMAGE_ALIASES,
}).reduce((acc, [key, img]) => {
  acc[normalizeProductNameKey(key)] = img
  return acc
}, {})

export function resolveProductImageMeta(product, allProducts = []) {
  const rawName = typeof product?.name === 'string' ? product.name.trim() : ''
  if (!rawName) {
    return {
      image: null,
      imageStatus: 'pending',
      imagePendingReason: 'Producto sin nombre registrado',
    }
  }

  const normalizedTarget = normalizeProductNameKey(rawName)

  // Detectar nombres duplicados o ambiguos dentro del catálogo visible
  if (Array.isArray(allProducts) && allProducts.length > 0) {
    const matches = allProducts.filter(
      item => typeof item?.name === 'string' && normalizeProductNameKey(item.name) === normalizedTarget
    )
    if (matches.length > 1) {
      return {
        image: null,
        imageStatus: 'pending',
        imagePendingReason: 'Nombre duplicado o ambiguo en el catálogo',
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(PRODUCT_IMAGES_BY_NAME, rawName)) {
    return {
      image: PRODUCT_IMAGES_BY_NAME[rawName],
      imageStatus: 'verified',
      imagePendingReason: null,
    }
  }

  if (Object.prototype.hasOwnProperty.call(NORMALIZED_IMAGE_MAP, normalizedTarget)) {
    return {
      image: NORMALIZED_IMAGE_MAP[normalizedTarget],
      imageStatus: 'verified',
      imagePendingReason: null,
    }
  }

  if (Object.prototype.hasOwnProperty.call(PENDING_PRODUCT_IMAGES, rawName)) {
    return {
      image: null,
      imageStatus: 'pending',
      imagePendingReason: PENDING_PRODUCT_IMAGES[rawName],
    }
  }

  return {
    image: null,
    imageStatus: 'pending',
    imagePendingReason: 'Sin coincidencia exacta de imagen registrada',
  }
}

export function resolveProductImage(product, allProducts = []) {
  return resolveProductImageMeta(product, allProducts).image
}

export function normalizeProduct(raw, allProducts = []) {
  if (!raw) return raw
  const cat = raw.cat || raw.category || 'Analgésicos'
  const imageMeta = resolveProductImageMeta(raw, allProducts)
  return {
    ...raw,
    id: Number(raw.id) || raw.id,
    cat,
    price: Number(raw.price || 0),
    stock: Number(raw.stock ?? 0),
    desc: raw.desc || raw.description || '',
    lowStockThreshold: Number(raw.lowStockThreshold ?? raw.low_stock_threshold ?? 15),
    requiresPrescription: Boolean(raw.requiresPrescription ?? raw.requires_prescription ?? false),
    lote: raw.lote || raw.batch_number || '',
    expiry: raw.expiry || raw.expiry_date || '',
    proveedor: raw.proveedor || raw.supplier || '',
    sku: raw.sku || '',
    image: imageMeta.image,
    imageStatus: imageMeta.imageStatus,
    imagePendingReason: imageMeta.imagePendingReason,
  }
}

export function reconcileCatalogImages(list) {
  const safeList = Array.isArray(list) ? list : []
  return safeList.map(item => normalizeProduct(item, safeList))
}

export function normalizeOrder(raw) {
  if (!raw) return raw
  const addressObj = raw.address || {
    name: raw.user_name || raw.userName || 'Cliente',
    phone: raw.delivery_phone || raw.phone || '',
    address: raw.delivery_address || '',
    sector: raw.delivery_sector || '',
    city: raw.delivery_city || 'Santo Domingo',
  }
  return {
    ...raw,
    order_number: raw.order_number || raw.id,
    date: raw.date || raw.created_at || new Date().toISOString(),
    created_at: raw.created_at || raw.date || new Date().toISOString(),
    paymentMethod: raw.paymentMethod || raw.payment_method || 'card',
    payment_method: raw.payment_method || raw.paymentMethod || 'card',
    user_name: raw.user_name || raw.userName || addressObj.name || 'Cliente',
    user_email: raw.user_email || raw.userEmail || '',
    address: addressObj,
    delivery_address: raw.delivery_address || addressObj.address || '',
    delivery_sector: raw.delivery_sector || addressObj.sector || '',
    delivery_city: raw.delivery_city || addressObj.city || 'Santo Domingo',
    total: Number(raw.total || 0),
    subtotal: Number(raw.subtotal || 0),
    tax: Number(raw.tax || 0),
    shipping: Number(raw.shipping || 0),
  }
}

// ── LocalStorage helpers ──────────────────────────────────────────────────────
function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage quota errors
  }
}

export function getSeededProducts() {
  const saved = readLS('tf_products', null)
  if (!saved) {
    const initial = reconcileCatalogImages(initialProducts)
    writeLS('tf_products', initial)
    return initial
  }
  // Sincronizar plantillas clínicas y validar imágenes por nombre normalizado
  const merged = saved.map(p => {
    const normalizedName = normalizeProductNameKey(p?.name)
    const template = initialProducts.find(
      ip => normalizeProductNameKey(ip.name) === normalizedName
    )
    return {
      ...template,
      ...p,
    }
  })
  const reconciled = reconcileCatalogImages(merged)
  writeLS('tf_products', reconciled)
  return reconciled
}

export function getSeededOrders() {
  const saved = readLS('tf_orders', null)
  if (saved) return saved.map(normalizeOrder)

  const now = Date.now()
  const seeded = [
    {
      id: '#TF-1042',
      order_number: '#TF-1042',
      userId: 'demo_user',
      userName: 'María García',
      userEmail: 'cliente@demo.com',
      items: [
        { id: 1, name: 'Paracetamol 500mg', cat: 'Analgésicos', price: 185, qty: 2 },
        { id: 2, name: 'Vitamina C 1000mg', cat: 'Vitaminas', price: 490, qty: 1 },
      ],
      subtotal: 860,
      tax: 154.8,
      shipping: 0,
      total: 1014.8,
      status: 'Pendiente',
      paymentMethod: 'card',
      address: {
        name: 'María García',
        phone: '809-555-0142',
        address: 'Av. Winston Churchill #48, Torre A',
        sector: 'Piantini',
        city: 'Santo Domingo',
      },
      date: new Date(now - 2 * 3600000).toISOString(),
      created_at: new Date(now - 2 * 3600000).toISOString(),
    },
    {
      id: '#TF-1041',
      order_number: '#TF-1041',
      userId: 'demo_user',
      userName: 'María García',
      userEmail: 'cliente@demo.com',
      items: [
        { id: 11, name: 'Omega 3 1000mg', cat: 'Vitaminas', price: 780, qty: 1 },
        { id: 10, name: 'Crema Hidratante 200ml', cat: 'Cuidado Personal', price: 690, qty: 1 },
      ],
      subtotal: 1470,
      tax: 264.6,
      shipping: 0,
      total: 1734.6,
      status: 'Enviado',
      paymentMethod: 'card',
      address: {
        name: 'María García',
        phone: '809-555-0142',
        address: 'Calle Federico Geraldino #12',
        sector: 'Naco',
        city: 'Santo Domingo',
      },
      date: new Date(now - 28 * 3600000).toISOString(),
      created_at: new Date(now - 28 * 3600000).toISOString(),
    },
    {
      id: '#TF-1039',
      order_number: '#TF-1039',
      userId: 'demo_user',
      userName: 'Carlos Méndez',
      userEmail: 'cmendez@correo.do',
      items: [
        { id: 4, name: 'Ibuprofeno 400mg', cat: 'Analgésicos', price: 240, qty: 2 },
        { id: 3, name: 'Amoxicilina 500mg', cat: 'Antibióticos', price: 420, qty: 1 },
        { id: 14, name: 'Proteína Whey 1kg', cat: 'Vitaminas', price: 2450, qty: 1 },
      ],
      subtotal: 3350,
      tax: 603,
      shipping: 0,
      total: 3953,
      status: 'Entregado',
      paymentMethod: 'cash',
      prescriptionRef: 'RX-2026-8841',
      address: {
        name: 'Carlos Méndez',
        phone: '809-555-0188',
        address: 'Av. Sarasota #92',
        sector: 'Bella Vista',
        city: 'Santo Domingo',
      },
      date: new Date(now - 4 * 86400000).toISOString(),
      created_at: new Date(now - 4 * 86400000).toISOString(),
    },
  ].map(normalizeOrder)

  writeLS('tf_orders', seeded)
  return seeded
}

function getUsersList() {
  const registered = readLS('tf_users', [])
  const statusMap = readLS('tf_user_status', {})
  const orders = getSeededOrders()

  const all = [
    ...DEMO_USERS.map((u, idx) => ({
      id: `demo_${u.role}`,
      name: u.name,
      email: u.email,
      role: u.role,
      created_at: new Date(Date.now() - (30 - idx * 5) * 86400000).toISOString(),
    })),
    ...registered.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      created_at: u.joinedAt || u.created_at || new Date().toISOString(),
    })),
  ]

  return all.map(u => {
    const userOrders = orders.filter(o => o.userId === u.id || o.user_email === u.email)
    const totalSpent = userOrders.reduce((s, o) => s + Number(o.total || 0), 0)
    return {
      ...u,
      total_orders: userOrders.length,
      total_spent: totalSpent,
      is_active: statusMap[u.id] !== undefined ? statusMap[u.id] : true,
    }
  })
}

export function getSeededMovements() {
  const saved = readLS('tf_inventory_movements', null)
  if (saved) return saved
  const products = getSeededProducts()
  const seeded = [
    {
      id: 'mov_sale_1',
      product_id: 1,
      product_name: 'Paracetamol 500mg',
      type: 'sale',
      quantity: -2,
      stock_before: 50,
      stock_after: 48,
      notes: 'Orden #TF-1042',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'mov_sale_2',
      product_id: 3,
      product_name: 'Amoxicilina 500mg',
      type: 'sale',
      quantity: -1,
      stock_before: 16,
      stock_after: 15,
      notes: 'Orden #TF-1039 (Receta RX-2026-8841)',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    ...products.slice(0, 3).map((p, idx) => ({
      id: `mov_init_${p.id}`,
      product_id: p.id,
      product_name: p.name,
      type: 'restock',
      quantity: p.stock,
      stock_before: 0,
      stock_after: p.stock,
      notes: `Recepción lote ${p.lote}`,
      created_at: new Date(Date.now() - (idx + 5) * 86400000).toISOString(),
    })),
  ]
  writeLS('tf_inventory_movements', seeded)
  return seeded
}

export function appendInventoryMovement(movement) {
  const movements = getSeededMovements()
  writeLS('tf_inventory_movements', [movement, ...movements])
}

function getNotifications() {
  const saved = readLS('tf_notifications', null)
  if (saved) return saved
  const products = getSeededProducts()
  const alerts = products.filter(p => p.stock === 0 || p.stock <= p.lowStockThreshold)
  const seeded = [
    {
      id: 'notif_order_1042',
      type: 'order_created',
      title: 'Nuevo pedido recibido (#TF-1042)',
      message: 'María García realizó una orden por RD$1,014.80.',
      is_read: false,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    ...alerts.slice(0, 5).map((p, idx) => ({
      id: `notif_${p.id}`,
      type: p.stock === 0 ? 'out_of_stock' : 'low_stock',
      title: p.stock === 0 ? `Agotado: ${p.name}` : `Stock bajo: ${p.name}`,
      message: p.stock === 0
        ? `SKU ${p.sku} sin disponibilidad en inventario.`
        : `Quedan ${p.stock} unidades (umbral mínimo: ${p.lowStockThreshold}).`,
      is_read: idx > 1,
      created_at: new Date(Date.now() - (idx + 3) * 3600000).toISOString(),
    })),
  ]
  writeLS('tf_notifications', seeded)
  return seeded
}

async function mockRequest(method, path, body = null) {
  const [cleanPath, queryString = ''] = path.split('?')
  const params = new URLSearchParams(queryString)

  // ── Admin Stats ──
  if (method === 'GET' && cleanPath === '/admin/stats') {
    const orders = getSeededOrders()
    const products = getSeededProducts()
    const users = getUsersList()
    const now = new Date()

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0)
    const monthlyRevenue = orders
      .filter(o => {
        const d = new Date(o.created_at || o.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((s, o) => s + Number(o.total || 0), 0)

    const counts = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 }
    orders.forEach(o => {
      if (o.status === 'Pendiente') counts.pending++
      else if (o.status === 'Enviado') counts.shipped++
      else if (o.status === 'Entregado') counts.delivered++
      else if (o.status === 'Cancelado') counts.cancelled++
    })

    const salesMap = {}
    const catRevenue = {}
    orders.forEach(o => {
      ;(o.items || []).forEach(item => {
        const prod = products.find(p => p.id === item.id)
        const key = prod?.sku || `SKU-${item.id}`
        const cat = prod?.cat || item.cat || 'General'
        if (!salesMap[key]) {
          salesMap[key] = {
            sku: key,
            name: item.name,
            units_sold: 0,
          }
        }
        salesMap[key].units_sold += Number(item.qty || 0)
        catRevenue[cat] = (catRevenue[cat] || 0) + Number(item.price || 0) * Number(item.qty || 0)
      })
    })
    const topProducts = Object.values(salesMap)
      .sort((a, b) => b.units_sold - a.units_sold)
      .slice(0, 5)

    const newThisMonth = users.filter(u => {
      const d = new Date(u.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    return {
      revenue: { total_revenue: totalRevenue, monthly_revenue: monthlyRevenue },
      orders: { ...counts, total: orders.length },
      users: { total: users.length, new_this_month: newThisMonth },
      top_products: topProducts,
      category_revenue: catRevenue,
    }
  }

  // ── Admin Orders ──
  if (method === 'GET' && cleanPath === '/admin/orders') {
    const statusFilter = params.get('status')
    const orders = getSeededOrders()
    const filtered = statusFilter ? orders.filter(o => o.status === statusFilter) : orders
    return { data: filtered }
  }

  const orderStatusMatch = cleanPath.match(/^\/admin\/orders\/(.+)\/status$/)
  if (method === 'PATCH' && orderStatusMatch) {
    const id = decodeURIComponent(orderStatusMatch[1])
    const orders = getSeededOrders().map(o => (String(o.id) === id ? { ...o, status: body?.status || o.status } : o))
    writeLS('tf_orders', orders)
    window.dispatchEvent(new Event('tf:orders-updated'))
    return { ok: true }
  }

  // ── Admin Users ──
  if (method === 'GET' && cleanPath === '/admin/users') {
    return { data: getUsersList() }
  }

  const toggleUserMatch = cleanPath.match(/^\/admin\/users\/(.+)\/toggle$/)
  if (method === 'PATCH' && toggleUserMatch) {
    const id = decodeURIComponent(toggleUserMatch[1])
    const statusMap = readLS('tf_user_status', {})
    const current = statusMap[id] !== undefined ? statusMap[id] : true
    statusMap[id] = !current
    writeLS('tf_user_status', statusMap)
    return { ok: true, is_active: statusMap[id] }
  }

  // ── Inventory ──
  if (method === 'GET' && cleanPath === '/admin/inventory/summary') {
    const products = getSeededProducts()
    const outOfStock = products.filter(p => p.stock === 0).length
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length
    const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0)
    return {
      summary: {
        total_products: products.length,
        out_of_stock: outOfStock,
        low_stock: lowStock,
        inventory_value: inventoryValue,
      },
    }
  }

  if (method === 'GET' && cleanPath === '/admin/inventory/movements') {
    const limit = parseInt(params.get('limit') || '40', 10)
    const movements = getSeededMovements()
    return { data: movements.slice(0, limit) }
  }

  if (method === 'GET' && cleanPath === '/admin/inventory/alerts') {
    const products = getSeededProducts()
    return products
      .filter(p => p.stock === 0 || p.stock <= p.lowStockThreshold)
      .map(p => ({
        id: `alert_${p.id}`,
        product_id: p.id,
        name: p.name,
        sku: p.sku || '—',
        stock: p.stock,
        low_stock_threshold: p.lowStockThreshold,
        alert_type: p.stock === 0 ? 'out_of_stock' : 'low_stock',
        sent_at: new Date().toISOString(),
      }))
  }

  if (method === 'POST' && (cleanPath === '/admin/inventory/restock' || cleanPath === '/admin/inventory/adjust')) {
    const productId = Number(body?.productId)
    const quantity = parseInt(body?.quantity || 0, 10)
    const products = getSeededProducts()
    const target = products.find(p => Number(p.id) === productId)
    if (!target) throw new ApiError('Producto no encontrado', 404)

    const stockBefore = Number(target.stock || 0)
    const stockAfter = Math.max(0, stockBefore + quantity)
    const updatedProducts = products.map(p => (Number(p.id) === productId ? { ...p, stock: stockAfter } : p))
    writeLS('tf_products', updatedProducts)
    window.dispatchEvent(new Event('tf:products-updated'))

    appendInventoryMovement({
      id: `mov_${Date.now()}`,
      product_id: target.id,
      product_name: target.name,
      type: cleanPath.endsWith('restock') ? 'restock' : 'adjustment',
      quantity,
      stock_before: stockBefore,
      stock_after: stockAfter,
      notes: body?.notes || 'Reposición manual',
      created_at: new Date().toISOString(),
    })
    return { ok: true, stock: stockAfter }
  }

  // ── Notifications ──
  if (method === 'GET' && cleanPath === '/notifications/unread-count') {
    const notifs = getNotifications()
    return { count: notifs.filter(n => !n.is_read).length }
  }

  if (method === 'GET' && cleanPath === '/notifications') {
    const limit = parseInt(params.get('limit') || '10', 10)
    return { data: getNotifications().slice(0, limit) }
  }

  if (method === 'PATCH' && cleanPath === '/notifications/read-all') {
    const notifs = getNotifications().map(n => ({ ...n, is_read: true }))
    writeLS('tf_notifications', notifs)
    return { ok: true }
  }

  const notifReadMatch = cleanPath.match(/^\/notifications\/(.+)\/read$/)
  if (method === 'PATCH' && notifReadMatch) {
    const id = decodeURIComponent(notifReadMatch[1])
    const notifs = getNotifications().map(n => (String(n.id) === id ? { ...n, is_read: true } : n))
    writeLS('tf_notifications', notifs)
    return { ok: true }
  }

  if (method === 'GET' && cleanPath === '/products') {
    return { data: getSeededProducts() }
  }

  if (method === 'GET' && cleanPath === '/orders') {
    return { data: getSeededOrders() }
  }

  return {}
}

async function request(method, path, body = null, options = {}) {
  if (!BASE_URL) {
    return mockRequest(method, path, body)
  }

  const token = localStorage.getItem('tf_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const config = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, config)

  if (res.status === 401) {
    localStorage.removeItem('tf_token')
    localStorage.removeItem('tf_user')
    window.dispatchEvent(new Event('auth:logout'))
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(data.error || `Error ${res.status}`, res.status)
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get:    (path, options)       => request('GET',    path, null, options),
  post:   (path, body, options) => request('POST',   path, body, options),
  put:    (path, body, options) => request('PUT',    path, body, options),
  patch:  (path, body, options) => request('PATCH',  path, body, options),
  delete: (path, options)       => request('DELETE', path, null, options),
}

// ── Auth endpoints ────────────────────────────────────────────────────────────
export const authApi = {
  login:           (email, password) => api.post('/auth/login', { email, password }),
  register:        (name, email, password) => api.post('/auth/register', { name, email, password }),
  me:              ()     => api.get('/auth/me'),
  updateMe:        (data) => api.patch('/auth/me', data),
  changePassword:  (data) => api.patch('/auth/change-password', data),
}

// ── Products endpoints ────────────────────────────────────────────────────────
export const productsApi = {
  getAll:   (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString()
    return api.get(`/products${qs ? `?${qs}` : ''}`)
  },
  getOne:   (id)   => api.get(`/products/${id}`),
  getStats: ()     => api.get('/products/stats'),
  create:   (data) => api.post('/products', data),
  update:   (id, data) => api.put(`/products/${id}`, data),
  delete:   (id)   => api.delete(`/products/${id}`),
}

// ── Orders endpoints ──────────────────────────────────────────────────────────
export const ordersApi = {
  create:   (data) => api.post('/orders', data),
  getMyOrders: ()  => api.get('/orders'),
  getOne:   (id)   => api.get(`/orders/${id}`),
}

// ── Admin endpoints ───────────────────────────────────────────────────────────
export const adminApi = {
  getStats:          ()         => api.get('/admin/stats'),
  getOrders:         (params)   => {
    const qs = new URLSearchParams(params || {}).toString()
    return api.get(`/admin/orders${qs ? `?${qs}` : ''}`)
  },
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  getUsers:          (params)   => {
    const qs = new URLSearchParams(params || {}).toString()
    return api.get(`/admin/users${qs ? `?${qs}` : ''}`)
  },
  toggleUser:        (id)       => api.patch(`/admin/users/${id}/toggle`),
}

// ── Inventory endpoints (admin) ───────────────────────────────────────────────
export const inventoryApi = {
  getSummary:   ()           => api.get('/admin/inventory/summary'),
  getMovements: (params)     => api.get(`/admin/inventory/movements?${new URLSearchParams(params || {})}`),
  getAlerts:    ()           => api.get('/admin/inventory/alerts'),
  restock:      (data)       => api.post('/admin/inventory/restock', data),
  adjust:       (data)       => api.post('/admin/inventory/adjust', data),
}

// ── Notifications endpoints ───────────────────────────────────────────────────
export const notificationsApi = {
  getAll:        (params)    => api.get(`/notifications?${new URLSearchParams(params || {})}`),
  getUnreadCount: ()         => api.get('/notifications/unread-count'),
  markRead:      (id)        => api.patch(`/notifications/${id}/read`),
  markAllRead:   ()          => api.patch('/notifications/read-all'),
}

// ── Invoice (PDF download URL helper) ────────────────────────────────────────
export const getInvoiceUrl = (orderId, preview = false) => {
  const BASE = import.meta.env.VITE_API_URL || ''
  if (!BASE) return '#'
  const token = localStorage.getItem('tf_token')
  return `${BASE}/orders/${orderId}/invoice${preview ? '/preview' : ''}?token=${token}`
}
