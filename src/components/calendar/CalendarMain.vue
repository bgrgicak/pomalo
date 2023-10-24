<script setup lang="ts">
import VueCal, { type VueCalEvent } from 'vue-cal';
import { getLocalDate } from '@/helper/date';
import { useCalendarStore } from '@/stores/calendar';
import { useLayoutStore } from '@/stores/layout';
import { display } from '@/plugins/vuetify';
import { allViews } from '@/plugins/vuecal';
import { ref } from 'vue';
import { computed } from 'vue';
import type { Ref } from 'vue';
import type { CalendarEvent } from '@/types/calendar';
import { nextTick } from 'vue';
import { watch } from 'vue';
import type { PropType } from 'vue';
import { getTimeDifference } from '@/helper/date';
import { settings } from '@/helper/settings';
import { addMilliseconds } from '@/helper/date';
import CalendarCell from './CalendarCell.vue';
import type { ActivityEvent } from '@/types/activity';

const props = defineProps({
	vuecal: {
		type: Object as PropType<any>,
		default: null
	},
	activeView: {
		type: String,
		default: 'week'
	},
	selectedDate: {
		type: Date,
		default: undefined
	},
	views: {
		type: Array as PropType<string[]>,
		default: () => []
	}
});
const emit = defineEmits(['update:activeView', 'addEvent', 'updateEvent', 'fetchEvents']);

const vuecalRef: Ref<VueCal | null> = ref(null);

const calendarStore = useCalendarStore();
const layoutStore = useLayoutStore();

watch(
	() => layoutStore.isRightSidebarVisible,
	(value: boolean) => {
		if (false === value) {
			deleteOlderNewEvents();
		}
	}
);

watch(
	() => props.selectedDate,
	() => {
		scrollToCurrentTime();
	}
);

const editingOptions = computed(() => {
	return {
		title: false,
		drag: true,
		resize: true,
		delete: false,
		create: !display.value.mobile.value
	};
});

const events = computed(() => {
	if (!props.vuecal) {
		return [];
	}
	return calendarStore.events;
});

const disabledViews = computed(() => {
	if (!props.vuecal) {
		return [];
	}
	if (!props.views) {
		return [];
	}
	return allViews.filter((view: string) => {
		return !props.views.includes(view);
	});
});

const cellHeight = computed(() => {
	if (['week', 'day'].includes(props.activeView)) {
		return 80;
	}
	return 40;
});

const cellClick = (cellDate: Date) => {
	calendarStore.focusCell(cellDate);
	eventUnfocus();
	const eventClick = props.vuecal.mutableEvents.findIndex((event: VueCalEvent) => cellDate >= event.start && event.end && cellDate <= event.end);
	if (-1 === eventClick) {
		calendarStore.removeNewEvent();
	}
};
const eventUnfocus = () => {
	calendarStore.unfocusEvent();
	layoutStore.hideRightSidebar();
};

const eventClick = (event: any) => {
	// If already focused, it's a double click.
	if (event.eventId === calendarStore.focusedEvent?.eventId) {
		layoutStore.showRightSidebar(
			event.id,
			event.eventId
		);
	}
	calendarStore.focusEvent(event.eventId);
	if (event.id) {
		deleteOlderNewEvents();
	}
};

const snapEvent = (event: CalendarEvent) => {
	const snapDifference = settings.calendar.snapDifference;

	const nowStartDifference = getTimeDifference(getLocalDate(), event.start);
	if (nowStartDifference < snapDifference && nowStartDifference > -snapDifference) {
		event.start = getLocalDate();
		return event;
	}

	if (event.end) {
		const nowEndDifference = getTimeDifference(getLocalDate(), event.end);
		if (nowEndDifference < snapDifference && nowEndDifference > -snapDifference) {
			event.end = getLocalDate();
			return event;
		}
	}

	const overlapEnd = props.vuecal.mutableEvents.find((e: VueCalEvent) => {
		return e.id?.toString() !== event.id && event.end && e.start <= event.end && e.end >= event.end;
	});
	if (overlapEnd && event.end) {
		const difference = getTimeDifference(overlapEnd.start, event.end);
		if (difference < snapDifference && difference > -snapDifference) {
			event.start = addMilliseconds(event.start, -difference);
			event.end = overlapEnd.start;
			return event;
		}
	}

	const overlapStart = props.vuecal.mutableEvents.find((e: VueCalEvent) => {
		return e.id?.toString() !== event.id
			&& e.start <= event.start
			&& e.end >= event.start;
	});
	if (overlapStart && event.end) {
		const difference = getTimeDifference(overlapStart.end, event.start);
		if (difference < snapDifference && difference > -snapDifference) {
			event.end = addMilliseconds(event.end, difference);
			event.start = overlapStart.end;
			return event;
		}
	}

	return event;
};

const eventOnDrop = (event: any) => {
	eventDurationChange(event);
};

const eventDurationChange = (event: any) => {
	if (!event.event.eventId) {
		return;
	}

	const activityEvent = snapEvent(event.event);

	emit(
		'updateEvent',
		activityEvent.id,
		{
			id: activityEvent.eventId,
			start: activityEvent.start,
			end: activityEvent.end,
		},
		activityEvent.repeatIteration
	);
	return true;
};

/**
 * Delete new events that were previously created. but not saved. Exclude event that is currently being created.
 * @param date Optional. Date of the event that is currently being created.
 */
const deleteOlderNewEvents = (date?: Date) => {
	props.vuecal.mutableEvents.forEach((event: VueCalEvent) => {
		if (event.id) {
			return;
		}
		if (date === event.start) {
			return;
		}
		props.vuecal.emitWithEvent('event-delete', event);
		if (vuecalRef.value) {
			vuecalRef.value.mutableEvents = props.vuecal.mutableEvents.filter((e: VueCalEvent) => e._eid !== event._eid);
			vuecalRef.value.view.events = props.vuecal.view.events.filter((e: VueCalEvent) => e._eid !== event._eid);
		}
	});
};

const fetchEvents = (options: any) => {
	if (options.view && props.vuecal) {
		emit('update:activeView', options.view);
	}

	emit('fetchEvents', options.startDate, options.endDate);
};

const cellDoubleClick = (start: Date) => {
	if (display.value.mobile.value) {
		return;
	}
	// If event is focused, do not create new event
	if (calendarStore.focusedEvent) {
		return false;
	}
	const findIndex = calendarStore.events.findIndex((event: CalendarEvent) => {
		return event.start <= start && (!event.end || event.end >= start);
	});
	// If clicked cell is already occupied by an event, do not create new event
	if (-1 < findIndex) {
		return false;
	}
	emit('addEvent', start);
};

const addLongPressEvent = () => {
	if (!display.value.mobile.value) {
		return;
	}
	if (!props.vuecal) {
		return;
	}
	const background = document.querySelector('.calendar .vuecal__bg');
	const cells = document.querySelectorAll('.calendar .vuecal__bg .vuecal__cell');
	if (!cells) {
		return;
	}
	cells.forEach((cell: any, index: number) => {
		const currentCell = structuredClone(props.vuecal.viewCells[index]);
		cell.addEventListener('touchstart', (event: any) => {
			const scrollTop = background?.scrollTop;
			const timeout = setTimeout(() => {
				if (scrollTop !== background?.scrollTop) {
					return;
				}
				const start = currentCell.startDate.addMinutes(
					props.vuecal.utils.cell.minutesAtCursor(event).minutes
				);
				emit('addEvent', start);
			}, 800);
			cell.addEventListener('touchend', () => {
				clearTimeout(timeout);
			});
		});
	});
};

const scrollToCurrentTime = () => {
	if (!props.vuecal) {
		return;
	}
	const calendar = document.querySelector('.calendar .vuecal__body');
	if (!calendar) {
		return;
	}
	calendar.scrollTo({ top: getLocalDate().getHours() * props.vuecal.timeCellHeight });
};

const onReady = (options: any) => {
	nextTick(() => {
		fetchEvents(options);
		scrollToCurrentTime();
		addLongPressEvent();
	});
};

const eventDragCreate = (event: any) => {
	const activityEvent = snapEvent(event);
	emit('addEvent', activityEvent.start, activityEvent.end);
};
</script>
<template>
  <vue-cal
    ref="vuecalRef"
    style="height: calc(100vh - 8px - 16px - 72px - 80px);"
    :selected-date="selectedDate"
    class="v-card calendar"
    :active-view="activeView"
    :disable-views="disabledViews"
    :events="events"
    :click-to-navigate="false"
    :dblclick-to-navigate="['year', 'month'].includes(activeView)"
    hide-view-selector
    hide-title-bar
    watch-realtime="true"
    :show-all-day-events="true"
    :editable-events="editingOptions"
    events-on-month-view="short"
    :time-cell-height="cellHeight"
    :watch-real-time="true"
    @event-click="eventClick"
    @cell-click="cellClick"
    @cell-dblclick="cellDoubleClick"
    @ready="onReady"
    @view-change="fetchEvents"
    @event-duration-change="eventDurationChange"
    @event-drop="eventOnDrop"
    @event-drag-create="eventDragCreate"
  >
    <template #event="{ event }">
      <calendar-cell :event="event" />
    </template>
  </vue-cal>
</template>
<style lang="scss">
@import '@/styles/mixins.scss';

$calendar-default-font-size: 0.75rem;

.vuecal__cell--selected,
.vuecal__cell--today,
.vuecal__cell--current {
    background-color: transparent;
}

.vuecal--month-view .vuecal__cell-content {
  justify-content: start;
  min-height: 150px;
  overflow: hidden;
  .vuecal__cell-date {
	text-align: right;
	padding: 0.25rem;
  }
}


.vuecal--years-view .vuecal__cell-content,
.vuecal--year-view .vuecal__cell-content {
  .vuecal__cell-date {
	font-size: 1.2rem;
  }
}

.vuecal__heading.today,
.vuecal__cell--current .vuecal__cell-date,
.vuecal__cell--today .vuecal__cell-date{
	font-weight: bold;
	color: rgb(var(--v-theme-primary-darken-2));
}

.vuecal__heading {
  height: 2rem;
}

.vuecal__body {
	overflow: auto;
	font-size: $calendar-default-font-size;
	.vuecal__bg {
		overflow: visible;
	}
	> .vuecal__flex {
		overflow-x: hidden;
	}
}

.vuecal__event {
    @include event-colors(var(--v-theme-primary), var(--v-theme-primary-darken-4));
    border: 1px solid #fff;
	align-items: start;
	overflow: hidden;

    &.calendar-event__task {
        @include event-colors(var(--v-theme-task), var(--v-theme-task-darken-4));
		&:hover {
			background-color: rgb(var(--v-theme-task));
		}
    }

    &.calendar-event__event {
        @include event-colors(var(--v-theme-event), var(--v-theme-event-darken-4));
		&:hover {
			background-color: rgb(var(--v-theme-event));
		}
    }

    &.calendar-event__project {
        @include event-colors(var(--v-theme-project), var(--v-theme-project-darken-4));
		&:hover {
			background-color: rgb(var(--v-theme-project));
		}
    }

    &.vuecal__event--focus {
        box-shadow: 1px 1px 6px rgba(var(--v-border-color), 0.3);
    }
	
	.v-card-title {
		text-align: left;
		text-transform: capitalize;
		font-size: 1rem;
		padding: 0.5rem 0.5rem 0 0.5rem;
		line-height: 1rem;
	}
	.v-card-subtitle {
		text-align: left;
		font-size: 0.75rem;
		padding: 0 0.5rem;
		line-height: 1rem;
	}
}

.vuecal__event-resize-handle {
	height: 0.25rem;
}

.calendar {
	.vuecal--view-with-time {
		.vuecal__weekdays-headings,
		.vuecal__all-day {
			padding-right: 0;
		}
	}

	$time-column-width: 2.4rem;
	.vuecal__weekdays-headings {
		padding-left: $time-column-width;
		font-size: $calendar-default-font-size;
	}

	.vuecal__time-column,
	.vuecal__all-day-text {
		width: $time-column-width !important;
		padding: 0;
	}
	
	.weekday-label {
		span.xsmall {
			display: none;
		}
	}
}
</style>