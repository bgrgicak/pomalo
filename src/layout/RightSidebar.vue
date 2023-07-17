<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import ActivityDetails from '@/components/activity/ActivityDetails.vue';
import { computed } from 'vue';

const layoutStore = useLayoutStore();
const activity = computed(() => layoutStore.currentActivity);
</script>
<template>
    <v-navigation-drawer location="right" v-if="layoutStore.isRightSidebarVisible" class="right-sidebar">
        <ActivityDetails :activity="activity"/>
    </v-navigation-drawer>
</template>
<style scoped lang="scss">
    @import '@/styles/variables.scss';
    .right-sidebar {
        top: $header-height !important;
    }
</style>