<script setup lang="ts">
import { emptyActivity, openActivityPage } from '@/helper/activities';
import { useLayoutStore } from '@/stores/layout';
import type Activity from '@/types/activity';
import type { ActivityType } from '@/types/activity';
import { ref, type Ref } from 'vue';
import __ from '@/helper/translations';
import ActivityClose from './ActivityClose.vue';
import { useActivityListStore } from '@/stores/activity-list';
import { toLocaleDateString } from '@/helper/date';
import TimerToggle from '../timer/TimerToggle.vue';

const props = defineProps(['type']);
const type = props.type as ActivityType;

if (!type) {
  throw new Error('ActivityList requires a type prop');
}

const newActivity: Ref<Activity> = ref(emptyActivity(type));

const layoutStore = useLayoutStore();
const activityListStore = useActivityListStore();

activityListStore.find(
  {
    selector: {
      type
    },
  }
);

const addActivity = () => {
  if (!newActivity.value.title) {
    return;
  }
  activityListStore.add(newActivity.value as Activity).then(() => {
    newActivity.value = emptyActivity(type);
  });
};

const showActivitySidebar = (activity: Activity) => {
  layoutStore.showRightSidebar(activity._id);
};
const openActivity = (activity: Activity) => {
  openActivityPage(activity).then(
    () => {
      layoutStore.hideRightSidebar();
    }
  );
};
</script>

<template>
  <v-table class="activity-list">
    <thead>
      <tr>
        <th>{{ __('Title') }}</th>
        <th>{{ __('Due Date') }}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in activityListStore.list"
          :key="item._id">
        <td @click="() => showActivitySidebar(item)"
            @dblclick="() => openActivity(item)"
            :class="['activity-list__item', 'activity-list__link', item.completedDate ? 'activity-list__link--completed' : '']">
          {{ item.title }}
        </td>
        <td class="activity-list__item">
          {{ item.dueDate ? toLocaleDateString(item.dueDate) : '' }}
        </td>
        <td class="activity-list__item activity-list__item--actions">
          <TimerToggle :activity="item" />
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical"
                     v-bind="props"
                     variant="plain"></v-btn>
            </template>
            <v-list>
              <v-list-item>
                <ActivityClose :activity="item" />
              </v-list-item>
            </v-list>
          </v-menu>
        </td>
      </tr>
      <tr>
        <td>
          <v-text-field v-model="newActivity.title"
                        :placeholder="__('Add a ') + newActivity.type"
                        variant="plain"
                        @keyup.enter="addActivity"
                        @change="addActivity" />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>
<style scoped lang="scss">
.activity-list__item--actions {
  text-align: end;
}

.activity-list__link {
  cursor: pointer;
}

.activity-list__link--completed {
  text-decoration: line-through;
}
</style>
