<script setup lang="ts">
import { RouterView } from "vue-router";
</script>
<template>
    <v-main class="main">
        <RouterView />
    </v-main>
</template>
<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.main {
    position: relative;
    top: $header-height;
    height: calc(100vh - #{$header-height});
}
</style>