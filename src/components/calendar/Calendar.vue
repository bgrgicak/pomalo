<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendarStore } from '@/stores/calendar';
import { computed } from 'vue';

const calendarStore = useCalendarStore();
calendarStore.load(new Date('2023-07-20'), new Date('2023-07-30'));

const calendarOptions = computed(
    () => {
        return {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            initialView: 'timeGridWeek',
            headerToolbar: {
                left: 'prev,next',
                center: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            editable: true,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: true,
            weekends: true,
            // select: this.handleDateSelect,
            // eventClick: this.handleEventClick,
            // eventsSet: this.handleEvents
            /* you can update a remote database when these fire:
            eventAdd:
            eventChange:
            eventRemove:
            */
            events: calendarStore.events,
        };
    }
);
</script>
<template>
    <FullCalendar :options="calendarOptions" />
</template>