<script setup lang="ts">
import VueCal, { type VueCalEvent } from 'vue-cal';
import { useCalendarStore } from '@/stores/calendar';
import { useLayoutStore } from '@/stores/layout';
import { ref } from 'vue';
import router from '@/router/router';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import type Activity from '@/types/activity';
import { removeEventFromActivity, updateEventInActivity } from '@/data/events';
import CalendarHeader from './CalendarHeader.vue';
import { getLocalDate, getUtcTimestamp } from '@/helper/date';
import { settings } from '@/helper/settings';
import { computed } from 'vue';

const calendarStore = useCalendarStore();
const activityStore = useActivityStore();
const layoutStore = useLayoutStore();

const activeView = ref(router.currentRoute.value.query.view?.toString() ?? settings.calendar.defaultView);

const selectedDate = computed(() => {
    if (!router.currentRoute.value.query.date) {
        return undefined;
    }
    return getLocalDate(
        parseInt(
            router.currentRoute.value.query.date as string,
        )
    );
});


const vuecal = ref(null);

const cellClick = (cellDate: Date) => {
    const vuecalRef = (vuecal as any).value;

    deleteOlderNewEvents(cellDate);

    const newEvent = vuecalRef.mutableEvents.findIndex((event: VueCalEvent) => !event.id && cellDate === event.start);
    if (-1 === newEvent) {
        eventUnfocus();
    }
};

/**
 * Delete new events that were previously created. but not saved. Exclude event that is currently being created.
 * @param date Optional. Date of the event that is currently being created.
 */
const deleteOlderNewEvents = (date?: Date) => {
    const vuecalRef = (vuecal as any).value;
    vuecalRef.mutableEvents.forEach((event: VueCalEvent) => {
        if (event.id) {
            return;
        }
        if (date === event.start) {
            return;
        }
        vuecalRef.emitWithEvent('event-delete', event);
        vuecalRef.mutableEvents = vuecalRef.mutableEvents.filter((e: VueCalEvent) => e._eid !== event._eid);
        vuecalRef.view.events = vuecalRef.view.events.filter((e: VueCalEvent) => e._eid !== event._eid);
    });
};

const eventUnfocus = () => {
    calendarStore.unfocusEvent();
    layoutStore.hideRightSidebar();
};

const eventFocus = (event: any) => {
    if (event.eventId) {
        calendarStore.focusEvent(event.eventId);
    }
};

const fetchEvents = (options: any) => {
    if (options.view) {
        activeView.value = options.view;
    }
    calendarStore.load(options.startDate, options.endDate);

    if (options.startDate && options.view) {
        router.push({
            query: {
                date: getUtcTimestamp(options.startDate),
                view: options.view ?? 'week',
            }
        });
    }
};

const eventClick = (event: any) => {
    if (event.id) {
        deleteOlderNewEvents();
        layoutStore.showRightSidebar(event.id);
    }
};

const eventDurationChange = (event: any) => {
    if (!event.event.eventId) {
        return;
    }
    activityStore.get(event.event.id).then((activity: Activity | void) => {
        if (!activity) {
            return;
        }
        activityStore.update(
            updateEventInActivity(
                activity,
                {
                    id: event.event.eventId,
                    start: event.event.start,
                    end: event.event.end,
                },
                event.event.repeatIteration
            )
        );
    });
    return true;
};

const eventDragCreate = (event: any) => {
    calendarStore.focusNewEvent(event.start, event.end);
    layoutStore.showRightSidebar();
};

const maybeDeleteEvent = (keyboardEvent: any) => {
    if (!calendarStore?.focusedEvent?.eventId) {
        return;
    }
    if (!calendarStore?.focusedEvent?.id) {
        return;
    }
    if ('Backspace' !== keyboardEvent.key) {
        return;
    }

    activityStore.get(calendarStore.focusedEvent.id).then((activity: Activity | void) => {
        if (!activity) {
            return;
        }
        activityStore.update(
            removeEventFromActivity(
                activity,
                calendarStore.focusedEvent!.eventId,
            )
        );
    });

};
</script>
<template>
    <v-card class="calendar pa-4"
            @keyup="maybeDeleteEvent">
        <CalendarHeader v-model:active-view="activeView"
                        :vuecal="vuecal" />
        <vue-cal style="height: calc(100vh - 48px - 8px - 72px - 80px);"
                 :selected-date="selectedDate"
                 class="v-card calendar"
                 ref="vuecal"
                 :active-view="activeView"
                 :disable-views="['years']"
                 :events="calendarStore.events"
                 :on-event-click="eventClick"
                 @event-focus="eventFocus"
                 @cell-click="cellClick"
                 :click-to-navigate="false"
                 :dblclick-to-navigate="['year', 'month'].includes(activeView)"
                 :snap-to-time="15"
                 hide-view-selector
                 hide-title-bar
                 watch-realtime="true"
                 :show-all-day-events="true"
                 :editable-events="{ title: false, drag: true, resize: true, delete: true, create: true }"
                 @ready="fetchEvents"
                 @view-change="fetchEvents"
                 @event-duration-change="eventDurationChange"
                 @event-drop="eventDurationChange"
                 @event-drag-create="eventDragCreate">

            <template #event="{ event, view }">
                <v-card-title>
                    {{ event.title }}
                </v-card-title>
                <v-card-subtitle>
                    {{ event.start.formatTime('h:m') + ' - ' + event.end.formatTime('h:m') }}
                </v-card-subtitle>
            </template>
        </vue-cal>

    </v-card>
</template>
<style lang="scss">
.vuecal__title-bar {
    background-color: rgb(var(--v-theme-on-surface-variant));
    color: rgb(var(--v-theme-on-surface));
}

.vuecal__event {
    background-color: rgba(var(--v-theme-primary), var(--v-medium-emphasis-opacity));
    color: rgb(var(--v-theme-primary-darken-4));
    border: 1px solid #fff;

    &.vuecal__event--focus {
        box-shadow: 1px 1px 6px rgba(var(--v-border-color), 0.3);
    }

    &.calendar-event__task {
        background-color: rgba(var(--v-theme-task), var(--v-medium-emphasis-opacity));
        color: rgb(var(--v-theme-task-darken-4));
    }

    &.calendar-event__event {
        background-color: rgba(var(--v-theme-event), var(--v-medium-emphasis-opacity));
        color: rgb(var(--v-theme-event-darken-4));
    }
}

.vuecal__cell--selected,
.vuecal__cell--today,
.vuecal__cell--current {
    background-color: transparent;
}

.vuecal__heading.today {
    font-weight: 600;
}
</style>