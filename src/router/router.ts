import { findMatches } from './routeMatcher'
import { cacheView, getCachedView } from './routerCache'
import { setRouteContext } from './routerContext'
import { routes } from './routes'
import { ViewResult } from './types'

function extractView(view: ViewResult) {
	return typeof view === 'string' ? { html: view, setup: undefined } : { html: view.html, setup: view.setup }
}

export async function router() {
	const app = document.querySelector('#app') as HTMLElement
	const spinner = document.querySelector('#loading-spinner') as HTMLElement

	spinner?.classList.remove('hidden')
	app.classList.add('fade-out')

	const matches = await findMatches(routes)
	if (!matches || matches.length === 0) {
		spinner?.classList.add('hidden')
		const notFound = (await import('../views/NotFound')).default
		const view = extractView(notFound())
		app.innerHTML = view.html
		view.setup?.()
		return
	}

	const lastMatch = matches[matches.length - 1]
	const pathname = location.pathname
	const query = Object.fromEntries(new URLSearchParams(location.search).entries())

	const cachedView = getCachedView(pathname)
	const viewFn = cachedView || (await lastMatch.route.view()).default
	if (!cachedView && lastMatch.route.cache) {
		cacheView(pathname, viewFn)
	}

	const view = extractView(viewFn())
	let html = view.html

	// Áp dụng layout từ trong ra ngoài
	for (let i = matches.length - 2; i >= 0; i--) {
		const parent = matches[i].route
		if (parent.layout) {
			html = parent.layout({ children: html })
		}
	}

	setRouteContext({
		params: lastMatch.params,
		query,
		pathname,
		navigateTo,
		goBack: () => history.back(),
		goForward: () => history.forward(),
		isActive: href => decodeURI(href) === decodeURI(pathname),
	})

	app.innerHTML = html
	view.setup?.()

	window.scrollTo(0, 0)
	spinner?.classList.add('hidden')
	app.classList.remove('fade-out')
}

export function navigateTo(url: string) {
	history.pushState({}, '', url)
	router()
}

export function initRouter(): void {
	window.addEventListener('popstate', router)
	document.addEventListener('click', e => {
		const target = e.target as HTMLElement
		if (target.matches('[data-link]')) {
			e.preventDefault()
			const href = target.getAttribute('href')
			if (href) navigateTo(href)
		}
	})

	router()
}

// const query = Object.fromEntries(new URLSearchParams(location.search).entries())
