<script setup lang="ts">
import VueCal, { type VueCalEvent, type VueCalView } from 'vue-cal';
import { newEvent } from '@/data/events';
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

const editingOptions = computed(() => {
	return {
		title: false,
		drag: true,
		resize: true,
		delete: true,
		create: !display.value.mobile.value
	};
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

const cellClick = (cellDate: Date) => {
	deleteOlderNewEvents(cellDate);
	calendarStore.focusCell(cellDate);
	const newEvent = props.vuecal.mutableEvents.findIndex((event: VueCalEvent) => !event.id && cellDate === event.start);
	if (-1 === newEvent) {
		eventUnfocus();
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
			{
				id: event.eventId,
				start: event.start,
				end: event.end,
			}
		);
	}
	calendarStore.focusEvent(event.eventId);
	if (event.id) {
		deleteOlderNewEvents();
	}
};

const eventDurationChange = (event: any) => {
	if (!event.event.eventId) {
		return;
	}
	emit(
		'updateEvent',
		event.event.id,
		{
			id: event.event.eventId,
			start: event.event.start,
			end: event.event.end,
		},
		event.event.repeatIteration
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

const eventDragCreate = (event: any) => {
	layoutStore.showRightSidebar(
		undefined,
		newEvent(
			event.start,
			event.end,
		)
	);
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
	const calendar = document.querySelector('.calendar .vuecal__bg');
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
</script>
<template>
  <vue-cal
    ref="vuecalRef"
    style="height: calc(100vh - 48px - 8px - 72px - 80px);"
    :selected-date="selectedDate"
    class="v-card calendar"
    :active-view="activeView"
    :disable-views="disabledViews"
    :events="calendarStore.events"
    :click-to-navigate="false"
    :dblclick-to-navigate="['year', 'month'].includes(activeView)"
    :snap-to-time="15"
    hide-view-selector
    hide-title-bar
    watch-realtime="true"
    :show-all-day-events="true"
    :editable-events="editingOptions"
    @event-click="eventClick"
    @cell-click="cellClick"
    @cell-dblclick="cellDoubleClick"
    @ready="onReady"
    @view-change="fetchEvents"
    @event-duration-change="eventDurationChange"
    @event-drop="eventDurationChange"
    @event-drag-create="eventDragCreate"
  >
    <template #event="{ event }">
      <v-card-title>
        {{ event.title }}
      </v-card-title>
      <v-card-subtitle>
        {{ event.start.formatTime('h:m') + ' - ' + event.end.formatTime('h:m') }}
      </v-card-subtitle>
    </template>
  </vue-cal>
</template>
<style lang="scss">
@import '@/styles/mixins.scss';

.vuecal__event {
    @include event-colors(var(--v-theme-primary), var(--v-theme-primary-darken-4));
    border: 1px solid #fff;

    &.vuecal__event--focus {
        box-shadow: 1px 1px 6px rgba(var(--v-border-color), 0.3);
    }

    &.calendar-event__task {
        @include event-colors(var(--v-theme-task), var(--v-theme-task-darken-4));
    }

    &.calendar-event__event {
        @include event-colors(var(--v-theme-event), var(--v-theme-event-darken-4));
    }

    &.calendar-event__project {
        @include event-colors(var(--v-theme-project), var(--v-theme-project-darken-4));
    }

    &.calendar-event__readonly {
        // opacity: var(--v-medium-emphasis-opacity);
    }
}

.calendar {
	.vuecal--view-with-time {
		.vuecal__weekdays-headings,
		.vuecal__all-day {
		padding-right: 0;
		}
	}
}
</style>