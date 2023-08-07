<script setup lang="ts">
import constants from '@/helper/constants';
import { mainMenu } from '@/router/routes';
import { useLayoutStore } from '@/stores/layout';

const layoutStore = useLayoutStore();
</script>
<template>
    <v-navigation-drawer :color="constants.colors.menuBackground"
                         rail
                         :model-value="layoutStore.isMenuVisible"
                         @update:model-value="layoutStore.updateMenuVisibility"
                         class="navigation">
        <template v-for="item in mainMenu">
            <v-btn :to="item.path"
                   class="navigation-item"
                   variant="text"
                   :icon="item.icon" />
        </template>
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
    width: $navigation-width;
    height: $navigation-width;
    border-radius: 4px;
}
</style>