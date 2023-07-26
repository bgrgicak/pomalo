<script setup lang="ts">
import VueCal from 'vue-cal';
import { useCalendarStore } from '@/stores/calendar';
import { useLayoutStore } from '@/stores/layout';

const calendarStore = useCalendarStore();
const layoutStore = useLayoutStore();

const fetchEvents = (options: any) => {
    calendarStore.load(options.startDate, options.endDate);
};

const eventClick = (event: any) => {
    console.log(event.id);
    if (event.id) {
        layoutStore.showRightSidebar(event.id);
    }
};

const selectedDate = (event: any) => {
    console.log('Open right sidebar');
};

</script>
<template>
    <v-card class="calendar pa-4">
        <vue-cal style="height: 100vh;"
                 active-view="week"
                 :disable-views="['years']"
                 :events="calendarStore.events"
                 :on-event-dblclick="eventClick"
                 :click-to-navigate="false"
                 :dblclick-to-navigate="false"
                 hide-view-selector
                 watch-realtime="true"
                 @ready="fetchEvents"
                 @view-change="fetchEvents" />

    </v-card>
</template>
<style lang="scss">
.vuecal__title-bar {
    background-color: rgb(var(--v-theme-on-surface-variant));
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

.vuecal__event {
    background-color: rgb(var(--v-theme-primary));
    color: rgba(var(--v-theme-on-primary), var(--v-high-emphasis-opacity));
}

.calendar-event__task {
    background-color: #2196F3;
}
</style>