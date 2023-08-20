<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import DatePicker from '@/components/ui/DatePicker.vue';
import { getLocalDate } from '@/helper/date';

import type { PropType } from 'vue';
import type Activity from '@/types/activity';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		required: true,
	}
});
const emit = defineEmits(['change']);

const activityStore = useActivityStore();

const onChange = (value: string | undefined) => {
	const newValue = value ? getLocalDate(value) : undefined;
	activityStore.updateField(
		props.activity._id,
		'dueDate',
		newValue,
	).then(() => {
		emit('change', newValue);
	});
};
</script>
<template>
  <DatePicker
    :label="__('Due date')"
    :value="props.activity.dueDate"
    :readonly="props.activity.readonly"
    @change="onChange"
  />
</template>