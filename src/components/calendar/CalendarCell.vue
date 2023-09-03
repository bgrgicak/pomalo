<script setup lang="ts">
import type { PropType } from 'vue';
import { computed } from 'vue';
import { newEvent } from '@/data/events';
import type Activity from '@/types/activity';
import { useCalendarStore } from '@/stores/calendar';
import ActivitySelect from '../activity/ActivitySelect.vue';
import { useActivityStore } from '@/stores/activities';

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

const calendarStore = useCalendarStore();
const activityStore = useActivityStore();

const event = computed(() => {
	return newEvent(
		props.event.start,
		props.event.end,
	);
});

const addEvent = (activity: Activity) => {
	activityStore.addOrUpdate(activity).then(() => {
		calendarStore.addActivityId(activity._id);
		calendarStore.removeNewEvent();
	});
};

const addNewEvent = (activity: Activity) => {
	addEvent(activity);
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
    <ActivitySelect
      v-else
      class="mb-1"
      :event="event"
      :focused="true"
      :search-options="{archived: false}"
      @newClick="addNewEvent"
      @optionClick="addEvent"
    />
  </v-card-title>
  <v-card-subtitle>
    {{ event.start.formatTime('hh:mm') + ' - ' + event.end.formatTime('hh:mm') }}
  </v-card-subtitle>
</template>
<style lang="scss">

.calendar-event__new {
  overflow: visible !important;
  min-height: 60px !important;
  &:hover {
    min-height: 60px !important;
  }

  .calendar-cell__title {
    overflow: visible;
    .activity-select {
      width: 100%;
      .activity-select__form{
          min-width: auto;
      }
    }
    &.calendar-cell__title--new {
      overflow: visible;
    }
  }

  .v-card-subtitle {
    display: none;
  }
}
</style>