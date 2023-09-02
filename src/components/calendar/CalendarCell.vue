<script setup lang="ts">
import type { PropType } from 'vue';
import ActivityAdd from '../activity/ActivityAdd.vue';
import { computed } from 'vue';
import { newEvent } from '@/data/events';
import type Activity from '@/types/activity';
import { useCalendarStore } from '@/stores/calendar';

const props = defineProps({
	vuecal: {
		type: Object as PropType<any>,
		default: null
	},
	event: {
		type: Object as PropType<any>,
		default: () => {}
	},
});

const emit = defineEmits(['addEvent']);

const calendarStore = useCalendarStore();

const event = computed(() => {
	return newEvent(
		props.event.start,
		props.event.end,
	);
});

const addEvent = (activity: Activity) => {
	calendarStore.addActivityId(activity._id);
};
</script>
<template>
  <v-card-title
    class="calendar-cell__title"
    :class="{'calendar-cell__title--new': !props.event.title}"
  >
    <span v-if="props.event.title">
      {{ props.event.title }}
    </span>
    <ActivityAdd
      v-else
      class="mb-1"
      :event="event"
      :focused="true"
      @addActivity="addEvent"
    />
  </v-card-title>
  <v-card-subtitle>
    {{ event.start.formatTime('h:m') + ' - ' + event.end.formatTime('h:m') }}
  </v-card-subtitle>
</template>
<style lang="scss">
.calendar-cell__title {
  .activity-add {
    width: 100%;
    .activity-add__form{
        min-width: auto;
    }
  }
  &.calendar-cell__title--new {
    overflow: visible;
  }
}
</style>