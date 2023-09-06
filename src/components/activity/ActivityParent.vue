<script setup lang="ts">
import type Activity from '@/types/activity';
import { ActivityType } from '@/types/activity';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import ActivitySelect from '../activity/ActivitySelect.vue';
import type { PropType } from 'vue';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		required: true,
	}
});
const emit = defineEmits(['change']);

const parentTypes = [ActivityType.Project];

const activityStore = useActivityStore();

const parentTitle: ComputedRef<string | undefined> = computed(() => {
	if (!props.activity.parent) {
		return undefined;
	}
	activityStore.get(props.activity.parent);
	if (!activityStore.activities[props.activity.parent]) {
		return undefined;
	}
	return activityStore.activities[props.activity.parent].title;
});

const onClick = (activity: Activity) => {
	const newValue = activity?._id;
	activityStore.updateField(
		props.activity._id,
		'parent',
		newValue,
	).then(() => {
		emit('change', newValue);
	});
};
</script>
<template>
  <ActivitySelect
    :types="parentTypes"
    :value="parentTitle"
    :new-types="parentTypes"
    :label="__('Project')"
    :placeholder="__('Select a project')"
    :visible="true"
    :hide-timer="true"
    :hide-icon="true"
    :prevent-default="true"
    icon=""
    :clearable="true"
    variant="underlined"
    :focused="true"
    class="activity-parent"
    @optionClick="onClick"
  />
</template>
<style lang="scss">
.activity-parent {
    max-width: 100%;
}
</style>