<script setup lang="ts">
import type Activity from '@/types/activity';
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import router from '@/router/router';
import { useLayoutStore } from '@/stores/layout';
import { ActivityType } from '@/types/activity';
import { computed } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		required: true,
	},
	small: {
		type: Boolean,
		default: false,
	},
	redirectAfterRemove: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits(['onArchived']);

const activityStore = useActivityStore();
const layoutStore = useLayoutStore();

const buttonLabel = computed(() => {
	if (props.small) {
		return undefined;
	}
	if (ActivityType.Task === props.activity.type) {
		return __('Archive Task');
	} else if (ActivityType.Event === props.activity.type) {
		return __('Delete Event');
	} else if (ActivityType.Project === props.activity.type) {
		return __('Archive Project');
	}
	return __('Delete');
});

const buttonIcon = computed(() => {
	return props.small ? 'mdi-delete' : undefined;
});

const archiveActivity = (activity: Activity) => {
	if (!confirm(__('Are you sure you want to archive ') + activity.title + '?')) return;
	activityStore.archive(activity._id).then(() => {
		if (!props.redirectAfterRemove) {
			return;
		}
		layoutStore.hideRightSidebar();
		emit('onArchived', activity._id);
		if (router.currentRoute.value.path.startsWith('/task/')) {
			router.push('/' + activity.type + 's');
		}
	});
};
</script>
<template>
  <v-btn
    v-if="!props.activity.archived && !props.activity.readonly"
    color="error"
    class="activity-archive"
    :class="{ 'activity-archive--small': props.small }"
    :readonly="props.activity.readonly"
    variant="text"
    :icon="buttonIcon"
    :text="buttonLabel"
    @click="archiveActivity(props.activity)"
  />
</template>
<style scoped lang="scss">
.activity-archive--small {
  
}
</style>