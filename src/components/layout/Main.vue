<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>
<template>
  <v-main class="main pa-0">
    <RouterView />
  </v-main>
</template>
<style lang="scss">
@import '@/styles/variables.scss';
html, body {
		overflow: hidden;
}
.main {
	padding: 0;
	position: relative;
	top: $header-height;
	left: $navigation-width;
	width: calc(100vw - $navigation-width);
	overflow: auto;
	height: calc(100vh - $header-height);
}
</style>