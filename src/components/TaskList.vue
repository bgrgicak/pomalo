<script setup lang="ts">
import { add, getTasks, remove } from '@/database/activities';
import { useLayoutStore } from '@/stores/layout';
import type Activity from '@/types/activity';
import { ActivityType } from '@/types/activity';
import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

const tasks: Ref<Activity[]> = ref([]);
const newTask = ref({
  title: '',
  type: ActivityType.Task,
} as any);

const layoutStore = useLayoutStore();

const router = useRouter();

getTasks().then((response) => {
  tasks.value = (response.docs  as Activity[]).sort(
    (a: Activity, b: Activity) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );
});

const addTask = () => {
  newTask.value._id = new Date().toISOString();
  console.log(newTask.value);
  add(newTask.value as Activity).then(() => {
    tasks.value.push(newTask.value as Activity);
    newTask.value = {
      title: '',
      type: ActivityType.Task,
    };
  });
};

const showActivitySidebar = (activity: Activity) => {
  layoutStore.showRightSidebar( activity );
};
const openActivityPage = (activity: Activity) => {
  router.push(`/task/${activity._id}/`).then(
    () => {
      layoutStore.hideRightSidebar();
    }
  );
};

const deleteTask = (activity: Activity) => {
  remove(activity._id).then(() => {
    tasks.value = tasks.value.filter((item) => item._id !== activity._id);
  });
};
</script>

<template>
  <v-table class="task-list">
    <tbody>
      <tr v-for="item in tasks"
          :key="item._id">
        <td @click="() => showActivitySidebar(item)"
            @dblclick="() => openActivityPage(item)"
            :class="[ 'task-list__link', item.completed ? 'task-list__link--completed' : '' ]">
          {{ item.title }}
        </td>
        <td class="task-list__item--actions">
          <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical"
                       v-bind="props"></v-btn>
            </template>
            <v-list>
                <v-list-item @click="() => deleteTask(item)">
                    <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
            </v-list>
          </v-menu>
        </td>
      </tr>
      <tr>
        <td>
          <v-text-field v-model="newTask.title"
                        placeholder="Add a task"
                        variant="plain"
                        @keyup.enter="addTask" />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>
<style scoped lang="scss">
.task-list {
  cursor: pointer;
}
.task-list-item--actions{
  text-align: end;
}
.task-list__link--completed {
  text-decoration: line-through;
}
</style>
