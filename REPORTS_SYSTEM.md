# 🚨 Sistema de Gestión de Reportes

## 📋 Resumen

Sistema completo para gestionar reportes/casos de usuarios sobre servicios, pagos y comportamiento en PymeMap.

## 🎯 Características

✅ **Lista de reportes** con información completa  
✅ **Filtros por tipo** (servicio, pago, comportamiento, técnico, otro)  
✅ **Filtros por estado** (abierto, en progreso, resuelto, cerrado)  
✅ **Búsqueda** por email, nombre o descripción  
✅ **Cambio de estado** de reportes  
✅ **Vista de detalles** completa  
✅ **Métricas en tiempo real** (total, abiertos, en progreso, resueltos)  
✅ **Acciones rápidas** (urgentes, de hoy, sin atender)  
✅ **Paginación** configurable  
✅ **Interfaz similar a comentarios** (familiar para el usuario)

## 📂 Archivos Creados

```
webadmin/
├── pedidos.html (ahora reportes)  # UI principal
├── js/
│   ├── report-service.js          # Servicio API
│   └── reports-main.js            # Lógica principal
└── css/
    └── estilo.css                 # Estilos actualizados
```

## 🔗 Estructura de un Reporte

```javascript
{
    "_id": "report_id",
    "bookingId": "booking_id",
    "businessId": "business_id",
    "reportedBy": "user_id",
    "reportedByName": "Jose",
    "reportedByEmail": "user@example.com",
    "type": "service_issue",          // service_issue, payment_issue, behavior_issue, technical_issue, other
    "description": "Descripción del problema",
    "state": "open",                  // open, in_progress, resolved, closed
    "timestamp": "2025-11-20T19:49:33.089905"
}
```

## 🎨 Tipos de Reportes

| Tipo              | Color      | Descripción                 |
| ----------------- | ---------- | --------------------------- |
| `service_issue`   | 🔴 Rojo    | Problemas con el servicio   |
| `payment_issue`   | 🟠 Naranja | Problemas de pago           |
| `behavior_issue`  | 🟣 Púrpura | Problemas de comportamiento |
| `technical_issue` | 🔵 Azul    | Problemas técnicos          |
| `other`           | ⚫ Gris    | Otros                       |

## 📊 Estados de Reportes

| Estado        | Color       | Descripción                   |
| ------------- | ----------- | ----------------------------- |
| `open`        | 🔴 Rojo     | Recién reportado, sin atender |
| `in_progress` | 🟡 Amarillo | En proceso de resolución      |
| `resolved`    | 🟢 Verde    | Problema resuelto             |
| `closed`      | ⚪ Gris     | Caso cerrado                  |

## 🔧 API Endpoints

### GET `/reports/`

Obtiene todos los reportes

```javascript
import { getReports } from './js/report-service.js'

const reports = await getReports()
```

### PATCH `/reports/{reportId}`

Actualiza el estado de un reporte

```javascript
import { updateReportState } from './js/report-service.js'

await updateReportState(reportId, 'resolved')
```

### POST `/reports/{reportId}/response`

Agrega una respuesta a un reporte (opcional, para futuro)

```javascript
import { addReportResponse } from './js/report-service.js'

await addReportResponse(reportId, 'Hemos solucionado el problema...')
```

## 🚀 Uso

### Acceder a la página:

```
http://localhost:8000/pedidos.html
```

### Filtrar reportes:

1. Usa los selectores de tipo y estado
2. Escribe en el buscador para encontrar por email/descripción
3. Usa las acciones rápidas para filtros comunes

### Cambiar estado de un reporte:

1. Click en "🔄 Cambiar estado"
2. Selecciona el nuevo estado
3. Click en "Guardar"

### Marcar como resuelto:

1. Click en "✅ Marcar resuelto"
2. Confirma la acción

### Ver detalles:

1. Click en "👁️ Ver detalles"
2. Se muestra un modal con toda la información

## 💻 Código de Ejemplo

### Cargar reportes personalizados

```javascript
// En reports-main.js

import { getFilteredReports } from './report-service.js'

// Filtrar por tipo y estado
const reports = await getFilteredReports({
    type: 'service_issue',
    state: 'open',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
})
```

### Actualizar estado programáticamente

```javascript
import { updateReportState } from './report-service.js'

// Marcar múltiples reportes como resueltos
const openReports = reports.filter(r => r.state === 'open')

for (const report of openReports) {
    await updateReportState(report._id, 'in_progress')
}
```

## 🎯 Flujo de Trabajo Recomendado

1. **Revisar reportes abiertos** (🔴 open)
2. **Cambiar a "en progreso"** (🟡 in_progress) al empezar a atender
3. **Investigar el caso** - Ver detalles, IDs de reserva/negocio
4. **Tomar acción** - Contactar usuario, resolver problema
5. **Marcar como resuelto** (🟢 resolved) cuando esté solucionado
6. **Cerrar** (⚪ closed) si es necesario archivar

## 📝 Próximas Mejoras

1. **Sistema de respuestas**
    - Agregar formulario para responder al usuario
    - Historial de conversación
    - Notificaciones al usuario

2. **Asignación de casos**
    - Asignar reportes a administradores específicos
    - Estado "asignado a: [admin]"

3. **Prioridades**
    - Alta, media, baja
    - Ordenar por prioridad

4. **Categorías adicionales**
    - Subcategorías de problemas
    - Tags personalizados

5. **Exportación**
    - Exportar reportes a CSV/Excel
    - Generar informes

6. **Estadísticas avanzadas**
    - Gráficos de tendencias
    - Tiempo promedio de resolución
    - Tipos más comunes

## 🔐 Seguridad

- ✅ Página protegida con auth-guard
- ✅ Token JWT en todas las peticiones
- ✅ Validación de permisos en backend
- ✅ Escape de HTML para prevenir XSS

## 🐛 Debugging

### Los reportes no cargan

```javascript
// En reports-main.js, línea 418
// Verifica que el endpoint esté correcto
const data = await getReports()
console.log('Reportes recibidos:', data)
```

### Error al cambiar estado

```javascript
// En reports-main.js, línea 335
// Descomenta cuando el endpoint esté listo:
await updateReportState(reportId, newState)
```

### Datos de prueba

Si el endpoint aún no está disponible, hay datos de ejemplo en `loadReports()` línea 435 de `reports-main.js`.

## 🎨 Personalización

### Cambiar colores de tipos

Edita `getTypeColor()` en `reports-main.js`:

```javascript
function getTypeColor(type) {
    const colors = {
        service_issue: '#F44336', // Cambiar aquí
        payment_issue: '#FF9800',
        // ...
    }
    return colors[type] || '#607D8B'
}
```

### Agregar nuevo tipo de reporte

1. En `report-service.js`, agrega a `REPORT_TYPES`:

```javascript
export const REPORT_TYPES = {
    // ... existentes
    CUSTOM_ISSUE: 'custom_issue',
}
```

2. Agrega traducción en `REPORT_TYPE_LABELS`:

```javascript
export const REPORT_TYPE_LABELS = {
    // ... existentes
    custom_issue: 'Problema Personalizado',
}
```

3. Agrega opción en `pedidos.html`:

```html
<option value="custom_issue">Problema Personalizado</option>
```

---

**Fecha**: Noviembre 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Funcional (pendiente conectar endpoint PATCH)
