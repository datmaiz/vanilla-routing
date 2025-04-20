import { Route } from './types'

interface MatchResult {
	route: Route
	params: Record<string, string>
	query: Record<string, string>
}

function parseQuery(queryString: string): Record<string, string> {
	const query: Record<string, string> = {}
	const searchParams = new URLSearchParams(queryString)
	for (const [key, value] of searchParams.entries()) {
		query[key] = value
	}
	return query
}

function pathToRegex(path: string): { regex: RegExp; keys: string[] } {
	const keys: string[] = []
	const regexStr = path.replace(/\//g, '/').replace(/:(\w+)/g, (_, key) => {
		keys.push(key)
		return '([^/]+)'
	})
	return { regex: new RegExp(`^${regexStr}$`), keys }
}

function matchPath(pathname: string, route: Route, parentPath = ''): MatchResult | null {
	const fullPath = (parentPath + '/' + route.path).replace(/\/+/g, '/').replace(/\/$/, '') || '/'
	const { regex, keys } = pathToRegex(fullPath)
	const match = regex.exec(pathname)

	if (match) {
		const params: Record<string, string> = {}
		keys.forEach((key, i) => (params[key] = match[i + 1]))
		const query = parseQuery(location.search)
		return { route, params, query }
	}

	if (route.children) {
		for (const child of route.children) {
			const childMatch = matchPath(pathname, child, fullPath)
			if (childMatch) return childMatch
		}
	}

	return null
}

export function findMatch(routes: Route[]): MatchResult | null {
	const pathname = location.pathname
	for (const route of routes) {
		const match = matchPath(pathname, route)
		if (match) return match
	}
	return null
}
