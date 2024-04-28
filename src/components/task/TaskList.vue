
<script lang="ts" setup>
import { emptyActivity } from '@/data/activities';
import __ from '@/helper/translations';
import { useActivityFilterStore } from '@/stores/activity-filters';
import { useActivityListStore } from '@/stores/activity-list';
import { useLayoutStore } from '@/stores/layout';
import type Activity from '@/types/activity';
import type { ActivityType } from '@/types/activity';
import { ActivityFilterGroup, type ActivityFilterState, type ActivityGroup } from '@/types/activity-filter';
import type { ComputedRef } from 'vue';
import { computed, ref, watch, type PropType } from 'vue';
import { filterActivityList, groupActivities, sortActivities, sortActivityGroups } from '../../data/activity-list';
import ActivityAdd from '../activity/ActivityAdd.vue';
import ActivityArchive from '../activity/ActivityArchive.vue';
import TimerToggle from '../timer/TimerToggle.vue';
import TaskCompleted from './TaskCompleted.vue';

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
	filters: {
		type: Object as PropType<ActivityFilterState>,
		default: undefined,
	},
});
const emit = defineEmits([
	'openActivity',
	'showActivitySidebar',
	'updateListId',
	'removeActivity'
]);

const activityFilterStore = useActivityFilterStore();
const activityListStore = useActivityListStore();
const layoutStore = useLayoutStore();

const newTitle = ref({} as {[key: string]: string});

const filters = computed(() => {
	if (props.filters) {
		return props.filters;
	}
	return activityFilterStore.filters;
});

const activityList = computed(() => {
	if (!props.listId) {
		return [];
	}
	if (!activityListStore.list[props.listId]) {
		return [];
	}
	return activityListStore.list[props.listId];
});

const groupList: ComputedRef<ActivityGroup[]> = computed(() => {
	if (!activityList.value || !activityList.value.length) {
		return [
			{
				name: __('Other'),
				activities: []
			},
		];
	}

	return sortActivityGroups(
		sortActivities(
			groupActivities(
				filterActivityList(
					activityList.value,
					filters.value
				),
				filters.value
			),
			filters.value
		)
	);
});
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

const onNewListItemEnter = (group: ActivityGroup) => {
	if (!newTitle.value) {
		return;
	}
	const newActivity = emptyActivity(props.type);
	newActivity.title = newTitle.value[group.name];
	if (props.parent) {
		newActivity.parent = props.parent;
	}

	if ( group.activityId && activityFilterStore.filters.group === ActivityFilterGroup.Project) {
		newActivity.parent = group.activityId;
	}

	activityListStore.add(newActivity, props.listId, false).then(() => {
		newTitle.value[group.name] = '';
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
    class="pa-4 pb-0 pl-1 activity-list__header"
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
          <tr v-if="props.headerItems.length">
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
              <div class="activity-list__item--actions-inner">
                <TimerToggle :activity="item" />
                <TaskCompleted
                  :activity="item"
                  :compact="true"
                />
                <ActivityArchive
                  :activity="item"
                  :small="true"
                  :redirect-after-remove="false"
                  @onArchived="removeActivity"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td class="activity-list__row activity-list__new">
              <v-text-field
                v-model="newTitle[ group.name ]"
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
  .activity-list__header {
    max-width: 100%;
    margin: 0;
  }
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
      td,
      th {
        line-height: 1rem;
        padding: 4px 16px !important;
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
  .activity-list__item--actions-inner {
    display: flex;
    justify-content: flex-end;
  }
  </style>