<script setup lang="ts">
import constants from '@/helper/constants';
import { display } from '@/plugins/vuetify';
import { mainMenu } from '@/router/routes';
import { useLayoutStore } from '@/stores/layout';

const layoutStore = useLayoutStore();
</script>
<template>
  <v-navigation-drawer
    :color="constants.colors.menuBackground"
    :rail="!display.mobile.value"
    :model-value="layoutStore.isMenuVisible"
    class="navigation"
    @update:model-value="layoutStore.updateMenuVisibility"
  >
    <v-list
      nav
      class="pa-0"
    >
      <v-list-item
        v-for="item in mainMenu"
        :key="item.name"
        :prepend-icon="item.icon"
        :value="item.name"
        :title="item.name"
        :to="item.path"
        class="navigation-item pa-4"
      />
    </v-list>
  </v-navigation-drawer>
</template>
<style scoped lang="scss">
@import '@/styles/variables.scss';
$navigation-icon-height: 36px;

.navigation {
    top: $header-height !important;
    width: $navigation-width;
    height: calc(100vh - #{$header-height}) !important;
    overflow: hidden;
}

.navigation-item {
    height: $navigation-width;
    border-radius: 4px;
}
</style>