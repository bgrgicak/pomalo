<script setup lang="ts">
import { headerMenu } from '@/router/routes';
import Search from '@/components/search/Search.vue';
import constants from '@/helper/constants';
import Timer from '@/components/timer/Timer.vue';
import { useLayoutStore } from '@/stores/layout';

const layoutStore = useLayoutStore();

const toggleMenu = () => {
    layoutStore.updateMenuVisibility(!layoutStore.isMenuVisible);
};
</script>
<template>
    <v-app-bar density="compact"
               :color="constants.colors.headerBackground"
               class="header">
        <v-app-bar-nav-icon variant="text"
                            class="ml-1 d-lg-none"
                            @click.stop="toggleMenu"></v-app-bar-nav-icon>
        <v-app-bar-title class="d-none d-lg-inline-flex ml-1">
            <v-btn class="header__logo"
                   to="/calendar"
                   :icon="constants.icons.logo" />
        </v-app-bar-title>
        <v-spacer />
        <v-divider vertical />

        <Timer />

        <v-divider vertical />

        <Search variant="solo-filled" />

        <v-divider vertical />

        <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical"
                       v-bind="props"></v-btn>
            </template>
            <v-list>
                <v-list-item v-for="(item, i) in headerMenu"
                             :key="i"
                             :to="item.path">
                    <template v-slot:append>
                        <v-icon :icon="item.icon"></v-icon>
                    </template>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>
</template>
<style lang="scss">
@import '@/styles/variables.scss';

.header {
    height: $header-height;
    overflow: visible !important;

    .v-btn__overlay {
        border-radius: 4px;
    }
}

.header__logo {
    &.v-btn--active .v-btn__overlay {
        background-color: transparent !important;
    }
}

.header__logo-icon {
    margin-right: 10px;
}

.timer {
    background: rgb(var(--v-theme-primary-darken-2));
}
</style>