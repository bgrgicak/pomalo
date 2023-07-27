<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import { getUtcTimestamp } from '@/helper/date';

const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const activityStore = useActivityStore();

const onChange = (event: any) => {
    const newValue = event.target.checked ? getUtcTimestamp() : undefined;
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
    <v-switch color="success"
              class="pa-4"
              :model-value="!!props.activity.completedDate"
              @change="onChange"
              :label="__('Completed')" />
</template>