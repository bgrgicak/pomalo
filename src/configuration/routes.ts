import type Route from "@/types/router";
import { MenuType } from "@/types/router";
import __ from "@/utilities/translations";

const routes: Route[] = [
    {
        path: "/",
        name: __("Calendar"),
        component: () => import("../views/CalendarView.vue"),
        icon: "mdi-calendar",
        menu: [
            MenuType.Main,
        ],
    },
    {
        path: "/task/:_id",
        name: __("Task"),
        icon: "mdi-format-list-bulleted",
        component: () => import("../views/ActivityView.vue"),
        menu: [],
    },
    {
        path: "/tasks",
        name: __("Tasks"),
        icon: "mdi-format-list-bulleted",
        component: () => import("../views/TaskListView.vue"),
        menu: [
            MenuType.Main,
        ],
    },
    {
        path: "/sign-in",
        name: __("Sign in"),
        icon: "mdi-login",
        component: () => import("../views/SignInView.vue"),
        menu: [
            MenuType.Header,
        ],
    },
    {
        path: "/settings",
        name: __("Settings"),
        icon: "mdi-cog",
        component: () => import("../views/SettingsView.vue"),
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