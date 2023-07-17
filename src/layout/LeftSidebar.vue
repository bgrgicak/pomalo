<script setup lang="ts">
import { useLayoutStore } from "@/stores/layout";

const layoutStore = useLayoutStore();
</script>
<template>
    <v-navigation-drawer width="244" v-if="layoutStore.isLeftSidebarVisible" class="left-sidebar">
        <v-sheet color="grey-lighten-5" height="128" width="100%">
            Task search
        </v-sheet>
    </v-navigation-drawer>
</template>
<style scoped lang="scss">
    @import '@/styles/variables.scss';
    .left-sidebar {
        top: $header-height !important;
    }
</style>