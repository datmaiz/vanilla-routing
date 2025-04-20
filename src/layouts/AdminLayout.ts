import { useRouteContext } from '../router/routerContext'

export default function AdminLayout({ children }: { children: string }): string {
	const { pathname } = useRouteContext()

	return `
    <div class="admin-layout">
      <nav>
        <a href="/dashboard" data-link>🏠 Dashboard</a>
        <a href="/settings/78" data-link>⚙️ Settings</a>
        <div>You are at: ${pathname}</div>
      </nav>
      <main>${children}</main>
    </div>
  `
}
