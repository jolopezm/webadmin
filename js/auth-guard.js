const inSubfolder = window.location.pathname.includes('/pages/')
const authServicePath = inSubfolder
    ? './api/auth-service.js'
    : './api/auth-service.js'

console.log('🔐 Auth Guard: Loading from', authServicePath)

const { isAuthenticated, getStoredUser, logout } = await import(authServicePath)

console.log('🔐 Auth Guard: Module loaded successfully')

function checkAuth() {
    if (!isAuthenticated()) {
        const currentPath = window.location.pathname + window.location.search
        sessionStorage.setItem('redirectAfterLogin', currentPath)

        const loginPath = inSubfolder ? 'login.html' : 'pages/login.html'
        window.location.href = loginPath
        return false
    }
    return true
}

function initUserInfo() {
    const user = getStoredUser()

    if (!user) {
        console.log('No user found in localStorage')
        return
    }

    console.log('User data:', user) // Debug: ver qué datos tiene el usuario

    // Función para actualizar la info del usuario
    const updateUserInfo = () => {
        const userNameElement = document.getElementById('sidebar-user-name')

        if (userNameElement) {
            const displayName = user.name || user.email || 'Usuario'
            userNameElement.textContent = displayName
            console.log('Updated user name to:', displayName)
        } else {
            console.log('User name element not found')
        }

        const avatarElement = document.getElementById('sidebar-user-avatar')
        if (avatarElement && user.name) {
            const initials = user.name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)
            avatarElement.textContent = initials
        }

        const roleElement = document.getElementById('sidebar-user-role')
        if (roleElement && user.role) {
            const roleText =
                user.role === 'admin'
                    ? 'Administrador'
                    : user.role === 'business'
                      ? 'Negocio'
                      : user.role === 'client'
                        ? 'Cliente'
                        : user.role
            roleElement.textContent = roleText
        }
    }

    // Si el sidebar ya está cargado, actualizar inmediatamente
    if (document.getElementById('sidebar-user-name')) {
        updateUserInfo()
    } else {
        // Si no está cargado, esperar a que se cargue con MutationObserver
        const observer = new MutationObserver(() => {
            // Verificar si el elemento ya existe en el DOM
            if (document.getElementById('sidebar-user-name')) {
                updateUserInfo()
                observer.disconnect()
            }
        })

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        })

        // Timeout de seguridad: si después de 3 segundos no se encuentra, reintentar
        setTimeout(() => {
            observer.disconnect()
            if (document.getElementById('sidebar-user-name')) {
                updateUserInfo()
            } else {
                console.warn('Sidebar user element not found after timeout')
            }
        }, 3000)
    }
}

function setupLogout() {
    // Buscar botón de logout existente o crear uno
    let logoutBtn = document.getElementById('sidebar-logout-btn')

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                await logout()
                window.location.href = 'login.html'
            }
        })
    }
}

/**
 * Verifica permisos específicos (opcional)
 * @param {string[]} requiredRoles - Roles requeridos para acceder a la página
 */
function checkPermissions(requiredRoles = []) {
    if (requiredRoles.length === 0) {
        return true
    }

    const user = getStoredUser()
    if (!user) {
        return false
    }

    const userRole = user.role || user.user_type

    if (!requiredRoles.includes(userRole)) {
        alert('No tienes permisos para acceder a esta página')
        window.location.href = 'index.html'
        return false
    }

    return true
}

/**
 * Maneja la expiración del token
 */
function handleTokenExpiration() {
    // Verificar token cada 5 minutos
    setInterval(
        () => {
            if (!isAuthenticated()) {
                alert(
                    'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
                )
                window.location.href = 'login.html'
            }
        },
        5 * 60 * 1000
    ) // 5 minutos
}

/**
 * Inicialización del guard
 */
function init() {
    // Verificar autenticación
    if (!checkAuth()) {
        return
    }

    // Inicializar la info del usuario (initUserInfo tiene su propio observer
    // que espera a que #sidebar-user-name exista en el DOM)
    initUserInfo()
    setupLogout()

    // Manejar expiración del token
    handleTokenExpiration()

    console.log('✅ Auth Guard: Usuario autenticado')
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}

// Exportar funciones útiles
export { checkAuth, checkPermissions, initUserInfo, setupLogout }
