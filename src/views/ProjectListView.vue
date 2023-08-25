<script setup lang="ts">
import { ref } from 'vue';
import { useActivityListStore } from '@/stores/activity-list';
import { ActivityType } from '@/types/activity';
import type { Ref } from 'vue';
import type Activity from '@/types/activity';
import { computed } from 'vue';
import { openActivityPage } from '@/data/activities';
import { colorScheme } from '@/plugins/ganttastic';
import { daysBetweenDates } from '@/helper/date';
import { useLayoutStore } from '@/stores/layout';
import { useActivityStore } from '@/stores/activities';
import { watch } from 'vue';
import { LogType } from '@/types/log';
import log from '@/helper/logs';

const projectListId: Ref<string> = ref('');
const taskListIds: any = ref({});
const projects: Ref<any[]> = ref([]);

const activityListStore = useActivityListStore();
const layoutStore = useLayoutStore();

activityListStore.find(ActivityType.Project).then((listId: string) => {
	projectListId.value = listId;
});

const mapActivityToGanttBar = (activity: Activity) => {
	return {
		label: activity.title,
		id: activity._id,
		start: activity.eventFirstStart,
		end: activity.eventLastEnd,
		activity,
		ganttBarConfig: {
			id: activity._id,
			hasHandles: true,
			label: activity.title,
			class: 'v-card ' + activity.type
		}
	};
};

watch(
	[
		() => activityListStore.list[projectListId.value] ?? [],
		() => (Object.values(taskListIds.value) as any).map((listId: string) => activityListStore.list[listId])
	],
	(newState) => {
		const [projectList] = newState;
		if (!projectList) {
			projects.value = [];
		}
		projects.value = projectList.map(
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
		start,
		end
	};
});

const width = computed(() => {
	if (!duration.value.start || !duration.value.end) {
		return 0;
	}
	const diff = daysBetweenDates(duration.value.end, duration.value.start);
	return (diff * 50) + 'px';
});

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

const expandProject = (activity: Activity) => {
	if (taskListIds.value[activity._id]) {
		taskListIds.value[activity._id] = undefined;
	} else {
		activityListStore.find(ActivityType.Task, activity._id).then((listId: string) => {
			taskListIds.value[activity._id] = listId;
			console.log(taskListIds.value);
		});
	}
};

const getExpandIcon = (activity: Activity) => {
	if (taskListIds.value[activity._id]) {
		return 'mdi-menu-up';
	}
	return 'mdi-menu-down';
};

const onDragEnd = (item: any, event: MouseEvent) => {
	if(event) {
		event.preventDefault();
		event.stopPropagation();
	}
	if (!item.bar || !item.bar.start || !item.bar.end || !item.bar.id) {
		return;
	}
	useActivityStore().updateFields(item.bar.id, {
		startDate: new Date(item.bar.start),
		dueDate: new Date(item.bar.end)
	});
	return false;
};
</script>
<template>
  <div class="project-list-view">
    <g-gantt-chart
      :chart-start="duration.start"
      :chart-end="duration.end"
      precision="day"
      bar-start="start"
      bar-end="end"
      :color-scheme="colorScheme"
      :width="width"
      @dragend-bar="onDragEnd"
      @click-bar="(item: any) => showActivitySidebar(item.bar.activity)"
      @dblclick-bar="(item: any) => openActivity(item.bar.activity)"
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
            @click="() => showActivitySidebar(project[0].activity)"
            @dblclick="() => openActivity(project[0].activity)"
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
</template>
<style lang="scss">
@import '@/styles/mixins.scss';

$label-width: 200px;
$row-height: 52px;
$border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));

.project-list-view {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.g-gantt-chart {
  border-bottom: $border;
}
.g-gantt-row-label {
  height: calc(100% + 2px);
  border-radius: 0;
  box-shadow: none;
  background: transparent !important;
  width: $label-width;
  padding: 0 16px;
  position: absolutes;
  height: $row-height;

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
	margin-top: 10px;
}
.g-upper-timeunit,
.g-timeunit {
	color: rgb(153, 153, 153) !important;
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
.g-gantt-bar {
	margin-bottom: 10px;
	position: relative !important;
	top: unset !important;
	&:first-child {
		margin-top: 10px;
	}
}
.g-gantt-bar.project {
    @include event-colors(var(--v-theme-project), var(--v-theme-project-darken-4));
}
</style>
