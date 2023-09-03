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

const focused = ref(props.focused);
const newActivityTitle = ref('');

const activityStore = useActivityStore();
const layoutStore = useLayoutStore();
const searchStore = useSearchStore();

watch(
	() => newActivityTitle.value,
	(searchText: string) => {
		searchStore.search(searchText, props.types);
	}
);

const placeholder = computed(() => {
	return __('Title');
});

const isInputFocused = computed(() => {
	return focused.value || props.focused;
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
			newActivityTitle.value = '';
			focused.value = false;
		});
};
</script>
<template>
  <ActivitySelect
    v-model="newActivityTitle"
    :types="props.types"
    :is-input-focused="isInputFocused"
    :placeholder="placeholder"
    :search="false"
    @new-click="addActivity"
  />
</template>