export type ViewResult =
	| string
	| {
			html: string
			setup?: () => void
	  }

export interface Route {
	path: string
	view: () => Promise<{ default: () => string } | { default: () => { html: string; setup: () => void } }>
	layout?: (args: { children: string }) => string
	cache?: boolean
	children?: Route[]
	parent?: Route
}
