<script setup lang="ts">
import { mainMenu } from '@/router/routes';
</script>
<template>
    <v-navigation-drawer color="grey-lighten-3"
                         rail
                         class="navigation">
        <template v-for="item in mainMenu">
            <RouterLink :to="item.path" class="navigation-item">
                <v-icon :icon="item.icon" size="36"/>
            </RouterLink>
            <v-divider class="mx-3 my-5"></v-divider>
    </template>
</v-navigation-drawer></template>
<style scoped lang="scss">
    @import '@/assets/styles/variables.scss';
    $navigation-icon-height: 36px;
    .navigation {
        top: $header-height !important;
        width: $navigation-width;
    }
    .navigation-item {
        width: $navigation-width;
        display: block;
        .v-icon {
            margin: calc($navigation-width - $navigation-icon-height) auto;
            display: block;
        }
    }
</style>