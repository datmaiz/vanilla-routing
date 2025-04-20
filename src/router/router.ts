import { findMatches } from './routeMatcher'
import { cacheView, getCachedView } from './routerCache'
import { setRouteContext } from './routerContext'
import { routes } from './routes'
import { ViewResult } from './types'

/**
 * Normalizes a view result into a consistent object with `html` and optional `setup` function.
 *
 * @param view - The view result which can be a string of HTML or an object { html, setup }
 * @returns A normalized view object with properties `html` and `setup`.
 */
function extractView(view: ViewResult) {
	return typeof view === 'string' ? { html: view, setup: undefined } : { html: view.html, setup: view.setup }
}

/**
 * The main routing function responsible for:
 * 1. Finding route matches using `findMatches`.
 * 2. Loading and rendering the correct view or layout.
 * 3. Handling not-found pages.
 * 4. Setting up route context (params, query, navigation helpers).
 * 5. Managing cache and loading spinner transitions.
 *
 * This function is called:
 * - On first page load
 * - After internal navigation (`navigateTo`)
 * - On `popstate` (browser back/forward)
 */
export async function router() {
	const app = document.querySelector('#app') as HTMLElement
	const spinner = document.querySelector('#loading-spinner') as HTMLElement

	// Start loading animation
	spinner?.classList.remove('hidden')
	app.classList.add('fade-out')

	const matches = await findMatches(routes)

	// Fallback to NotFound view if no match is found
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

	// Parse query string into object
	const query = Object.fromEntries(new URLSearchParams(location.search).entries())

	// Use cached view if available
	const cachedView = getCachedView(pathname)
	const viewFn = cachedView || (await lastMatch.route.view()).default
	if (!cachedView && lastMatch.route.cache) {
		cacheView(pathname, viewFn)
	}

	// Get the HTML and setup function
	const view = extractView(viewFn())
	let html = view.html

	// Apply nested layouts from inside out
	for (let i = matches.length - 2; i >= 0; i--) {
		const parent = matches[i].route
		if (parent.layout) {
			html = parent.layout({ children: html })
		}
	}

	// Provide context to the view (params, query, navigation)
	setRouteContext({
		params: lastMatch.params,
		query,
		pathname,
		navigateTo,
		goBack: () => history.back(),
		goForward: () => history.forward(),
		isActive: href => decodeURI(href) === decodeURI(pathname),
	})

	// Mount the view
	app.innerHTML = html
	view.setup?.()

	// Reset scroll and end loading animation
	window.scrollTo(0, 0)
	spinner?.classList.add('hidden')
	app.classList.remove('fade-out')
}

/**
 * Performs client-side navigation by:
 * - Updating the browser's history (pushState)
 * - Calling the `router()` function to update the view.
 *
 * @param url - The target URL to navigate to (e.g., '/admin/settings')
 */
export function navigateTo(url: string) {
	history.pushState({}, '', url)
	router()
}

/**
 * Initializes the router:
 * - Listens to browser history events (`popstate`)
 * - Intercepts click events on elements with `data-link` attribute
 *   to perform client-side navigation instead of full reload.
 * - Calls `router()` on initial load to render the current route.
 */
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
