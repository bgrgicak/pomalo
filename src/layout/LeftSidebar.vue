<script setup lang="ts">
import { ref } from 'vue';

const showLeftSidebar = ref(false);
</script>
<template>
    <v-navigation-drawer width="244" v-if="showLeftSidebar">
        <v-sheet color="grey-lighten-5" height="128" width="100%">
            Task search
        </v-sheet>
    </v-navigation-drawer>
</template>