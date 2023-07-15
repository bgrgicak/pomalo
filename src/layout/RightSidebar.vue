<script setup lang="ts">
import { ref } from 'vue';

const showRightSidebar = ref(false);
</script>
<template>
    <v-navigation-drawer location="right" v-if="showRightSidebar">
        Activity details
    </v-navigation-drawer>
</template>