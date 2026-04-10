# 💊 TuFarmacia — MVP React + Vite

Tu farmacia en línea de confianza. Aplicación MVP completa construida con **Vite + React**.

---

## 🚀 Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
# → http://localhost:5173
```

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── Navbar.jsx          # Navegación sticky con badge de carrito
│   ├── Navbar.module.css
│   ├── ProductCard.jsx     # Tarjeta de producto con animación
│   ├── ProductCard.module.css
│   ├── Cart.jsx            # Página de carrito completa
│   ├── Cart.module.css
│   ├── Login.jsx           # Login + Registro con validación
│   ├── Login.module.css
│   ├── Dashboard.jsx       # Dashboard con Chart.js
│   └── Dashboard.module.css
│
├── pages/
│   ├── Home.jsx            # Landing + catálogo destacado
│   ├── Home.module.css
│   ├── Products.jsx        # Catálogo completo con filtros y ordenamiento
│   ├── Products.module.css
│   ├── Admin.jsx           # Panel admin + CRUD inventario
│   ├── Admin.module.css
│   ├── Contact.jsx         # Página de contacto + FAQ
│   └── Contact.module.css
│
├── context/
│   └── AppContext.jsx      # Estado global (productos, carrito, usuario, toasts)
│
├── data/
│   └── datos.js            # Productos, categorías, datos mock, chart data
│
├── App.jsx                 # Rutas + Footer + Toast renderer
├── main.jsx                # Entry point
└── index.css               # Estilos globales, variables CSS, utilidades
```

---

## ✅ Funcionalidades implementadas

### 🏠 Inicio
- Hero con animaciones y pills flotantes
- Barra de confianza (Pago Seguro, Envíos, 24/7)
- Catálogo con filtros por categoría y búsqueda

### 💊 Productos
- 12 productos en 4 categorías
- Búsqueda en tiempo real
- Filtro por categoría
- Ordenamiento (precio, nombre, stock)
- Badge de stock (OK / Bajo / Sin stock)

### 🛒 Carrito
- Agregar / eliminar productos
- Cambiar cantidades
- Cálculo de total y envío
- Envío gratis en compras > $20
- Flujo de checkout con confirmación
- Persistencia en localStorage

### 👤 Autenticación
- Login con validación
- Registro de usuario
- Sesión persistente en localStorage
- Demo: `admin@tufarmacia.com` / `admin123`

### 📊 Panel Administrativo
- Dashboard con estadísticas
- Gráficas de ventas (Chart.js)
- **CRUD completo** de inventario (agregar, editar, eliminar)
- Lista de pedidos
- Gestión de usuarios
- Reportes con barras de progreso

### 📞 Contacto
- Información de contacto
- Formulario con validación
- FAQ con 3 preguntas frecuentes

---

## 🛠️ Tecnologías

| Tecnología       | Uso                             |
|------------------|---------------------------------|
| React 18         | UI con hooks                    |
| Vite             | Bundler y dev server            |
| React Router v6  | Navegación SPA                  |
| Chart.js         | Gráficas de ventas              |
| CSS Modules      | Estilos encapsulados por módulo |
| localStorage     | Persistencia de estado          |

---

## 🎨 Diseño

- Paleta: **Verde (#1BB87A)** + **Azul (#2980d9)** + **Blanco**
- Tipografía: **Plus Jakarta Sans** (títulos) + **DM Sans** (cuerpo)
- Componentes con CSS Modules para evitar colisiones
- Variables CSS centralizadas en `index.css`
- Responsive para móvil, tablet y escritorio

---

## 🔐 Credenciales de demo

| Campo       | Valor                    |
|-------------|--------------------------|
| Email       | admin@tufarmacia.com     |
| Contraseña  | admin123                 |

---

## 📦 Dependencias

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.22.0",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0"
}
```
