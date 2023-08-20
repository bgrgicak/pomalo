import type Route from '@/types/router';
import { MenuType } from '@/types/router';
import __ from '@/helper/translations';

const routes: Route[] = [
	{
		path: '/',
		name: __('Dashboard'),
		component: () => import('../views/DashboardView.vue'),
		icon: 'mdi-view-dashboard',
		menu: [],
	},
	{
		path: '/calendar',
		name: __('Calendar'),
		component: () => import('../views/CalendarView.vue'),
		icon: 'mdi-calendar',
		menu: [
			MenuType.Main,
		],
	},
	{
		path: '/event/:_id',
		name: __('Event'),
		icon: 'mdi-calendar-edit',
		component: () => import('../views/ActivityView.vue'),
		menu: [],
	},
	{
		path: '/task/:_id',
		name: __('Task'),
		icon: 'mdi-format-list-checkbox',
		component: () => import('../views/ActivityView.vue'),
		menu: [],
	},
	{
		path: '/tasks',
		name: __('Tasks'),
		icon: 'mdi-format-list-checkbox',
		component: () => import('../views/TaskListView.vue'),
		menu: [
			MenuType.Main,
		],
	},
	{
		path: '/project/:_id',
		name: __('Project'),
		icon: 'mdi-chart-gantt',
		component: () => import('../views/ActivityView.vue'),
		menu: [],
	},
	{
		path: '/projects',
		name: __('Projects'),
		icon: 'mdi-chart-gantt',
		component: () => import('../views/ProjectListView.vue'),
		menu: [
			MenuType.Main,
		],
	},
	{
		path: '/sign-in',
		name: __('Sign in'),
		icon: 'mdi-login',
		component: () => import('../views/SignInView.vue'),
		menu: [
			MenuType.Header,
		],
	},
	{
		path: '/settings',
		name: __('Settings'),
		icon: 'mdi-cog',
		component: () => import('../views/SettingsView.vue'),
		menu: [
			MenuType.Header,
		],
	}
];

const mainMenu = routes.filter((route) => route.menu.includes(MenuType.Main));

export { mainMenu };

const headerMenu = routes.filter((route) => route.menu.includes(MenuType.Header));

export { headerMenu };

export default routes;