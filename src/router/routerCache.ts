const viewCache = new Map<string, () => string>()

export function getCachedView(pathname: string): (() => string) | undefined {
	return viewCache.get(pathname)
}

export function cacheView(pathname: string, viewFn: () => string): void {
	viewCache.set(pathname, viewFn)
}
