export interface RouteContext {
	params: Record<string, string>
	query: Record<string, string>
	pathname: string
	navigateTo: (path: string) => void
}

let currentCtx: RouteContext = {
	params: {},
	query: {},
	pathname: '/',
	navigateTo: () => {},
}

export function setRouteContext(ctx: RouteContext) {
	currentCtx = ctx
}

export function useRouteContext(): RouteContext {
	return currentCtx
}
