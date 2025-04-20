import { Route, RouteMatch } from './types'

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
