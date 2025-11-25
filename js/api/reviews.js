import { API_URL, getAuthHeaders } from './config.js'

export async function getAllReviews() {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/reviews/`, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching reviews:', error)
        throw error
    }
}

export async function deleteReview(reviewId) {
    try {
        const headers = await getAuthHeaders()
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error deleting review:', error)
        throw error
    }
}
