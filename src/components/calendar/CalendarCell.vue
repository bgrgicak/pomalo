<script setup lang="ts">
import type { PropType } from 'vue';
import { computed } from 'vue';
import { newEvent } from '@/data/events';
import type Activity from '@/types/activity';
import { useCalendarStore } from '@/stores/calendar';
import ActivitySelect from '../activity/ActivitySelect.vue';
import { useActivityStore } from '@/stores/activities';
import { display } from '@/plugins/vuetify';

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

const subtitle = computed(() => {
	const parts = [props.event.start];
	if (props.event.end) {
		parts.push(props.event.end);
	}
	return parts.map((part) => part.formatTime('hh:mm')).join(' - ');
});
</script>
<template>
  <div
    class="calendar-cell"
    :class="{ 'sm': display.smAndDown.value }"
  >
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
        :search-options="{archived: undefined}"
        :overlay="display.smAndDown.value"
        @newClick="addNewEvent"
        @optionClick="addEvent"
        @onEscape="calendarStore.removeNewEvent"
      />
    </v-card-title>
    <v-card-subtitle>
      {{ subtitle }}
    </v-card-subtitle>
    <v-card-text>
      {{ props.event.content }}
    </v-card-text>
  </div>
</template>
<style lang="scss">
@import '@/styles/mixins.scss';
.vuecal__event {
	.v-card-title {
		text-align: left;
		font-size: 1rem;
		margin: 0.5rem 0.5rem 0 0.5rem;
		padding: 0;
		line-height: 1rem;
	}
	.v-card-title,
	.v-card-subtitle {
		text-overflow: clip !important;
	}
	.v-card-subtitle,
	.v-card-text {
		text-align: left;
		font-size: 0.75rem;
		padding: 0 0.5rem;
		line-height: 1rem;
	}

	.calendar-cell.sm {
		.v-card-title {
			font-size: 0.75rem;
		}
		.v-card-subtitle {
			font-size: 0.7rem;
		}
		.v-card-text {
			display: none;
		}
	}
}
.calendar-event__new {
	overflow: visible !important;
	min-height: 60px !important;

	.calendar-cell__title {
		overflow: visible;
		margin-bottom: 0.5rem;
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
.calendar-event__completed {
	.calendar-cell__title {
		text-decoration: line-through;
	}
}
</style>