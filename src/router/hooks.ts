import { useRouteContext } from './routerContext'

export function useParams(): Record<string, string> {
	return useRouteContext().params
}

export function useQuery(): Record<string, string> {
	return useRouteContext().query
}

export function useRouter(): {
	pathname: string
	navigateTo: (path: string) => void
} {
	const { pathname, navigateTo } = useRouteContext()
	return { pathname, navigateTo }
}

export function useMatch(): (path: string) => boolean {
	const { pathname } = useRouteContext()

	// Hàm này sẽ kiểm tra đường dẫn hiện tại (pathname) với pattern của route
	const match = (path: string): boolean => {
		const routePattern = new RegExp(
			'^' +
				path.replace(/\/:([^/]+)/g, '/([^/]+)') + // Chuyển các tham số vào regex
				'$'
		)
		return routePattern.test(pathname)
	}

	return match
}
