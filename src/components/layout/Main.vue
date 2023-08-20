<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>
<template>
  <v-main class="main">
    <RouterView />
  </v-main>
</template>
<style lang="scss" scoped>
@import '@/styles/variables.scss';

.main {
    height: 100vh;
    overflow: hidden;

    >main {
        overflow-y: auto;
        height: 100vh;
    }
}
</style>