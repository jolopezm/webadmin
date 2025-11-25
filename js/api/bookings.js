import { API_URL, getAuthHeaders } from './config.js'

export async function getAllBookings() {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/bookings/`, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching bookings:', error)
        throw error
    }
}

export async function updateBookingStatus(bookingId, status) {
    try {
        const headers = await getAuthHeaders()
        const endpoint = status === 'confirmed' ? 'confirm' : 'reject'

        const response = await fetch(
            `${API_URL}/bookings/${bookingId}/${endpoint}`,
            {
                method: 'PATCH',
                headers,
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error updating booking status:', error)
        throw error
    }
}

export async function deleteBooking(bookingId) {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error deleting booking:', error)
        throw error
    }
}
