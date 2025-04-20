import { Route } from './types'
import AdminLayout from '../layouts/AdminLayout'

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
