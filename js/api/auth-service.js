import { API_URL } from './config.js'

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token')

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
        ...options,
        headers,
    })

    if (response.status === 401) {
        await logout()
        window.location.href = 'login.html'
    }

    return response
}

export async function getCurrentUser() {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            return null
        }

        const response = await fetchWithAuth(`${API_URL}/users/me`)

        if (!response.ok) {
            throw new Error('Error al obtener usuario')
        }

        const userData = await response.json()
        if (userData.role !== 'admin') {
            throw new Error('No autorizado')
        }

        localStorage.setItem('user', JSON.stringify(userData))
        return userData
    } catch (error) {
        console.error('Error en getCurrentUser:', error)
        return null
    }
}

export function isAuthenticated() {
    const token = localStorage.getItem('token')
    return !!token
}

export function getToken() {
    return localStorage.getItem('token')
}

export function getStoredUser() {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
        return JSON.parse(userStr)
    } catch (error) {
        console.error('Error parsing user data:', error)
        return null
    }
}

export async function login({ email, password }) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error al iniciar sesión')
        }

        const data = await response.json()

        if (data.access_token) {
            // Verificar que el usuario sea admin antes de guardar el token
            localStorage.setItem('token', data.access_token)

            const userData = await getCurrentUser()
            if (!userData || userData.role !== 'admin') {
                // Si no es admin, limpiar el token y lanzar error
                localStorage.removeItem('token')
                throw new Error(
                    'Acceso denegado: Solo administradores pueden acceder'
                )
            }
        }

        return data
    } catch (error) {
        console.error('Error en login:', error)
        throw error
    }
}

export async function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('authData')
}

export async function sendAuthCode(email) {
    try {
        const response = await fetch(`${API_URL}/send-auth-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error al enviar código')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en sendAuthCode:', error)
        throw error
    }
}

export async function verifyAuthCode(authData, redirectToIndex = true) {
    try {
        const response = await fetch(`${API_URL}/verify-auth-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(authData),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Código inválido')
        }

        const data = await response.json()

        if (data.access_token && redirectToIndex) {
            localStorage.setItem('token', data.access_token)
            await getCurrentUser()
        }

        return data
    } catch (error) {
        console.error('Error en verifyAuthCode:', error)
        throw error
    }
}

export function hasRole(role) {
    const user = getStoredUser()
    if (!user) return false

    return user.role === role || user.user_type === role
}

export function isAdmin() {
    return hasRole('admin')
}

export function isBusiness() {
    return hasRole('business')
}

export async function resetPassword(data) {
    try {
        const response = await fetch(`${API_URL}/users/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error al restablecer contraseña')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en resetPassword:', error)
        throw error
    }
}
