# Template Include System - PymeMap Admin

## 📋 Sistema Simple de Templates

Sistema **super simple** para reutilizar el sidebar sin necesidad de servidor backend o frameworks complejos.

---

## 🎯 Qué hace

- **Carga el sidebar** automáticamente en todas las páginas
- **Detecta la página activa** y resalta el enlace correspondiente
- **Muestra datos del usuario** obtenidos desde `auth-service.js`
- **Maneja el logout** con confirmación

---

## 📁 Archivos del Sistema

### 1. **Template del Sidebar**

**Ubicación:** `/templates/left-sidebar.html`

Contiene:

- Logo y título
- Navegación con 5 páginas
- **Usuario y botón de logout** (ahora en el sidebar, no en el header)
- Versión del panel

### 2. **Script Cargador**

**Ubicación:** `/js/template-include.js`

Funciones principales:

- `includeHTML()` - Carga el template vía fetch
- `initSidebar()` - Inicializa eventos del sidebar
- `loadUserData()` - Obtiene datos del usuario autenticado

---

## 🚀 Uso en las Páginas

### Estructura HTML requerida:

```html
<!doctype html>
<html lang="es">
    <head>
        <meta charset="UTF-8" />
        <title>Mi Página — PymeMap</title>
        <link rel="stylesheet" href="css/estilo.css" />

        <!-- 1. Cargar template-include ANTES de auth-guard -->
        <script type="module" src="js/template-include.js"></script>

        <!-- 2. Auth Guard -->
        <script type="module" src="js/auth-guard.js"></script>
    </head>
    <body>
        <div class="app">
            <!-- 3. Contenedor donde se cargará el sidebar -->
            <div id="sidebar-container"></div>

            <!-- 4. Contenido principal -->
            <main class="main">
                <header class="header">
                    <!-- Solo info del negocio, NO usuario -->
                    <div class="biz">
                        <img src="..." alt="Business logo" />
                        <div>
                            <div class="name">Mi Negocio</div>
                            <div>Descripción</div>
                        </div>
                    </div>
                </header>

                <!-- Contenido de la página -->
                <section class="card">
                    <h1>Contenido...</h1>
                </section>
            </main>
        </div>

        <script src="js/mi-script.js"></script>
    </body>
</html>
```

---

## ✅ Páginas Actualizadas

| Página           | Estado         | Notas                                           |
| ---------------- | -------------- | ----------------------------------------------- |
| `index.html`     | ✅ Actualizada | Sidebar cargado dinámicamente                   |
| `pedidos.html`   | ✅ Actualizada | Sidebar cargado dinámicamente                   |
| `servicios.html` | ✅ Actualizada | Sidebar cargado dinámicamente + layout mejorado |
| `historial.html` | ⏸️ Pendiente   | Requiere refactoring mayor                      |
| `vision.html`    | ⏸️ Pendiente   | Requiere refactoring mayor                      |
| `login.html`     | ⛔ No aplica   | No usa sidebar                                  |

---

## 🎨 Cambios en el Layout

### ❌ Antes: Usuario en el Header (arriba a la derecha)

```
┌─────────────┬────────────────────────────────────┐
│   SIDEBAR   │  HEADER                     [USER] │
│             ├────────────────────────────────────┤
│             │                                    │
│             │  CONTENT                           │
│             │                                    │
└─────────────┴────────────────────────────────────┘
```

### ✅ Ahora: Usuario en el Sidebar (abajo)

```
┌─────────────┬────────────────────────────────────┐
│   SIDEBAR   │  HEADER (solo info del negocio)   │
│             ├────────────────────────────────────┤
│             │                                    │
│   [USER]    │  CONTENT                           │
│   [LOGOUT]  │                                    │
│   Version   │                                    │
└─────────────┴────────────────────────────────────┘
```

**Ventajas:**

- ✅ Más espacio en el header para info del negocio
- ✅ Usuario siempre visible sin scroll
- ✅ Botón de logout accesible desde cualquier página
- ✅ Diseño más limpio y moderno

---

## 🔧 Cómo Funciona

### 1. **Carga Automática**

Cuando la página carga:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    const sidebarContainer = document.getElementById('sidebar-container')
    if (sidebarContainer) {
        await includeHTML('#sidebar-container', 'templates/left-sidebar.html')
        initSidebar()
    }
})
```

### 2. **Detección de Página Activa**

El template incluye un script que se ejecuta automáticamente:

```javascript
const currentPage = window.location.pathname.split('/').pop() || 'index.html'
const links = document.querySelectorAll('.sidebar .nav a')

links.forEach(link => {
    const page = link.getAttribute('data-page') + '.html'
    if (page === currentPage) {
        link.classList.add('active')
    }
})
```

### 3. **Carga de Datos del Usuario**

```javascript
async function loadUserData() {
    const { getCurrentUser } = await import('./auth-service.js')
    const user = await getCurrentUser()

    if (user) {
        document.getElementById('sidebar-user-avatar').textContent = user.name
            .charAt(0)
            .toUpperCase()
        document.getElementById('sidebar-user-name').textContent = user.name
        document.getElementById('sidebar-user-role').textContent =
            user.role === 'business' ? 'Negocio' : 'Administrador'
    }
}
```

### 4. **Manejo de Logout**

```javascript
document.getElementById('sidebar-logout-btn').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        import('./auth-service.js').then(({ logout }) => {
            logout()
            window.location.href = 'login.html'
        })
    }
})
```

---

## 🎯 Ventajas de Este Enfoque

### ✅ Simplicidad

- No requiere servidor backend para SSI (Server Side Includes)
- No usa frameworks complejos
- JavaScript vanilla puro
- Fácil de entender y mantener

### ✅ Mantenibilidad

- **Un solo archivo** para el sidebar (`templates/left-sidebar.html`)
- Cambios en un lugar se reflejan en todas las páginas
- Fácil agregar nuevas páginas

### ✅ Performance

- Carga asíncrona, no bloquea el render inicial
- El template HTML es pequeño (~80 líneas)
- Se cachea automáticamente por el navegador

### ✅ Compatibilidad

- Funciona en todos los navegadores modernos
- No requiere compilación ni build step
- Compatible con GitHub Pages, Netlify, cualquier hosting estático

---

## 🐛 Troubleshooting

### El sidebar no aparece

**Causa:** Error de CORS si abres el HTML directamente (file://)

**Solución:** Usa un servidor local:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# VS Code
Usa Live Server extension
```

### La página activa no se resalta

**Verificar:** Los enlaces en el template tienen `data-page` correcto:

```html
<a href="index.html" data-page="index">💬 Comentarios</a>
```

### El usuario no se carga

**Verificar:**

1. `auth-service.js` existe y exporta `getCurrentUser`
2. El usuario está autenticado (token en localStorage)
3. La consola del navegador para ver errores

---

## 📝 Próximos Pasos

- [ ] Refactorizar `historial.html` para usar el sistema
- [ ] Refactorizar `vision.html` para usar el sistema
- [ ] Opcional: Crear template para el header también
- [ ] Opcional: Agregar animación de entrada al sidebar

---

## 🔗 Archivos Relacionados

- `/templates/left-sidebar.html` - Template del sidebar
- `/js/template-include.js` - Script cargador
- `/js/auth-service.js` - Servicio de autenticación
- `/js/auth-guard.js` - Protección de rutas
- `/css/estilo.css` - Estilos

---

**Creado:** Enero 2025  
**Sistema:** Template Include (JavaScript Vanilla)
