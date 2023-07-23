<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import ActivityDetails from '@/components/activity/ActivityDetails.vue';
import { computed } from 'vue';

const layoutStore = useLayoutStore();
const activity = computed(() => layoutStore.currentActivity);
const hide = () => {
    layoutStore.hideRightSidebar();
};
</script>
<template>
    <v-navigation-drawer location="right"
                         v-if="layoutStore.isRightSidebarVisible"
                         class="right-sidebar">
        <div v-click-outside="hide">
            <ActivityDetails :activity="activity"
                             small="true" />
        </div>
    </v-navigation-drawer>
</template>
<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.right-sidebar {
    top: $header-height !important;
}
</style>