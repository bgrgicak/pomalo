<script setup lang="ts">
import { display } from '@/plugins/vuetify';
import { useLayoutStore } from '@/stores/layout';
import { RouterView } from 'vue-router';

const layoutStore = useLayoutStore();
</script>
<template>
  <v-main
    class="main pa-0"
    :class="{
      'main--mobile': display.mobile.value,
      'left-sidebar': layoutStore.isLeftSidebarVisible,
    }"
  >
    <RouterView />
  </v-main>
</template>
<style lang="scss">
@import '@/styles/variables.scss';
html, body {
		overflow: hidden;
}
.v-main.main {
	flex: 0 0 auto;
	padding: 0;
	position: relative;
	top: $header-height;
	left: $navigation-width;
	width: calc(100vw - $navigation-width);
	overflow: auto;
	height: calc(100vh - $header-height);
	&.left-sidebar {
		left: $navigation-width + 244px;
		width: calc(100vw - $navigation-width - 244px);
	}
	&.main--mobile {
		left: 0;
		width: 100%;
	}
}
</style>