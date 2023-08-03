<script setup lang="ts">
import VueCal, { type VueCalEvent } from 'vue-cal';
import { useCalendarStore } from '@/stores/calendar';
import { useLayoutStore } from '@/stores/layout';
import { ref } from 'vue';
import __ from '@/helper/translations';
import { useActivityStore } from '@/stores/activities';
import type Activity from '@/types/activity';
import { updateEventInActivity } from '@/data/events';

const calendarStore = useCalendarStore();
const activityStore = useActivityStore();
const layoutStore = useLayoutStore();

const activeView = ref('week');

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
};

const eventClick = (event: any) => {
    if (event.id) {
        deleteOlderNewEvents();
        layoutStore.showRightSidebar(event.id);
    }
};

const previous = () => {
    if (!vuecal.value) {
        return;
    }
    (vuecal.value as any).previous();
};

const next = () => {
    if (!vuecal.value) {
        return;
    }
    (vuecal.value as any).next();
};

const today = () => {
    if (!vuecal.value) {
        return;
    }
    (vuecal.value as any).switchView(activeView.value, new Date());
};

const addEvent = () => {
    layoutStore.showRightSidebar();
};

const eventDurationChange = (event: any) => {
    activityStore.get(event.event.id).then((activity: Activity | void) => {
        if (!activity) {
            return;
        }
        if (!event.event.eventId) {
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
</script>
<template>
    <v-card class="calendar pa-4">
        <v-row class="pb-0">
            <v-col cols="4"
                   align="left">
                <v-btn icon="mdi-plus"
                       @click="addEvent"
                       variant="text" />
            </v-col>
            <v-col cols="4"
                   align="center">
                <v-btn-toggle v-model="activeView"
                              rounded="0"
                              group>
                    <v-btn value="year">
                        Year
                    </v-btn>
                    <v-btn value="month">
                        Month
                    </v-btn>
                    <v-btn value="week">
                        Week
                    </v-btn>
                    <v-btn value="day">
                        Day
                    </v-btn>
                </v-btn-toggle>
            </v-col>
            <v-col cols="4"></v-col>
        </v-row>
        <v-row class="pb-2">
            <v-col cols="8">
                <h2 class="m-0">
                    {{ (vuecal as any)?.viewTitle }}
                </h2>
            </v-col>
            <v-col cols="4"
                   align="right">
                <v-btn icon="mdi-arrow-left"
                       @click="previous"
                       variant="text" />
                <v-btn @click="today"
                       icon="mdi-calendar-today"
                       variant="text" />
                <v-btn icon="mdi-arrow-right"
                       @click="next"
                       variant="text" />
            </v-col>
        </v-row>
        <vue-cal style="height: calc(100vh - 48px - 8px - 72px - 80px);"
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
        </vue-cal>

    </v-card>
</template>
<style lang="scss">
.vuecal__title-bar {
    background-color: rgb(var(--v-theme-on-surface-variant));
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

.vuecal__event {
    background-color: rgb(var(--v-theme-accent));
    color: rgba(var(--v-theme-on-accent), var(--v-high-emphasis-opacity));
    border-bottom: 1px solid #fff;

    &.vuecal__event--focus {
        box-shadow: 1px 1px 6px rgba(var(--v-border-color), 0.3);
    }

    &.calendar-event__task {
        background-color: rgb(var(--v-theme-success));
    }

    &.calendar-event__event {
        background-color: rgb(var(--v-theme-primary));
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