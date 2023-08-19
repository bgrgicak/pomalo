<script setup lang="ts">
import ActivityClose from '../activity/ActivityClose.vue';
import ActivitySchedule from '../activity/ActivitySchedule.vue';

const props = defineProps(['activity', 'small', 'event']);
const emit = defineEmits(['fieldChange']);

const onFieldChange = (key: string, value: any) => {
    emit('fieldChange', key, value);
};
</script>
<template>
  <ActivitySchedule
    :activity="props.activity"
    :event="props.event"
    :small="props.small"
    @fieldChange="(value) => onFieldChange('events', value)"
  />
  <v-divider />
  <ActivityClose
    :activity="props.activity"
    class=" mt-4"
  />
</template>
<style lang="scss">
.right-sidebar .date-picker--has-time {

    .date-picker__date,
    .date-picker__time {}
}
</style>