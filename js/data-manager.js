import { getUsers, deleteUser, updateUser } from './api/users.js'
import { getBusinesses, deleteBusiness } from './api/businesses.js'
import {
    getAllBookings,
    updateBookingStatus,
    deleteBooking,
} from './api/bookings.js'
import { getAllReviews, deleteReview } from './api/reviews.js'
import { TableComponent } from './table-component.js'

let currentCollection = 'users'
let allData = []
let filteredData = []
let table
let isLoading = false

const $ = id => document.getElementById(id)

const collections = {
    users: {
        title: 'Usuarios',
        load: getUsers,
        delete: deleteUser,
        update: updateUser,
        columns: [
            {
                key: '_id',
                label: 'ID',
                render: val =>
                    val ? `<span class="middle-ellipsis">${val}</span>` : 'N/A',
                searchable: true,
            },
            {
                key: 'name',
                label: 'Nombre',
                render: val => val || 'N/A',
                searchable: true,
            },
            {
                key: 'rut',
                label: 'RUT',
                render: val => val || 'N/A',
                searchable: true,
            },
            {
                key: 'email',
                label: 'Email',
                render: val => val || '',
            },
            {
                key: 'phone',
                label: 'Teléfono',
                render: val => val || 'N/A',
            },
            {
                key: 'role',
                label: 'Rol',
                render: val => getRoleBadge(val),
            },
            {
                key: 'birthdate',
                label: 'Fecha de Nacimiento',
                render: val => val || 'N/A',
            },
            {
                key: 'profile_pic',
                label: 'Foto de Perfil',
                render: val =>
                    val
                        ? `<a href="${val}" target="_blank">Ver Foto</a>`
                        : 'N/A',
            },
            {
                key: 'registered_at',
                label: 'Creado El',
                render: val => (val ? val : 'N/A'),
            },
            {
                key: 'suspended',
                label: 'Suspendido',
                render: val => (val ? 'Sí' : 'No'),
                editable: true,
            },
        ],
        metrics: data => {
            const total = data.length
            const active = data.filter(
                u => u.role === 'client' && !u.suspended
            ).length
            const authenticated = data.filter(u => !u.suspended).length
            const business = data.filter(u => u.role === 'business').length

            return `
                <div class="metric">
                    <div class="num">${total}</div>
                    <div class="label">Total usuarios</div>
                </div>
                <div class="metric">
                    <div class="num">${active}</div>
                    <div class="label">Usuarios activos</div>
                </div>
                <div class="metric">
                    <div class="num">${authenticated}</div>
                    <div class="label">Usuarios autenticados</div>
                </div>
                <div class="metric">
                    <div class="num">${business}</div>
                    <div class="label">Usuarios con negocios</div>
                </div>
            `
        },
    },
    businesses: {
        title: 'Negocios',
        load: getBusinesses,
        delete: deleteBusiness,
        columns: [
            {
                key: '_id',
                label: 'ID',
                render: val =>
                    `<strong class="middle-ellipsis">${val || 'Sin id'}</strong>`,
            },
            {
                key: 'name',
                label: 'Nombre',
                render: (val, item) =>
                    `<strong>${val || 'Sin nombre'}</strong>${item.description ? `<br><small style="color: var(--muted);">${item.description.substring(0, 50)}...</small>` : ''}`,
                searchable: true,
            },
            {
                key: 'owner_id',
                label: 'Propietario',
                render: val =>
                    `<strong class="middle-ellipsis">${val || 'Sin id'}</strong>`,
            },
            {
                key: 'category',
                label: 'Categoría',
                render: val => getCategoryBadge(val),
                filterable: true,
            },
            {
                key: 'profile_pic',
                label: 'Foto de Perfil',
                render: val =>
                    val
                        ? `<a href="${val}" target="_blank">Ver Foto</a>`
                        : 'N/A',
            },
            {
                key: 'address',
                label: 'Dirección',
                render: val => val || 'Sin dirección',
                filterable: true,
            },
            {
                key: 'average_rating',
                label: 'Rating',
                render: val => (val ? val.toFixed(1) : 'Sin rating'),
                filterable: true,
            },
        ],
        metrics: data => {
            const total = data.length
            const active = data.filter(b => b.is_active).length
            const verified = data.filter(b => b.is_verified).length
            const totalRatings = data.reduce(
                (sum, b) => sum + (b.average_rating || 0),
                0
            )
            const avgRating =
                total > 0 ? (totalRatings / total).toFixed(1) : '0.0'

            return `
                <div class="metric">
                    <div class="num">${total}</div>
                    <div class="label">Total Negocios</div>
                </div>
                <div class="metric">
                    <div class="num">${active}</div>
                    <div class="label">Activos</div>
                </div>
                <div class="metric">
                    <div class="num">${verified}</div>
                    <div class="label">Verificados</div>
                </div>
                <div class="metric">
                    <div class="num">${avgRating}</div>
                    <div class="label">Rating Promedio</div>
                </div>
            `
        },
    },
    bookings: {
        title: 'Reservas',
        load: getAllBookings,
        delete: deleteBooking,
        update: updateBookingStatus,
        columns: [
            {
                key: '_id',
                label: 'ID',
                render: (val, item) =>
                    `<strong class='middle-ellipsis'>${val || item._id || 'N/A'}</strong>`,
                searchable: true,
            },
            {
                key: 'user_name',
                label: 'Usuario',
                render: (val, item) =>
                    `<strong>${val || item.user_id || 'N/A'}</strong>${item.user_email ? `<br><small style="color: var(--muted);">${item.user_email}</small>` : ''}`,
                searchable: true,
            },
            {
                key: 'business_name',
                label: 'Negocio',
                render: val => val || 'N/A',
                searchable: true,
            },
            {
                key: 'date',
                label: 'Fecha/Hora',
                render: (val, item) =>
                    `${formatDate(val)}<br>${item.start_time || 'N/A'}`,
            },
            {
                key: 'status',
                label: 'Estado',
                render: val => getStatusBadge(val),
                filterable: true,
            },
        ],
        metrics: data => {
            const total = data.length
            const pending = data.filter(b => b.status === 'pending').length
            const confirmed = data.filter(b => b.status === 'confirmed').length
            const completed = data.filter(b => b.status === 'completed').length

            return `
                <div class="metric">
                    <div class="num">${total}</div>
                    <div class="label">Total Reservas</div>
                </div>
                <div class="metric">
                    <div class="num">${pending}</div>
                    <div class="label">Pendientes</div>
                </div>
                <div class="metric">
                    <div class="num">${confirmed}</div>
                    <div class="label">Confirmadas</div>
                </div>
                <div class="metric">
                    <div class="num">${completed}</div>
                    <div class="label">Completadas</div>
                </div>
            `
        },
    },
    reviews: {
        title: 'Reseñas',
        load: getAllReviews,
        delete: deleteReview,
        columns: [
            {
                key: '_id',
                label: 'ID',
                render: (val, item) =>
                    `<strong class='middle-ellipsis'>${val || item._id || 'N/A'}</strong>`,
                searchable: true,
            },
            {
                key: 'userId',
                label: 'ID usuario',
                render: (val, item) =>
                    `<strong class='middle-ellipsis'>${val || item.userId || 'N/A'}</strong>`,
                searchable: true,
            },
            {
                key: 'businessId',
                label: 'ID negocio',
                render: val =>
                    `<strong class='middle-ellipsis'>${val || 'N/A'}</strong>`,
                searchable: true,
            },
            {
                key: 'rating',
                label: 'Rating',
                render: val => getStars(val),
                filterable: true,
            },
            {
                key: 'comment',
                label: 'Comentario',
                render: val =>
                    `<div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${val || '<span style="color: var(--muted);">Sin comentario</span>'}</div>`,
            },
            {
                key: 'date',
                label: 'Fecha',
                render: val => formatDate(val),
                searchable: true,
            },
        ],
        metrics: data => {
            const total = data.length
            const totalRating = data.reduce(
                (sum, r) => sum + (r.rating || 0),
                0
            )
            const avgRating =
                total > 0 ? (totalRating / total).toFixed(1) : '0.0'
            const fiveStars = data.filter(r => r.rating === 5).length
            const lowRatings = data.filter(r => r.rating <= 2).length

            return `
                <div class="metric">
                    <div class="num">${total}</div>
                    <div class="label">Total Reseñas</div>
                </div>
                <div class="metric">
                    <div class="num">${avgRating}</div>
                    <div class="label">Rating Promedio</div>
                </div>
                <div class="metric">
                    <div class="num">${fiveStars}</div>
                    <div class="label">5 Estrellas</div>
                </div>
                <div class="metric">
                    <div class="num">${lowRatings}</div>
                    <div class="label">≤ 2 Estrellas</div>
                </div>
            `
        },
    },
}

function getRoleBadge(role) {
    const badges = {
        client: '<span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Cliente</span>',
        business:
            '<span style="background: #f3e5f5; color: #7b1fa2; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Negocio</span>',
        admin: '<span style="background: #fff3e0; color: #e65100; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Admin</span>',
    }
    return badges[role] || role
}

function getCategoryBadge(category) {
    const badges = {
        restaurant: 'Restaurante',
        salon: 'Salón',
        gym: 'Gimnasio',
        clinic: 'Clínica',
        other: 'Otro',
    }
    return badges[category] || category || 'Sin categoría'
}

function getStatusBadge(status) {
    const badges = {
        pending: '<span class="badge badge-warning">Pendiente</span>',
        confirmed: '<span class="badge badge-info">Confirmada</span>',
        completed: '<span class="badge badge-success">Completada</span>',
        cancelled: '<span class="badge badge-gray">Cancelada</span>',
        rejected: '<span class="badge badge-danger">Rechazada</span>',
    }
    return (
        badges[status] ||
        `<span class="badge badge-gray">${status || 'Desconocido'}</span>`
    )
}

function getStars(rating) {
    if (!rating) return '—'
    const stars = '⭐'.repeat(Math.floor(rating))
    return `<span title="${rating} estrellas">${stars} ${rating.toFixed(1)}</span>`
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    } catch {
        return dateString
    }
}

function showToast(message, type = 'info') {
    const toast = $('toast')
    toast.textContent = message
    toast.className = `toast show ${type}`
    setTimeout(() => toast.classList.remove('show'), 3000)
}

function setLoading(loading) {
    isLoading = loading
    const spinner = document.getElementById('loading-spinner')
    const tableContainer = document.getElementById('data-table')
    const metricsContainer = document.querySelector('.metrics')

    if (loading) {
        spinner.style.display = 'flex'
        tableContainer.style.opacity = '0.5'
        tableContainer.style.pointerEvents = 'none'
        if (metricsContainer) {
            metricsContainer.style.opacity = '0.5'
        }
    } else {
        spinner.style.display = 'none'
        tableContainer.style.opacity = '1'
        tableContainer.style.pointerEvents = 'auto'
        if (metricsContainer) {
            metricsContainer.style.opacity = '1'
        }
    }
}

async function loadData() {
    setLoading(true)

    try {
        const config = collections[currentCollection]

        const cached = localStorage.getItem(config.cacheKey)
        if (cached) {
            allData = JSON.parse(cached)
            filteredData = [...allData]
            updateMetrics()
            initTable()
        }

        const data = await config.fetchFn()
        allData = data
        filteredData = [...allData]

        localStorage.setItem(config.cacheKey, JSON.stringify(data))

        updateMetrics()
        initTable()
    } catch (error) {
        console.error(`Error cargando ${currentCollection}:`, error)
        showToast(`Error cargando ${currentCollection}`, 'error')

        const cached = localStorage.getItem(
            collections[currentCollection].cacheKey
        )
        if (cached && allData.length === 0) {
            allData = JSON.parse(cached)
            filteredData = [...allData]
            updateMetrics()
            initTable()
            showToast('Mostrando datos en caché', 'warning')
        }
    } finally {
        setLoading(false)
    }
}

async function loadCollection(collectionName) {
    try {
        showToast(`Cargando ${collections[collectionName].title}...`)
        currentCollection = collectionName

        allData = await collections[collectionName].load()
        filteredData = [...allData]

        updateFilterFields()
        renderTable()
        updateMetrics()

        showToast(`${collections[collectionName].title} cargados correctamente`)
    } catch (error) {
        console.error(`Error al cargar ${collectionName}:`, error)
        showToast(
            `Error al cargar ${collections[collectionName].title}`,
            'error'
        )
    }
}

function renderTable() {
    const config = collections[currentCollection]

    $('table-title').textContent = config.title

    const actions = [
        { key: 'delete', label: 'Eliminar Seleccionados', multiple: true },
        {
            key: 'refresh',
            label: 'Refrescar',
            multiple: false,
            requiresSelection: false,
        },
    ]

    if (currentCollection === 'bookings') {
        actions.unshift({
            key: 'confirm',
            label: 'Confirmar Seleccionadas',
            multiple: true,
        })
    }

    if (currentCollection !== 'reviews') {
        actions.splice(1, 0, {
            key: 'view',
            label: 'Ver Detalles',
            multiple: false,
            requiresSelection: true,
        })
    }

    table = new TableComponent({
        containerId: 'data-table-container',
        data: filteredData,
        columns: config.columns,
        actions: actions,
        onAction: handleAction,
    })

    window.tableInstances['data-table-container'] = table
}

function updateMetrics() {
    const config = collections[currentCollection]
    $('metrics-container').innerHTML = config.metrics(filteredData)
}

async function handleAction(action, ids, updates) {
    if (action === 'delete') {
        await handleDelete(ids)
    } else if (action === 'view') {
        handleView(ids[0])
    } else if (action === 'refresh') {
        await loadCollection(currentCollection)
    } else if (action === 'save') {
        await handleSave(ids, updates)
    } else if (action === 'confirm' && currentCollection === 'bookings') {
        await handleConfirm(ids)
    }
}

async function handleDelete(ids) {
    const config = collections[currentCollection]
    if (confirm(`¿Eliminar ${ids.length} elemento(s)?`)) {
        try {
            for (const id of ids) {
                await config.delete(id)
            }
            showToast(`${ids.length} elemento(s) eliminado(s)`)
            await loadCollection(currentCollection)
        } catch (error) {
            console.error('Error al eliminar:', error)
            showToast('Error al eliminar', 'error')
        }
    }
}

function handleView(id) {
    const item = allData.find(d => d._id === id || d.id === id)
    if (!item) return

    const details = Object.entries(item)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')

    alert(details)
}

async function handleSave(id, updates) {
    const config = collections[currentCollection]
    if (!config.update) {
        showToast('Esta colección no soporta actualizaciones', 'error')
        return
    }

    try {
        const originalItem = allData.find(d => d._id === id || d.id === id)
        if (!originalItem) {
            showToast('Elemento no encontrado', 'error')
            return
        }

        const changedUpdates = {}
        for (const [key, value] of Object.entries(updates)) {
            if (originalItem[key] !== value) {
                changedUpdates[key] = value
            }
        }

        if (Object.keys(changedUpdates).length === 0) {
            showToast('No hay cambios para guardar')
            return
        }

        const fullData = { ...originalItem, ...changedUpdates }
        if (fullData._id && !fullData.id) {
            fullData.id = fullData._id
            delete fullData._id
        }

        await config.update(id, fullData)
        showToast('Elemento actualizado correctamente')
        await loadCollection(currentCollection)
    } catch (error) {
        console.error('Error al actualizar:', error)
        showToast('Error al actualizar', 'error')
    }
}

async function handleConfirm(ids) {
    try {
        for (const id of ids) {
            await updateBookingStatus(id, 'confirmed')
        }
        showToast(`${ids.length} reserva(s) confirmada(s)`)
        await loadCollection(currentCollection)
    } catch (error) {
        console.error('Error al confirmar reservas:', error)
        showToast('Error al confirmar reservas', 'error')
    }
}

function updateFilterFields() {
    const config = collections[currentCollection]
    const filterFieldSelect = $('filter-field')

    filterFieldSelect.innerHTML =
        '<option value="">Seleccionar campo...</option>'

    config.columns.forEach(column => {
        const option = document.createElement('option')
        option.value = column.key
        option.textContent = column.label
        filterFieldSelect.appendChild(option)
    })

    $('filter-value').value = ''
}

function applyFilter() {
    const field = $('filter-field').value
    const value = $('filter-value').value.trim().toLowerCase()

    if (!field || !value) {
        showToast('Selecciona un campo y un valor para filtrar', 'error')
        return
    }

    filteredData = allData.filter(item => {
        const itemValue = item[field]
        if (itemValue === null || itemValue === undefined) return false

        return String(itemValue).toLowerCase().includes(value)
    })

    if (filteredData.length === 0) {
        showToast('No se encontraron resultados', 'info')
    } else {
        showToast(`${filteredData.length} resultado(s) encontrado(s)`)
    }

    renderTable()
    updateMetrics()
}

function clearFilter() {
    filteredData = [...allData]
    $('filter-field').value = ''
    $('filter-value').value = ''

    renderTable()
    updateMetrics()

    showToast('Filtros limpiados')
}

function init() {
    $('collection-selector').addEventListener('change', e => {
        loadCollection(e.target.value)
    })

    $('apply-filter-btn').addEventListener('click', applyFilter)
    $('clear-filter-btn').addEventListener('click', clearFilter)

    $('filter-value').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            applyFilter()
        }
    })

    loadCollection('users')
}

document.addEventListener('DOMContentLoaded', init)
