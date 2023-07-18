<script setup lang="ts">
import { headerMenu } from '@/router/routes';
import Search from '@/components/search/Search.vue';
</script>
<template>
    <v-toolbar density="compact" class="header">
        <v-btn icon="mdi-square"
               to="/" />
        <v-spacer></v-spacer>

        <Search />

        <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical"
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
</v-toolbar></template>
<style scoped lang="scss">
    @import '@/assets/styles/variables.scss';
    .header {
        height: $header-height;
        position: relative;
        z-index: 10000;
    }
</style>