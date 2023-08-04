<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import ActivityDetails from '@/components/activity/ActivityDetails.vue';
import { computed } from 'vue';
import { useActivityStore } from '@/stores/activities';
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { openActivityPage } from '@/data/activities';
import { useCalendarStore } from '@/stores/calendar';
import { calendarEventToActivityEvent } from '@/data/events';

const layoutStore = useLayoutStore();
const activityStore = useActivityStore();
const calendarStore = useCalendarStore();

const route = useRoute();

const activityId = computed(() => layoutStore.currentActivityId as string);
const activity = computed(() => activityStore.activities[activityId.value]);
const event = computed(() => calendarStore.focusedEvent ? calendarEventToActivityEvent(calendarStore.focusedEvent) : null);

if (activityId.value) {
    activityStore.get(activityId.value);
}

const hide = () => {
    layoutStore.hideRightSidebar();
};

watch(route, hide);
</script>
<template>
    <v-navigation-drawer location="right"
                         v-if="layoutStore.isRightSidebarVisible"
                         class="right-sidebar">
        <header class="right-sidebar__header">
            <v-btn icon="mdi-arrow-expand"
                   variant="plain"
                   size="56"
                   class="right-sidebar__expand ml-2"
                   @click="() => openActivityPage(activity)" />
            <v-spacer />
            <v-btn icon="mdi-close"
                   variant="plain"
                   size="56"
                   class="right-sidebar__close mr-2"
                   @click="hide" />
        </header>
        <ActivityDetails :activity="activity"
                         :event="event"
                         small="true" />
    </v-navigation-drawer>
</template>
<style lang="scss">
@import '@/assets/styles/variables.scss';

.right-sidebar {
    top: $header-height !important;
    height: calc(100vh - #{$header-height}) !important;
    overflow-y: auto;

    .v-navigation-drawer__content {
        >.v-card {
            padding-top: 0 !important;
            height: 100%;

            .v-container {
                padding-top: 0 !important;
            }
        }
    }
}

.right-sidebar__header {
    display: flex;
}
</style>