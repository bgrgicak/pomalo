<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import ActivityDetails from '@/components/activity/ActivityDetails.vue';
import { computed } from 'vue';
import { useActivityStore } from '@/stores/activities';
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const layoutStore = useLayoutStore();
const activityStore = useActivityStore();

const route = useRoute();

const activityId = computed(() => layoutStore.currentActivityId as string);
const activity = computed(() => activityStore.activities[activityId.value]);

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
        <v-btn icon="mdi-close"
               variant="plain"
               size="56"
               class="right-sidebar__close mr-2"
               @click="hide" />
        <ActivityDetails :activity="activity"
                         small="true" />
    </v-navigation-drawer>
</template>
<style lang="scss">
@import '@/assets/styles/variables.scss';

.right-sidebar {
    top: $header-height !important;

    .v-navigation-drawer__content {
        .v-card {
            padding-top: 0 !important;

            .v-container {
                padding-top: 0 !important;
            }
        }
    }
}

.right-sidebar__close {
    margin-left: auto;
    display: block;
}
</style>