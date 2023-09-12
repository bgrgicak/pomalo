
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
import { useLayoutStore } from '@/stores/layout';
import { useActivityFilterStore } from '@/stores/activity-filters';
import type { ComputedRef } from 'vue';
import { ActivityFilterGroup } from '@/types/activity-filter';
import { useProjectStore } from '@/stores/projects';

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

const activityFilterStore = useActivityFilterStore();
const projectStore = useProjectStore();

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

interface Group {
  name: string;
  activities: Activity[];
}

const groupList: ComputedRef<Group[]> = computed(() => {
	if (!activityList.value) {
		return [];
	}

	const groups: {[key: string]: Group} = {
		other: {
			name: __('Other'),
			activities: [] as Activity[],
		},
		inProgress: {
			name: __('In progress'),
			activities: [] as Activity[],
		},
		notStarted: {
			name: __('Not started'),
			activities: [] as Activity[],
		},
		completed: {
			name: __('Completed'),
			activities: [] as Activity[],
		},
		noProject: {
			name: __('No project'),
			activities: [] as Activity[],
		},
	};

	if (!activityFilterStore.filters.group) {
		groups.other.activities = activityList.value;
	} else {
		activityList.value.forEach((activity: Activity) => {
			if (activityFilterStore.filters.group === ActivityFilterGroup.Completed) {
				if (activity.completedDate) {
					groups.completed.activities.push(activity);
				} else if ( activity.events && activity.events.length > 0) {
					groups.inProgress.activities.push(activity);
				} else {
					groups.notStarted.activities.push(activity);
				}
			} else if (activityFilterStore.filters.group === ActivityFilterGroup.Project) {
				if (activity.parent) {
					if (!groups[activity.parent]) {
						groups[activity.parent] = {
							name: projectStore.getTitle(activity.parent),
							activities: [],
						};
					}
					groups[activity.parent].activities.push(activity);
				} else {
					groups.noProject.activities.push(activity);
				}
			}
		});
	}
	return Object.values(groups).filter(
		(group: Group) => group.activities.length > 0
	);
});

const activityListStore = useActivityListStore();
const layoutStore = useLayoutStore();
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

const onNewListItemEnter = (group: Group) => {
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

const toggleFilters = () => {
	if (layoutStore.isLeftSidebarVisible) {
		layoutStore.hideLeftSidebar();
	} else {
		layoutStore.showLeftSidebar();
	}
};
</script>
<template>
  <v-row
    v-if="!props.compact"
    class="pa-4 pb-0 pl-1"
  >
    <v-col cols="10">
      <v-btn
        icon="mdi-filter-variant"
        variant="plain"
        @click="toggleFilters"
      />
    </v-col>
    <v-col
      cols="2"
      align="right"
      class="pb-0 pr-2 pt-2"
    >
      <ActivityAdd
        :types="[type]"
        @add-activity="addActivity"
      />
    </v-col>
  </v-row>
  <v-table class="activity-list">
    <tbody>
      <v-table
        v-for="group in groupList"
        :key="group.name"
        class="activity-list__group"
      >
        <thead v-if="!props.compact">
          <tr
            v-if="1 < groupList.length"
          >
            <th class="activity-list__group-title">
              <h3 class="activity-list__title pt-6 pb-2">
                {{ group.name }}
              </h3>
            </th>
            <th
              v-for="(headerItem, headerIndex) in props.headerItems"
              :key="headerIndex"
            />
            <th />
          </tr>
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
            v-for="item in group.activities"
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
            <td
              class="activity-list__item activity-list__item--actions"
              align="right"
            >
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
            <td class="activity-list__row activity-list__new">
              <v-text-field
                v-model="newTitle"
                :placeholder="__('Add ') + props.type"
                variant="plain"
                density="compact"
                :hide-details="true"
                @keyup.enter="() => onNewListItemEnter(group)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </tbody>
  </v-table>
</template>
  <style lang="scss">
  $row-height: 2rem;
  $font-size: 0.9rem;
  .activity-list {
    padding-bottom: 2rem;
    font-size: $font-size;
    table {
      border-collapse: collapse; 

      td,
      th,
      .v-btn {
        height: $row-height !important;
      }
    }
  }
  .activity-list__title {
    text-transform: capitalize;
  }
  .activity-list__group-title {
    width: 100%;
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
    border-bottom: none;
    .v-field__input {
      padding: 0 !important;
      height: $row-height;
      font-size: $font-size;
    }
  }
  </style>