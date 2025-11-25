export class TableComponent {
    constructor(options) {
        this.containerId = options.containerId
        this.data = options.data || []
        this.columns = options.columns || []
        this.actions = options.actions || []
        this.perPageOptions = options.perPageOptions || [10, 20, 50]
        this.onAction = options.onAction || (() => {})
        this.onLoad = options.onLoad || (() => {})

        this.state = {
            page: 1,
            perPage: this.perPageOptions[0],
            search: '',
            filters: {},
            selected: new Set(),
            editing: null,
        }

        this.init()
    }

    init() {
        this.render()
        this.bindEvents()
    }

    updateData(data) {
        this.data = data
        this.state.selected.clear()
        this.state.editing = null
        this.render()
    }

    getFilteredData() {
        return this.data.filter(item => {
            // Filtros
            for (const [key, value] of Object.entries(this.state.filters)) {
                if (value && item[key] !== value) return false
            }
            // Búsqueda
            if (this.state.search) {
                const searchLower = this.state.search.toLowerCase()
                const searchable = this.columns
                    .filter(col => col.searchable !== false)
                    .some(col => {
                        const val = item[col.key]
                        return (
                            val &&
                            val.toString().toLowerCase().includes(searchLower)
                        )
                    })
                if (!searchable) return false
            }
            return true
        })
    }

    getPagedData() {
        const filtered = this.getFilteredData()
        const start = (this.state.page - 1) * this.state.perPage
        return filtered.slice(start, start + this.state.perPage)
    }

    render() {
        const container = document.getElementById(this.containerId)
        if (!container) return

        const filteredData = this.getFilteredData()
        const pagedData = this.getPagedData()
        const totalPages = Math.ceil(filteredData.length / this.state.perPage)

        container.innerHTML = `
            <div class="table-controls">
                <div class="table-filters">
                </div>
                <div class="table-actions">
                    ${this.actions
                        .map(
                            action => `
                        <button class="btn ${action.multiple ? 'ghost' : ''}" id="${this.containerId}-action-${action.key}" ${this.state.selected.size === 0 && action.multiple ? 'disabled' : ''}>
                            ${action.label}
                        </button>
                    `
                        )
                        .join('')}
                    <select class="select" id="${this.containerId}-perPage">
                        ${this.perPageOptions.map(opt => `<option value="${opt}" ${opt === this.state.perPage ? 'selected' : ''}>${opt} por página</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width:40px"><input type="checkbox" id="${this.containerId}-select-all"></th>
                            ${this.columns.map(col => `<th>${col.label}</th>`).join('')}
                            <th style="width:120px">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagedData.map(item => this.renderRow(item)).join('')}
                    </tbody>
                </table>
                ${filteredData.length === 0 ? '<div class="empty-state">No hay datos que mostrar</div>' : ''}
            </div>
            ${totalPages > 1 ? this.renderPagination(totalPages) : ''}
        `
    }

    renderRow(item) {
        const isSelected = this.state.selected.has(item._id || item.id)
        const isEditing = this.state.editing === (item._id || item.id)

        if (isEditing) {
            return this.renderEditRow(item)
        }

        return `
            <tr>
                <td><input type="checkbox" class="row-checkbox" data-id="${item._id || item.id}" ${isSelected ? 'checked' : ''}></td>
                ${this.columns.map(col => `<td>${col.render ? col.render(item[col.key], item) : item[col.key] || '—'}</td>`).join('')}
                <td>
                    <button class="btn ghost" onclick="window.tableEdit('${this.containerId}', '${item._id || item.id}')">Editar</button>
                </td>
            </tr>
        `
    }

    renderEditRow(item) {
        return `
            <tr class="editing">
                <td><input type="checkbox" disabled></td>
                ${this.columns
                    .map(
                        col => `
                    <td>
                        ${col.editable ? (typeof item[col.key] === 'boolean' ? `<input type="checkbox" ${item[col.key] ? 'checked' : ''} data-field="${col.key}">` : `<input type="text" value="${item[col.key] || ''}" data-field="${col.key}">`) : col.render ? col.render(item[col.key], item) : item[col.key] || '—'}
                    </td>
                `
                    )
                    .join('')}
                <td>
                    <button class="btn" onclick="window.tableSave('${this.containerId}', '${item._id || item.id}')">OK</button>
                    <button class="btn ghost" onclick="window.tableCancel('${this.containerId}')">X</button>
                </td>
            </tr>
        `
    }

    renderPagination(totalPages) {
        const pages = []
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                `<button class="page-btn ${i === this.state.page ? 'active' : ''}" data-page="${i}">${i}</button>`
            )
        }
        return `<div class="pagination">${pages.join('')}</div>`
    }

    bindEvents() {
        const container = document.getElementById(this.containerId)

        // Search
        const searchInput = container.querySelector(
            `#${this.containerId}-search`
        )
        if (searchInput) {
            searchInput.addEventListener('input', e => {
                this.state.search = e.target.value
                this.state.page = 1
                this.render()
            })
        }

        // Filters
        this.columns
            .filter(col => col.filterable)
            .forEach(col => {
                const filterSelect = container.querySelector(
                    `#${this.containerId}-filter-${col.key}`
                )
                if (filterSelect) {
                    filterSelect.addEventListener('change', e => {
                        this.state.filters[col.key] = e.target.value
                        this.state.page = 1
                        this.render()
                    })
                }
            })

        // Per page
        const perPageSelect = container.querySelector(
            `#${this.containerId}-perPage`
        )
        if (perPageSelect) {
            perPageSelect.addEventListener('change', e => {
                this.state.perPage = parseInt(e.target.value)
                this.state.page = 1
                this.render()
            })
        }

        // Select all
        const selectAll = container.querySelector(
            `#${this.containerId}-select-all`
        )
        if (selectAll) {
            selectAll.addEventListener('change', e => {
                const checkboxes = container.querySelectorAll('.row-checkbox')
                checkboxes.forEach(cb => {
                    cb.checked = e.target.checked
                    const id = cb.dataset.id
                    if (e.target.checked) {
                        this.state.selected.add(id)
                    } else {
                        this.state.selected.delete(id)
                    }
                })
                this.updateActionButtons()
            })
        }

        // Row checkboxes
        container.addEventListener('change', e => {
            if (e.target.classList.contains('row-checkbox')) {
                const id = e.target.dataset.id
                if (e.target.checked) {
                    this.state.selected.add(id)
                } else {
                    this.state.selected.delete(id)
                }
                this.updateSelectAll()
                this.updateActionButtons()
            }
        })

        // Pagination
        container.addEventListener('click', e => {
            if (e.target.classList.contains('page-btn')) {
                this.state.page = parseInt(e.target.dataset.page)
                this.render()
            }
        })

        // Actions
        this.actions.forEach(action => {
            const btn = container.querySelector(
                `#${this.containerId}-action-${action.key}`
            )
            if (btn) {
                btn.addEventListener('click', () => {
                    const selectedArray = Array.from(this.state.selected)
                    if (action.multiple) {
                        if (selectedArray.length > 0) {
                            this.onAction(action.key, selectedArray)
                        }
                    } else {
                        // Para acciones individuales
                        if (
                            action.requiresSelection === false ||
                            selectedArray.length > 0
                        ) {
                            this.onAction(action.key, selectedArray)
                        }
                    }
                })
            }
        })
    }

    updateSelectAll() {
        const container = document.getElementById(this.containerId)
        const selectAll = container.querySelector(
            `#${this.containerId}-select-all`
        )
        const checkboxes = container.querySelectorAll('.row-checkbox')
        const checkedBoxes = container.querySelectorAll('.row-checkbox:checked')
        selectAll.checked =
            checkboxes.length > 0 && checkedBoxes.length === checkboxes.length
        selectAll.indeterminate =
            checkedBoxes.length > 0 && checkedBoxes.length < checkboxes.length
    }

    updateActionButtons() {
        const container = document.getElementById(this.containerId)
        this.actions.forEach(action => {
            const btn = container.querySelector(
                `#${this.containerId}-action-${action.key}`
            )
            if (btn) {
                btn.disabled = action.multiple
                    ? this.state.selected.size === 0
                    : this.state.selected.size !== 1
            }
        })
    }
}

window.tableEdit = function (containerId, id) {
    const table = window.tableInstances[containerId]
    if (table) {
        table.state.editing = id
        table.render()
    }
}

window.tableSave = function (containerId, id) {
    const table = window.tableInstances[containerId]
    if (table) {
        const row = document.querySelector(`tr.editing`)
        const inputs = row.querySelectorAll('input[data-field]')
        const updates = {}
        inputs.forEach(input => {
            updates[input.dataset.field] =
                input.type === 'checkbox' ? input.checked : input.value
        })
        table.onAction('save', id, updates)
        table.state.editing = null
        table.render()
    }
}

window.tableCancel = function (containerId) {
    const table = window.tableInstances[containerId]
    if (table) {
        table.state.editing = null
        table.render()
    }
}

// Inicializar instancia global
window.tableInstances = {}
