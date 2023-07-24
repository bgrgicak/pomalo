<script setup lang="ts">
import { headerMenu } from '@/router/routes';
import Search from '@/components/search/Search.vue';
import constants from '@/helper/constants';
import Timer from '@/components/timer/Timer.vue';
</script>
<template>
    <v-toolbar density="compact"
               class="header">
        <v-btn :color="constants.colors.icons"
               to="/"
               class="header__Logo">
            <v-icon :icon="constants.icons.logo"
                    class="header__logo-icon"
                    :size="36" />
            {{ constants.appTitle }}
        </v-btn>
        <v-spacer></v-spacer>

        <Timer />

        <Search />

        <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical"
                       :color="constants.colors.icons"
                       v-bind="props"></v-btn>
            </template>
            <v-list>
                <v-list-item v-for="(item, i) in headerMenu"
                             :key="i"
                             :to="item.path">
                    <template v-slot:prepend>
                        <v-icon :icon="item.icon"></v-icon>
                    </template>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-toolbar>
</template>
<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

.header {
    height: $header-height;
    position: relative;
    z-index: 10000;
}

.header__Logo {
    padding-left: 0;
    font-weight: 600;
}

.header__logo-icon {
    margin-right: 10px;
}
</style>