export type ViewResult =
	| string
	| {
			html: string
			setup?: () => void
	  }

export interface Route {
	path: string
	view: () => Promise<{ default: () => ViewResult }>
	layout?: (props: { children: string }) => string
	children?: Route[]
	cache?: boolean
}

export interface RouteMatch {
	route: Route
	params: Record<string, string>
}
