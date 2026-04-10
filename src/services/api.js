// ── Cliente API centralizado ──────────────────────────────────────────────────
// Todas las llamadas al backend pasan por aquí.
// El token JWT se adjunta automáticamente a cada request.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(method, path, body = null, options = {}) {
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

  // Token expirado — limpiar sesión
  if (res.status === 401) {
    localStorage.removeItem('tf_token')
    localStorage.removeItem('tf_user')
    window.dispatchEvent(new Event('auth:logout'))
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(data.error || `Error ${res.status}`, res.status)
  }

  // 204 No Content
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
  const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
  const token = localStorage.getItem('tf_token')
  // Retorna URL directa — el browser adjunta el token via parámetro para descarga directa
  // En producción se recomienda generar un signed URL temporal
  return `${BASE}/orders/${orderId}/invoice${preview ? '/preview' : ''}?token=${token}`
}
