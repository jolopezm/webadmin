async function includeHTML(selector, templatePath) {
    try {
        const response = await fetch(templatePath)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const html = await response.text()
        const container = document.querySelector(selector)
        if (container) {
            container.innerHTML = html

            const scripts = container.querySelectorAll('script')
            scripts.forEach(script => {
                const newScript = document.createElement('script')
                newScript.textContent = script.textContent
                document.body.appendChild(newScript)
            })

            try {
                const inSubfolder = window.location.pathname.includes('/pages/')
                if (inSubfolder) {
                    const links = container.querySelectorAll('.nav a')
                    links.forEach(link => {
                        const href = link.getAttribute('href')
                        if (!href) return

                        if (
                            href.startsWith('http') ||
                            href.startsWith('/') ||
                            href.startsWith('..')
                        )
                            return

                        if (href === 'index.html') {
                            link.setAttribute('href', '../index.html')
                        } else if (href.startsWith('pages/')) {
                            link.setAttribute('href', '../' + href)
                        }
                    })
                }
            } catch (e) {
                console.warn('No se pudo ajustar enlaces del sidebar:', e)
            }
        }
    } catch (error) {
        console.error('Error cargando template:', error)
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const sidebarContainer = document.getElementById('sidebar-container')
    if (sidebarContainer) {
        const inSubfolder = window.location.pathname.includes('/pages/')
        const templatePath = inSubfolder
            ? '../templates/left-sidebar.html'
            : 'templates/left-sidebar.html'

        await includeHTML('#sidebar-container', templatePath)

        initSidebar()
    }
})

function initSidebar() {
    const inSubfolder = window.location.pathname.includes('/pages/')

    const logoutBtn = document.getElementById('sidebar-logout-btn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                const authPath = inSubfolder
                    ? '../js/api/auth-service.js'
                    : './js/api/auth-service.js'
                const loginPath = inSubfolder
                    ? '../pages/login.html'
                    : 'pages/login.html'

                import(authPath)
                    .then(({ logout }) => {
                        logout()
                        window.location.href = loginPath
                    })
                    .catch(() => {
                        localStorage.clear()
                        window.location.href = loginPath
                    })
            }
        })
    }

    // Removido: loadUserData() - auth-guard.js se encarga de esto
}

async function loadUserData() {
    // Esta función ha sido removida - auth-guard.js maneja la carga de datos del usuario
    console.log('loadUserData() removida - usando auth-guard.js')
}
