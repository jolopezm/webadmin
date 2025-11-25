import { API_URL, getAuthHeaders } from './config.js'

export async function getReports() {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(`${API_URL}/reports/`, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error('Error al obtener reportes')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en getReports:', error)
        throw error
    }
}

export async function createReport(reportData) {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(`${API_URL}/reports/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(reportData),
        })

        if (!response.ok) {
            throw new Error('Error al crear reporte')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en createReport:', error)
        throw error
    }
}

export async function updateReportState(reportId, state) {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(
            `${API_URL}/reports/${reportId}/update_state?new_state=${state}`,
            {
                method: 'PUT',
                headers,
            }
        )

        if (!response.ok) {
            throw new Error('Error al actualizar estado del reporte')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en updateReportState:', error)
        throw error
    }
}

export async function addReportResponse(reportId, response) {
    try {
        const headers = await getAuthHeaders()

        const response = await fetch(
            `${API_URL}/reports/${reportId}/response`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({ response }),
            }
        )

        if (!response.ok) {
            throw new Error('Error al agregar respuesta')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en addReportResponse:', error)
        throw error
    }
}

export async function getFilteredReports(filters = {}) {
    try {
        const headers = await getAuthHeaders()

        const params = new URLSearchParams()
        if (filters.type) params.append('type', filters.type)
        if (filters.state) params.append('state', filters.state)
        if (filters.startDate) params.append('start_date', filters.startDate)
        if (filters.endDate) params.append('end_date', filters.endDate)

        const url = `${API_URL}/reports/?${params.toString()}`

        const response = await fetch(url, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error('Error al obtener reportes filtrados')
        }

        return await response.json()
    } catch (error) {
        console.error('Error en getFilteredReports:', error)
        throw error
    }
}

export const REPORT_TYPES = {
    SERVICE_ISSUE: 'service_issue',
    PAYMENT_ISSUE: 'payment_issue',
    BEHAVIOR_ISSUE: 'behavior_issue',
    TECHNICAL_ISSUE: 'technical_issue',
    OTHER: 'other',
}

export const REPORT_STATES = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
}

export const REPORT_TYPE_LABELS = {
    service_issue: 'Problema con el servicio',
    payment_issue: 'Problema de pago',
    behavior_issue: 'Problema de comportamiento',
    technical_issue: 'Problema técnico',
    other: 'Otro',
}

export const REPORT_STATE_LABELS = {
    open: 'Abierto',
    in_progress: 'En progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
}
