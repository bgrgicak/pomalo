<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import ActivityMain from '@/components/activity/ActivityMain.vue';
import { computed } from 'vue';
import { useActivityStore } from '@/stores/activities';
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { openActivityPage } from '@/data/activities';

const layoutStore = useLayoutStore();
const activityStore = useActivityStore();

const route = useRoute();

const activityId = computed(() => layoutStore.currentActivityId as string);
const activity = computed(() => activityStore.activities[activityId.value]);
const event = computed(() => layoutStore.currentEvent ?? undefined);
const newType = computed(() => layoutStore.newActivityType ?? undefined);

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
                         v-bind:width="350"
                         v-if="layoutStore.isRightSidebarVisible"
                         :model-value="layoutStore.isRightSidebarVisible"
                         @update:model-value="hide"
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
        <ActivityMain :activity="activity"
                      :event="event"
                      :type="newType"
                      small="true" />
    </v-navigation-drawer>
</template>
<style lang="scss">
@import '@/styles/variables.scss';

.right-sidebar {
    top: $header-height !important;
    height: calc(100vh - #{$header-height}) !important;
    overflow-y: auto;
    min-width: 350px;

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