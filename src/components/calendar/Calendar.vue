<script setup lang="ts">
import VueCal from 'vue-cal';
import { useCalendarStore } from '@/stores/calendar';
import { useLayoutStore } from '@/stores/layout';
import { ref } from 'vue';
import __ from '@/helper/translations';

const calendarStore = useCalendarStore();
const layoutStore = useLayoutStore();

const activeView = ref('week');
const vuecal = ref(null);

const fetchEvents = (options: any) => {
    calendarStore.load(options.startDate, options.endDate);
};

const eventClick = (event: any) => {
    if (event.id) {
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

</script>
<template>
    <v-card class="calendar pa-4">
        <v-row class="pb-2">
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
        <vue-cal style="height: calc(100vh - 48px - 8px - 80px);"
                 ref="vuecal"
                 :active-view="activeView"
                 :disable-views="['years']"
                 :events="calendarStore.events"
                 :on-event-dblclick="eventClick"
                 :click-to-navigate="false"
                 :dblclick-to-navigate="false"
                 hide-view-selector
                 hide-title-bar
                 watch-realtime="true"
                 @ready="fetchEvents"
                 @view-change="fetchEvents">
        </vue-cal>

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
    background-color: rgb(var(--v-theme-secondary));
}

.calendar-event__event {
    background-color: rgb(var(--v-theme-secondary));
}
</style>