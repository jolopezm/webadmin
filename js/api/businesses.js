import { API_URL, getAuthHeaders } from './config.js'

export async function getBusinesses() {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/business/`, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching businesses:', error)
        throw error
    }
}

export async function deleteBusiness(businessId) {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/business/${businessId}`, {
            method: 'DELETE',
            headers,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error deleting business:', error)
        throw error
    }
}

export async function updateBusiness(businessId, businessData) {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/business/${businessId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(businessData),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error updating business:', error)
        throw error
    }
}
