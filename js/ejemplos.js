/**
 * EJEMPLO DE USO DE LA ARQUITECTURA MODULAR
 *
 * Este archivo muestra cómo aprovechar la nueva estructura
 * para hacer cambios de manera sencilla.
 */

// ============================================
// EJEMPLO 1: Agregar un nuevo filtro
// ============================================

/*
1. En index.html, agrega dentro de .controls:
   
   <select class="select" id="urgencyFilter">
       <option value="all">Todas las urgencias</option>
       <option value="high">Alta</option>
       <option value="medium">Media</option>
       <option value="low">Baja</option>
   </select>

2. En main.js, actualiza el objeto state:
   
   let state = {
       page: 1,
       perPage: 10,
       statusFilter: 'all',
       ratingFilter: 'all',
       search: '',
       urgencyFilter: 'all'  // <-- NUEVO
   };

3. En setupEventListeners(), agrega:
   
   $('urgencyFilter').addEventListener('change', e => {
       state.urgencyFilter = e.target.value;
       state.page = 1;
       renderComments();
   });

4. En filteredComments(), agrega la lógica:
   
   if(state.urgencyFilter !== 'all' && c.urgency !== state.urgencyFilter) {
       return false;
   }
*/

// ============================================
// EJEMPLO 2: Conectar con API real
// ============================================

/*
async function loadCommentsFromAPI() {
    try {
        const response = await fetch('http://localhost:8000/api/comments');
        const data = await response.json();
        
        // Limpiar el array de comentarios
        comments.length = 0;
        
        // Llenar con datos reales
        comments.push(...data);
        
        // Re-renderizar
        renderComments();
        updateChart();
        
    } catch (error) {
        console.error('Error cargando comentarios:', error);
        showToast('Error al cargar comentarios');
    }
}

// Llamar al inicializar
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadCommentsFromAPI(); // <-- En lugar de usar datos hardcoded
});
*/

// ============================================
// EJEMPLO 3: Agregar nueva métrica
// ============================================

/*
1. En index.html, dentro de .metrics:
   
   <div class="metric">
       <div class="num" id="pending-count">0</div>
       <div class="label">Pendientes</div>
   </div>

2. En updateSummary() en main.js:
   
   function updateSummary() {
       // ... código existente ...
       
       // Nueva métrica
       const pending = comments.filter(c => c.status === 'Pendiente').length;
       $('pending-count').textContent = pending;
   }
*/

// ============================================
// EJEMPLO 4: Agregar dark mode
// ============================================

/*
1. En estilo.css, agrega al inicio:
   
   [data-theme="dark"] {
       --purple: #9D7FEA;
       --light-gray: #404040;
       --bg: #1a1a1a;
       --muted: #999;
   }

2. En main.js, agrega función:
   
   function toggleTheme() {
       const html = document.documentElement;
       const currentTheme = html.getAttribute('data-theme');
       const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
       html.setAttribute('data-theme', newTheme);
       localStorage.setItem('theme', newTheme);
   }

3. En index.html, agrega botón en header:
   
   <button class="btn ghost" onclick="toggleTheme()">🌓 Tema</button>
*/

// ============================================
// EJEMPLO 5: Agregar exportación a CSV
// ============================================

/*
function exportToCSV() {
    // Preparar datos
    const csvContent = [
        ['Usuario', 'Fecha', 'Rating', 'Comentario', 'Estado'],
        ...comments.map(c => [
            c.user,
            formatDate(c.date),
            c.rating,
            c.text.replace(/,/g, ';'), // Escapar comas
            c.status
        ])
    ]
    .map(row => row.join(','))
    .join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comentarios_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Archivo CSV descargado');
}

// Agregar botón en index.html:
<button class="btn ghost" onclick="exportToCSV()">📥 Exportar CSV</button>
*/

// ============================================
// EJEMPLO 6: Agregar notificaciones en tiempo real
// ============================================

/*
// Conectar con WebSocket
let socket;

function setupWebSocket() {
    socket = new WebSocket('ws://localhost:8000/ws/comments');
    
    socket.onmessage = (event) => {
        const newComment = JSON.parse(event.data);
        
        // Agregar al inicio
        comments.unshift(newComment);
        
        // Re-renderizar
        renderComments();
        
        // Notificar al usuario
        showToast(`Nuevo comentario de ${newComment.user}`);
        
        // Notificación del navegador (si tiene permiso)
        if (Notification.permission === 'granted') {
            new Notification('Nuevo comentario', {
                body: newComment.text.substring(0, 100),
                icon: '/icon.png'
            });
        }
    };
    
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        showToast('Error en conexión en tiempo real');
    };
}

// Solicitar permisos de notificación
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Llamar al inicializar
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderComments();
    setupWebSocket();
    requestNotificationPermission();
});
*/

// ============================================
// EJEMPLO 7: Agregar búsqueda avanzada
// ============================================

/*
function advancedFilter(comment, filters) {
    // Fecha desde/hasta
    if (filters.dateFrom && new Date(comment.date) < new Date(filters.dateFrom)) {
        return false;
    }
    if (filters.dateTo && new Date(comment.date) > new Date(filters.dateTo)) {
        return false;
    }
    
    // Rating mínimo
    if (filters.minRating && comment.rating < filters.minRating) {
        return false;
    }
    
    // Palabras clave
    if (filters.keywords && filters.keywords.length > 0) {
        const hasKeyword = filters.keywords.some(keyword => 
            comment.text.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
    }
    
    return true;
}

// Usar en filteredComments()
function filteredComments() {
    return comments.filter(c => {
        // ... filtros existentes ...
        
        // Aplicar filtros avanzados
        if (state.advancedFilters) {
            return advancedFilter(c, state.advancedFilters);
        }
        
        return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
}
*/

console.log('📚 Ejemplos cargados. Abre este archivo para ver casos de uso.')
