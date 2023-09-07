<script setup lang="ts">
import type Activity from '@/types/activity';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import type { PropType } from 'vue';
import ProjectSelect from '../project/ProjectSelect.vue';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		required: true,
	}
});
const emit = defineEmits(['change']);

const activityStore = useActivityStore();

const onClick = (activityId: string) => {
	const newValue = activityId ?? undefined;
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
  <ProjectSelect
    :model-value="props.activity.parent"
    @update:modelValue="onClick"
  />
</template>
<style lang="scss">
.activity-parent {
    max-width: 100%;
}
</style>