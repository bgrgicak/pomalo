
<script lang="ts" setup>
import __ from '@/helper/translations';
import { useActivityListStore } from '@/stores/activity-list';
import type Activity from '@/types/activity';
import type { ActivityType } from '@/types/activity';
import { computed, watch, type PropType } from 'vue';
import TimerToggle from '../timer/TimerToggle.vue';
import ActivityArchive from '../activity/ActivityArchive.vue';
import ActivityAdd from '../activity/ActivityAdd.vue';
import { emptyActivity } from '@/data/activities';
import { ref } from 'vue';

const props = defineProps({
	type: {
		type: String as PropType<ActivityType>,
		required: true,
	},
	headerItems: {
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
	listId: {
		type: String,
		default: '',
	},
});
const emit = defineEmits([
	'openActivity',
	'showActivitySidebar',
	'updateListId',
	'removeActivity'
]);

const newTitle = ref('');

const activityList = computed(() => {
	if (!props.listId) {
		return [];
	}
	if (!activityListStore.list[props.listId]) {
		return [];
	}
	return activityListStore.list[props.listId];
});

const activityListStore = useActivityListStore();

watch(
	props,
	() => {
		activityListStore.getPriorityTypeView(props.type, props.parent).then((id: string) => {
			emit('updateListId', id);
		});
	},
	{ 
		immediate: true,
	}
);

const addActivity = (activity: Activity) => {
	activityListStore.addToList(activity._id, props.listId);
};

const removeActivity = (activityId: string) => {
	emit('removeActivity', activityId);
};

const onNewListItemEnter = () => {
	if (!newTitle.value) {
		return;
	}
	const newActivity = emptyActivity(props.type);
	newActivity.title = newTitle.value;
	if (props.parent) {
		newActivity.parent = props.parent;
	}
	activityListStore.add(newActivity, props.listId, false).then(() => {
		newTitle.value = '';
	});
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
      <ActivityAdd
        :types="[type]"
        @add-activity="addActivity"
      />
    </v-col>
  </v-row>
  <v-table class="activity-list">
    <thead v-if="!props.compact">
      <tr>
        <th>{{ __('Title') }}</th>
        <th
          v-for="(headerItem, headerIndex) in props.headerItems"
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
        class="activity-list__row"
      >
        <td
          :class="['activity-list__item', 'activity-list__link', item.completedDate ? 'activity-list__link--completed' : '']"
          @click="() => emit('showActivitySidebar', item)"
          @dblclick="() => emit('openActivity', item)"
        >
          {{ item.title }}
        </td>
        <td class="activity-list__item activity-list__item--actions">
          <TimerToggle :activity="item" />
          <ActivityArchive
            :activity="item"
            :small="true"
            :redirect-after-remove="false"
            @onArchived="removeActivity"
          />
        </td>
      </tr>
      <tr>
        <td class="activity-list__new">
          <v-text-field
            v-model="newTitle"
            :placeholder="__('Add ') + props.type"
            variant="plain"
            @keyup.enter="onNewListItemEnter"
          />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>
  <style lang="scss">
  .activity-list {
    padding-bottom: 2rem;
      table {
      border-collapse: collapse; 
    }
  }
  .activity-list__title {
    text-transform: capitalize;
  }
  .activity-list__row {
    border-bottom: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  }
  .activity-list__item {
    border-bottom: unset !important;
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