<script setup lang="ts">
import { add, getTasks } from '@/database/activities';
import { useLayoutStore } from '@/stores/layout';
import type Activity from '@/types/activity';
import { ActivityType } from '@/types/activity';
import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

const tasks: Ref<Activity[]> = ref([]);
const newTask: Ref<Activity> = ref({
  title: '',
  type: ActivityType.Task,
});

const layoutStore = useLayoutStore();

const router = useRouter();

getTasks().then((response) => {
  tasks.value = response.docs as Activity[];
});

const addTask = () => {
  newTask.value._id = new Date().toISOString();
  console.log(newTask.value);
  add(newTask.value).then(() => {
    tasks.value.push(newTask.value);
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
  layoutStore.hideRightSidebar();
  router.push(`/task/${activity._id}/`);
};
</script>

<template>
  <v-table class="task-list">
    <thead>
      <tr>
        <th class="text-left">
          Task
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in tasks"
          :key="item._id">
        <td @click="() => showActivitySidebar(item)"
            @dblclick="() => openActivityPage(item)"
            class="task-list__link">
          {{ item.title }}
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
</style>
