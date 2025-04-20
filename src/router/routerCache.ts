import { ViewResult } from './types'

const viewCache = new Map<string, () => ViewResult>()

export function getCachedView(pathname: string) {
	return viewCache.get(pathname)
}

export function cacheView(pathname: string, viewFn: () => ViewResult): void {
	viewCache.set(pathname, viewFn)
}
