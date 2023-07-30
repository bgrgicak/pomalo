<script setup lang="ts">
import ActivityClose from '../activity/ActivityClose.vue';
import EventsSchedule from '../event/EventSchedule.vue';

const props = defineProps(['activity', 'small']);
const emit = defineEmits(['fieldChange']);

const onFieldChange = (key: string, value: any) => {
    emit('fieldChange', key, value);
};
</script>
<template>
    <EventsSchedule :activity="props.activity"
                    @fieldChange="(value) => onFieldChange('events', value)" />
    <v-divider />
    <ActivityClose :activity="props.activity"
                   class=" mt-4" />
</template>
<style lang="scss">
.right-sidebar .date-picker--has-time {

    .date-picker__date,
    .date-picker__time {}
}
</style>