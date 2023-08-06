<script setup lang="ts">
import __ from '@/helper/translations';
import ActivityClose from '../activity/ActivityClose.vue';
import ActivityCompleted from './TaskCompleted.vue';
import ActivityDueDate from './TaskDueDate.vue';
import ActivityEstimatedTime from './TaskEstimatedTime.vue';
import ActivityTimer from '../activity/ActivityTimer.vue';
import ActivitySchedule from '../activity/ActivitySchedule.vue';

const props = defineProps(['activity', 'small', 'event']);
const emit = defineEmits(['fieldChange']);

const onFieldChange = (key: string, value: any) => {
    emit('fieldChange', key, value);
};
</script>
<template>
    <ActivityTimer :activity="props.activity" />
    <template v-if="props.event">
        <ActivitySchedule :activity="props.activity"
                          :event="props.event"
                          @fieldChange="(value: any) => onFieldChange('events', value)" />
        <v-divider class="mb-2 mt-10" />
    </template>
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