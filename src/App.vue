<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <v-app>
    <v-system-bar>
      <v-icon icon="mdi-square"></v-icon>

      Search
      <v-spacer></v-spacer>

      Activity overview
      <v-icon icon="mdi-circle"></v-icon>
      Menu
    </v-system-bar>

    <v-navigation-drawer color="grey-lighten-3" rail>
      <RouterLink to="/">
        <v-avatar class="d-block text-center mx-auto mt-4" color="grey-darken-1" size="36"></v-avatar>
      </RouterLink>
      <v-divider class="mx-3 my-5"></v-divider>
      <RouterLink to="/tasks">
        <v-avatar class="d-block text-center mx-auto mt-4" color="grey-darken-1" size="36"></v-avatar>
      </RouterLink>
      <v-divider class="mx-3 my-5"></v-divider>
    </v-navigation-drawer>

    <v-navigation-drawer width="244">
      <v-sheet color="grey-lighten-5" height="128" width="100%">
        Task search
      </v-sheet>
    </v-navigation-drawer>

    <v-main>
      <RouterView />
    </v-main>

    <v-navigation-drawer location="right">
      Activity details
    </v-navigation-drawer>
  </v-app>
</template>

<style scoped></style>
