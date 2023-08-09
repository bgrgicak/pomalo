<script setup lang="ts">
import VueCal, { type VueCalEvent } from 'vue-cal';
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

const props = defineProps(['vuecal', 'activeView', 'selectedDate', 'views']);
const emit = defineEmits(['update:activeView', 'addEvent', 'updateEvent', 'fetchEvents']);

const vuecal: Ref<any> = ref(null);

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

const eventFocus = (event: any) => {
    if (event.eventId) {
        calendarStore.focusEvent(event.eventId);
    }
};

const eventDoubleClick = (event: any) => {
    if (event.id) {
        layoutStore.showRightSidebar(
            event.id,
            {
                id: event.eventId,
                start: event.start,
                end: event.end,
            }
        );
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
        props.vuecal.mutableEvents = props.vuecal.mutableEvents.filter((e: VueCalEvent) => e._eid !== event._eid);
        props.vuecal.view.events = props.vuecal.view.events.filter((e: VueCalEvent) => e._eid !== event._eid);
    });
};

const fetchEvents = (options: any) => {
    if (options.view && props.vuecal) {
        emit('update:activeView', options.view);
    }

    emit('fetchEvents', options.startDate, options.endDate);
};

const eventClick = (event: any) => {
    if (event.id) {
        deleteOlderNewEvents();
    }
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
    const cells = document.querySelectorAll('.calendar .vuecal__bg .vuecal__cell');
    if (!cells) {
        return;
    }
    cells.forEach((cell: any, index: number) => {
        const currentCell = structuredClone(props.vuecal.viewCells[index]);
        cell.addEventListener('mousedown', (event: any) => {
            if (event.button !== 0) {
                return;
            }
            const timeout = setTimeout(() => {
                const start = currentCell.startDate.addMinutes(
                    props.vuecal.utils.cell.minutesAtCursor(event).minutes
                );
                emit('addEvent', start);
            }, 500);
            cell.addEventListener('mouseup', () => {
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
    calendar.scrollTo({ top: getLocalDate().getHours() * props.vuecal.timeCellHeight, behavior: 'smooth' });
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
    <vue-cal style="height: calc(100vh - 48px - 8px - 72px - 80px);"
             ref="vuecal"
             :selected-date="selectedDate"
             class="v-card calendar"
             :active-view="activeView"
             :disable-views="disabledViews"
             :events="calendarStore.events"
             @event-click="eventClick"
             @event-dblclick="eventDoubleClick"
             @event-focus="eventFocus"
             @cell-click="cellClick"
             @cell-dblclick="cellDoubleClick"
             :click-to-navigate="false"
             :dblclick-to-navigate="['year', 'month'].includes(activeView)"
             :snap-to-time="15"
             hide-view-selector
             hide-title-bar
             watch-realtime="true"
             :show-all-day-events="true"
             :editable-events="editingOptions"
             @ready="onReady"
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
</template>