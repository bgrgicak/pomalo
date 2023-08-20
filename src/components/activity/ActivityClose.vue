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
});

const activityStore = useActivityStore();
const layoutStore = useLayoutStore();

const buttonLabel = computed(() => {
	if (props.small) {
		return undefined;
	}
	if (ActivityType.Task === props.activity.type) {
		return __('Close Task');
	} else if (ActivityType.Event === props.activity.type) {
		return __('Delete Event');
	}
	return __('Delete');
});

const buttonIcon = computed(() => {
	return props.small ? 'mdi-delete' : undefined;
});

const closeActivity = (activity: Activity) => {
	if (!confirm(__('Are you sure you want to close this ') + activity.type + '?')) return;
	activityStore.remove(activity._id).then(() => {
		layoutStore.hideRightSidebar();
		if (router.currentRoute.value.path.startsWith('/task/'))
			router.push('/' + activity.type + 's');
	});
};
</script>
<template>
  <v-btn
    color="error"
    class="activity-close"
    :class="{ 'activity-close--small': props.small }"
    :readonly="props.activity.readonly"
    variant="text"
    :icon="buttonIcon"
    :text="buttonLabel"
    @click="closeActivity(props.activity)"
  />
</template>
<style scoped lang="scss">
.activity-close--small {
  
}
</style>