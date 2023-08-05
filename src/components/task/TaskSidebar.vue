<script setup lang="ts">
import __ from '@/helper/translations';
import ActivityClose from '../activity/ActivityClose.vue';
import ActivityCompleted from './TaskCompleted.vue';
import ActivityDueDate from './TaskDueDate.vue';
import ActivityEstimatedTime from './TaskEstimatedTime.vue';
import ActivityTimer from '../activity/ActivityTimer.vue';

const props = defineProps(['activity', 'small']);
const emit = defineEmits(['fieldChange']);

const onFieldChange = (key: string, value: any) => {
    emit('fieldChange', key, value);
};
</script>
<template>
    <ActivityTimer :activity="props.activity" />
    <ActivityCompleted :activity="props.activity"
                       class="pb-0"
                       @change="(value: any) => onFieldChange('completedDate', value)" />
    <v-divider class="mb-8" />
    <ActivityDueDate :activity="props.activity"
                     @change="(value: any) => onFieldChange('dueDate', value)" />
    <ActivityEstimatedTime :activity="props.activity"
                           @change="(value: any) => onFieldChange('estimatedTime', value)" />
    <v-divider class="mb-2" />
    <ActivityClose :activity="props.activity"
                   class=" mt-4" />
</template>