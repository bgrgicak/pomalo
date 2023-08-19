<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import { settings } from '@/helper/settings';

const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const activityStore = useActivityStore();

const onChange = (value: string | undefined) => {
    const newValue = value ? parseInt(value) : undefined;
    activityStore.updateField(
        props.activity._id,
        'estimatedHours',
        newValue,
    ).then(() => {
        emit('change', newValue);
    });
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
    v-if="props.activity.estimatedHours > settings.recommendedMaxHoursPerTask"
    color="primary"
    class="mb-8"
    :text="__('It\'s recommended to split large tasks into smaller ones.')"
  />
</template>