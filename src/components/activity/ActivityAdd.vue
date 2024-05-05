<script setup lang="ts">
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import { useLayoutStore } from '@/stores/layout';
import { useNoticeStore } from '@/stores/notices';
import { useSearchStore } from '@/stores/search';
import type Activity from '@/types/activity';
import { ActivityType, type ActivityEvent } from '@/types/activity';
import { NoticeType } from '@/types/notice';
import type { PropType } from 'vue';
import { watch } from 'vue';
import { computed } from 'vue';
import { ref } from 'vue';
import ActivitySelect from './ActivitySelect.vue';

const props = defineProps({
	types: {
		type: Array as PropType<ActivityType[]>,
		default: () => [
			ActivityType.Task,
			ActivityType.Event,
			ActivityType.Project,
		],
	},
	focused: {
		type: Boolean,
		default: false,
	},
	event: {
		type: Object as PropType<ActivityEvent>,
		default: undefined
	},
});

const emit = defineEmits(['addActivity']);

const activityStore = useActivityStore();
const layoutStore = useLayoutStore();

const placeholder = computed(() => {
	return __('Title');
});

const addActivity = (activity: Activity) => {
	activityStore.add(activity)
		.then((response) => {
			if (!response) {
				useNoticeStore().addNotice({
					type: NoticeType.Error,
					title: __('Unable to add ') + activity.type,
				});
				return;
			}
			layoutStore.showRightSidebar(activity._id);
			emit('addActivity', activity);
		});
};
</script>
<template>
  <ActivitySelect
    :types="props.types"
    :is-input-focused="props.focused"
    :placeholder="placeholder"
    :search="false"
    :overlay="true"
    @new-click="addActivity"
  />
</template>