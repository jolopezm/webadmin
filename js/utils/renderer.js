function renderTemplate(templateOrId, context = {}) {
    let template = ''
    const el = typeof window !== 'undefined' ? document.getElementById(templateOrId) : null
    if (el) {
        template = el.innerHTML
    } else if (typeof templateOrId === 'string') {
        template = templateOrId
    }

    return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        const k = key.trim()
        return Object.prototype.hasOwnProperty.call(context, k) && context[k] !== undefined
            ? context[k]
            : ''
    })
}

export { renderTemplate };