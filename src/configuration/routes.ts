import TaskListView from "../views/TaskListView.vue";
import CalendarView from "../views/CalendarView.vue";
import { MenuType } from "@/types/router";
import __ from "@/utilities/translations";

const routes = [
    {
        path: "/",
        name: __("Calendar"),
        component: CalendarView,
        menu: [
            MenuType.Main,
        ],
    },
    {
        path: "/tasks",
        name: __("Tasks"),
        component: TaskListView,
        menu: [
            MenuType.Main,
        ],
    },
];

const mainMenu = routes.filter((route) => route.menu.includes(MenuType.Main));

export { mainMenu };

export default routes;