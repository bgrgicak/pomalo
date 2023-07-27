<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import { settings } from '@/helper/settings';
import constants from '@/helper/constants';

const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const activityStore = useActivityStore();

const onChange = (value: string | undefined) => {
    const newValue = value ? parseInt(value) : undefined;
    activityStore.updateField(
        props.activity._id,
        'estimatedTime',
        newValue,
    ).then(() => {
        emit('change', newValue);
    });
};
</script>
<template>
    <v-text-field :label="__('How many hours?')"
                  :model-value="props.activity.estimatedTime"
                  @update:modelValue="onChange"
                  variant="outlined"
                  type="number" />
    <v-alert v-if="props.activity.estimatedTime > settings.recommendedMaxHoursPerTask"
             color="primary"
             variant="outlined"
             class="mb-8"
             :text="__('It\'s recommended to split large tasks into smaller ones.')" />
</template>