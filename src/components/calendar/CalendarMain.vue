<script setup lang="ts">
import VueCal, { type VueCalEvent } from 'vue-cal';
import { getLocalDate, getUtcTimestamp, minuteInMilliseconds, setTime } from '@/helper/date';
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
import { useKeyboardStore } from '../../stores/keyboard';

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
const keyboardStore = useKeyboardStore();

watch(
	() => layoutStore.isRightSidebarVisible,
	(value: boolean) => {
		if (false === value) {
			deleteOlderNewEvents();
		}
	}
);

watch(
	() => [
		props.selectedDate,
		props.activeView,
		calendarStore.events,
	],
	() => {
		nextTick(() => {
			addLongPressEvent();
		});
	}
);

const editingOptions = computed(() => {
	return {
		title: false,
		drag: true,
		resize: true,
		delete: false,
		create: !display.value.smAndDown.value,
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
		if (display.value.lgAndUp.value) {
			return 80;
		}
		return 60;
	}
	return 40;
});

const cellClick = (cellDate: Date) => {
	calendarStore.focusCell(cellDate);
	const eventClick = props.vuecal.mutableEvents
		.filter((event: VueCalEvent) => !event.allDay)
		.find((event: VueCalEvent) => cellDate >= event.start && event.end && cellDate <= event.end);
	if (!eventClick) {
		calendarStore.removeNewEvent();
		calendarStore.unfocusAllEvents();
	}
	layoutStore.hideRightSidebar();
};

const eventClick = (event: any) => {
	if (keyboardStore.isTouch) {
		layoutStore.showRightSidebar(
			event.id,
			event.eventId
		);
		return;
	}
	if (!keyboardStore.cmdCtrl) {
		calendarStore.unfocusAllEvents();
	}
	calendarStore.toggleFocusEvent(event.eventId);
	if (event.id) {
		deleteOlderNewEvents();
	}
	if (!event.new) {
		calendarStore.removeNewEvent();
	}
};

const eventDblClick = (event: any) => {
	if (!keyboardStore.cmdCtrl) {
		layoutStore.showRightSidebar(
			event.id,
			event.eventId
		);
	}
};

const snapEvent = (event: CalendarEvent, type?: 'start' | 'end') => {
	// TODO refactor this and move to another file
	const differences: {[difference: number]: CalendarEvent} = {};
	const snapDifference = settings.calendar.snapDifference;
	const eventDuration = event.end ? getTimeDifference(event.start, event.end) : undefined;
	const tempEvent = structuredClone(event);

	const snapStart = !type || type === 'start';
	const snapEnd = !type || type === 'end';

	const nowStartDifference = getTimeDifference(getLocalDate(), event.start);
	if (nowStartDifference < snapDifference && nowStartDifference > -snapDifference) {
		tempEvent.start = getLocalDate();
		if (eventDuration && snapEnd) {
			tempEvent.end = addMilliseconds(tempEvent.start, eventDuration);
		}
		differences[nowStartDifference] = tempEvent;
	}

	if (event.end) {
		const nowEndDifference = getTimeDifference(getLocalDate(), event.end);
		if (nowEndDifference < snapDifference && nowEndDifference > -snapDifference) {
			tempEvent.end = getLocalDate();
			if (eventDuration && snapStart) {
				tempEvent.start = addMilliseconds(tempEvent.end, -eventDuration);
			}
			differences[nowStartDifference] = tempEvent;
		}
	}

	const overlapEnd = props.vuecal.mutableEvents.find((e: VueCalEvent) => {
		return e.id?.toString() !== event.id && event.end && e.start <= event.end && e.end >= event.end;
	});
	if (overlapEnd && event.end) {
		const difference = getTimeDifference(overlapEnd.start, event.end);
		if (difference < snapDifference && difference > -snapDifference) {
			tempEvent.end = overlapEnd.start;
			if (eventDuration && tempEvent.end && snapStart) {
				tempEvent.start = addMilliseconds(tempEvent.end, -eventDuration);
			} else if( snapStart ) {
				tempEvent.start = addMilliseconds(tempEvent.start, -difference);
			}
			differences[nowStartDifference] = tempEvent;
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
			tempEvent.start = overlapStart.end;
			if (eventDuration && snapEnd) {
				tempEvent.end = addMilliseconds(tempEvent.start, eventDuration);
			} else if(snapEnd) {
				tempEvent.end = addMilliseconds(tempEvent.start, difference);
			}
			differences[nowStartDifference] = tempEvent;
		}
	}

	const snapTimes: number[] = [0, 15,30, 45, 60];
	for (const snapTime of snapTimes) {
		const difference = (snapTime - event.start.getMinutes()) * minuteInMilliseconds;
		if (difference < snapDifference && difference > -snapDifference) {
			tempEvent.start = addMilliseconds(event.start, difference);
			if (eventDuration && snapEnd) {
				tempEvent.end = addMilliseconds(tempEvent.start, eventDuration);
			}
			differences[difference] = tempEvent;
		}
		if (event.end) {
			const endDifference = (snapTime - event.end.getMinutes()) * minuteInMilliseconds;
			if (endDifference < snapDifference && endDifference > -snapDifference) {
				tempEvent.end = addMilliseconds(event.end, endDifference);
				if (eventDuration && snapStart) {
					tempEvent.start = addMilliseconds(tempEvent.end, -eventDuration);
				}
				differences[endDifference] = tempEvent;
			}
		}
	}

	if (Object.keys(differences).length === 0) {
		return event;
	}
	const smallestDifference = Math.min(...Object.keys(differences).map(Number));
	return differences[smallestDifference];
};

const eventOnDrop = (event: any) => {
	eventDurationChange(event);
};

const eventDurationChange = (event: any) => {
	if (!event.event.eventId) {
		return;
	}

	let activityEvent = snapEvent(
		event.event,
		getUtcTimestamp(event.event.start) === getUtcTimestamp(event.originalEvent.start)
			? 'end'
			: undefined
	);
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
	if (display.value.smAndDown.value && keyboardStore.isTouch) {
		return false;
	}
	// If event is focused, do not create new event
	if (calendarStore.focusedEvents.length > 0) {
		return false;
	}
	start = setTime(start, start.getHours());
	const eventClicked = calendarStore.events.find((event: CalendarEvent) => {
		return event.start <= start && (!event.end || event.end >= start) && !event.allDay;
	});
	// If clicked cell is already occupied by an event, do not create new event
	if (!!eventClicked) {
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
	if (!keyboardStore.isTouch) {
		return;
	}
	const background = document.querySelector('.calendar .vuecal__bg');
	const cells = document.querySelectorAll('.calendar .vuecal__bg .vuecal__cell');
	if (!cells) {
		return;
	}

	cells.forEach((cell: any, index: number) => {
		const currentCell = structuredClone(props.vuecal.viewCells[index]);
		if (!currentCell) {
			return;
		}
		const cellTouchStart = (event: any) => {
			const scrollTop = background?.scrollTop;
			const timeout = setTimeout(() => {
				if (scrollTop !== background?.scrollTop) {
					return;
				}
				let start = currentCell.startDate.addMinutes(
					props.vuecal.utils.cell.minutesAtCursor(event).minutes
				);
				start = setTime(start, start.getHours());
				emit('addEvent', start);
			}, 600);
			cell.addEventListener('touchend', () => {
				clearTimeout(timeout);
			});
		};
		cell.removeEventListener('touchstart', cellTouchStart);
		cell.addEventListener('touchstart', cellTouchStart);
	});
};

const scrollToCurrentTime = () => {
	if (!props.vuecal) {
		return;
	}
	const calendar = document.querySelector('.calendar .vuecal__body .vuecal__flex');

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
	emit('addEvent', event.start, event.end);
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
    @event-dblclick="eventDblClick"
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
		position: relative;
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
}

.vuecal__event-resize-handle {
	height: 0.25rem;
}

.calendar {
	.vuecal--view-with-time {
		.vuecal__weekdays-headings,
		.vuecal__all-day {
			padding-right: 0;
			top: 0;
			background: rgb(var(--v-theme-background));
			z-index: 2;
			border: 1px solid rgba(196,196,196,.25);
		}
		.vuecal__all-day {
			position: sticky;
		}
	}

	$time-column-width: 2rem;
	.vuecal--week-view .vuecal__weekdays-headings {
		padding-left: $time-column-width;
		font-size: $calendar-default-font-size;
	}

	.vuecal__time-column,
	.vuecal__all-day-text {
		width: $time-column-width !important;
		padding: 0;
		font-size: 0.75rem;
	}

	.vuecal__all-day .vuecal__flex.vuecal__cells.week-view {
		width: calc(100% - #{$time-column-width}) !important;
	}
	.weekday-label {
		span.xsmall {
			display: none;
		}
	}
}
</style>