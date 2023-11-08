<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import { getLocalDate } from '@/helper/date';

import type { PropType } from 'vue';
import type Activity from '@/types/activity';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		required: true,
	},
	compact: {
		type: Boolean,
		default: false,
	},
});
const emit = defineEmits(['change']);

const activityStore = useActivityStore();

const onChange = (checked: boolean) => {
	const newValue = checked ? getLocalDate() : undefined;
	activityStore.updateField(
		props.activity._id,
		'completedDate',
		newValue,
	).then(() => {
		emit('change', newValue);
	});
};
</script>
<template>
  <v-switch
    v-if="!props.compact"
    color="success"
    class="pa-4"
    :model-value="!!props.activity.completedDate"
    :label="__('Completed')"
    :disabled="props.activity.archived"
    @change="(event: any) => onChange(event.target.checked)"
  />
  <v-btn
    v-else
    :color="props.activity.completedDate ? 'success' : 'grey'"
    class="p0-4"
    icon="mdi-check"
    variant="text"
    :disabled="props.activity.archived"
    @click="() => onChange(!props.activity.completedDate)"
  />
</template>