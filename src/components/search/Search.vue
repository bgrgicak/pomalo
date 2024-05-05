<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import { openActivityPage } from '@/data/activities';
import { useActivityStore } from '@/stores/activities';
import type Activity from '@/types/activity';
import { ActivityType, type ActivityEvent } from '@/types/activity';
import __ from '@/helper/translations';
import type { PropType } from 'vue';
import ActivitySelect from '../activity/ActivitySelect.vue';


const props = defineProps({
	value: {
		type: String,
		default: '',
	},
	label: {
		type: String,
		default: '',
	},
	openInSidebar: {
		type: Boolean,
		default: false,
	},
	types: {
		type: Array as PropType<ActivityType[]>,
		default: () => [ActivityType.Task, ActivityType.Event],
	},
	newTypes: {
		type: Array as PropType<ActivityType[]>,
		default: () => [ActivityType.Task, ActivityType.Event],
	},
	visible: {
		type: Boolean,
		default: false,
	},
	event: {
		type: Object as PropType<ActivityEvent>,
		default: undefined,
	},
	autofocus: {
		type: Boolean,
		default: false,
	},
	variant: {
		type: String as PropType<any>,
		default: undefined,
	},
	placeholder: {
		type: String,
		default: undefined,
	},
	preventDefault: {
		type: Boolean,
		default: false,
	},
	hideTimer: {
		type: Boolean,
		default: false,
	},
	hideIcon: {
		type: Boolean,
		default: false,
	},
	clearable: {
		type: Boolean,
		default: false,
	},
});

const layoutStore = useLayoutStore();
const activityStore = useActivityStore();

const addActivity = (activity: Activity) => {
	activityStore.add(activity).then(() => {
		layoutStore.showRightSidebar(activity._id, props.event?.id);
	});
};

const openActivity = (activity: Activity) => {
	if (ActivityType.Event === activity.type) {
		openActivityPage(activity);
		return;
	}
	layoutStore.showRightSidebar(activity._id, props.event?.id);
};
</script>
<template>
  <ActivitySelect
    class="search"
    :types="props.types"
    :search="true"
    :show-timer="true"
    icon="mdi-magnify"
    :placeholder="__('Search')"
    :variant="props.variant"
    :label="props.label"
    :clearable="props.clearable"
    :overlay="true"
    @new-click="addActivity"
    @option-click="openActivity"
  />
</template>
<style lang="scss">
@import '@/styles/variables.scss';

.search {
	.v-input {
		border: none;
	}
	.v-field__overlay {
		background-color: transparent;
	}

	&.activity-select--focused {
		.v-input {
			border-bottom: none;
		}
	}

	.v-list.autocomplete__options {
		border: none;
		border-bottom-left-radius: 0.25rem;
		border-bottom-right-radius: 0.25rem;
	}
}
</style>