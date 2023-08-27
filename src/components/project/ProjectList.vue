<script setup lang="ts">
import { ref } from 'vue';
import { useActivityListStore } from '@/stores/activity-list';
import { ActivityType } from '@/types/activity';
import type { PropType, Ref } from 'vue';
import type Activity from '@/types/activity';
import { computed } from 'vue';
import { colorScheme } from '@/plugins/ganttastic';
import { daysBetweenDates, setTime } from '@/helper/date';
import { useActivityStore } from '@/stores/activities';
import { watch } from 'vue';
import { display } from '@/plugins/vuetify';
import { getLocalDate } from '@/helper/date';

const DAY_WIDTH_PX = 50;

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
	newActivity: {
		type: Object as PropType<Activity>,
		default: () => {},
	},
	listId: {
		type: String,
		default: '',
	},
});
const emit = defineEmits(['addActivity', 'openActivity', 'showActivitySidebar', 'updateNewActivity', 'updateListId']);

const taskListIds: any = ref({});
const projects: Ref<any[]> = ref([]);

const activityListStore = useActivityListStore();

activityListStore.find(ActivityType.Project).then((listId: string) => {
	emit('updateListId', listId);
});

const mapActivityToGanttBar = (activity: Activity) => {
	const start = activity.startDate ?? activity.eventFirstStart;
	const end = activity.dueDate && (start && activity.dueDate > start)
		? activity.dueDate
		:  activity.eventLastEnd;
	return {
		label: activity.title,
		id: activity._id,
		start,
		end,
		activity,
		ganttBarConfig: {
			id: activity._id,
			hasHandles: false === display.value.mobile.value,
			label: activity.title,
			class: 'v-card ' + activity.type
		}
	};
};

watch(
	[
		() => activityListStore.list[props.listId] ?? [],
		() => (Object.values(taskListIds.value) as any).map((listId: string) => activityListStore.list[listId])
	],
	(newState) => {
		const [projectList] = newState;
		if (!projectList) {
			projects.value = [];
		}
		projects.value = projectList
			.map(
				(activity: Activity) => {
					let tasks: any[] = []; 
					if (taskListIds.value[activity._id] && activityListStore.list[taskListIds.value[activity._id]]) {
						tasks = activityListStore.list[taskListIds.value[activity._id]].map(mapActivityToGanttBar);
					}
					tasks= tasks.sort((a, b) => {
						if (!a.start || !b.start) {
							return 0;
						}
						if (a.start < b.start) {
							return -1;
						}
						if (a.start > b.start) {
							return 1;
						}
						return 0;
					});
					return [
						mapActivityToGanttBar(activity),
						...tasks
					];
				}
			).sort((a, b) => {
				if (!a[0].start || !b[0].start) {
					return 0;
				}
				if (a[0].start < b[0].start) {
					return -1;
				}
				if (a[0].start > b[0].start) {
					return 1;
				}
				return 0;
			});
	}
);

const duration = computed(() => {
	let start: Date | undefined = undefined;
	let end: Date | undefined = undefined;
	projects.value.forEach(project => {
		project.forEach((task: any) => {
			if (!start || (task.start && task.start < start)) {
				start = task.start;
			}
			if (!end || (task.end && task.end > end)) {
				end = task.end;
			}
		});
	});
	return {
		start: setTime(
			getLocalDate(
				start
			)
		),
		end: setTime(
			getLocalDate(
				end
			)
		),
	};
});

const width = computed(() => {
	if (!duration.value.start || !duration.value.end) {
		return 0;
	}
	const diff = daysBetweenDates(
		duration.value.end,
		duration.value.start
	);
	return ((diff) * DAY_WIDTH_PX) + 'px';
});

const expandProject = (activity: Activity) => {
	if (taskListIds.value[activity._id]) {
		taskListIds.value[activity._id] = undefined;
	} else {
		activityListStore.find(ActivityType.Task, activity._id).then((listId: string) => {
			taskListIds.value[activity._id] = listId;
		});
	}
};

const getExpandIcon = (activity: Activity) => {
	if (taskListIds.value[activity._id]) {
		return 'mdi-menu-up';
	}
	return 'mdi-menu-down';
};

const onDragEnd = (item: any) => {
	if (!item.bar || !item.bar.start || !item.bar.end || !item.bar.id) {
		return;
	}
	useActivityStore().updateFields(item.bar.id, {
		startDate: setTime(
			getLocalDate(item.bar.start)
		),
		dueDate: setTime(		
			getLocalDate(item.bar.end)
		),
	});
};

const onBarClick = (item: any) => {
	if (!item.bar || !item.bar.activity) {
		return;
	}
	emit('showActivitySidebar', item.bar.activity);
};
</script>
<template>
  <div
    class="project-list"
    :style="{'--day-width': DAY_WIDTH_PX + 'px'}"
  >
    <v-row
      v-if="!props.compact"
      class="pa-4 pb-0"
    >
      <v-col
        cols="10"
        class="pb-0"
      >
        <h2 class="activity-list__title mb-0">
          {{ type + 's' }}
        </h2>
      </v-col>
      <v-col
        cols="2"
        align="right"
        class="pb-0"
      >
        <v-btn
          icon
          variant="text"
          @click="() => emit('addActivity')"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <div class="project-list__chart">
      <g-gantt-chart
        :chart-start="duration.start"
        :chart-end="duration.end"
        precision="day"
        bar-start="start"
        bar-end="end"
        :color-scheme="colorScheme"
        :width="width"
        :grid="true"
        @dragend-bar="onDragEnd"
        @click-bar="(item: any) => onBarClick(item)"
        @dblclick-bar="(item: any) => emit('openActivity',item.bar.activity)"
      >
        <g-gantt-row
          v-for="project in projects"
          :key="project[0].id"
          :label="project[0].label"
          :bars="project"
        >
          <template
            #label
          >
            <div
              class="project-label" 
              variant="text"
              @click="() => emit('showActivitySidebar',project[0].activity)"
              @dblclick="() => emit('openActivity',project[0].activity)"
            >
              {{ project[0].label }}
            </div>

            <v-btn
              :icon="getExpandIcon(project[0].activity)"
              class="project-label__expand"
              variant="text"
              @click="() => expandProject(project[0].activity)"
            />
          </template>
        </g-gantt-row>
      </g-gantt-chart>
    </div>
  </div>
</template>
<style lang="scss">
@import '@/styles/mixins.scss';

$label-width: 189px;
$row-height: 52px;
$project-label-height: 48px;
$border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));

.project-list-chart {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.g-gantt-chart {
  border-bottom: $border;
  overflow-y: hidden;
  min-width: 100%;
}
.g-gantt-row-label {
  height: calc(100% + 2px);
  border-radius: 0;
  box-shadow: none;
  background: #ffffff !important;
  width: $label-width;
  padding: 0 16px;
  display: flex;
  align-content: start;
  flex-direction: column;

  &:first-child {
	border-top: $border;
  }

  .project-label {
	font-weight: 500;
	font-size: 1rem !important;
	text-align: left;
	cursor: pointer;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	text-align: left;
	width: calc(#{$label-width} - 64px);
	height: $project-label-height;
	line-height: $project-label-height;
  }

  .project-label__expand {
	position: absolute;
	right: 0;
  }
}
.g-timeaxis {
	box-shadow: none;
	padding-left: $label-width;
	height: 75px;
	padding-top: 10px;
}
.g-upper-timeunit,
.g-timeunit {
	color: rgb(153, 153, 153) !important;
}
.g-timeunit{
	width: var(--day-width) !important;
	min-width: var(--day-width) !important;
}
.g-gantt-row-bars-container {
	border: none !important;
	border-top: $border !important;
}
.g-gantt-row {
  padding-left: $label-width;
  min-height: $row-height;
  height: auto !important;
}
.g-grid-container {
	margin-left: $label-width;
}
.g-gantt-bar {
	margin-bottom: 10px;
	position: relative !important;
	top: unset !important;
	transition-duration: 0.1s !important;
	&:first-child {
		margin-top: 10px;
	}
	.g-gantt-bar-handle-left,
	.g-gantt-bar-handle-right {
		background-color: transparent !important;
	}
}
.g-gantt-bar.project {
    @include event-colors(var(--v-theme-project), var(--v-theme-project-darken-4));
}

.g-gantt-bar.task {
    @include event-colors(var(--v-theme-task), var(--v-theme-task-darken-4));
}
</style>
