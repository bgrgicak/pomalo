<script setup>
import { mainMenu } from '@/configuration/routes';
</script>
<template>
    <v-navigation-drawer color="grey-lighten-3" rail>
        <template v-for="item in mainMenu">
            <RouterLink :to="item.path">
                <v-avatar class="d-block text-center mx-auto mt-4" color="grey-darken-1" size="36"></v-avatar>
            </RouterLink>
            <v-divider class="mx-3 my-5"></v-divider>
        </template>
    </v-navigation-drawer>
</template>