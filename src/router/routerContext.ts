export interface RouteContext {
	params: Record<string, string>
	query: Record<string, string>
	pathname: string
	navigateTo: (path: string) => void
	goBack: () => void
	goForward: () => void
	isActive: (href: string) => boolean
}

let currentCtx: RouteContext = {
	params: {},
	query: {},
	pathname: '/',
	navigateTo: () => {},
	goBack: () => {},
	goForward: () => {},
	isActive: () => false,
}

export function setRouteContext(ctx: RouteContext) {
	currentCtx = ctx
}

export function useRouteContext(): RouteContext {
	return currentCtx
}
