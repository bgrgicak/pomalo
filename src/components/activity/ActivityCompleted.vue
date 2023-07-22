<script setup lang="ts">
import { updateField } from '@/data/activities';
import __ from '@/helper/translations';

const props = defineProps(['activity']);
const emit = defineEmits(['onChange']);

const onChange = (event: any) => {
    const newValue = event.target.checked ? new Date() : undefined;
    updateField(
        props.activity._id,
        'completedDate',
        newValue,
    ).then(() => {
        emit('onChange', newValue);
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