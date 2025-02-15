<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import { settings } from '@/helper/settings';

import type { PropType } from 'vue';
import type Activity from '@/types/activity';
import { computed } from 'vue';
import { debounce } from '@/helper/debounce';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		required: true,
	}
});
const emit = defineEmits(['change']);

const activityStore = useActivityStore();
let typingTimeout: any = undefined;

const isAboveLimit = computed(() => {
	return props.activity.estimatedHours && props.activity.estimatedHours > settings.recommendedMaxHoursPerTask;
});
const onChange = (value: string | undefined) => {
	const newValue = value ? parseInt(value) : undefined;
	if (typingTimeout) {
		clearTimeout(typingTimeout);
	}
	typingTimeout = setTimeout(() => {
		activityStore.updateField(
			props.activity._id,
			'estimatedHours',
			newValue,
		).then(() => {
			emit('change', newValue);
		});
	}, 500);
};
</script>
<template>
  <v-text-field
    :label="__('Estimated hours')"
    :model-value="props.activity.estimatedHours"
    type="number"
    @update:modelValue="onChange"
  />
  <v-alert
    v-if="isAboveLimit"
    color="primary"
    class="mb-8"
    :text="__('It\'s recommended to split large tasks into smaller ones.')"
  />
</template>