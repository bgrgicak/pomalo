<script setup lang="ts">
import { headerMenu } from '@/configuration/routes';
import HeaderSearch from '@/components/header-search/HeaderSearch.vue';
</script>
<template>
    <v-toolbar density="compact">
        <v-btn icon="mdi-square"
               to="/" />
        <v-spacer></v-spacer>

        <HeaderSearch />

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