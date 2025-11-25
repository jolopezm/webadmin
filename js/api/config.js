//const API_URL = 'https://pymemap-production-306f.up.railway.app'
const API_URL = 'http://localhost:8000'

async function getAuthHeaders() {
    const token = localStorage.getItem('token')
    const headers = {
        'Content-Type': 'application/json',
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    return headers
}

export { API_URL, getAuthHeaders }
