import { routes } from './routes'
import { findMatch } from './routeMatcher'
import { setRouteContext } from './routerContext'
import { getCachedView, cacheView } from './routerCache'

export async function router(): Promise<void> {
	const app = document.querySelector('#app') as HTMLElement
	const spinner = document.querySelector('#loading-spinner') as HTMLElement

	const showSpinner = () => spinner?.classList.remove('hidden')
	const hideSpinner = () => spinner?.classList.add('hidden')

	showSpinner()
	app.classList.add('fade-out')

	const match = findMatch(routes)
	if (!match) {
		hideSpinner()
		const notFound = (await import('../views/NotFound')).default
		app.innerHTML = notFound()
		return
	}

	const { route, params, query } = match
	const pathname = location.pathname

	const cachedView = getCachedView(pathname)
	const viewFn = cachedView || (await route.view()).default

	if (!cachedView && route.cache) {
		cacheView(pathname, viewFn)
	}

	setRouteContext({
		params,
		query,
		pathname,
		navigateTo,
	})

	const content = viewFn()
	const html = typeof content === 'string' ? content : content.html
	const setup = typeof content === 'string' ? undefined : content.setup
	const layout = route.layout ? route.layout({ children: html }) : html

	app.innerHTML = layout
	window.scrollTo(0, 0)
	setup?.()

	hideSpinner()
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
