import { createRouter, createWebHistory } from "vue-router";
import TaskListView from "../views/TaskListView.vue";
import CalendarView from "../views/CalendarView.vue";
console.log(import.meta.env);
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "calendar",
      component: CalendarView,
    },
    {
      path: "/tasks",
      name: "tasks",
      component: TaskListView,
    },
  ],
});

export default router;
