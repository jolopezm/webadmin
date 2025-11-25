import {
    getReports,
    updateReportState,
    REPORT_TYPE_LABELS,
    REPORT_STATE_LABELS,
} from './api/report-service.js'
import {
    getChatByParticipants,
    createChat,
    getMessagesByChatId,
    sendMessage,
    getChatsByUserId,
} from './api/chat.js'
import { getCurrentUser } from './api/auth-service.js'

console.log('Reports main.js imports loaded')

// ============================================
// DATOS Y ESTADO
// ============================================

let reports = []
let state = {
    page: 1,
    perPage: 10,
    typeFilter: 'all',
    stateFilter: 'all',
    search: '',
}

let currentChat = null
let currentReport = null

let toastTimeout

// ============================================
// HELPERS Y UTILIDADES
// ============================================

const $ = id => document.getElementById(id)

/**
 * Formatea una fecha ISO a formato legible
 */
function formatDate(iso) {
    const d = new Date(iso)
    return d.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(str) {
    if (!str) return ''
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

/**
 * Obtiene el color según el tipo de reporte
 */
function getTypeColor(type) {
    const colors = {
        service_issue: '#F44336',
        payment_issue: '#FF9800',
        behavior_issue: '#9C27B0',
        technical_issue: '#2196F3',
        other: '#607D8B',
    }
    return colors[type] || '#607D8B'
}

/**
 * Obtiene el color según el estado
 */
function getStateColor(state) {
    const colors = {
        open: '#F44336',
        in_progress: '#FFC107',
        resolved: '#4CAF50',
        closed: '#9E9E9E',
    }
    return colors[state] || '#9E9E9E'
}

// ============================================
// FILTRADO Y PAGINACIÓN
// ============================================

/**
 * Filtra reportes según los filtros activos
 */
function filteredReports() {
    return reports
        .filter(r => {
            // Filtro por tipo
            if (state.typeFilter !== 'all' && r.type !== state.typeFilter)
                return false

            // Filtro por estado
            if (state.stateFilter !== 'all' && r.state !== state.stateFilter)
                return false

            // Búsqueda por texto
            if (state.search) {
                const searchLower = state.search.toLowerCase()
                const matchesEmail = r.reportedByEmail
                    ?.toLowerCase()
                    .includes(searchLower)
                const matchesName = r.reportedByName
                    ?.toLowerCase()
                    .includes(searchLower)
                const matchesDescription = r.description
                    ?.toLowerCase()
                    .includes(searchLower)

                if (!matchesEmail && !matchesName && !matchesDescription) {
                    return false
                }
            }

            return true
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

/**
 * Pagina una lista de reportes
 */
function paginate(list) {
    const start = (state.page - 1) * state.perPage
    return list.slice(start, start + state.perPage)
}

// ============================================
// RENDERIZADO
// ============================================

/**
 * Renderiza la lista de reportes
 */
function renderReports() {
    const list = filteredReports()
    const pageItems = paginate(list)
    const $list = $('reportsList')

    $list.innerHTML = ''

    if (pageItems.length === 0) {
        $list.innerHTML =
            '<div style="text-align:center;padding:40px;color:var(--muted)">No hay reportes que mostrar.</div>'
        renderPagination(0)
        updateSummary()
        return
    }

    pageItems.forEach(r => {
        const reportDiv = document.createElement('div')
        reportDiv.className = 'report-card'
        reportDiv.dataset.reportId = r._id || r.bookingId

        const typeColor = getTypeColor(r.type)
        const stateColor = getStateColor(r.state)

        reportDiv.innerHTML = `
            <div class="report-header">
                <div>
                    <span class="report-type" style="background:${typeColor}20;color:${typeColor};border:1px solid ${typeColor}">
                        ${REPORT_TYPE_LABELS[r.type] || r.type}
                    </span>
                    <span class="report-state" style="background:${stateColor}20;color:${stateColor};border:1px solid ${stateColor}">
                        ${REPORT_STATE_LABELS[r.state] || r.state}
                    </span>
                </div>
                <div class="report-date">${formatDate(r.timestamp)}</div>
            </div>
            
            <div class="report-body">
                <div class="report-user">
                    <strong>Reportado por:</strong> ${escapeHtml(r.reportedByName || 'Usuario')}
                    <br>
                    <span style="font-size:12px;color:var(--muted)">${escapeHtml(r.reportedByEmail)}</span>
                </div>
                
                <div class="report-description">
                    ${escapeHtml(r.description)}
                </div>
                
                <div class="report-ids" style="font-size:11px;color:var(--muted);margin-top:8px">
                    ${r.bookingId ? `<div>Reserva: ${r.bookingId}</div>` : ''}
                    ${r.businessId ? `<div>Negocio: ${r.businessId}</div>` : ''}
                </div>
            </div>
            
            <div class="report-actions">
                <button class="btn ghost" data-action="reply" data-report-id="${r._id || r.bookingId}">
                    Ver chat
                </button>
                <button class="btn ghost" data-action="change-state" data-report-id="${r._id || r.bookingId}">
                    Cambiar estado
                </button>
                ${
                    r.state !== 'resolved' && r.state !== 'closed'
                        ? `
                    <button class="btn" data-action="mark-resolved" data-report-id="${r._id || r.bookingId}">
                        ✅ Marcar resuelto
                    </button>
                `
                        : ''
                }
                <button class="btn ghost" data-action="view-details" data-report-id="${r._id || r.bookingId}">
                    Ver detalles
                </button>
            </div>
            
            <div class="report-response-container"></div>
        `

        $list.appendChild(reportDiv)

        // Event listeners
        reportDiv
            .querySelector('[data-action="view-details"]')
            .addEventListener('click', () => {
                showReportDetails(r)
            })

        reportDiv
            .querySelector('[data-action="reply"]')
            .addEventListener('click', async () => {
                console.log('Ver chat clicked, reporte:', r)
                await openChatForReport(r)
            })

        reportDiv
            .querySelector('[data-action="change-state"]')
            .addEventListener('click', () => {
                showStateSelector(reportDiv, r)
            })

        const resolveBtn = reportDiv.querySelector(
            '[data-action="mark-resolved"]'
        )
        if (resolveBtn) {
            resolveBtn.addEventListener('click', () => {
                markResolved(r._id || r.bookingId)
            })
        }
    })

    renderPagination(list.length)
    updateSummary()
}

/**
 * Muestra detalles completos de un reporte
 */
function showReportDetails(report) {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.innerHTML = `
        <div class="modal-content" style="max-width:600px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <h2 style="margin:0;color:var(--purple)">Detalle del Reporte</h2>
                <button class="btn ghost" onclick="this.closest('.modal-overlay').remove()" style="padding:4px 8px">✕</button>
            </div>
            
            <div style="display:flex;flex-direction:column;gap:16px">
                <div>
                    <strong>Tipo:</strong>
                    <span style="color:${getTypeColor(report.type)};margin-left:8px">
                        ${REPORT_TYPE_LABELS[report.type] || report.type}
                    </span>
                </div>
                
                <div>
                    <strong>Estado:</strong>
                    <span style="color:${getStateColor(report.state)};margin-left:8px">
                        ${REPORT_STATE_LABELS[report.state] || report.state}
                    </span>
                </div>
                
                <div>
                    <strong>Fecha:</strong> ${formatDate(report.timestamp)}
                </div>
                
                <div>
                    <strong>Reportado por:</strong><br>
                    ${escapeHtml(report.reportedByName)}<br>
                    <span style="color:var(--muted)">${escapeHtml(report.reportedByEmail)}</span>
                </div>
                
                <div>
                    <strong>Descripción:</strong><br>
                    <div style="background:#f9f9f9;padding:12px;border-radius:8px;margin-top:8px">
                        ${escapeHtml(report.description)}
                    </div>
                </div>
                
                ${
                    report.bookingId
                        ? `
                    <div>
                        <strong>ID de Reserva:</strong> ${report.bookingId}
                    </div>
                `
                        : ''
                }
                
                ${
                    report.businessId
                        ? `
                    <div>
                        <strong>ID de Negocio:</strong> ${report.businessId}
                    </div>
                `
                        : ''
                }
            </div>
            
            <div style="display:flex;gap:8px;margin-top:24px">
                <button class="btn" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
            </div>
        </div>
    `

    document.body.appendChild(modal)
}

/**
 * Muestra selector de estado
 */
function showStateSelector(container, report) {
    const existing = container.querySelector('.state-selector')
    if (existing) {
        existing.remove()
        return
    }

    const selector = document.createElement('div')
    selector.className = 'state-selector'
    selector.innerHTML = `
        <div style="padding:12px;background:#f9f9f9;border-radius:8px;margin-top:12px">
            <label style="font-weight:600;font-size:13px;display:block;margin-bottom:8px">
                Cambiar estado:
            </label>
            <select class="select" id="state-select-${report._id || report.bookingId}">
                <option value="open" ${report.state === 'open' ? 'selected' : ''}>Abierto</option>
                <option value="in_progress" ${report.state === 'in_progress' ? 'selected' : ''}>En progreso</option>
                <option value="resolved" ${report.state === 'resolved' ? 'selected' : ''}>Resuelto</option>
                <option value="closed" ${report.state === 'closed' ? 'selected' : ''}>Cerrado</option>
            </select>
            <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn" data-action="save-state">Guardar</button>
                <button class="btn ghost" data-action="cancel-state">Cancelar</button>
            </div>
        </div>
    `

    container.querySelector('.report-response-container').appendChild(selector)

    selector
        .querySelector('[data-action="save-state"]')
        .addEventListener('click', async () => {
            const newState = $(
                `state-select-${report._id || report.bookingId}`
            ).value
            await changeReportState(report._id || report.bookingId, newState)
            selector.remove()
        })

    selector
        .querySelector('[data-action="cancel-state"]')
        .addEventListener('click', () => {
            selector.remove()
        })
}

/**
 * Abre el chat para un reporte desde la lista de reportes
 */
async function openChatForReport(report) {
    try {
        console.log('Abriendo chat para reporte:', report)
        showToast('Buscando chat...')

        // Obtener usuario actual
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            showToast('Error: No se pudo obtener el usuario actual.', 'error')
            return
        }

        const adminId = currentUser._id
        const clientId = report.reportedBy

        // Buscar chat existente
        let chat = null
        try {
            chat = await getChatByParticipants(adminId, clientId)
            console.log('Chat encontrado:', chat)

            if (chat && chat._id) {
                // Si existe el chat, abrirlo usando la función de la lista
                await openChatFromList(chat._id)
                return
            }
        } catch (error) {
            console.log(
                'No se encontró chat existente, creando uno nuevo',
                error
            )
        }

        // Si no existe, crear uno nuevo
        if (!chat) {
            const chatData = {
                participants: [adminId, clientId],
            }
            chat = await createChat(chatData)
            console.log('Chat creado:', chat)

            // Recargar la lista de chats para que aparezca el nuevo
            await loadChats()

            // Abrir el chat recién creado
            if (chat && chat._id) {
                await openChatFromList(chat._id)
            }
        }
    } catch (error) {
        console.error('Error al abrir chat para reporte:', error)
        showToast('Error al abrir el chat', 'error')
    }
}

/**
 * Abre el chat para un reporte (función legacy)
 */
async function openReplyBox(container, report) {
    try {
        console.log('openReplyBox llamada', container, report)

        // Obtener usuario actual
        const currentUser = await getCurrentUser()
        console.log('Usuario actual:', currentUser)
        if (!currentUser) {
            showToast('Error: No se pudo obtener el usuario actual.')
            return
        }

        const adminId = currentUser._id
        const clientId = report.reportedBy

        // Buscar chat existente
        let chat = null
        try {
            chat = await getChatByParticipants(adminId, clientId)
            console.log('Chat encontrado:', chat)
        } catch (error) {
            console.log(
                'No se encontró chat existente, creando uno nuevo',
                error
            )
        }

        if (!chat) {
            const chatData = {
                participants: [adminId, clientId],
            }
            chat = await createChat(chatData)
            console.log('Chat creado:', chat)
        }

        // Mostrar el chat en el panel lateral
        await showChatPanel(chat, report)
    } catch (error) {
        console.error('Error en openReplyBox:', error)
        showToast('Error al abrir el chat')
    }
}

/**
 * Muestra el chat en el panel lateral
 */
async function showChatPanel(chat, report) {
    try {
        console.log('showChatPanel llamada', chat, report)
        currentChat = chat
        currentReport = report

        // Mostrar el panel de chat
        const chatPanel = $('chat-panel')
        const reportsCard = $('reports-card')
        const sideTop = $('side-top')

        console.log('Chat panel element:', chatPanel)
        console.log('Reports card element:', reportsCard)

        chatPanel.style.display = 'flex'
        reportsCard.classList.add('with-chat')
        sideTop.style.display = 'none' // Ocultar el sidebar de acciones rápidas

        console.log('Panel visible')

        // Actualizar el título
        const header = chatPanel.querySelector('.chat-panel-header h2')
        header.textContent = `Chat con ${report.reportedByName || 'Usuario'}`

        // Cargar mensajes
        await loadChatMessages()

        // Configurar event listeners
        setupChatEventListeners()
    } catch (error) {
        console.error('Error en showChatPanel:', error)
        showToast('Error al mostrar el chat')
    }
}

/**
 * Configura los event listeners del chat
 */
function setupChatEventListeners() {
    const closeBtn = $('close-chat-panel')
    const sendBtn = $('send-chat-message')
    const input = $('chat-input-text')

    // Remover listeners anteriores clonando y reemplazando
    const newCloseBtn = closeBtn.cloneNode(true)
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn)

    const newSendBtn = sendBtn.cloneNode(true)
    sendBtn.parentNode.replaceChild(newSendBtn, sendBtn)

    // Agregar nuevos listeners
    newCloseBtn.onclick = () => {
        const chatPanel = $('chat-panel')
        const chatsListContainer = $('chats-list-container')

        chatPanel.style.display = 'none'
        chatsListContainer.style.display = 'block'
        currentChat = null
    }

    newSendBtn.onclick = async () => {
        const text = input.value.trim()
        if (!text) {
            showToast('Por favor escribe un mensaje')
            return
        }

        try {
            const currentUser = await getCurrentUser()
            const messageData = {
                chatId: currentChat._id,
                sender_id: currentUser._id,
                content: text,
                timestamp: new Date().toISOString(),
            }

            await sendMessage(messageData)
            input.value = ''
            await loadChatMessages()
            showToast('Mensaje enviado')
        } catch (error) {
            console.error('Error enviando mensaje:', error)
            showToast('Error al enviar mensaje')
        }
    }

    input.onkeydown = e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            newSendBtn.click()
        }
    }
}

/**
 * Carga los mensajes del chat actual
 */
async function loadChatMessages() {
    try {
        if (!currentChat) {
            console.log('No hay chat actual')
            return
        }

        console.log('Cargando mensajes para chat:', currentChat._id)
        const messages = await getMessagesByChatId(currentChat._id)
        console.log('Mensajes obtenidos:', messages)

        const container = $('chat-messages')
        console.log('Container de mensajes:', container)
        container.innerHTML = ''

        const currentUser = await getCurrentUser()

        if (messages.length === 0) {
            container.innerHTML =
                '<p style="text-align:center;color:var(--muted);padding:20px;">No hay mensajes aún</p>'
            return
        }

        messages.forEach(msg => {
            const msgDiv = document.createElement('div')
            msgDiv.className = `chat-message ${msg.sender_id === currentUser._id ? 'sent' : 'received'}`
            msgDiv.textContent = msg.content
            container.appendChild(msgDiv)
        })

        // Scroll to bottom
        container.scrollTop = container.scrollHeight
        console.log('Mensajes cargados en el DOM')
    } catch (error) {
        console.error('Error en loadChatMessages:', error)
        showToast('Error al cargar mensajes')
    }
}

/**
 * Cambia el estado de un reporte
 */
async function changeReportState(reportId, newState) {
    try {
        showToast('Actualizando estado...')

        await updateReportState(reportId, newState)

        renderReports()
        showToast(`Estado actualizado a: ${REPORT_STATE_LABELS[newState]}`)
    } catch (error) {
        console.error('Error al cambiar estado:', error)
        showToast('Error al cambiar estado', 'error')
    }
}

/**
 * Marca un reporte como resuelto
 */
async function markResolved(reportId) {
    if (!confirm('¿Marcar este reporte como resuelto?')) {
        return
    }

    await changeReportState(reportId, 'resolved')
}

/**
 * Renderiza los controles de paginación
 */
function renderPagination(total) {
    const $p = $('pagination')
    $p.innerHTML = ''

    const pages = Math.max(1, Math.ceil(total / state.perPage))

    for (let i = 1; i <= pages; i++) {
        const btn = document.createElement('button')
        btn.className = 'page-btn'
        btn.textContent = i
        btn.style.fontWeight = i === state.page ? '700' : '400'
        btn.style.background = i === state.page ? 'var(--purple)' : 'white'
        btn.style.color = i === state.page ? 'white' : '#333'

        btn.addEventListener('click', () => {
            state.page = i
            renderReports()
        })

        $p.appendChild(btn)
    }
}

/**
 * Actualiza el resumen de métricas
 */
function updateSummary() {
    $('total-reports').textContent = reports.length

    const openCount = reports.filter(r => r.state === 'open').length
    const inProgressCount = reports.filter(
        r => r.state === 'in_progress'
    ).length
    const resolvedCount = reports.filter(r => r.state === 'resolved').length

    $('open-reports').textContent = openCount
    $('in-progress-reports').textContent = inProgressCount
    $('resolved-reports').textContent = resolvedCount
}

/**
 * Muestra un mensaje toast
 */
function showToast(msg, type = 'info') {
    const t = $('toast')
    t.textContent = msg
    t.style.display = 'block'

    clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => (t.style.display = 'none'), 3600)
}

// ============================================
// CARGA DE DATOS
// ============================================

/**
 * Carga reportes desde la API
 */
async function loadReports() {
    try {
        showToast('Cargando reportes...')

        const data = await getReports()
        reports = data

        renderReports()
        showToast('Reportes cargados correctamente')
    } catch (error) {
        console.error('Error al cargar reportes:', error)
        showToast('Error al cargar reportes', 'error')

        // Datos de ejemplo para desarrollo
        reports = [
            {
                _id: '1',
                bookingId: '691f0c369600f44fa8f3a4ec',
                businessId: '68efaff738bf29f2eda51307',
                reportedBy: '68e6b4821ffe0add544fcd1d',
                reportedByName: 'Jose',
                reportedByEmail: 'joselopezmignone7@gmail.com',
                type: 'service_issue',
                description: 'el tipo me abofeteó',
                state: 'open',
                timestamp: '2025-11-20T19:49:33.089905',
            },
        ]

        renderReports()
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
    // Filtro de tipo
    $('typeFilter').addEventListener('change', e => {
        state.typeFilter = e.target.value
        state.page = 1
        renderReports()
    })

    // Filtro de estado
    $('stateFilter').addEventListener('change', e => {
        state.stateFilter = e.target.value
        state.page = 1
        renderReports()
    })

    // Búsqueda
    $('search').addEventListener('input', e => {
        state.search = e.target.value
        state.page = 1
        renderReports()
    })

    // Items por página
    $('perPage').addEventListener('change', e => {
        state.perPage = parseInt(e.target.value)
        state.page = 1
        renderReports()
    })

    // Botón refresh
    $('refresh-btn').addEventListener('click', loadReports)
}

async function loadChats() {
    try {
        console.log('Cargando chats...')
        const user = await getCurrentUser()
        console.log('Usuario actual:', user)

        if (!user || !user._id) {
            console.error('No se pudo obtener el usuario actual')
            showToast('No se pudo obtener el usuario actual', 'error')
            return
        }

        console.log('Obteniendo chats para usuario:', user._id)
        const chats = await getChatsByUserId(user._id)
        console.log('Chats recibidos:', chats)

        renderChatsList(chats, user)
    } catch (error) {
        console.error('Error al cargar chats:', error)
        showToast('Error al cargar chats: ' + error.message, 'error')
    }
}

function renderChatsList(chats, user) {
    const $list = $('chats-list')

    console.log('Renderizando chats, elemento encontrado:', $list)

    if (!$list) {
        console.error('Elemento chats-list no encontrado')
        return
    }

    $list.innerHTML = ''

    if (!chats || chats.length === 0) {
        console.log('No hay chats para mostrar')
        $list.innerHTML =
            '<div style="text-align:center;padding:12px;color:var(--muted);font-size:13px;">No hay chats disponibles</div>'
        return
    }

    console.log('Renderizando', chats.length, 'chats')

    chats.forEach((chat, index) => {
        console.log(`Renderizando chat ${index}:`, chat)

        const chatItem = document.createElement('button')
        chatItem.className = 'btn ghost '
        chatItem.style.cssText = 'text-align:left;padding:12px;width:100%;'
        chatItem.dataset.chatId = chat._id

        const otherUser = chat.participants?.find(p => p !== user._id)
        let userName = 'Usuario'

        try {
            const cachedUsersStr = localStorage.getItem('cachedUsers')
            if (cachedUsersStr && otherUser) {
                const cachedUsers = JSON.parse(cachedUsersStr)
                const foundUser = cachedUsers.find(u => u._id === otherUser)
                if (foundUser) {
                    userName = foundUser.name
                }
            }
        } catch (error) {
            console.error('Error al obtener usuario de cache:', error)
        }

        if (userName === 'Usuario') {
            userName =
                chat.other_user_name ||
                chat.otherUserName ||
                otherUser ||
                'Usuario'
        }

        chatItem.innerHTML = `
            <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${escapeHtml(userName)}</div>
            <div style="font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${escapeHtml(chat.last_message.content || 'Sin mensajes')}
            </div>
        `

        chatItem.addEventListener('click', async () => {
            await openChatFromList(chat._id)
        })

        $list.appendChild(chatItem)
    })
}

async function openChatFromList(chatId) {
    try {
        showToast('Cargando chat...')

        const $chatsList = $('chats-list-container')
        if ($chatsList) {
            $chatsList.style.display = 'none'
        }

        const $chatPanel = $('chat-panel')
        $chatPanel.style.display = 'block'

        currentChat = { _id: chatId }

        await loadChatMessages(chatId)

        const closeBtn = $('close-chat-panel')
        if (closeBtn) {
            closeBtn.onclick = () => {
                $chatPanel.style.display = 'none'
                $chatsList.style.display = 'block'
                currentChat = null
            }
        }

        showToast('Chat cargado')
    } catch (error) {
        console.error('Error al abrir chat:', error)
        showToast('Error al abrir chat', 'error')
    }
}

function init() {
    setupEventListeners()
    loadReports()
    loadChats()
}

document.addEventListener('DOMContentLoaded', init)
