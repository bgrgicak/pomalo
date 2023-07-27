<script setup lang="ts">
import __ from '@/helper/translations';
import ActivityClose from '../activity/ActivityClose.vue';
import ActivityCompleted from './TaskCompleted.vue';
import ActivityDueDate from './TaskDueDate.vue';
import ActivityImportance from './TaskImportance.vue';
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
                       @change="(value: any) => onFieldChange('completedDate', value)" />
    <v-divider />
    <ActivityDueDate :activity="props.activity"
                     @change="(value: any) => onFieldChange('dueDate', value)" />
    <ActivityEstimatedTime :activity="props.activity"
                           @change="(value: any) => onFieldChange('estimatedTime', value)" />
    <ActivityImportance :activity="props.activity"
                        @change="(value: any) => onFieldChange('importance', value)" />
    <v-divider />
    <ActivityClose :activity="props.activity"
                   class=" mt-4" />
</template>