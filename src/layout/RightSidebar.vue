<script setup lang="ts">
import { useLayoutStore } from '@/stores/layout';
import ActivityDetails from '@/components/activity-details/ActivityDetails.vue';
import { computed } from 'vue';

const layoutStore = useLayoutStore();
const activity = computed(() => layoutStore.currentActivity);
</script>
<template>
    <v-navigation-drawer location="right" v-if="layoutStore.isRightSidebarVisible">
        <ActivityDetails :activity="activity"/>
    </v-navigation-drawer>
</template>