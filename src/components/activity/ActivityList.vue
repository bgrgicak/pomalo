<script setup lang="ts">
import { emptyActivity, openActivityPage } from '@/data/activities';
import { useLayoutStore } from '@/stores/layout';
import type Activity from '@/types/activity';
import type { ActivityType } from '@/types/activity';
import { ref, type Ref } from 'vue';
import __ from '@/helper/translations';
import { useActivityListStore } from '@/stores/activity-list';
import { toLocaleDateString } from '@/helper/date';
import TimerToggle from '../timer/TimerToggle.vue';
import { computed } from 'vue';

const props = defineProps(['type', 'items']);
const type = props.type as ActivityType;

if (!type) {
  throw new Error('ActivityList requires a type prop');
}

const newActivity: Ref<Activity> = ref(emptyActivity(type));

const layoutStore = useLayoutStore();
const activityListStore = useActivityListStore();

const activities = computed(() => {
  if (!activityListStore.list) {
    return [];
  }
  return activityListStore.list.sort(
    (a, b) => {
      return b.priority - a.priority;
    }
  );
});

activityListStore.find(
  {
    selector: {
      type,
    },
  }
);

const addActivity = (title?: string) => {
  if (!title) {
    layoutStore.showRightSidebarNewActivity(type);
  } else {
    activityListStore.add(newActivity.value as Activity).then(() => {
      newActivity.value = emptyActivity(type);
    });
  }
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
  <v-row class="pa-4 pb-0">
    <v-col cols="10">
      <h2 class="activity-list__title mb-0">
        {{ type + 's' }}
      </h2>
    </v-col>
    <v-col cols="2"
           align="right">
      <v-btn icon
             variant="text"
             @click="() => addActivity()">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-col>
  </v-row>
  <v-table class="activity-list">
    <thead>
      <tr>
        <th>{{ __('Title') }}</th>
        <th v-for="(headerItem, headerIndex) in props.items"
            :key="headerIndex">
          {{ headerItem.name }}
        </th>
        <th>{{ __('Due Date') }}</th>
        <th class="d-none d-sm-table-cell">{{ __('Estimated hours') }}</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in activities"
          :key="item._id">
        <td @click="() => showActivitySidebar(item)"
            @dblclick="() => openActivity(item)"
            :class="['activity-list__item', 'activity-list__link', item.completedDate ? 'activity-list__link--completed' : '']">
          {{ item.title }}
        </td>
        <td class="activity-list__item">
          {{ item.dueDate ? toLocaleDateString(item.dueDate) : '' }}
        </td>
        <td class="activity-list__item d-none d-sm-table-cell">
          {{ item.estimatedTime }}
        </td>
        <td class="activity-list__item activity-list__item--actions">
          <TimerToggle :activity="item" />
        </td>
      </tr>
      <tr>
        <td>
          <v-text-field v-model="newActivity.title"
                        :placeholder="__('Add a ') + newActivity.type"
                        variant="plain"
                        @keyup.enter="addActivity" />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>
<style scoped lang="scss">
.activity-list__title {
  text-transform: capitalize;
}

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
