<script setup lang="ts">
import { emptyActivity, openActivityPage } from '@/data/activities';
import { useLayoutStore } from '@/stores/layout';
import type Activity from '@/types/activity';
import type { ActivityType } from '@/types/activity';
import { ref, type Ref } from 'vue';
import __ from '@/helper/translations';
import { useActivityListStore } from '@/stores/activity-list';
import TimerToggle from '../timer/TimerToggle.vue';
import type { PropType } from 'vue';
import ActivityClose from './ActivityClose.vue';
import { computed } from 'vue';
import { watch } from 'vue';

const props = defineProps({
	type: {
		type: String as PropType<ActivityType>,
		required: true,
	},
	items: {
		type: Array as PropType<any[]>,
		default: () => [],
	},
	parent: {
		type: String,
		default: undefined,
	},
	compact: {
		type: Boolean,
		default: false,
	},
});

const listId: Ref<string> = ref('');

const activityList = computed(() => {
	return activityListStore.list[listId.value] || [];
});

const getNewActivity = () => {
	const activity = emptyActivity(props.type);
	if (props.parent) {
		activity.parent = props.parent;
	}
	return activity;
};

const newActivity: Ref<Activity> = ref(getNewActivity());

const layoutStore = useLayoutStore();
const activityListStore = useActivityListStore();

watch(
	props,
	() => {
		activityListStore.find(props.type, props.parent).then((id: string) => {
			listId.value = id;
		});
	},
	{ 
		immediate: true,
	}
);

const addActivity = (title?: string) => {
	if (!title) {
		layoutStore.showRightSidebarNewActivity(props.type);
	} else {
		activityListStore.add(newActivity.value as Activity, listId.value).then(() => {
			newActivity.value = getNewActivity();
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
  <v-row
    v-if="!props.compact"
    class="pa-4 pb-0"
  >
    <v-col cols="10">
      <h2 class="activity-list__title mb-0">
        {{ type + 's' }}
      </h2>
    </v-col>
    <v-col
      cols="2"
      align="right"
    >
      <v-btn
        icon
        variant="text"
        @click="() => addActivity()"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-col>
  </v-row>
  <v-table class="activity-list">
    <thead v-if="!props.compact">
      <tr>
        <th>{{ __('Title') }}</th>
        <th
          v-for="(headerItem, headerIndex) in props.items"
          :key="headerIndex"
        >
          {{ headerItem.name }}
        </th>
        <th />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="item in activityList"
        :key="item._id"
      >
        <td
          :class="['activity-list__item', 'activity-list__link', item.completedDate ? 'activity-list__link--completed' : '']"
          @click="() => showActivitySidebar(item)"
          @dblclick="() => openActivity(item)"
        >
          {{ item.title }}
        </td>
        <td class="activity-list__item activity-list__item--actions">
          <TimerToggle :activity="item" />
          <ActivityClose
            :activity="item"
            :small="true"
            :redirect-after-remove="false"
          />
        </td>
      </tr>
      <tr>
        <td class="activity-list__new">
          <v-text-field
            v-model="newActivity.title"
            :placeholder="__('Add a ') + newActivity.type"
            variant="plain"
            @keyup.enter="addActivity"
          />
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
  grid-auto-flow: column;
  display: grid;
}

.activity-list__link {
  cursor: pointer;
}

.activity-list__link--completed {
  text-decoration: line-through;
}
.activity-list__new {
  width: 100%;
}
</style>
