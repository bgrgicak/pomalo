<script setup lang="ts">
import __ from '@/helper/translations';
import ActivityArchive from '../activity/ActivityArchive.vue';
import ActivityDueDate from '../activity/ActivityDueDate.vue';
import ActivityTimer from '../activity/ActivityTimer.vue';
import ActivitySchedule from '../activity/ActivitySchedule.vue';
import { computed, type PropType } from 'vue';
import type Activity from '@/types/activity';
import type { ActivityEvent } from '@/types/activity';
import ActivityStartDate from '../activity/ActivityStartDate.vue';

const props = defineProps({
	activity: {
		type: Object as PropType<Activity>,
		default: null,
	},
	event: {
		type: Object as PropType<ActivityEvent>,
		default: null,
	},
	small: {
		type: Boolean,
		default: false,
	},
});
const emit = defineEmits(['fieldChange']);

const showSchedulerInSidebar = computed(() => {
	return props.event && props.small;
});

const onFieldChange = (key: string, value: any) => {
	emit('fieldChange', key, value);
};
</script>
<template>
  <ActivityTimer :activity="props.activity" />
  <div
    v-if="showSchedulerInSidebar"
    class="mt-8"
  >
    <ActivitySchedule
      :activity="props.activity"
      :event="props.event"
      :small="props.small"
      :repeat="false"
      :all-day="false"
      @fieldChange="(value: any) => onFieldChange('events', value)"
    />
    <v-divider class="mb-2 mt-10" />
  </div>
  <v-divider class="mb-8" />
  <ActivityStartDate
    :activity="props.activity"
    @change="(value: any) => onFieldChange('startDate', value)"
  />
  <ActivityDueDate
    :activity="props.activity"
    @change="(value: any) => onFieldChange('dueDate', value)"
  />
  <v-divider class="mb-2" />
  <ActivityArchive
    :activity="props.activity"
    class=" mt-4"
  />
</template>