import { API_URL, getAuthHeaders } from './config.js'

export async function getUsers() {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(`${API_URL}/users/`, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error('Error al obtener usuarios')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en getUsers:', error)
        throw error
    }
}

export async function deleteUser(userId) {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers,
        })

        if (!response.ok) {
            throw new Error('Error al eliminar usuario')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en deleteUser:', error)
        throw error
    }
}

export async function updateUser(userId, userData) {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(userData),
        })

        if (!response.ok) {
            throw new Error('Error al actualizar usuario')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en updateUser:', error)
        throw error
    }
}
