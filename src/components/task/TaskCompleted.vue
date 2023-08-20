<script setup lang="ts">
import { useActivityStore } from '@/stores/activities';
import __ from '@/helper/translations';
import { getLocalDate } from '@/helper/date';

import type { PropType } from 'vue';

const props = defineProps({
  activity: {
    type: Object as PropType<Activity>,
    required: true,
  }
});
const emit = defineEmits(['change']);

const activityStore = useActivityStore();

const onChange = (event: any) => {
    const newValue = event.target.checked ? getLocalDate() : undefined;
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
    color="success"
    class="pa-4"
    :model-value="!!props.activity.completedDate"
    :label="__('Completed')"
    @change="onChange"
  />
</template>