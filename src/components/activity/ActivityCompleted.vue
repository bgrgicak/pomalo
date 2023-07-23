<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';

const props = defineProps(['activity']);
const emit = defineEmits(['change']);

const activityStore = useActivityStore();

const onChange = (event: any) => {
    const newValue = event.target.checked ? new Date() : undefined;
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