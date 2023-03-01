<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <v-card>
    <v-layout>
      <v-app-bar title="Application bar"></v-app-bar>

      <v-navigation-drawer>
        <v-list>
          <v-list-item title="Navigation drawer">
            <RouterLink to="/">Home</RouterLink>
          </v-list-item>
          <v-list-item title="Navigation drawer">
            <RouterLink to="/about">About</RouterLink>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main style="min-height: 300px;">
        <RouterView />
      </v-main>
    </v-layout>
  </v-card>
</template>

<style scoped></style>
