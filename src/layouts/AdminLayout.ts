import { useMatch } from '../router/hooks'
import { useRouteContext } from '../router/routerContext'

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
