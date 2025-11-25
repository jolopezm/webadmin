# 🔐 Sistema de Autenticación - PymeMap WebAdmin

## 📋 Resumen

Sistema completo de autenticación JWT para el panel administrativo de PymeMap, integrado con el backend existente.

## 🏗️ Arquitectura

```
webadmin/
├── login.html              # Página de inicio de sesión
├── js/
│   ├── auth-service.js     # Servicio de autenticación (API calls)
│   └── auth-guard.js       # Protección de rutas
└── [páginas protegidas]    # index.html, pedidos.html, etc.
```

## ✨ Características

- ✅ **Login con JWT**: Autenticación mediante tokens
- ✅ **Protección de rutas**: Todas las páginas del admin protegidas
- ✅ **Persistencia de sesión**: Token almacenado en localStorage
- ✅ **Logout seguro**: Limpieza de tokens y redirección
- ✅ **Información de usuario**: Avatar, nombre, etc.
- ✅ **Expiración de sesión**: Verificación automática cada 5 min
- ✅ **Diseño responsive**: Funciona en desktop y mobile
- ✅ **UX mejorada**: Animaciones, loading states, feedback visual

## 🔑 Endpoints Utilizados

### POST `/login`

```javascript
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### GET `/users/me`

```javascript
// Headers
Authorization: Bearer {token}

// Response
{
  "id": "123",
  "email": "user@example.com",
  "name": "Usuario Ejemplo",
  "role": "business",
  "business_name": "Mi Negocio"
}
```

## 📦 Archivos Creados

### 1. `login.html` (Página de Login)

- Formulario de inicio de sesión
- Toggle de visibilidad de contraseña
- Validación de campos
- Estados de loading
- Mensajes de error/éxito
- Diseño moderno con gradiente

### 2. `js/auth-service.js` (Servicio de Autenticación)

**Funciones principales:**

```javascript
// Login
await login({ email, password })

// Verificar autenticación
isAuthenticated() // returns boolean

// Obtener usuario actual
await getCurrentUser()

// Obtener datos almacenados
getStoredUser()

// Logout
await logout()

// Obtener token
getToken()

// Verificar roles
hasRole('admin')
isAdmin()
isBusiness()
```

### 3. `js/auth-guard.js` (Protección de Rutas)

**Funcionalidades:**

- Verifica autenticación al cargar cada página
- Redirige a login si no está autenticado
- Inicializa información del usuario en la UI
- Crea botón de logout automáticamente
- Monitorea expiración de sesión (cada 5 min)
- Permite verificar permisos específicos

## 🚀 Uso

### Proteger una nueva página

1. Agrega el script al `<head>`:

```html
<head>
    <!-- ... otros scripts ... -->

    <!-- Auth Guard - Protege esta página -->
    <script type="module" src="js/auth-guard.js"></script>
</head>
```

2. ¡Listo! La página ahora está protegida.

### Usar el servicio de auth en tu código

```javascript
// Importar funciones necesarias
import { login, logout, getStoredUser } from './js/auth-service.js'

// Login
try {
    await login({
        email: 'user@example.com',
        password: 'password',
    })
    console.log('Login exitoso')
} catch (error) {
    console.error('Error:', error.message)
}

// Obtener usuario
const user = getStoredUser()
console.log('Usuario:', user.name)

// Logout
await logout()
```

### Verificar permisos específicos

```javascript
import { checkPermissions } from './js/auth-guard.js'

// En una página que solo admins pueden ver
document.addEventListener('DOMContentLoaded', () => {
    checkPermissions(['admin'])
})
```

## 🎨 Personalización

### Cambiar la URL de la API

Edita `js/auth-service.js`:

```javascript
// Línea 8
const API_URL = 'https://tu-api.com'
```

### Modificar el diseño del login

Los estilos están en el mismo `login.html` dentro de `<style>`.
Puedes ajustar colores, tamaños, animaciones, etc.

### Agregar campos adicionales

En `login.html`, agrega inputs al formulario:

```html
<div class="form-group">
    <label class="form-label" for="business_code">Código de Negocio</label>
    <input type="text" id="business_code" class="form-input" />
</div>
```

Y en el submit handler:

```javascript
const businessCode = document.getElementById('business_code').value
await login({ email, password, business_code: businessCode })
```

## 🔒 Seguridad

### Buenas prácticas implementadas:

1. **Tokens en localStorage**:
    - Más seguro que cookies para SPA
    - No vulnerable a CSRF
    - Permite control manual del token

2. **Limpieza en logout**:
    - Elimina token y datos de usuario
    - Redirige a login

3. **Verificación automática**:
    - Cada 5 minutos verifica si el token sigue válido
    - Si expira, logout automático

4. **Redirección segura**:
    - Si 401 en cualquier request → logout + redirect

5. **No expone credenciales**:
    - Contraseñas nunca se almacenan
    - Solo se guarda el token JWT

### Mejoras de seguridad adicionales (opcionales):

1. **HTTPS obligatorio** en producción
2. **Refresh tokens** para sesiones largas
3. **Rate limiting** en el login
4. **2FA** (two-factor authentication)
5. **Encriptación adicional** del localStorage

## 🐛 Debugging

### El login no funciona

1. **Verifica la consola del navegador** (F12)
2. **Revisa la URL de la API** en `auth-service.js`
3. **Prueba el endpoint** con curl:

```bash
curl -X POST https://pymemap-production-306f.up.railway.app/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

4. **Verifica CORS** en el backend

### El auth-guard no redirige

1. **Verifica que el script sea type="module"**:

```html
<script type="module" src="js/auth-guard.js"></script>
```

2. **Revisa que las rutas sean correctas** (rutas relativas)

3. **Verifica en la consola** si hay errores de import

### La sesión expira muy rápido

Ajusta el intervalo en `auth-guard.js`:

```javascript
// Línea 95
setInterval(
    () => {
        // ...
    },
    30 * 60 * 1000
) // 30 minutos en lugar de 5
```

## 📊 Flujo de Autenticación

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ Accede a página protegida
       ▼
┌─────────────────┐
│  auth-guard.js  │
└──────┬──────────┘
       │ ¿Tiene token?
       │
    NO │                SI
       ▼                │
┌─────────────┐         │
│ login.html  │         │
└──────┬──────┘         │
       │                │
       │ Login          │
       ▼                │
┌──────────────────┐    │
│ auth-service.js  │    │
│   POST /login    │    │
└──────┬───────────┘    │
       │                │
       │ Recibe token   │
       ▼                ▼
┌────────────────────────┐
│  localStorage          │
│  token: "eyJ..."       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Página protegida      │
│  (con datos usuario)   │
└────────────────────────┘
```

## 🎯 Próximos Pasos Sugeridos

1. **Recuperación de contraseña**: Implementar flujo de reset
2. **Registro de usuarios**: Formulario de sign-up
3. **Roles y permisos**: Sistema granular de permisos
4. **Perfil de usuario**: Página para editar datos
5. **Historial de sesiones**: Log de inicios de sesión
6. **Notificaciones**: Alertas cuando se detectan sesiones sospechosas

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador
2. Verifica los logs del backend
3. Prueba con credenciales de prueba
4. Revisa este README completo

---

**Autor**: Sistema de autenticación para PymeMap  
**Fecha**: Noviembre 2025  
**Versión**: 1.0.0
