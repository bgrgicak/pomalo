<script setup lang="ts">
import { openActivityPage } from '@/data/activities';
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
});

const listId: Ref<string> = ref('');

const layoutStore = useLayoutStore();
const activityListStore = useActivityListStore();

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

const removeActivity = (activityId: string) => {
	activityListStore.remove(activityId, listId.value);
};
</script>
<template>
  <TaskList
    v-if="props.type === ActivityType.Task"
    :type="props.type"
    :header-items="props.headerItems"
    :parent="props.parent"
    :compact="props.compact"
    :list-id="listId"
    @showActivitySidebar="showActivitySidebar"
    @openActivity="openActivity"
    @updateListId="listId = $event"
    @removeActivity="removeActivity"
  />
  <ProjectList
    v-else-if="props.type === ActivityType.Project"
    :type="props.type"
    :header-items="props.headerItems"
    :parent="props.parent"
    :compact="props.compact"
    :list-id="listId"
    @showActivitySidebar="showActivitySidebar"
    @openActivity="openActivity"
    @updateListId="listId = $event"
  />
</template>
