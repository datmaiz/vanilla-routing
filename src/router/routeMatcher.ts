import { Route, RouteMatch } from './types'

/**
 * Checks if a given route path matches the current URL segments.
 *
 * @param routePath - The route path pattern (e.g., '/admin/:id')
 * @param pathSegments - The URL path split into segments (e.g., ['admin', '123'])
 * @returns An object with:
 *   - matched: true if the routePath matches the beginning of pathSegments
 *   - params: a map of dynamic parameters extracted from the path
 *   - consumed: number of segments used from pathSegments
 */
function matchPath(
	routePath: string,
	pathSegments: string[]
): { matched: boolean; params: Record<string, string>; consumed: number } {
	const routeSegments = routePath.split('/').filter(Boolean)
	if (routeSegments.length > pathSegments.length) return { matched: false, params: {}, consumed: 0 }

	const params: Record<string, string> = {}
	for (let i = 0; i < routeSegments.length; i++) {
		const r = routeSegments[i]
		const p = pathSegments[i]
		if (r.startsWith(':')) {
			params[r.slice(1)] = p
		} else if (r !== p) {
			return { matched: false, params: {}, consumed: 0 }
		}
	}
	return { matched: true, params, consumed: routeSegments.length }
}

/**
 * Recursively finds a list of route matches that correspond to the current URL path,
 * supporting nested routes.
 *
 * @param routes - The route configuration to match against
 * @param pathSegments - The current URL path split into segments (default: from location.pathname)
 * @param basePath - Internal base path used for recursion (default: '')
 * @returns A Promise that resolves to an ordered array of matched routes (from root to leaf),
 *          or null if no match is found.
 *
 * Example return value for '/admin/settings':
 * [
 *   { route: { path: '/admin', ... }, params: {} },
 *   { route: { path: 'settings', ... }, params: {} }
 * ]
 */
export async function findMatches(
	routes: Route[],
	pathSegments = location.pathname.split('/').filter(Boolean),
	basePath = ''
): Promise<RouteMatch[] | null> {
	for (const route of routes) {
		const { matched, params, consumed } = matchPath(route.path, pathSegments)
		if (!matched) continue

		const matchedRoute: RouteMatch = {
			route,
			params,
		}

		if (route.children) {
			const childSegments = pathSegments.slice(consumed)
			const childMatches = await findMatches(route.children, childSegments, basePath + '/' + route.path)
			if (childMatches) {
				return [matchedRoute, ...childMatches]
			}
		}

		if (consumed === pathSegments.length) {
			return [matchedRoute]
		}
	}

	return null
}
