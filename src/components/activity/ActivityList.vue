<script setup lang="ts">
import { emptyActivity, openActivityPage } from '@/data/activities';
import { useLayoutStore } from '@/stores/layout';
import type Activity from '@/types/activity';
import { ActivityType } from '@/types/activity';
import { ref, type Ref } from 'vue';
import __ from '@/helper/translations';
import { useActivityListStore } from '@/stores/activity-list';
import type { PropType } from 'vue';
import TaskList from '../task/TaskList.vue';
import ProjectList from '../project/ProjectList.vue';

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
  <TaskList
    v-if="props.type === ActivityType.Task"
    :type="props.type"
    :items="props.items"
    :parent="props.parent"
    :compact="props.compact"
    :list-id="listId"
    :new-activity="newActivity"
    @showActivitySidebar="showActivitySidebar"
    @openActivity="openActivity"
    @addActivity="addActivity"
    @updateNewActivity="newActivity = $event"
    @updateListId="listId = $event"
  />
  <ProjectList 
    v-else-if="props.type === ActivityType.Project"
    :type="props.type"
    :items="props.items"
    :parent="props.parent"
    :compact="props.compact"
    :list-id="listId"
    :new-activity="newActivity"
    @showActivitySidebar="showActivitySidebar"
    @openActivity="openActivity"
    @addActivity="addActivity"
    @updateNewActivity="newActivity = $event"
    @updateListId="listId = $event"
  />
</template>
