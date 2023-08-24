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

const projectListId: Ref<string> = ref('');

const activityListStore = useActivityListStore();
activityListStore.find(ActivityType.Project).then((listId: string) => {
	projectListId.value = listId;
});

const projects = computed(() => {
	if (!activityListStore.list[projectListId.value]) {
		return [];
	}
	return activityListStore.list[projectListId.value].map(
		(activity: Activity) => {
			return [
				{
					label: activity.title,
					id: activity._id,
					start: activity.eventFirstStart,
					end: activity.eventLastEnd,
					activity,
					ganttBarConfig: {
						id: activity._id,
						hasHandles: true,
						label: activity.title,
						class: 'project'
					}
				}
			];
		}
	);
});

const duration = computed(() => {
	let start: Date | undefined = undefined;
	let end: Date | undefined = undefined;
	projects.value.forEach(project => {
		project.forEach(task => {
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
    >
      <g-gantt-row
        v-for="project in projects"
        :key="project[0].id"
        :label="project[0].label"
        :bars="project"
        @click="() => openActivityPage(project[0].activity)"
      />
    </g-gantt-chart>
  </div>
</template>
<style lang="scss">
@import '@/styles/mixins.scss';

.project-list-view {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.g-gantt-chart {
  border-bottom: 2px solid #eaeaea;
}
.g-gantt-row-label {
  height: calc(100% + 2px);
  border-radius: 0;
  box-shadow: none;
  background: transparent !important;
  border-right: 1px solid #eaeaea;
  width: 100%;
  max-width: 100px;
  font-weight: 500;
  cursor: pointer;
  &:first-child {
	border-top: 2px solid #eaeaea;
  }
}
.g-timeaxis {
	box-shadow: none;
	padding-left: 100px;
}
.g-gantt-row {
  padding-left: 100px;
}
.g-gantt-bar.project {
    @include event-colors(var(--v-theme-project), var(--v-theme-project-darken-4));
}
</style>
