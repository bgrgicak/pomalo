import { MenuType } from "@/types/router";
import __ from "@/utilities/translations";

const routes = [
    {
        path: "/",
        name: __("Calendar"),
        component: () => import(/* webpackChunkName: "settings" */ "../views/CalendarView.vue"),
        icon: "mdi-calendar",
        menu: [
            MenuType.Main,
        ],
    },
    {
        path: "/tasks",
        name: __("Tasks"),
        icon: "mdi-format-list-bulleted",
        component: () => import(/* webpackChunkName: "settings" */ "../views/TaskListView.vue"),
        menu: [
            MenuType.Main,
        ],
    },
    {
        path: "/sign-in",
        name: __("Sign in"),
        icon: "mdi-login",
        component: () => import(/* webpackChunkName: "settings" */ "../views/SignInView.vue"),
        menu: [
            MenuType.Header,
        ],
    },
    {
        path: "/settings",
        name: __("Settings"),
        icon: "mdi-cog",
        component: () => import(/* webpackChunkName: "settings" */ "../views/SettingsView.vue"),
        menu: [
            MenuType.Header,
        ],
    },
];

const mainMenu = routes.filter((route) => route.menu.includes(MenuType.Main));

export { mainMenu };

const headerMenu = routes.filter((route) => route.menu.includes(MenuType.Header));

export { headerMenu };

export default routes;