<script setup lang="ts">
import constants from '@/helper/constants';
import { mainMenu } from '@/router/routes';
</script>
<template>
    <v-navigation-drawer :color="constants.colors.menuBackground"
                         rail
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