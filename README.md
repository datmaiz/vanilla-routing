# 🔗 Tiny SPA Router (Vanilla JS)

A lightweight, M-Router–like Single Page Application (SPA) router built with **vanilla Typescript**. Supports nested routes, layouts, dynamic params, route caching, and more — without any external dependencies.

---

## 🚀 Features

- ✅ Custom routing with nested routes and layouts
- ✅ Route-based code splitting (`import()` views)
- ✅ Dynamic path parameters (`/users/:id`)
- ✅ Simple `navigateTo()` API
- ✅ View caching (for performance)
- ✅ Layout support (wrap nested routes)
- ✅ Route context injection (params, query, pathname, helpers)
- ✅ Custom `<a data-link>` navigation
- ✅ Loading spinner + smooth transitions

---

## 📁 Project Structure

```
src/           # App entry point
├── main.ts              # App init
├── components/
│   ├── counter.ts       # Define component
├── layouts/
│   ├── AdminLayout.ts   # Define layout
├── router/
│   ├── router.ts        # Main router logic
│   ├── routeMatcher.ts  # Recursive path matcher
│   ├── routerCache.ts   # Optional view caching
│   ├── routerContext.ts # Share data (like React context)
│   └── routes.ts        # Define app routes
│   └── hooks.ts         # Define hooks
│   └── state.ts         # Define state managerment
│   └── types.ts         # Define different types of router
│   └── use-signal.ts    # Define signal (a different way to manage state)
├── views/               # Lazy-loaded views
│   ├── Home.ts
│   ├── About.ts
│   └── NotFound.ts
│   └── Settings.ts
└index.html
```

---

## 🧠 How It Works

1. On load or navigation, `router()` is called.
2. It uses `findMatches()` to match `location.pathname` to your route tree.
3. If found:
   - Loads view via dynamic `import()`
   - Wraps it with parent layouts (if any)
   - Injects `params`, `query`, `navigateTo()`, etc. via context
4. Updates the DOM with `innerHTML`, runs `setup()` (if any)

---

## ✨ Example Route Definition

```ts
export const routes: Route[] = [
	{
		path: '',
		view: () => import('../views/Home'),
		cache: true,
	},
	{
		path: 'about',
		layout: ({ children }) => `<div class="layout">${children}</div>`,
		children: [
			{
				path: '',
				view: () => import('../views/About'),
			},
			{
				path: ':teamId',
				view: () => import('../views/AboutTeam'),
			},
		],
	},
	{
		path: '*',
		view: () => import('../views/NotFound'),
	},
]
```

---

## 🔧 Navigation Helpers

You can use:

```ts
navigateTo('/about')
```

or:

```html
<a
	href="/about"
	data-link
	>About</a
>
```

The router intercepts `[data-link]` clicks automatically.

---

## 🧩 Route Context

Inside a view's `setup()` function, you can access:

```ts
import { getRouteContext } from '../router/routerContext'

const { params, query, navigateTo, pathname, isActive } = getRouteContext()
```

---

## ⚙️ Custom View Format

Each view module should export a default function returning either:

```ts
// Simple
export default () => `<h1>Home</h1>`

// Or with setup logic
export default () => ({
	html: `<button id="btn">Click</button>`,
	setup() {
		document.querySelector('#btn')?.addEventListener('click', () => alert('Clicked!'))
	},
})
```

---

## Practices

### Create a simple page

```ts
export default function HomePage() {
	let count = 0

	return {
		html: `
    <div>
      <h1>Home Page</h1>
      <a data-link href="/dashboard">To Dashboard</a>
      <button id="button">Click me</button>
      <p id="count">0</p>
    </div>
  `,
		setup() {
			const button = document.getElementById('button')!
			const countElement = document.getElementById('count')!

			button.onclick = () => {
				countElement.textContent = (count + 1).toString()
				count++
			}
		},
	}
}
```

### Create a simple layout

```ts
import { useMatch } from '@/router/hooks'
import { useRouteContext } from '@/router/routerContext'

export default function AdminLayout({ children }: { children: string }): string {
	const { pathname, isActive } = useRouteContext()
	const match = useMatch()

	return `
    <div class="admin-layout">
      <nav>
        <a href="/dashboard" data-link classname="${match('/admin/settings') ? 'active' : ''}">🏠 Dashboard</a>
        <a href="/settings/78" data-link classname="${match('/setting') ? 'active' : ''}">⚙️ Settings</a>
        <div>You are at: ${pathname}</div>
      </nav>
      <main>${children}</main>
    </div>
  `
}
```

remember to use `data-link` attribute on the link to make it work.

### Create simple routes

```ts
export const routes: Route[] = [
	{
		path: '/',
		view: () => import('../views/Home'),
		cache: true,
	},
	{
		path: '/admin',
		view: () => import('../views/Dashboard'),
		layout: AdminLayout,
		cache: true,
		children: [
			{
				path: 'settings',
				view: () => import('../views/Settings'),
				cache: true,
			},
			{
				path: 'home',
				view: () => import('../views/Home'),
				cache: true,
			},
		],
	},
	{
		path: '*',
		view: () => import('../views/NotFound'),
	},
]
```

Settings and Home will be rendered inside the AdminLayout.

### Let route work

`main.ts`

```ts
document.addEventListener('DOMContentLoaded', () => {
	initRouter()
})
```

### Use createState for managing state

```ts
import { createState } from '../router/state'

export default function HomePage() {
	let count = createState(0)

	return {
		html: `
    <div>
      <h1>Home Page</h1>
      <a data-link href="/dashboard">To Dashboard</a>
      <button id="button">Click me</button>
      <p id="count">${count}</p>
    </div>
  `,
		setup() {
			const button = document.getElementById('button')!
			const countElement = document.getElementById('count')!

			// triggle when use `set` method to set a new value
			subscribe(state => {
				countElement.textContent = count.toString()
			})

			button.onclick = () => {
				set(get() + 1)
			}
		},
	}
}
```

### Use createSignal for managing state and pass props to others component

Home.ts

```ts
import { Counter, CounterSignal } from '../components'
import { createState } from '../router/state'
import { createSignal } from '../router/use-signal'

export default function HomePage() {
	let countSignal = createSignal(0)

	const counterSignal = CounterSignal({ count: countSignal })

	return {
		html: `
    <div>
      <h1>Home Page</h1>
      <a data-link href="/dashboard">To Dashboard</a>
      <button id="button">Click me</button>
			${counterSignal.html}
    </div>
  `,
		setup() {
			counterSignal.setup()
			const button = document.getElementById('button')!
			const countElement = document.getElementById('count')!

			button.onclick = () => {
				countSignal.value++
			}
		},
	}
}

export function CounterSignal({ count }: { count: Signal<number> }) {
	return {
		html: /*html*/ `
			<p id="count">${count}</p>
    `,
		setup() {
			const countElement = document.getElementById('count')!

			// triggle when count change
			effect(() => {
				countElement.innerHTML = count.value.toString()
			})
		},
	}
}
```

when click button, `count` will be increased by 1 and UI is updated automaticaly
remember to use `data-link` attribute on the link to make it work.

---

### How to create a component with props

counter.ts

```ts
export function CounterSignal({ count }: { count: Signal<number> }) {
	return {
		html: /*html*/ `
			<p id="count">${count}</p>
    `,
		setup() {
			const countElement = document.getElementById('count')!

			effect(() => {
				countElement.innerHTML = count.value.toString()
			})
		},
	}
}
```

or

```ts
export const Component: SignalFC<{ count: number }> = ({ count }) => {
	return {
		html: /*html*/ `
			<p id="count">${count}</p>
    `,
		setup() {
			const countElement = document.getElementById('count')!

			effect(() => {
				countElement.innerHTML = count.value.toString()
			})
		},
	}
}
```

You don't need to use `Signal`

you can't use `SignalFC` with `Signal` as a parameter, you need to use `SignalFC` with `Signal` as a return value. And you can't define function inside `SignalFC` because all properties inside it will be convert to `Signal` automatically.

---

### Use component inside another component without

Home.ts

```ts
import { Counter, CounterSignal } from '../components'
import { createState } from '../router/state'
import { createSignal } from '../router/use-signal'

export default function HomePage() {
	let countSignal = createSignal(0)

	const counterSignal = CounterSignal({ count: countSignal })

	return {
		html: `
      <div>
        <h1>Home Page</h1>
        <a data-link href="/dashboard">To Dashboard</a>
        <button id="button">Click me</button>
        ${counterSignal.html}
      </div>
    `,
		setup() {
			counterSignal.setup()
			const button = document.getElementById('button')!
			const countElement = document.getElementById('count')!

			button.onclick = () => {
				countSignal.value++
			}
		},
	}
}
```

## 🧪 Dev Setup

```bash
npm install
npm run dev
```

---

## 📦 Build

```bash
npm run build
```

---

## 📜 License

MIT — use freely, modify wildly.
